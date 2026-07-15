const express = require('express');
const cors = require('cors');
require('dotenv').config();

const telemetryRoutes = require('./routes/telemetryRoutes');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

app.use('/api/telemetry', telemetryRoutes);

app.listen(PORT, () => {
    console.log(`[SERVER] Telemetry service corriendo en: http://localhost:${PORT}`);
});