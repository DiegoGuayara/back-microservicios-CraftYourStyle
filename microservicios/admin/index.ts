import express from 'express'
import dotenv from 'dotenv'
import adminRoutes from './routes/admin.routes.js'
import cors from 'cors'

dotenv.config()

const app = express()

app.use(cors({
  origin: ['https://proyecto-formativo-cliente.vercel.app/', 'http://localhost:5173'],
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
