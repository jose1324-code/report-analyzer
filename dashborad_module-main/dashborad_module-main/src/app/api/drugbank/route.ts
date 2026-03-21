import { NextRequest, NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import path from 'path'

type Medicine = {
  id: string
  name: string
  'price(₹)': string
  Is_discontinued: string
  manufacturer_name: string
  type: string
  pack_size_label: string
  short_composition1: string
  short_composition2: string
}

function loadData(): Medicine[] {
  const filePath = path.join(process.cwd(), 'indian_medicine_data.json')
  return JSON.parse(readFileSync(filePath, 'utf-8'))
}

function repairJson(raw: string): string {
  // Remove trailing commas before } or ]
  let s = raw.replace(/,\s*([}\]])/g, '$1')
  // If JSON is truncated mid-string, close open structures
  const opens = (s.match(/\{/g) || []).length
  const closes = (s.match(/\}/g) || []).length
  if (opens > closes) {
    // Close any open string first
    const lastQuote = s.lastIndexOf('"')
    const secondLast = s.lastIndexOf('"', lastQuote - 1)
    if (lastQuote !== -1 && (s.match(/"/g) || []).length % 2 !== 0) s += '"'
    s += '}'.repeat(opens - closes)
  }
  return s
}

async function callGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set in environment')
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 2048 }
      })
    }
  )
  if (!res.ok) {
    const err = await res.text()
    console.error('Gemini API response:', res.status, err)
    throw new Error(`Gemini error ${res.status}: ${err}`)
  }
  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action')

  try {
    const medicines = loadData()

    // ── Search ──────────────────────────────────────────────────────────────
    if (action === 'search') {
      const q = (searchParams.get('q') || '').toLowerCase().trim()
      if (q.length < 2) return NextResponse.json({ suggestions: [] })
      const results = medicines
        .filter(m => m.name.toLowerCase().includes(q))
        .slice(0, 10)
        .map(m => m.name)
      return NextResponse.json({ suggestions: results })
    }

    // ── Details + Gemini enrichment ─────────────────────────────────────────
    if (action === 'llm') {
      const name = (searchParams.get('name') || '').toLowerCase().trim()
      const med = medicines.find(m => m.name.toLowerCase() === name)
      if (!med) return NextResponse.json({ error: 'Medicine not found' }, { status: 404 })

      const compositions = [med.short_composition1, med.short_composition2]
        .filter(c => c?.trim()).join(' + ')

      const prompt = `You are a clinical pharmacist. Provide comprehensive medical information for this Indian medicine.

Medicine: ${med.name}
Manufacturer: ${med.manufacturer_name}
Active Composition: ${compositions}
Pack: ${med.pack_size_label}
Type: ${med.type}

Respond ONLY with a valid JSON object, no markdown, no code block, no extra text:
{
  "overview": "2-3 sentence description of what this medicine is and what it treats",
  "indications": "Bullet list of medical conditions this medicine is used for (use • as bullet)",
  "mechanism": "How this medicine works in the body (2-3 sentences)",
  "dosage": "Typical adult dosage, frequency, and how to take it",
  "sideEffects": {
    "common": "Bullet list of common side effects (use •)",
    "serious": "Bullet list of serious side effects requiring immediate attention (use •)"
  },
  "warnings": "Bullet list of important warnings and precautions (use •)",
  "contraindications": "Who should NOT take this medicine",
  "interactions": "Bullet list of notable drug interactions (use •)",
  "storage": "How to store this medicine",
  "pregnancy": "Safety during pregnancy and breastfeeding",
  "overdose": "What to do in case of overdose"
}`

      try {
        const raw = await callGemini(prompt)
        const jsonMatch = raw.match(/\{[\s\S]*\}/)
        if (!jsonMatch) throw new Error('No JSON in response')
        const llmData = JSON.parse(repairJson(jsonMatch[0]))
        return NextResponse.json({ ...med, llm: llmData, llmAvailable: true })
      } catch (e) {
        console.error('Gemini LLM error:', e)
        return NextResponse.json({ ...med, llmAvailable: false, llmError: 'Gemini API error. Showing basic data.' })
      }
    }

    // ── Interaction (Gemini-powered) ─────────────────────────────────────────
    if (action === 'interaction') {
      const drug1 = (searchParams.get('drug1') || '').toLowerCase().trim()
      const drug2 = (searchParams.get('drug2') || '').toLowerCase().trim()

      const med1 = medicines.find(m => m.name.toLowerCase().includes(drug1))
      const med2 = medicines.find(m => m.name.toLowerCase().includes(drug2))

      if (!med1 || !med2) {
        return NextResponse.json({ found: false, message: 'One or both medicines not found. Try partial names.' })
      }

      const comp1 = [med1.short_composition1, med1.short_composition2].filter(Boolean).join(' + ')
      const comp2 = [med2.short_composition1, med2.short_composition2].filter(Boolean).join(' + ')

      const prompt = `You are a clinical pharmacist. Analyze the drug interaction between these two Indian medicines for a patient.

Medicine 1: ${med1.name} (${comp1})
Medicine 2: ${med2.name} (${comp2})

Respond ONLY with a valid JSON object, no markdown, no code block, no extra text:
{
  "compatible": true or false or null,
  "severity": "none" or "mild" or "moderate" or "severe",
  "summary": "One sentence summary of the interaction",
  "details": "2-3 sentences explaining the interaction mechanism and clinical significance",
  "recommendation": "What the patient or doctor should do",
  "monitoring": "What parameters to monitor if used together"
}`

      try {
        const raw = await callGemini(prompt)
        const jsonMatch = raw.match(/\{[\s\S]*\}/)
        if (!jsonMatch) throw new Error('No JSON')
        const result = JSON.parse(jsonMatch[0])
        return NextResponse.json({
          found: true,
          drug1: med1.name,
          drug2: med2.name,
          composition1: comp1,
          composition2: comp2,
          ...result,
          llmAvailable: true,
          source: 'Gemini 1.5 Flash + Indian Medicine Database'
        })
      } catch {
        const fallback = ruleBasedInteraction(med1, med2, comp1, comp2)
        return NextResponse.json({
          found: true,
          drug1: med1.name,
          drug2: med2.name,
          composition1: comp1,
          composition2: comp2,
          ...fallback,
          llmAvailable: false,
          source: 'Indian Medicine Database (rule-based fallback)'
        })
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (err) {
    console.error('Drug API error:', err)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}

function ruleBasedInteraction(med1: Medicine, med2: Medicine, comp1: string, comp2: string) {
  const c1 = comp1.toLowerCase(), c2 = comp2.toLowerCase()
  const dangerousPairs = [
    ['warfarin', 'aspirin'], ['warfarin', 'ibuprofen'],
    ['sildenafil', 'nitroglycerin'], ['acenocoumarol', 'aspirin'],
    ['spironolactone', 'potassium'], ['clopidogrel', 'omeprazole'],
    ['atorvastatin', 'clarithromycin'], ['alprazolam', 'lorazepam'],
  ]
  for (const [a, b] of dangerousPairs) {
    if ((c1.includes(a) && c2.includes(b)) || (c1.includes(b) && c2.includes(a))) {
      return {
        compatible: false, severity: 'severe',
        summary: `Dangerous interaction between ${a} and ${b}.`,
        details: 'These active ingredients are known to interact adversely. Avoid combining without medical supervision.',
        recommendation: 'Do not use together without consulting your doctor.',
        monitoring: 'Monitor for adverse effects closely.'
      }
    }
  }
  const ing1 = med1.short_composition1.replace(/\(.*?\)/g, '').trim().toLowerCase()
  const ing2 = med2.short_composition1.replace(/\(.*?\)/g, '').trim().toLowerCase()
  if (ing1 && ing2 && ing1 === ing2) {
    return {
      compatible: false, severity: 'moderate',
      summary: 'Both medicines contain the same active ingredient.',
      details: 'Taking two medicines with the same active ingredient can lead to overdose.',
      recommendation: 'Do not take both medicines simultaneously.',
      monitoring: 'Monitor for signs of overdose.'
    }
  }
  return {
    compatible: true, severity: 'none',
    summary: 'No known dangerous interaction found.',
    details: 'No significant interaction detected between these two medicines based on their compositions.',
    recommendation: 'Generally safe to use together, but always consult your doctor.',
    monitoring: 'Routine monitoring as prescribed.'
  }
}
