const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.criarUsuario = async (req, res) => {
    try {
        const novoUsuario = new User(req.body);
        await novoUsuario.save();
        res.status(201).json(novoUsuario);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, senhaHash } = req.body;

        if (!email || !senhaHash) {
            return res.status(400).json({ message: "E-mail e senha são obrigatórios." });
        }

        // 1. Busca o usuário no banco de dados pelo e-mail
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({ message: "Usuário não encontrado." });
        }

        // 2. Compara a senha digitada com a senha criptografada do banco
        const senhaValida = await bcrypt.compare(senhaHash, user.senhaHash);
        
        if (!senhaValida) {
            return res.status(401).json({ message: "Senha incorreta." });
        }

        // 3. Se tudo estiver certo, gera o Token JWT
        const token = jwt.sign(
            { id: user._id, cargo: user.cargo },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // 4. Retorna o token e os dados básicos do usuário (nunca a senha!)
        return res.status(200).json({
            message: "Login realizado com sucesso!",
            token: token,
            user: {
                id: user._id,
                nomeCompleto: user.nomeCompleto,
                email: user.email,
                tipo: user.tipo
            }
        });

    } catch (error) {
        return res.status(500).json({ message: "Erro interno no servidor.", erro: error.message });
    }
};