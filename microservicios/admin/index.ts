import express from 'express'
import dotenv from 'dotenv'
import adminRoutes from './routes/admin.routes.js'

dotenv.config()

const app = express()
app.use('/admin', adminRoutes)
app.use(express.json())

const PORT = process.env.PORT || 3000

app.get('/', (req, res) => {
    res.send('Admin service')
})

app.listen(PORT, () => {
    console.log(`Admin service running on port ${PORT}`)
})