const Servico = require('../models/servico');

// Cadastrar um novo serviço
exports.criarServico = async (req, res) => {
    try {
        const { nome, descricao, preco, duracao_minutos } = req.body;

        if (!nome || !preco || !duracao_minutos) {
            return res.status(400).json({ message: "Nome, preço e duração são obrigatórios." });
        }

        const novoServico = new Servico({
            nome,
            descricao,
            preco,
            duracao_minutos
        });

        await novoServico.save();
        
        return res.status(201).json({
            message: "Serviço cadastrado com sucesso!",
            dados: novoServico
        });

    } catch (error) {
        return res.status(500).json({ message: "Erro ao cadastrar serviço.", erro: error.message });
    }
};

// Listar todos os serviços ativos (Catálogo)
exports.listarServicos = async (req, res) => {
    try {
        // Busca apenas os serviços que não foram "deletados"
        const servicos = await Servico.find({ status: 'ativo' });
        return res.status(200).json(servicos);
    } catch (error) {
        return res.status(500).json({ message: "Erro ao listar serviços.", erro: error.message });
    }
};

exports.atualizarServico = async (req, res) => {
    try {
        const servicoId = req.params.id;
        const { nome, descricao, preco, duracao_minutos } = req.body;

        // O { new: true } garante que o Mongoose devolva o objeto já atualizado na resposta
        const servicoAtualizado = await Servico.findByIdAndUpdate(
            servicoId,
            { nome, descricao, preco, duracao_minutos },
            { new: true, runValidators: true } 
        );

        if (!servicoAtualizado) {
            return res.status(404).json({ message: "Serviço não encontrado." });
        }

        return res.status(200).json({
            message: "Serviço atualizado com sucesso!",
            dados: servicoAtualizado
        });

    } catch (error) {
        return res.status(500).json({ message: "Erro ao atualizar serviço.", erro: error.message });
    }
};

// Inativar um serviço (Soft Delete)
exports.inativarServico = async (req, res) => {
    try {
        const servicoId = req.params.id;

        const servico = await Servico.findById(servicoId);

        if (!servico) {
            return res.status(404).json({ message: "Serviço não encontrado." });
        }

        if (servico.status === 'inativo') {
            return res.status(400).json({ message: "Este serviço já está inativo." });
        }

        servico.status = 'inativo';
        await servico.save();

        return res.status(200).json({ 
            message: "Serviço inativado com sucesso. Ele não aparecerá mais no catálogo.", 
            dados: servico 
        });

    } catch (error) {
        return res.status(500).json({ message: "Erro ao inativar serviço.", erro: error.message });
    }
};