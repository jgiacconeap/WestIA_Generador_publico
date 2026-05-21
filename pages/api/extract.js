const SYSTEM_PROMPT = `Sos un asistente de West Investments. Tu tarea es extraer la información clave de una noticia financiera.
Respondé ÚNICAMENTE con un JSON válido, sin texto antes ni después, sin backticks. Estructura exacta:
{"title":"título claro y descriptivo","source":"nombre del medio o fuente","content":"resumen detallado con TODOS los datos clave: cifras, porcentajes, fechas, nombres, contexto. Mínimo 150 palabras."}`

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { mode, url, base64, mediaType, title, source, content } = req.body

  let messages = []
  let useSearch = false

  if (mode === 'link') {
    useSearch = true
    messages = [{
      role: 'user',
      content: `Accedé a esta URL y extraé el contenido completo de la noticia financiera: ${url}\n\nSi no podés acceder directamente, usá web search para encontrarla.`
    }]
  } else if (mode === 'file') {
    const isImage = (mediaType || '').startsWith('image/')
    messages = [{
      role: 'user',
      content: [
        {
          type: isImage ? 'image' : 'document',
          source: { type: 'base64', media_type: mediaType || 'application/pdf', data: base64 }
        },
        { type: 'text', text: 'Extraé la información principal de este documento/archivo.' }
      ]
    }]
  } else {
    messages = [{
      role: 'user',
      content: `Estructurá y resumí esta noticia financiera:\n\nTítulo: ${title || ''}\nFuente: ${source || ''}\n\n${content}`
    }]
  }

  const body = {
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    system: SYSTEM_PROMPT,
    messages,
  }
  if (useSearch) body.tools = [{ type: 'web_search_20250305', name: 'web_search' }]

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'web-search-2025-03-05',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    const text = (data.content || []).map(b => b.text || '').join('').trim()
    const clean = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim()
    const parsed = JSON.parse(clean)
    return res.json(parsed)
  } catch (e) {
    console.error('Extract error:', e)
    return res.status(500).json({ error: 'No se pudo extraer el contenido.' })
  }
}
