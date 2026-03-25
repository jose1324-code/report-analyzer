import { NextRequest, NextResponse } from "next/server";

const JSON_PROMPT = `Respond ONLY with valid JSON in this exact format:
{
  "summary": "Brief summary of the report findings",
  "findings": [
    {"label": "Test Name", "value": "Result Value", "status": "normal"}
  ],
  "recommendations": ["First recommendation"],
  "riskLevel": "low"
}
Status must be: "normal", "warning", or "critical". Risk level must be: "low", "medium", or "high".`;

function normalizeResult(raw: any) {
  return {
    summary: raw.summary ?? "",
    findings: Array.isArray(raw.findings) ? raw.findings : [],
    recommendations: Array.isArray(raw.recommendations)
      ? raw.recommendations.map((r: any) =>
          typeof r === "string" ? r : r.label ?? r.text ?? r.recommendation ?? JSON.stringify(r)
        )
      : [],
    riskLevel: raw.riskLevel ?? "low",
  };
}

async function analyzeWithOllama(prompt: string) {
  const res = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "deepseek-r1:7b", prompt, stream: false, format: "json" }),
    signal: AbortSignal.timeout(120000),
  });
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
