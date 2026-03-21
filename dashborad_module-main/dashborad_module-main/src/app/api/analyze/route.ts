import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const extractedText = formData.get('extractedText') as string;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64File = buffer.toString('base64');
    const mimeType = file.type;

    let prompt = `You are a medical AI assistant analyzing a medical report.
Analyze this medical report and provide a detailed analysis.

`;

    if (extractedText) {
      prompt += `Medical Report Content:
${extractedText}

`;
    }

    prompt += `Respond ONLY with valid JSON in this exact format:
{
  "summary": "Brief summary of the report findings",
  "findings": [
    {"label": "Test Name", "value": "Result Value", "status": "normal"},
    {"label": "Another Test", "value": "Result", "status": "warning"}
  ],
  "recommendations": [
    "First recommendation",
    "Second recommendation"
  ],
  "riskLevel": "low"
}

Status must be: "normal", "warning", or "critical"
Risk level must be: "low", "medium", or "high"`;

    console.log('Calling Ollama DeepSeek...');
    
    // Call Ollama API (default runs on localhost:11434)
    const ollamaResponse = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-r1:7b',
        prompt: prompt,
        stream: false,
        format: 'json'
      })
    });

    if (!ollamaResponse.ok) {
      const errorData = await ollamaResponse.text();
      console.error('Ollama API error:', errorData);
      return NextResponse.json({ error: `Ollama API error: ${errorData}` }, { status: 500 });
    }

    const ollamaData = await ollamaResponse.json();
    console.log('Ollama response:', JSON.stringify(ollamaData, null, 2));
    
    const textResponse = ollamaData.response;
    
    // Strip <think>...</think> tags (deepseek-r1 reasoning traces)
    const cleaned = textResponse.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

    // Parse JSON from response
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    const raw = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(cleaned);

    // Normalize to ensure arrays are never null/undefined
    const analysisResult = {
      summary: raw.summary ?? '',
      findings: Array.isArray(raw.findings) ? raw.findings : [],
      recommendations: Array.isArray(raw.recommendations)
        ? raw.recommendations.map((r: any) => typeof r === 'string' ? r : r.label ?? r.text ?? r.recommendation ?? JSON.stringify(r))
        : [],
      riskLevel: raw.riskLevel ?? 'low'
    };

    return NextResponse.json(analysisResult);

  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: `Failed to analyze report: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
