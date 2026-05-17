const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
    nomeCompleto: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    senhaHash: { type: String, required: true },
    telefone: { type: String, required: true },
    cargo: { type: String, enum: ['cliente', 'barbeiro', 'gerente'], default: 'cliente' }
});

UserSchema.pre('save', async function (next) {
    if (!this.isModified('senhaHash')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.senhaHash = await bcrypt.hash(this.senhaHash, salt);
        next();
    } catch (error) {
        next(error);
    }
});

module.exports = mongoose.model('User', UserSchema, 'usuarios');