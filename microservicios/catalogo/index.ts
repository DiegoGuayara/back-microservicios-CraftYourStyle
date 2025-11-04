import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express()
const PORT = 10102

app.get('/', (req, res) => {
    res.send('Microservicio de Catálogo funcionando correctamente');
})

app.listen(PORT, () => {
    console.log(`Microservicio de Catálogo escuchando en el puerto ${PORT}`);
})