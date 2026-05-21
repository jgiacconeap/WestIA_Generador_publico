# West Agent — Setup Guide

## Requisitos
- Cuenta en GitHub (gratis)
- Cuenta en Vercel (gratis) → vercel.com
- Cuenta en Supabase (gratis) → supabase.com
- API key de Anthropic → console.anthropic.com

---

## Paso 1 — Supabase: crear la base de datos

1. Entrá a https://supabase.com y creá un proyecto nuevo (ej: "west-agent")
2. Una vez creado, andá a **SQL Editor** y ejecutá esto:

```sql
CREATE TABLE news (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  source TEXT,
  content TEXT NOT NULL,
  date BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

3. Andá a **Project Settings → API** y copiá:
   - `Project URL` → es tu `SUPABASE_URL`
   - `anon public` key → es tu `SUPABASE_ANON_KEY`

---

## Paso 2 — GitHub: subir el código

1. Creá un repo nuevo en GitHub (ej: "west-agent"), privado
2. Subí todos los archivos de esta carpeta al repo

Si tenés git instalado:
```bash
cd west-agent
git init
git add .
git commit -m "first commit"
git remote add origin https://github.com/TU_USUARIO/west-agent.git
git push -u origin main
```

---

## Paso 3 — Vercel: deployar

1. Entrá a https://vercel.com e importá el repo de GitHub
2. En la pantalla de configuración, antes de deployar, agregá las variables de entorno:

| Variable | Valor |
|---|---|
| `ANTHROPIC_API_KEY` | sk-ant-... (de console.anthropic.com) |
| `SUPABASE_URL` | https://xxxx.supabase.co |
| `SUPABASE_ANON_KEY` | eyJ... |

3. Hacé click en **Deploy**. En 2 minutos Vercel te da una URL pública como:
   `https://west-agent.vercel.app`

---

## Paso 4 — Compartir con el equipo

Pinear en el grupo de WhatsApp:
- 🖥️ App principal: `https://west-agent.vercel.app`
- 📱 Agregar noticia (celu): `https://west-agent.vercel.app/add`

Las dos URLs son permanentes y el archivo es compartido entre los tres.

---

## Flujo de uso

**Desde el celu (al ver una noticia):**
1. Abrir `west-agent.vercel.app/add`
2. Elegir Link, Archivo o Texto
3. Pegar la info → la IA extrae → confirmar → guardar

**Para generar contenido:**
1. Abrir `west-agent.vercel.app`
2. Ir a Generar → seleccionar noticias → generar
3. Copiar cada post para LinkedIn, Instagram, X, Facebook

---

## Costos estimados

| Servicio | Costo |
|---|---|
| Vercel | Gratis (hobby plan) |
| Supabase | Gratis (hasta 500MB) |
| Anthropic API | ~$0.01–0.03 por extracción, ~$0.05 por generación de posts |

Con uso normal (5-10 posts por semana) el costo de API es menor a USD 5/mes.
