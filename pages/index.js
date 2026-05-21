import { useState, useEffect } from 'react'
import Head from 'next/head'

const WEST_NAVY = '#0A2342'
const WEST_GOLD = '#C9A84C'
const WEST_GOLD_LIGHT = '#F5EDD6'

const s = {
  wrap: { fontFamily: "'Helvetica Neue', Arial, sans-serif", maxWidth: 700, margin: '0 auto', background: '#F7F6F3', minHeight: '100vh' },
  header: { background: WEST_NAVY, padding: '20px 28px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logo: { fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 700, color: 'white', letterSpacing: '0.04em' },
  tagline: { fontSize: 11, color: WEST_GOLD, letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 3, fontWeight: 500 },
  body: { padding: '20px 20px 40px' },
  tabBar: { display: 'flex', gap: 6, marginBottom: 20, background: 'white', borderRadius: 10, padding: 5, border: '1px solid #E8E5DF' },
  tab: (a) => ({ flex: 1, padding: '9px 12px', borderRadius: 7, border: 'none', background: a ? WEST_NAVY : 'transparent', color: a ? 'white' : '#888', cursor: 'pointer', fontSize: 13, fontWeight: 500, textAlign: 'center' }),
  card: { background: 'white', border: '1px solid #E8E5DF', borderRadius: 10, padding: '16px 18px', marginBottom: 10 },
  cardHL: { background: 'white', border: `1.5px solid ${WEST_GOLD}`, borderRadius: 10, padding: '16px 18px', marginBottom: 14 },
  lbl: { fontSize: 11, fontWeight: 600, color: '#999', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 6 },
  inp: { width: '100%', padding: '9px 12px', border: '1px solid #DDD', borderRadius: 7, fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box', color: '#222', outline: 'none', background: 'white' },
  btnPrimary: { background: WEST_NAVY, color: 'white', border: 'none', borderRadius: 8, padding: '11px 20px', fontSize: 14, fontWeight: 500, cursor: 'pointer' },
  btnGold: { background: WEST_GOLD, color: WEST_NAVY, border: 'none', borderRadius: 8, padding: '11px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  btnOutline: { background: 'white', color: WEST_NAVY, border: `1.5px solid ${WEST_NAVY}`, borderRadius: 7, padding: '7px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer' },
  sectionTitle: { fontSize: 17, fontWeight: 600, color: WEST_NAVY, margin: '0 0 4px' },
  goldLine: { width: 28, height: 2.5, background: WEST_GOLD, borderRadius: 2, margin: '6px 0 16px' },
  platformBtn: (a) => ({ padding: '8px 16px', borderRadius: 20, border: `1.5px solid ${a ? WEST_GOLD : '#DDD'}`, background: a ? WEST_GOLD_LIGHT : 'white', color: a ? WEST_NAVY : '#777', cursor: 'pointer', fontSize: 13, fontWeight: a ? 600 : 400 }),
}

export default function WestAgent() {
  const [tab, setTab] = useState('archivo')
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)

  const [showForm, setShowForm] = useState(false)
  const [fTitle, setFTitle] = useState('')
  const [fSource, setFSource] = useState('')
  const [fContent, setFContent] = useState('')
  const [saving, setSaving] = useState(false)

  const [selected, setSelected] = useState([])
  const [extraCtx, setExtraCtx] = useState('')
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState('')

  const [posts, setPosts] = useState(null)
  const [platform, setPlatform] = useState('linkedin')
  const [copied, setCopied] = useState(null)

  useEffect(() => { loadNews() }, [])

  async function loadNews() {
    setLoading(true)
    try {
      const r = await fetch('/api/news')
      const data = await r.json()
      setNews(Array.isArray(data) ? data : [])
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  async function addNews() {
    if (!fTitle.trim() || !fContent.trim()) return
    setSaving(true)
    const item = { id: `${Date.now()}`, title: fTitle.trim(), source: fSource.trim(), content: fContent.trim(), date: Date.now() }
    await fetch('/api/news', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item) })
    setNews(prev => [item, ...prev])
    setFTitle(''); setFSource(''); setFContent(''); setShowForm(false)
    setSaving(false)
  }

  async function removeNews(id) {
    await fetch(`/api/news?id=${id}`, { method: 'DELETE' })
    setNews(prev => prev.filter(n => n.id !== id))
    setSelected(prev => prev.filter(s => s !== id))
  }

  function toggleSelect(id) {
    setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])
  }

  async function generate() {
    if (!selected.length || generating) return
    setGenerating(true); setGenError(''); setPosts(null)
    const newsItems = news.filter(n => selected.includes(n.id))
    try {
      const r = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newsItems, extraContext: extraCtx }),
      })
      const data = await r.json()
      if (data.error) throw new Error(data.error)
      setPosts(data); setPlatform('linkedin'); setTab('resultados')
    } catch (e) {
      console.error(e); setGenError('Hubo un error al generar. Intentá de nuevo.')
    }
    setGenerating(false)
  }

  function copyText(text, key) {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(key); setTimeout(() => setCopied(null), 2000)
  }

  const PLATFORMS = [
    { key: 'linkedin', label: 'LinkedIn' },
    { key: 'instagram', label: 'Instagram' },
    { key: 'x', label: 'X / Twitter' },
    { key: 'facebook', label: 'Facebook' },
  ]

  const tabs = [
    { key: 'archivo', label: '📰  Archivo' },
    { key: 'generar', label: '✨  Generar' },
    ...(posts ? [{ key: 'resultados', label: '📋  Resultados' }] : []),
  ]

  return (
    <>
      <Head><title>West Agent</title></Head>
      <div style={s.wrap}>
        <div style={s.header}>
          <div>
            <div style={s.logo}>WEST INVESTMENTS</div>
            <div style={s.tagline}>Agente de Contenido</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.4)', color: WEST_GOLD, borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 500 }}>
              {loading ? 'Cargando...' : `${news.length} noticia${news.length !== 1 ? 's' : ''}`}
            </div>
            <a href="/add" style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 6, display: 'block', textDecoration: 'none' }}>
              + Agregar desde celu →
            </a>
          </div>
        </div>

        <div style={s.body}>
          <div style={s.tabBar}>
            {tabs.map(t => (
              <button key={t.key} style={s.tab(tab === t.key)} onClick={() => setTab(t.key)}>{t.label}</button>
            ))}
          </div>

          {/* ARCHIVO */}
          {tab === 'archivo' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                <div>
                  <p style={s.sectionTitle}>Archivo de Noticias</p>
                  <div style={s.goldLine} />
                </div>
                <button style={s.btnPrimary} onClick={() => setShowForm(v => !v)}>
                  {showForm ? 'Cancelar' : '+ Agregar'}
                </button>
              </div>

              {showForm && (
                <div style={s.cardHL}>
                  <p style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 600, color: WEST_NAVY }}>Nueva noticia manual</p>
                  <div style={{ marginBottom: 12 }}>
                    <label style={s.lbl}>Título *</label>
                    <input style={s.inp} value={fTitle} onChange={e => setFTitle(e.target.value)} placeholder="Título de la noticia..." />
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={s.lbl}>Fuente</label>
                    <input style={s.inp} value={fSource} onChange={e => setFSource(e.target.value)} placeholder="Infobae, Bloomberg..." />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={s.lbl}>Contenido *</label>
                    <textarea style={{ ...s.inp, minHeight: 100, resize: 'vertical' }} value={fContent} onChange={e => setFContent(e.target.value)} placeholder="Pegá el texto de la noticia..." />
                  </div>
                  <button style={{ ...s.btnGold, width: '100%', opacity: (!fTitle.trim() || !fContent.trim() || saving) ? 0.5 : 1 }} onClick={addNews} disabled={!fTitle.trim() || !fContent.trim() || saving}>
                    {saving ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              )}

              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#AAA' }}>Cargando archivo...</div>
              ) : news.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#AAA' }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>📭</div>
                  El archivo está vacío. Agregá noticias desde acá o desde el link del celu.
                </div>
              ) : (
                news.map(n => (
                  <div key={n.id} style={s.card}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 600, fontSize: 14, color: WEST_NAVY, margin: '0 0 3px' }}>{n.title}</p>
                        {n.source && <p style={{ fontSize: 12, color: WEST_GOLD, fontWeight: 500, margin: '0 0 6px' }}>{n.source}</p>}
                        <p style={{ fontSize: 13, color: '#666', lineHeight: 1.5, margin: 0 }}>
                          {n.content.length > 160 ? n.content.slice(0, 160) + '…' : n.content}
                        </p>
                        <p style={{ fontSize: 11, color: '#BBB', marginTop: 8 }}>
                          {new Date(n.date).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <button onClick={() => removeNews(n.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#CCC', fontSize: 20, padding: 0, flexShrink: 0 }}>×</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* GENERAR */}
          {tab === 'generar' && (
            <div>
              <p style={s.sectionTitle}>Generar Contenido</p>
              <div style={s.goldLine} />
              {news.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#AAA' }}>Primero agregá noticias en el Archivo.</div>
              ) : (
                <>
                  <p style={{ fontSize: 13, color: '#777', margin: '0 0 16px', lineHeight: 1.6 }}>
                    Seleccioná una o más noticias. El agente genera un post para <strong>LinkedIn, Instagram, X y Facebook</strong> con el tono de West.
                  </p>
                  <label style={s.lbl}>Noticias ({selected.length} seleccionada{selected.length !== 1 ? 's' : ''})</label>
                  {news.map(n => {
                    const sel = selected.includes(n.id)
                    return (
                      <div key={n.id} onClick={() => toggleSelect(n.id)} style={{ ...s.card, cursor: 'pointer', border: sel ? `1.5px solid ${WEST_NAVY}` : '1px solid #E8E5DF', background: sel ? '#F0F4FA' : 'white', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                        <div style={{ width: 19, height: 19, borderRadius: 5, border: `2px solid ${sel ? WEST_NAVY : '#CCC'}`, background: sel ? WEST_NAVY : 'white', flexShrink: 0, marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {sel && <span style={{ color: 'white', fontSize: 11, fontWeight: 700 }}>✓</span>}
                        </div>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: 14, color: WEST_NAVY, margin: 0 }}>{n.title}</p>
                          {n.source && <p style={{ fontSize: 12, color: WEST_GOLD, margin: '2px 0 0' }}>{n.source}</p>}
                        </div>
                      </div>
                    )
                  })}
                  <div style={{ margin: '16px 0' }}>
                    <label style={s.lbl}>Contexto adicional (opcional)</label>
                    <textarea style={{ ...s.inp, minHeight: 70, resize: 'vertical' }} value={extraCtx} onChange={e => setExtraCtx(e.target.value)} placeholder="Enfoque particular, instrucción específica..." />
                  </div>
                  {genError && <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#9B1C1C', marginBottom: 14 }}>{genError}</div>}
                  <button style={{ ...s.btnPrimary, width: '100%', padding: '14px', fontSize: 15, opacity: (!selected.length || generating) ? 0.5 : 1, cursor: (!selected.length || generating) ? 'not-allowed' : 'pointer' }} onClick={generate} disabled={!selected.length || generating}>
                    {generating ? '⏳  Generando...' : '✨  Generar posts para las 4 redes'}
                  </button>
                </>
              )}
            </div>
          )}

          {/* RESULTADOS */}
          {tab === 'resultados' && posts && (
            <div>
              <p style={s.sectionTitle}>Contenido generado</p>
              <div style={s.goldLine} />
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
                {PLATFORMS.map(p => (
                  <button key={p.key} style={s.platformBtn(platform === p.key)} onClick={() => setPlatform(p.key)}>{p.label}</button>
                ))}
              </div>
              {PLATFORMS.map(p => platform === p.key && posts[p.key] && (
                <div key={p.key} style={s.card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid #F0EDE8' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: WEST_GOLD, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{p.label}</span>
                    <button style={{ ...s.btnOutline, color: copied === p.key ? '#2D7A5E' : WEST_NAVY, borderColor: copied === p.key ? '#2D7A5E' : WEST_NAVY }} onClick={() => copyText(posts[p.key], p.key)}>
                      {copied === p.key ? '✓ Copiado' : 'Copiar'}
                    </button>
                  </div>
                  <div style={{ whiteSpace: 'pre-wrap', fontSize: 14, color: '#333', lineHeight: 1.75 }}>{posts[p.key]}</div>
                </div>
              ))}
              <button style={{ ...s.btnOutline, marginTop: 12, fontSize: 13 }} onClick={() => { setTab('generar'); setPosts(null) }}>← Generar de nuevo</button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
