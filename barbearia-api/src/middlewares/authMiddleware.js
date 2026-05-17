const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // 1. Pega o token que vem no cabeçalho (Header) da requisição
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: "Acesso negado. Token não fornecido." });
    }

    // 2. O padrão do mercado é enviar o token assim: "Bearer HUASHUASHUASH..."
    // Precisamos separar a palavra "Bearer" do código do token
    const parts = authHeader.split(' ');

    if (parts.length !== 2) {
        return res.status(401).json({ message: "Token com erro de formatação." });
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
        return res.status(401).json({ message: "Token mal formatado." });
    }

    // 3. Verifica se o token é válido e se foi assinado com a sua chave secreta
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Token inválido ou expirado." });
        }

        // 4. Se tudo estiver certo, injetamos o ID do usuário na requisição e liberamos a passagem
        req.userId = decoded.id;
        req.userCargo = decoded.cargo;
        
        return next(); // "Pode passar para o Controller!"
    });
};