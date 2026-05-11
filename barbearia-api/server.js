const express = require('express');
const connectDB = require('./src/config/db');
require('dotenv').config();

const app = express();

connectDB();

app.use(express.json());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));