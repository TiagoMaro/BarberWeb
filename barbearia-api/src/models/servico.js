const mongoose = require('mongoose');

const ServicoSchema = new mongoose.Schema({
    nome: { 
        type: String, 
        required: true 
    },
    descricao: { 
        type: String 
    },
    preco: { 
        type: Number, 
        required: true 
    },
    duracao_minutos: { 
        type: Number, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['ativo', 'inativo'], 
        default: 'ativo' // Soft Delete novamente!
    }
});

// Força o nome da coleção para 'servicos'
module.exports = mongoose.model('Servico', ServicoSchema, 'servicos');