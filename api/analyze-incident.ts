import { GoogleGenAI } from '@google/genai'

export const maxDuration = 30

type RequestBody = {
  prompt?: unknown
  photo?: unknown
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'GEMINI_API_KEY is not configured.' }, { status: 503 })
  }

  try {
    const { prompt, photo } = (await request.json()) as RequestBody
    if (typeof prompt !== 'string' || prompt.length === 0) {
      return Response.json({ error: 'A valid incident prompt is required.' }, { status: 400 })
    }

    const contents: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [{ text: prompt }]
    if (typeof photo === 'string' && photo.startsWith('data:')) {
      const [metadata, data] = photo.split(',', 2)
      const mimeType = metadata.match(/^data:([^;]+);base64$/)?.[1]
      if (mimeType && data) contents.push({ inlineData: { mimeType, data } })
    }

    const client = new GoogleGenAI({ apiKey })
    const result = await client.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-3.6-flash',
      contents,
      config: {
        maxOutputTokens: 600,
        systemInstruction: 'You are AEGIS-X, an emergency decision-support simulation. Analyze only the supplied simulated incident. Do not claim real-world authority, live data, or guaranteed outcomes. Give an operator a concise recommendation for human review.'
      }
    })

    return Response.json({ analysis: result.text || '{}' })
  } catch (error) {
    console.error('Incident analysis failed:', error)
    return Response.json({ error: 'AI analysis failed.' }, { status: 500 })
  }
}
