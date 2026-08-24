import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { GoogleGenAI } from '@google/genai'

function aegisAiPlugin(): Plugin {
  return { name: 'aegis-ai-endpoint', configureServer(server) {
    server.middlewares.use('/api/analyze-incident', async (request, response) => {
      if (request.method !== 'POST') { response.statusCode = 405; response.end('Method not allowed'); return }
      // OPENAI_API_KEY is accepted temporarily so an existing locally-entered key keeps working.
      const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY
      if (!apiKey) { response.statusCode = 503; response.setHeader('Content-Type', 'application/json'); response.end(JSON.stringify({ error: 'GEMINI_API_KEY is not configured in .env.local.' })); return }
      let body = ''
      request.on('data', chunk => { body += chunk })
      request.on('end', async () => {
        try {
          const client = new GoogleGenAI({ apiKey })
          const result = await client.models.generateContent({ model: process.env.GEMINI_MODEL || 'gemini-3.6-flash', contents: `SIMULATED INCIDENT:\n${body}`, config: { maxOutputTokens: 220, systemInstruction: 'You are AEGIS-X, an emergency decision-support simulation. Analyze only the supplied simulated incident. Do not claim real-world authority, live data, or guaranteed outcomes. Give an operator a concise 3-sentence explanation of priority, constraints, and a human-review recommendation.' } })
          response.setHeader('Content-Type', 'application/json'); response.end(JSON.stringify({ analysis: result.text }))
        } catch (error) { response.statusCode = 500; response.setHeader('Content-Type', 'application/json'); response.end(JSON.stringify({ error: error instanceof Error ? error.message : 'AI request failed.' })) }
      })
    })
  }}
}

export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''))
  return { plugins: [react(), aegisAiPlugin()] }
})
