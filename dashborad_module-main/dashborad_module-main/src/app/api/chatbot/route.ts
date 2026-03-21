import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'No messages provided' },
        { status: 400 }
      );
    }

    // Get the last user message
    const lastUserMessage = messages[messages.length - 1].content;

    // Build conversation context for better responses
    const conversationContext = messages.slice(-5).map((msg: any) => 
      `${msg.role === 'user' ? 'Patient' : 'Medical Assistant'}: ${msg.content}`
    ).join('\n\n');

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

    console.log('Calling Ollama with prompt...');

    try {
      // Call Ollama API
      const ollamaResponse = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-r1:7b',
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.8,
            top_p: 0.95,
            top_k: 40,
            num_predict: 400,
            repeat_penalty: 1.1,
          }
        })
      });

      if (!ollamaResponse.ok) {
        const errorText = await ollamaResponse.text();
        console.error('Ollama API error:', errorText);
        throw new Error(`Ollama API failed: ${errorText}`);
      }

      const ollamaData = await ollamaResponse.json();
      console.log('Ollama response received:', ollamaData);
      
      let response = ollamaData.response || '';
      
      // Clean up the response
      response = response.trim();
      
      // If response is too short or empty, use fallback
      if (response.length < 20) {
        console.warn('Response too short, using fallback');
        throw new Error('Response too short');
      }

      return NextResponse.json({ response });

    } catch (ollamaError) {
      console.error('Ollama error, using fallback:', ollamaError);
      
      // Use intelligent fallback
      const fallbackResponse = generateFallbackResponse(lastUserMessage);
      
      return NextResponse.json({ 
        response: fallbackResponse,
        note: 'Using fallback response - Ollama may not be running'
      });
    }

  } catch (error) {
    console.error('Chatbot error:', error);
    return NextResponse.json(
      { error: 'Failed to process your message. Please try again.' },
      { status: 500 }
    );
  }
}

function generateFallbackResponse(userMessage: string): string {
  // Symptom-based responses
  if (userMessage.includes('headache') || userMessage.includes('head pain')) {
    return `Headaches can have various causes including stress, dehydration, lack of sleep, or tension. Here are some tips:

• Stay hydrated - drink plenty of water
• Get adequate rest and sleep
• Practice stress management techniques
• Avoid triggers like bright lights or loud noises
• Consider over-the-counter pain relievers if appropriate

If headaches are severe, frequent, or accompanied by other symptoms like vision changes, fever, or neck stiffness, please consult a healthcare provider immediately.`;
  }

  if (userMessage.includes('fever') || userMessage.includes('temperature')) {
    return `Fever is your body's natural response to infection. Here's what you can do:

• Rest and stay hydrated
• Take fever-reducing medication like acetaminophen or ibuprofen (if appropriate)
• Wear light clothing and keep the room cool
• Monitor your temperature regularly

Seek medical attention if:
• Fever is above 103°F (39.4°C)
• Fever lasts more than 3 days
• You have severe symptoms like difficulty breathing, chest pain, or confusion
• You have a weakened immune system`;
  }

  if (userMessage.includes('cold') || userMessage.includes('flu') || userMessage.includes('cough')) {
    return `Common cold and flu symptoms can be managed with:

• Rest and plenty of fluids
• Over-the-counter medications for symptom relief
• Warm liquids like tea or soup
• Humidifier to ease congestion
• Gargling with salt water for sore throat

Prevention tips:
• Wash hands frequently
• Avoid close contact with sick people
• Get adequate sleep
• Maintain a healthy diet

Consult a doctor if symptoms worsen or persist beyond 10 days, or if you have difficulty breathing.`;
  }

  if (userMessage.includes('stress') || userMessage.includes('anxiety') || userMessage.includes('worried')) {
    return `Managing stress and anxiety is important for your overall health. Here are some strategies:

• Practice deep breathing exercises
• Regular physical activity (even a short walk helps)
• Maintain a consistent sleep schedule
• Connect with friends and family
• Try meditation or mindfulness
• Limit caffeine and alcohol
• Consider journaling your thoughts

If stress or anxiety is significantly impacting your daily life, please consider speaking with a mental health professional. They can provide personalized support and treatment options.`;
  }

  if (userMessage.includes('sleep') || userMessage.includes('insomnia') || userMessage.includes('tired')) {
    return `Better sleep hygiene can improve your rest:

• Maintain a consistent sleep schedule
• Create a relaxing bedtime routine
• Keep your bedroom cool, dark, and quiet
• Avoid screens 1 hour before bed
• Limit caffeine after 2 PM
• Exercise regularly (but not close to bedtime)
• Avoid large meals before bed

If sleep problems persist for more than a few weeks, consult a healthcare provider to rule out underlying conditions.`;
  }

  if (userMessage.includes('blood pressure') || userMessage.includes('hypertension')) {
    return `Managing blood pressure is crucial for heart health:

• Maintain a healthy weight
• Exercise regularly (at least 30 minutes most days)
• Eat a balanced diet low in sodium
• Limit alcohol consumption
• Manage stress
• Quit smoking if you smoke
• Take prescribed medications as directed

Regular monitoring and check-ups with your doctor are important. High blood pressure often has no symptoms, so regular screening is essential.`;
  }

  if (userMessage.includes('diet') || userMessage.includes('nutrition') || userMessage.includes('food')) {
    return `A healthy diet is fundamental to good health:

• Eat plenty of fruits and vegetables (aim for 5+ servings daily)
• Choose whole grains over refined grains
• Include lean proteins (fish, poultry, beans, nuts)
• Limit processed foods and added sugars
• Stay hydrated with water
• Control portion sizes
• Eat regular, balanced meals

Consider consulting a registered dietitian for personalized nutrition advice, especially if you have specific health conditions or dietary restrictions.`;
  }

  // Default response
  return `Thank you for your question. I'm here to help with general health information and guidance.

I can assist with:
• Understanding common symptoms
• General wellness and preventive care tips
• Lifestyle and nutrition advice
• When to seek medical attention

However, I'm not able to diagnose conditions or replace professional medical advice. For specific health concerns, symptoms that are severe or persistent, or if you need a diagnosis, please consult with a qualified healthcare provider.

Could you tell me more about what you'd like to know? I'm here to help!`;
}
