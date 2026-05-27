export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { prompt } = req.body
  if (!prompt) return res.status(400).json({ error: 'Falta prompt' })

  try {
    const r = await fetch('https://api.ideogram.ai/v1/ideogram-v3/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': process.env.IDEOGRAM_API_KEY,
      },
      body: JSON.stringify({ prompt, rendering_speed: 'TURBO', style_type: 'DESIGN' }),
    })
    if (!r.ok) {
      const err = await r.json().catch(() => ({}))
      throw new Error(err.error || err.detail || `Ideogram error ${r.status}`)
    }
    const data = await r.json()
    const imgUrl = data?.data?.[0]?.url
    if (!imgUrl) throw new Error('Ideogram no devolvió imagen')

    // Download image and return as base64
    const imgRes = await fetch(imgUrl)
    const buffer = await imgRes.arrayBuffer()
    const b64 = Buffer.from(buffer).toString('base64')
    return res.json({ base64: b64 })
  } catch (e) {
    console.error('Ideogram error:', e)
    return res.status(500).json({ error: e.message })
  }
}
