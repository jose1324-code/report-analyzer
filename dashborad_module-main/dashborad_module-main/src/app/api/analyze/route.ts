import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 300;

const JSON_PROMPT = `You are an expert medical analyst. Your job is to carefully read the medical report text provided and extract ALL test results, then give detailed findings and recommendations.

Respond ONLY with valid JSON in this exact format (no extra text, no markdown):
{
  "summary": "Write 3-5 sentences summarizing the patient's overall health status based on the report.",
  "findings": [
    {"label": "Exact test name from report", "value": "Exact result value with units", "status": "normal"}
  ],
  "recommendations": [
    "Detailed recommendation 1 based on the findings",
    "Detailed recommendation 2 based on the findings",
    "Detailed recommendation 3 based on the findings",
    "Detailed recommendation 4 based on the findings"
  ],
  "riskLevel": "low"
}

STRICT RULES:
- findings: Extract EVERY single test/measurement from the report. Each must have label, value, and status.
- status must be exactly one of: "normal", "warning", "critical" — based on whether the value is in normal range.
- recommendations: Write AT LEAST 4 specific, actionable recommendations based on the actual findings. Each must be a plain string sentence.
- riskLevel must be exactly one of: "low", "medium", "high".
- If no report text is provided, generate realistic example findings and recommendations for a general health checkup.
- DO NOT return empty arrays. Always populate findings and recommendations.`;

function normalizeResult(raw: any) {
  const findings = Array.isArray(raw.findings)
    ? raw.findings.map((f: any) => ({
        label: f.label ?? "Unknown Test",
        value: f.value ?? "N/A",
        status: ["normal", "warning", "critical"].includes(f.status) ? f.status : "normal",
      }))
    : [];

  const recommendations = Array.isArray(raw.recommendations)
    ? raw.recommendations.map((r: any) =>
        typeof r === "string" ? r : r.title ?? r.detail ?? r.text ?? r.recommendation ?? JSON.stringify(r)
      )
    : [];

  return {
    summary: raw.summary ?? "No summary available.",
    findings,
    recommendations,
    riskLevel: ["low", "medium", "high"].includes(raw.riskLevel) ? raw.riskLevel : "low",
  };
}

function getMockResult() {
  return normalizeResult({
    summary: "Ollama is not running locally. This is a mock response for development purposes. Start Ollama with 'ollama serve' and ensure the model is pulled with 'ollama pull llama3.2:3b'.",
    findings: [{ label: "Service Status", value: "Ollama Offline", status: "warning" }],
    recommendations: [
      "Start Ollama by running 'ollama serve' in your terminal.",
      "Pull the required model with 'ollama pull llama3.2:3b'.",
      "Ensure port 11434 is not blocked by a firewall or antivirus.",
      "Retry the analysis once Ollama is running.",
    ],
    riskLevel: "low",
  });
}

async function analyzeWithOllama(prompt: string) {
  let res: Response;
  try {
    res = await fetch("http://127.0.0.1:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "llama3.2:3b", prompt, stream: false, format: "json", keep_alive: "10m" }),
      signal: AbortSignal.timeout(300000),
    });
  } catch (err: any) {
    const code = err?.cause?.code ?? err?.code;
    if (code === "ECONNREFUSED") return getMockResult();
    throw err;
  }
  if (!res.ok) throw new Error(`Ollama error: ${await res.text()}`);
  const data = await res.json();
  const cleaned = data.response.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  return normalizeResult(JSON.parse(match ? match[0] : cleaned));
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const extractedText = formData.get("extractedText") as string;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const prompt = `You are a medical AI assistant analyzing a medical report.\n${
      extractedText ? `Medical Report Content:\n${extractedText}\n\n` : ""
    }${JSON_PROMPT}`;

    const result = await analyzeWithOllama(prompt);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: `Failed to analyze report: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}
