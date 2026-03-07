import express from 'express'
import dotenv from 'dotenv'
import adminRoutes from './routes/admin.routes.js'
import cors from 'cors'

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

app.use('/admin', adminRoutes)

const PORT = process.env.PORT || 3000

app.get('/', (req, res) => {
  res.send('Admin service')
})

app.listen(PORT, () => {
  console.log(`Admin service running on port ${PORT}`)
})
