const express = require('express');
const cors = require('cors');
require('dotenv').config();

const opsRoutes = require('./routes/docsRoutes');
const validateJWT = require('./middlewares/validateJWT');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/ops', validateJWT, opsRoutes);
app.listen(PORT, () => {
    console.log(`[SERVER] OPS service corriendo en: http://localhost:${PORT}`);
});