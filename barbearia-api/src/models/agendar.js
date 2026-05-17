const mongoose = require("mongoose");

const AgendarSchema = new mongoose.Schema({
    data_hora: { type: Date, required: true },
    barbeiro: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pendente', 'concluido', 'cancelado'], default: 'pendente' },
    servico: { type: String, required: true }
});

module.exports = mongoose.model('Agendar', AgendarSchema, 'agendamentos');