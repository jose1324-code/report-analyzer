import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

    const lastUserMessage = messages[messages.length - 1].content;

    const conversationContext = messages
      .slice(-5)
      .map((msg: any) => `${msg.role === "user" ? "Patient" : "Medical Assistant"}: ${msg.content}`)
      .join("\n\n");

    const prompt = `You are a knowledgeable and empathetic medical assistant AI.

Your responsibilities:
- Answer health questions with accurate, evidence-based information
- Help understand symptoms (but never diagnose)
- Provide wellness and preventive care advice
- Recommend when to seek professional medical care
- Be supportive, clear, and easy to understand

IMPORTANT RULES:
- Always clarify you're not replacing professional medical advice
- For serious symptoms, recommend consulting a healthcare provider
- Use simple language, avoid complex medical jargon
- Show empathy and care
- If unsure, admit it and suggest seeing a doctor

Conversation History:
${conversationContext}

Patient's current question: ${lastUserMessage}

Provide a helpful, caring response (2-4 paragraphs):`;

    const res = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "deepseek-r1:7b",
        prompt,
        stream: false,
        options: {
          temperature: 0.8,
          top_p: 0.95,
          top_k: 40,
          num_predict: 400,
          repeat_penalty: 1.1,
        },
      }),
    });

    if (!res.ok) throw new Error(`Ollama error: ${await res.text()}`);

    const data = await res.json();
    const response = data.response
      ?.replace(/<think>[\s\S]*?<\/think>/gi, "")
      .trim() ?? "";

    if (response.length < 20) throw new Error("Response too short");

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Chatbot error:", error);
    return NextResponse.json(
      { error: `Failed to process your message: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}
