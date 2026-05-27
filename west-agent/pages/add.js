import { useState, useRef } from 'react'
import Head from 'next/head'

const WEST_NAVY = '#0A2342'
const WEST_GOLD = '#C9A84C'

function fileToBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader()
    r.onload = () => res(r.result.split(',')[1])
    r.onerror = () => rej(new Error('Error leyendo archivo'))
    r.readAsDataURL(file)
  })
}

export default function WestAdd() {
  const [mode, setMode] = useState('link')
  const [url, setUrl] = useState('')
  const [file, setFile] = useState(null)
  const [manualTitle, setManualTitle] = useState('')
  const [manualSource, setManualSource] = useState('')
  const [manualContent, setManualContent] = useState('')
  const fileRef = useRef()

  const [extracting, setExtracting] = useState(false)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  async function extract() {
    setExtracting(true); setError(''); setPreview(null)
    try {
      let body = { mode }
      if (mode === 'link') body.url = url.trim()
      else if (mode === 'file') {
        body.base64 = await fileToBase64(file)
        body.mediaType = file.type
      } else {
        body.title = manualTitle; body.source = manualSource; body.content = manualContent
      }
      const r = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await r.json()
      if (data.error) throw new Error(data.error)
      setPreview(data)
    } catch (e) {
      console.error(e); setError('No pude extraer el contenido. Probá con texto manual o revisá el link.')
    }
    setExtracting(false)
  }

  async function save() {
    if (!preview) return
    const item = { id: `${Date.now()}`, ...preview, date: Date.now() }
    await fetch('/api/news', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    })
    setPreview(null); setUrl(''); setFile(null); setManualTitle(''); setManualSource(''); setManualContent('')
    setSaved(true); setTimeout(() => setSaved(false), 3500)
  }

  const inp = { width: '100%', padding: '13px 14px', border: '1.5px solid #DDD', borderRadius: 10, fontSize: 15, fontFamily: 'inherit', boxSizing: 'border-box', color: '#222', background: 'white', outline: 'none', WebkitAppearance: 'none' }
  const lbl = { fontSize: 11, fontWeight: 600, color: '#999', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }

  const canExtract = !extracting && (
    mode === 'link' ? url.trim().length > 5 :
    mode === 'file' ? !!file :
    manualTitle.trim().length > 0 && manualContent.trim().length > 0
  )

  return (
    <>
      <Head>
        <title>West — Agregar noticia</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>
      <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", maxWidth: 420, margin: '0 auto', minHeight: '100vh', background: '#F7F6F3' }}>

        <div style={{ background: WEST_NAVY, padding: '18px 20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: 17, fontWeight: 700, color: 'white', letterSpacing: '0.04em' }}>WEST</div>
            <div style={{ fontSize: 10, color: WEST_GOLD, letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 2, fontWeight: 600 }}>Agregar noticia</div>
          </div>
          <a href="/" style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>Ver archivo →</a>
        </div>

        {saved && (
          <div style={{ background: '#D1FAE5', borderBottom: '2px solid #6EE7B7', padding: '12px 20px', fontSize: 14, color: '#065F46', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>✓</span> Guardada. Ya la ven los tres.
          </div>
        )}

        <div style={{ padding: '20px 16px 40px' }}>

          {/* Selector de modo */}
          <div style={{ display: 'flex', background: 'white', border: '1px solid #E8E5DF', borderRadius: 10, padding: 4, marginBottom: 20, gap: 4 }}>
            {[{ key: 'link', label: '🔗  Link' }, { key: 'file', label: '📎  Archivo' }, { key: 'text', label: '📝  Texto' }].map(m => (
              <button key={m.key} onClick={() => { setMode(m.key); setPreview(null); setError('') }} style={{ flex: 1, padding: '9px 6px', borderRadius: 7, border: 'none', background: mode === m.key ? WEST_NAVY : 'transparent', color: mode === m.key ? 'white' : '#888', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
                {m.label}
              </button>
            ))}
          </div>

          {!preview && (
            <>
              {/* LINK */}
              {mode === 'link' && (
                <div>
                  <p style={{ fontSize: 13, color: '#888', margin: '0 0 16px', lineHeight: 1.55, textAlign: 'center' }}>
                    Pegá el link. La IA extrae el contenido automáticamente.
                  </p>
                  <label style={lbl}>URL</label>
                  <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://infobae.com/..." style={{ ...inp, marginBottom: 8 }} />
                  <p style={{ fontSize: 11, color: '#BBB', margin: '0 0 20px' }}>Funciona con Infobae, Bloomberg, El Cronista, Reuters y la mayoría de los medios.</p>
                </div>
              )}

              {/* FILE */}
              {mode === 'file' && (
                <div>
                  <p style={{ fontSize: 13, color: '#888', margin: '0 0 16px', lineHeight: 1.55, textAlign: 'center' }}>
                    Subí un PDF, imagen o documento.
                  </p>
                  <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp" onChange={e => setFile(e.target.files[0] || null)} style={{ display: 'none' }} />
                  <div onClick={() => fileRef.current?.click()} style={{ border: `2px dashed ${file ? WEST_GOLD : '#CCC'}`, borderRadius: 12, padding: '28px 20px', textAlign: 'center', cursor: 'pointer', background: file ? '#FDFAF2' : 'white', marginBottom: 20 }}>
                    {file ? (
                      <div>
                        <div style={{ fontSize: 28, marginBottom: 8 }}>📄</div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: WEST_NAVY }}>{file.name}</div>
                        <div style={{ fontSize: 12, color: '#AAA', marginTop: 4 }}>{(file.size / 1024).toFixed(0)} KB · Tocá para cambiar</div>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: 32, marginBottom: 8 }}>📎</div>
                        <div style={{ fontWeight: 500, fontSize: 14, color: '#666' }}>Tocá para elegir archivo</div>
                        <div style={{ fontSize: 12, color: '#AAA', marginTop: 6 }}>PDF · Word · Imagen</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TEXT */}
              {mode === 'text' && (
                <div>
                  <p style={{ fontSize: 13, color: '#888', margin: '0 0 16px', lineHeight: 1.55, textAlign: 'center' }}>Pegá el texto directamente.</p>
                  <div style={{ marginBottom: 12 }}>
                    <label style={lbl}>Título *</label>
                    <input type="text" value={manualTitle} onChange={e => setManualTitle(e.target.value)} placeholder="Título de la noticia..." style={inp} />
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={lbl}>Fuente</label>
                    <input type="text" value={manualSource} onChange={e => setManualSource(e.target.value)} placeholder="Infobae, Bloomberg..." style={inp} />
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label style={lbl}>Texto *</label>
                    <textarea value={manualContent} onChange={e => setManualContent(e.target.value)} placeholder="Pegá el contenido..." rows={7} style={{ ...inp, resize: 'vertical', lineHeight: 1.5 }} />
                  </div>
                </div>
              )}

              {error && <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#9B1C1C', marginBottom: 14 }}>{error}</div>}

              <button onClick={extract} disabled={!canExtract} style={{ width: '100%', padding: '15px', background: canExtract ? WEST_NAVY : '#C8C8C8', color: 'white', border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: canExtract ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}>
                {extracting ? 'Extrayendo...' : mode === 'link' ? '🔍  Extraer noticia' : mode === 'file' ? '📖  Leer archivo' : '✨  Estructurar texto'}
              </button>
              {extracting && <p style={{ textAlign: 'center', fontSize: 12, color: '#AAA', marginTop: 10 }}>Esto puede tardar unos segundos...</p>}
            </>
          )}

          {/* PREVIEW */}
          {preview && (
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: WEST_GOLD, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
                Vista previa — confirmá antes de guardar
              </p>
              <div style={{ background: 'white', border: `1.5px solid ${WEST_GOLD}`, borderRadius: 12, padding: 16 }}>
                <div style={{ marginBottom: 12 }}>
                  <label style={lbl}>Título</label>
                  <input type="text" value={preview.title} onChange={e => setPreview(p => ({ ...p, title: e.target.value }))} style={inp} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={lbl}>Fuente</label>
                  <input type="text" value={preview.source || ''} onChange={e => setPreview(p => ({ ...p, source: e.target.value }))} style={inp} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={lbl}>Contenido extraído</label>
                  <textarea value={preview.content} onChange={e => setPreview(p => ({ ...p, content: e.target.value }))} rows={6} style={{ ...inp, resize: 'vertical', lineHeight: 1.5 }} />
                </div>
                <button onClick={save} style={{ width: '100%', padding: 14, background: WEST_GOLD, color: WEST_NAVY, border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                  ✓  Guardar en el archivo
                </button>
                <button onClick={() => setPreview(null)} style={{ width: '100%', padding: 10, background: 'none', color: '#AAA', border: 'none', fontSize: 13, cursor: 'pointer', marginTop: 6, fontFamily: 'inherit' }}>
                  Volver a editar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
