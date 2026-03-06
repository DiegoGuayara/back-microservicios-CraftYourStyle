import express from 'express'
import dotenv from 'dotenv'
import adminRoutes from './routes/admin.routes.js'
import cors from 'cors'
import axios from 'axios'

dotenv.config()

const app = express()

const allowedOrigins = (
  process.env.CORS_ORIGINS ??
  "https://proyecto-formativo-cliente.vercel.app,http://localhost:5173,http://127.0.0.1:5173"
)
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    const normalizedOrigin = origin.replace(/\/$/, "")
    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true)
    }
    return callback(new Error("Origen no permitido por CORS"))
  },
  credentials: true,
}))
app.use(express.json())

app.post('/api/generate', async (req, res) => {
  // Ruta legacy temporal: la ruta oficial es /api/generate vía gateway:1010.
  res.setHeader('Deprecation', 'true')
  res.setHeader('Sunset', 'Wed, 30 Sep 2026 23:59:59 GMT')
  res.setHeader('Link', '</api/generate>; rel=\"successor-version\"')

  const agenteIaBaseUrl = process.env.AGENTE_IA_URL ?? 'http://agente-ia:10105'
  try {
    const { data, status } = await axios.post(
      `${agenteIaBaseUrl}/generate`,
      req.body,
      { timeout: 120000 }
    )
    return res.status(status).json(data)
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 502
      const data = error.response?.data ?? { message: 'Error al conectar con agente IA' }
      return res.status(status).json(data)
    }
    return res.status(500).json({ message: 'Error interno en proxy /api/generate' })
  }
})

app.use('/admin', adminRoutes)

const PORT = process.env.PORT || 3000

app.get('/', (req, res) => {
  res.send('Admin service')
})

app.listen(PORT, () => {
  console.log(`Admin service running on port ${PORT}`)
})
