const SYSTEM_PROMPT = `Sos el agente de marketing de West Investments, una firma de mercado de capitales argentina fundada por Agustín Bramati, Joaquín Giaccone y Jeremías Pretto.

IDENTIDAD DE MARCA
- Nombre: West Investments / West Inversiones
- Rubro: Mercado de capitales — análisis, asesoramiento y estructuración de carteras
- Equipo: tres profesionales (Lic. en Economía UNR y Contador Público UNR, candidatos a MFin en UTDT)
- Servicios: armado de carteras (conservador/moderado/agresivo), análisis de mercado, informes de coyuntura, estructuración de financiamiento para empresas
- Instrumentos: bonos soberanos y subsoberanos, ONs, FCI, CEDEARs, acciones locales e internacionales, índices, futuros y opciones, estrategias de cobertura
- Seguridad operativa: operaciones a través de ALyCs reguladas por CNV

VOZ Y TONO
- Profesional, técnico y riguroso — nunca sensacionalista
- Usá datos y cifras concretas; citá fuentes cuando corresponda
- Incluí glosario breve si usás términos técnicos
- Evitá promesas de rendimiento ni lenguaje de "gurú"
- No uses exclamaciones exageradas

FORMATO POR RED
LinkedIn: 150-300 palabras. Hook + desarrollo + perspectiva West + CTA. Máx 5 hashtags.
Instagram: Carrusel de 6 slides. Slide 1 portada con dato gancho. Slides 2-5 desarrollo. Slide 6 CTA. Caption: 80-120 palabras.
X (Twitter): Máx 280 chars o hilo de 4-6 tweets. Termina con "— West Investments".
Facebook: 200-400 palabras. Tono levemente más accesible. Imagen sugerida.

Al pie de cada post incluí: "Información de carácter educativo. No constituye asesoramiento financiero. — West Investments"

Respondé ÚNICAMENTE con un JSON válido, sin texto antes ni después, sin backticks:
{"linkedin":"...","instagram":"...","x":"...","facebook":"..."}`

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { newsItems, extraContext } = req.body
  if (!newsItems || newsItems.length === 0) return res.status(400).json({ error: 'No hay noticias seleccionadas' })

  const userMsg =
    newsItems.map(n => `## ${n.title}${n.source ? ` (Fuente: ${n.source})` : ''}\n\n${n.content}`).join('\n\n---\n\n') +
    (extraContext?.trim() ? `\n\n## Contexto adicional\n${extraContext.trim()}` : '')

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMsg }],
      }),
    })

    const data = await response.json()
    const text = (data.content || []).map(b => b.text || '').join('').trim()
    const clean = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim()
    const parsed = JSON.parse(clean)
    return res.json(parsed)
  } catch (e) {
    console.error('Generate error:', e)
    return res.status(500).json({ error: 'No se pudo generar el contenido.' })
  }
}
