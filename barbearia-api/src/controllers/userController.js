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

// Atualizar o próprio perfil
exports.atualizarPerfil = async (req, res) => {
    try {
        const userId = req.userId; // Esse ID vem do nosso authMiddleware!
        const { nomeCompleto, email } = req.body;

        // Busca o usuário no banco
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "Usuário não encontrado." });
        }

        // Atualiza apenas os campos que o frontend enviou
        if (nomeCompleto) user.nomeCompleto = nomeCompleto;
        if (email) user.email = email;

        if (req.body.senhaHash) {
            // Criptografa a nova senha antes de salvar no banco
            const salt = await bcrypt.genSalt(10);
            user.senhaHash = await bcrypt.hash(req.body.senhaHash, salt);
        }
        
        // Salva as alterações no MongoDB
        await user.save();

        return res.status(200).json({
            message: "Perfil atualizado com sucesso!",
            dados: {
                id: user._id,
                nomeCompleto: user.nomeCompleto,
                email: user.email,
                cargo: user.cargo
            }
        });

    } catch (error) {
        return res.status(500).json({ message: "Erro ao atualizar perfil.", erro: error.message });
    }
};

exports.obterPerfil = async (req, res) => {
    try {
        // O req.userId vem do authMiddleware
        const user = await User.findById(req.userId).select('-senha'); 
        
        if (!user) {
            return res.status(404).json({ message: "Usuário não encontrado." });
        }

        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ message: "Erro ao buscar perfil.", erro: error.message });
    }
};

exports.listarUsuarios = async (req, res) => {
    try {
        // Captura o que vier depois do ponto de interrogação na URL
        const { cargo } = req.query; 
        
        let filtro = {};

        // Se o frontend mandou um cargo, a gente adiciona na regra de busca
        if (cargo) {
            filtro.cargo = cargo;
        }

        // Busca no banco e usa .select('-senha') para NUNCA enviar a senha criptografada para o frontend
        const usuarios = await User.find(filtro).select('-senha');

        return res.status(200).json(usuarios);

    } catch (error) {
        return res.status(500).json({ message: "Erro ao buscar usuários.", erro: error.message });
    }
};