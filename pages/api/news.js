import { supabase } from '../../lib/supabase'

export default async function handler(req, res) {
  // GET — traer todas las noticias
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('date', { ascending: false })
    if (error) return res.status(500).json({ error: error.message })
    return res.json(data)
  }

  // POST — guardar noticia nueva
  if (req.method === 'POST') {
    const { id, title, source, content, date } = req.body
    if (!id || !title || !content) return res.status(400).json({ error: 'Faltan campos' })
    const { error } = await supabase.from('news').insert([{ id, title, source, content, date }])
    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json({ ok: true })
  }

  // DELETE — eliminar por id
  if (req.method === 'DELETE') {
    const { id } = req.query
    if (!id) return res.status(400).json({ error: 'Falta id' })
    const { error } = await supabase.from('news').delete().eq('id', id)
    if (error) return res.status(500).json({ error: error.message })
    return res.json({ ok: true })
  }

  res.status(405).end()
}
