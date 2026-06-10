const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.json({ mensaje: "API Funcionando correctamente." });
});

app.listen(PORT, () => {
    console.log('Servidor Back-End funcionando en http://localhost:${PORT}')
});
