import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  let healthData;
  
  try {
    healthData = await request.json();

    // Calculate BMI
    const weight = parseFloat(healthData.weight);
    const height = parseFloat(healthData.height) / 100;
    const bmi = weight / (height * height);

    // Build comprehensive prompt for AI
    const prompt = `You are a medical AI assistant analyzing health risk factors.

Patient Health Data:
- Age: ${healthData.age} years
- Gender: ${healthData.gender}
- BMI: ${bmi.toFixed(1)}
- Blood Pressure: ${healthData.bloodPressureSystolic}/${healthData.bloodPressureDiastolic} mmHg
- Cholesterol: ${healthData.cholesterol} mg/dL
- Blood Sugar: ${healthData.bloodSugar} mg/dL
- Smoking: ${healthData.smokingStatus}
- Exercise: ${healthData.exerciseFrequency} days/week
- Alcohol: ${healthData.alcoholConsumption} drinks/week
- Sleep: ${healthData.sleepHours} hours/night
- Stress Level: ${healthData.stressLevel}/10
- Family History Diabetes: ${healthData.familyHistoryDiabetes}
- Family History Heart Disease: ${healthData.familyHistoryHeart}

Analyze and provide a comprehensive health risk assessment in JSON format:
{
  "overallScore": number (0-100, where 0 is lowest risk),
  "riskLevel": "Low Risk" | "Moderate Risk" | "High Risk",
  "categories": [
    {
      "name": "Cardiovascular",
      "score": number (0-100),
      "level": "Low" | "Moderate" | "High",
      "icon": "Heart"
    },
    {
      "name": "Diabetes",
      "score": number (0-100),
      "level": "Low" | "Moderate" | "High",
      "icon": "Activity"
    },
    {
      "name": "Respiratory",
      "score": number (0-100),
      "level": "Low" | "Moderate" | "High",
      "icon": "Wind"
    },
    {
      "name": "Mental Health",
      "score": number (0-100),
      "level": "Low" | "Moderate" | "High",
      "icon": "Brain"
    },
    {
      "name": "Metabolic",
      "score": number (0-100),
      "level": "Low" | "Moderate" | "High",
      "icon": "Zap"
    }
  ],
  "recommendations": [
    {
      "category": "Exercise" | "Nutrition" | "Stress Management" | "Sleep" | "Medical",
      "message": "specific recommendation",
      "emoji": "🏃" | "🥗" | "🧘" | "😴" | "📅"
    }
  ],
  "positiveFactors": ["factor1", "factor2"],
  "improvementAreas": ["area1", "area2"]
}

Respond ONLY with valid JSON.`;

    try {
      // Call Ollama DeepSeek
      const ollamaResponse = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-r1:1.5b',
          prompt: prompt,
          stream: false,
          format: 'json'
        })
      });

      if (!ollamaResponse.ok) {
        throw new Error('Ollama API request failed');
      }

      const ollamaData = await ollamaResponse.json();
      const textResponse = ollamaData.response;

      // Parse JSON from response
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(textResponse);

      return NextResponse.json(analysis);
    } catch (ollamaError) {
      console.warn('Ollama failed, using rule-based analysis:', ollamaError);
      return NextResponse.json(getRuleBasedAnalysis(healthData));
    }

  } catch (error) {
    console.error('Risk prediction error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze health data' },
      { status: 500 }
    );
  }
}

function getRuleBasedAnalysis(healthData: any) {
  const weight = parseFloat(healthData.weight) || 70;
  const height = parseFloat(healthData.height) / 100 || 1.7;
  const bmi = weight / (height * height);
  
  const age = parseInt(healthData.age) || 30;
  const systolic = parseInt(healthData.bloodPressureSystolic) || 120;
  const cholesterol = parseInt(healthData.cholesterol) || 200;
  const bloodSugar = parseInt(healthData.bloodSugar) || 95;
  const exercise = parseInt(healthData.exerciseFrequency) || 3;
  const sleep = parseInt(healthData.sleepHours) || 7;
  const stress = parseInt(healthData.stressLevel) || 5;

  // Calculate risk scores
  const cardiovascularScore = Math.min(100, 
    (age > 50 ? 20 : 10) +
    (systolic > 140 ? 30 : systolic > 120 ? 15 : 5) +
    (cholesterol > 240 ? 25 : cholesterol > 200 ? 15 : 5) +
    (healthData.smokingStatus === 'current' ? 20 : 0) +
    (healthData.familyHistoryHeart === 'yes' ? 10 : 0)
  );

  const diabetesScore = Math.min(100,
    (bmi > 30 ? 25 : bmi > 25 ? 15 : 5) +
    (bloodSugar > 125 ? 30 : bloodSugar > 100 ? 15 : 5) +
    (age > 45 ? 15 : 5) +
    (exercise < 3 ? 15 : 5) +
    (healthData.familyHistoryDiabetes === 'yes' ? 10 : 0)
  );

  const respiratoryScore = Math.min(100,
    (healthData.smokingStatus === 'current' ? 40 : healthData.smokingStatus === 'former' ? 20 : 5) +
    (age > 60 ? 15 : 5) +
    (exercise < 2 ? 10 : 5)
  );

  const mentalHealthScore = Math.min(100,
    (stress > 7 ? 30 : stress > 5 ? 20 : 10) +
    (sleep < 6 ? 25 : sleep < 7 ? 15 : 5) +
    (exercise < 2 ? 15 : 5)
  );

  const metabolicScore = Math.min(100,
    (bmi > 30 ? 30 : bmi > 25 ? 20 : 10) +
    (cholesterol > 240 ? 20 : cholesterol > 200 ? 10 : 5) +
    (bloodSugar > 100 ? 15 : 5) +
    (exercise < 3 ? 10 : 5)
  );

  const overallScore = Math.round(
    (cardiovascularScore + diabetesScore + respiratoryScore + mentalHealthScore + metabolicScore) / 5
  );

  const getRiskLevel = (score: number) => score < 30 ? 'Low' : score < 60 ? 'Moderate' : 'High';

  return {
    overallScore,
    riskLevel: overallScore < 30 ? 'Low Risk - Excellent Health!' : 
               overallScore < 60 ? 'Moderate Risk - Room for Improvement' : 
               'High Risk - Consult Healthcare Provider',
    categories: [
      { name: 'Cardiovascular', score: cardiovascularScore, level: getRiskLevel(cardiovascularScore), icon: 'Heart' },
      { name: 'Diabetes', score: diabetesScore, level: getRiskLevel(diabetesScore), icon: 'Activity' },
      { name: 'Respiratory', score: respiratoryScore, level: getRiskLevel(respiratoryScore), icon: 'Wind' },
      { name: 'Mental Health', score: mentalHealthScore, level: getRiskLevel(mentalHealthScore), icon: 'Brain' },
      { name: 'Metabolic', score: metabolicScore, level: getRiskLevel(metabolicScore), icon: 'Zap' }
    ],
    recommendations: [
      {
        category: 'Exercise',
        message: exercise < 3 ? 'Increase physical activity to at least 150 minutes per week' : 'Great job! Continue your regular exercise routine',
        emoji: '🏃'
      },
      {
        category: 'Nutrition',
        message: bmi > 25 ? 'Consider a balanced diet to achieve healthy BMI' : 'Maintain your healthy eating habits',
        emoji: '🥗'
      },
      {
        category: 'Stress Management',
        message: stress > 6 ? 'Practice stress reduction techniques like meditation or yoga' : 'Your stress management is good',
        emoji: '🧘'
      },
      {
        category: 'Sleep',
        message: sleep < 7 ? 'Aim for 7-9 hours of quality sleep per night' : 'Excellent sleep habits!',
        emoji: '😴'
      }
    ],
    positiveFactors: [
      healthData.smokingStatus === 'never' && 'Non-smoker',
      exercise >= 3 && 'Regular exercise routine',
      bmi >= 18.5 && bmi < 25 && `Healthy BMI (${bmi.toFixed(1)})`,
      sleep >= 7 && sleep <= 9 && 'Good sleep habits',
      stress <= 5 && 'Well-managed stress levels'
    ].filter(Boolean),
    improvementAreas: [
      systolic > 130 && 'Elevated blood pressure',
      cholesterol > 200 && 'High cholesterol levels',
      bloodSugar > 100 && 'Elevated blood sugar',
      exercise < 3 && 'Insufficient physical activity',
      bmi > 25 && 'BMI above healthy range',
      sleep < 7 && 'Inadequate sleep duration'
    ].filter(Boolean)
  };
}
