const Agendamento = require('../models/agendar');

exports.criarAgendamento = async (req, res) => {
    try {
        const { data_hora, barbeiro, servico } = req.body;
        const cliente = req.userId;


        const dataAgendamento = new Date(data_hora);
        const agora = new Date();

        // 1. A MÁQUINA DO TEMPO: Bloqueia datas no passado
        if (dataAgendamento < agora) {
            return res.status(400).json({ 
                message: "Não é possível agendar em uma data ou horário que já passou." 
            });
        }

        // 2. HORÁRIO DE EXPEDIENTE: Verifica os dias de funcionamento
        const diaDaSemana = dataAgendamento.getDay(); // 0 = Domingo, 1 = Segunda... 6 = Sábado
        const horaAgendamento = dataAgendamento.getHours();

        // Bloqueia domingos (dia 0)
        if (diaDaSemana === 0) {
            return res.status(400).json({ 
                message: "A barbearia não funciona aos domingos." 
            });
        }
        
        // Bloqueia horários fora do expediente (8h às 18h)
        if (horaAgendamento < 8 || horaAgendamento >= 18) {
            return res.status(400).json({ 
                message: "A barbearia só funciona das 8h às 18h." 
            });
        }

        if (!data_hora || !barbeiro || !servico) {
            return res.status(400).json({ message: "Todos os campos são obrigatórios." });
        }

        const horaDesejada = new Date(data_hora);
        const umaHoraEmMilissegundos = 60 * 60 * 1000;
        const limiteInferior = new Date(horaDesejada.getTime() - umaHoraEmMilissegundos);
        const limiteSuperior = new Date(horaDesejada.getTime() + umaHoraEmMilissegundos);

        // Executa as duas buscas no banco de dados SIMULTANEAMENTE para ganhar velocidade
        const [conflitoBarbeiro, conflitoCliente] = await Promise.all([
            Agendamento.findOne({
                barbeiro: barbeiro,
                data_hora: { $gt: limiteInferior, $lt: limiteSuperior },
                status: { $ne: 'cancelado' }
            }),
            Agendamento.findOne({
                cliente: cliente,
                data_hora: { $gt: limiteInferior, $lt: limiteSuperior },
                status: { $ne: 'cancelado' }
            })
        ]);

        //Retorna erro específico se o barbeiro estiver ocupado
        if (conflitoBarbeiro) {
            return res.status(400).json({
                message: "Conflito: Este barbeiro já possui um agendamento neste intervalo de horário."
            });
        }

        //Retorna erro específico se o cliente já tiver marcado com outra pessoa na mesma hora
        if (conflitoCliente) {
            return res.status(400).json({
                message: "Conflito: Você (cliente) já possui um agendamento marcado neste mesmo horário."
            });
        }

        //Se ninguém tem conflito, salva o agendamento
        const novoAgendamento = new Agendamento({
            data_hora: horaDesejada,
            barbeiro,
            cliente,
            servico
        });

        await novoAgendamento.save();

        return res.status(201).json({
            message: "Agendamento realizado com sucesso!",
            dados: novoAgendamento
        });

    } catch (error) {
        return res.status(500).json({ message: "Erro interno", erro: error.message });
    }
};


//Listar todos os agendamentos (Geral)
exports.listarTodos = async (req, res) => {
    try {
        const userId = req.userId;       // ID vindo do Token JWT
        const userCargo = req.userCargo;   // 'cliente' ou 'barbeiro' vindo do Token JWT

        // Criamos um objeto de filtro vazio
        let filtro = {};

        // Regra de Negócio: Aplica o filtro dependendo de QUEM está logado
        if (userCargo === 'cliente') {
            filtro.cliente = userId; // Cliente só vê os agendamentos que pertencem a ele
        } else if (userCargo === 'barbeiro') {
            filtro.barbeiro = userId;
        } else if (userCargo === 'gerente') {
            filtro = {};
        } else {
            return res.status(403).json({ message: "Acesso negado. Seu cargo não tem permissão para esta listagem." });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        
        // A matemática do pulo: na página 1, pula 0. Na página 2 (limite 10), pula os 10 primeiros.
        const skip = (page - 1) * limit;

        // Busca os agendamentos fatiados
        const agendamentos = await Agendamento.find(filtro)
            .populate('barbeiro', 'nomeCompleto email')
            .populate('cliente', 'nomeCompleto email')
            .sort({ data_hora: 1 })
            .skip(skip)    // Pula os registros das páginas anteriores
            .limit(limit); // Limita a quantidade desta página

        // Conta quantos documentos totais existem no banco com aquele filtro
        const totalRegistros = await Agendamento.countDocuments(filtro);

        // Retorna um objeto mais rico para o frontend
        return res.status(200).json({
            info: {
                totalRegistros,
                paginasTotais: Math.ceil(totalRegistros / limit),
                paginaAtual: page,
                itensNestaPagina: agendamentos.length
            },
            dados: agendamentos
        });

    } catch (error) {
        return res.status(500).json({ message: "Erro ao buscar agendamentos.", erro: error.message });
    }
};

//Buscar horários ocupados de um barbeiro em um dia específico
exports.listarPorBarbeiroEDia = async (req, res) => {
    try {
        const { barbeiroId, data } = req.query;

        if (!barbeiroId || !data) {
            return res.status(400).json({ message: "Barbeiro e Data são obrigatórios." });
        }

        const inicioDoDia = new Date(`${data}T00:00:00.000Z`);
        const fimDoDia = new Date(`${data}T23:59:59.999Z`);

        const agendamentos = await Agendamento.find({
            barbeiro: barbeiroId,
            data_hora: {
                $gte: inicioDoDia,
                $lte: fimDoDia
            },
            status: { $ne: 'cancelado' }
        }).select('data_hora');

        return res.status(200).json(agendamentos);
    } catch (error) {
        return res.status(500).json({ message: "Erro ao buscar horários do barbeiro.", erro: error.message });
    }
};

exports.cancelarAgendamento = async (req, res) => {
    try {
        const agendamentoId = req.params.id; // Pega o ID da URL
        const clienteId = req.userId;        // Pega o ID do Token (Middleware)

        // 1. Busca o agendamento no banco
        const agendamento = await Agendamento.findById(agendamentoId);

        if (!agendamento) {
            return res.status(404).json({ message: "Agendamento não encontrado." });
        }

        // 2. Segurança: Verifica se o cliente que pediu o cancelamento é o dono do agendamento
        // (O toString() é necessário porque o cliente no banco é um ObjectId)
        if (agendamento.cliente.toString() !== clienteId) {
            return res.status(403).json({ message: "Você não tem permissão para cancelar este agendamento." });
        }

        // 3. Regra de Negócio: Não pode cancelar algo que já está cancelado
        if (agendamento.status === 'cancelado') {
            return res.status(400).json({ message: "Este agendamento já foi cancelado." });
        }

        // 4. Muda o status e salva
        agendamento.status = 'cancelado';
        await agendamento.save();

        return res.status(200).json({
            message: "Agendamento cancelado com sucesso!",
            dados: agendamento
        });

    } catch (error) {
        return res.status(500).json({ message: "Erro ao cancelar agendamento.", erro: error.message });
    }
};

exports.buscarHorariosOcupados = async (req, res) => {
    try {
        const { data, barbeiro } = req.query; // Espera formato YYYY-MM-DD
        
        if (!data || !barbeiro) {
            return res.status(400).json({ message: "Data e Barbeiro são obrigatórios." });
        }

        // Define o início e o fim do dia para a busca no banco
        const inicioDia = new Date(`${data}T00:00:00.000Z`);
        const fimDia = new Date(`${data}T23:59:59.999Z`);

        // Busca todos os agendamentos daquele barbeiro naquele dia
        const agendamentos = await Agendamento.find({
            barbeiro: barbeiro,
            data_hora: { $gte: inicioDia, $lte: fimDia }
        });

        // Extrai apenas as horas no formato "HH:MM" para o frontend
        const horasOcupadas = agendamentos.map(ag => {
            const hora = String(ag.data_hora.getUTCHours()).padStart(2, '0');
            const minuto = String(ag.data_hora.getUTCMinutes()).padStart(2, '0');
            return `${hora}:${minuto}`;
        });

        return res.status(200).json(horasOcupadas);

    } catch (error) {
        return res.status(500).json({ message: "Erro ao buscar disponibilidade.", erro: error.message });
    }
};