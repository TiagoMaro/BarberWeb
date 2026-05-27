const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./src/config/db');

const app = express();
app.use(cors());
app.use(express.json());


// Importar as Rotas
const agendamentoRoutes = require('./src/routes/agendamentoRoutes');
const userRoutes = require('./src/routes/userRoutes');
const servicoRoutes = require('./src/routes/servicoRoutes');


// Conectar ao MongoDB Atlas
connectDB();

//Definição de Rotas
app.use('/api/agendamentos', agendamentoRoutes);
app.use('/api/user', userRoutes)
app.use('/api/servicos', servicoRoutes);

// Rota de teste para ver se o servidor está online
app.get('/', (req, res) => {
    res.send('API da Barbearia Rodando no Zorin OS!');
});

// Inicialização do Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor iniciado na porta ${PORT}`);
});