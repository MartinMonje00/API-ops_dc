const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'UP', timestamp: new Date() });
});

app.use((req, res) => {
    res.status(404).json({ code: 'RESOURCE_NOT_FOUND' });
});

app.listen(PORT, () => {
    console.log(`[SERVER] API corriendo en: http://localhost:${PORT}`);
});
