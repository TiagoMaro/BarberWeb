// js/agenda.js

const token = localStorage.getItem('token');
if (!token) window.location.href = 'login.html';

document.addEventListener('DOMContentLoaded', iniciarDashboard);

async function iniciarDashboard() {
    try {
        // Descobre quem é o usuário logado
        const respostaPerfil = await fetch(`${API_BASE_URL}/user/perfil`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const usuarioLogado = await respostaPerfil.json();

        // Se for gerente, exibe o seletor de barbeiros
        if (usuarioLogado.cargo === 'gerente') {
            configurarPainelGerente();
        }

        // Busca a agenda de HOJE
        carregarAgendamentos(usuarioLogado.cargo);

    } catch (erro) {
        console.error("Erro ao iniciar dashboard:", erro);
    }
}

async function carregarAgendamentos(cargo, barbeiroIdOpcional = '') {
    const container = document.getElementById('appointments-list');
    if (!container) return;

    try {
        // Monta a URL base (buscando TODOS)
        let url = `${API_BASE_URL}/agendamentos`;

        // Se o gerente filtrou um barbeiro, adicionamos na URL
        if (cargo === 'gerente' && barbeiroIdOpcional) {
            url += `?barbeiro=${barbeiroIdOpcional}`;
        }

        const resposta = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const respostaDaApi = await resposta.json();
        const agendamentos = respostaDaApi.dados;

        container.innerHTML = '';

        if (!agendamentos || agendamentos.length === 0) {
            container.innerHTML = '<p style="text-align:center;">Nenhum agendamento encontrado.</p>';
            return;
        }

        agendamentos.forEach(ag => {
            const card = document.createElement('div');
            card.className = 'agenda-container-card';

            const dataCompleta = new Date(ag.data_hora);
            const dia = String(dataCompleta.getUTCDate()).padStart(2, '0');
            const mes = String(dataCompleta.getUTCMonth() + 1).padStart(2, '0');
            const ano = dataCompleta.getUTCFullYear();

            const hora = String(dataCompleta.getUTCHours()).padStart(2, '0');
            const minuto = String(dataCompleta.getUTCMinutes()).padStart(2, '0');

            dataFormatada = `${dia}/${mes}/${ano}`;
            horaFormatada = `${hora}:${minuto}`;


            // Define a cor do status (verde para ativo, vermelho para cancelado)
            const isCancelado = ag.status === 'cancelado';
            const corStatus = isCancelado ? 'red' : 'green';
            const textoStatus = isCancelado ? 'Cancelado' : 'Confirmado';

            // O botão só existe se NÃO estiver cancelado
            const botaoCancelar = isCancelado ? '' :
                `<button onclick="cancelarAgendamento('${ag._id}')" 
                         style="background: #ff4c4c; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; margin-top: 10px;">
                    Cancelar Horário
                </button>`;

            if (cargo === 'cliente') {
                card.innerHTML = `
                    <h3 style="">📅 ${dataFormatada} - ⏰ ${horaFormatada}</h3>
                    <p><strong>Barbeiro:</strong> ${ag.barbeiro?.nomeCompleto || 'Não informado'}</p>
                    <p><em>Status: <strong style="color: ${corStatus}">${textoStatus}</strong></em></p>
                    ${botaoCancelar}
                `;
            } else {
                // Visão do Barbeiro ou Gerente
                card.innerHTML = `
                    <h3 style="">📅 ${dataFormatada} - ⏰ ${horaFormatada}</h3>
                    <p><strong>Cliente:</strong> ${ag.cliente?.nomeCompleto || 'Não informado'}</p>
                    <p><strong>Contato:</strong> ${ag.cliente?.email || ag.cliente?.telefone || 'Sem contato'}</p>
                    <p><em>Status: <strong style="color: ${corStatus}">${textoStatus}</strong></em></p>
                `;
            }
            container.appendChild(card);
        });

    } catch (erro) {
        container.innerHTML = '<p>Erro ao carregar a listagem.</p>';
        console.error(erro);
    }
}

async function configurarPainelGerente() {
    const blocoFiltro = document.getElementById('filtroGerente');
    const select = document.getElementById('selectBarbeirosGerente');

    if (blocoFiltro) blocoFiltro.style.display = 'block';

    try {
        const resposta = await fetch(`${API_BASE_URL}/user?cargo=barbeiro`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const respostaJson = await resposta.json();
        const barbeiros = respostaJson.dados || respostaJson;

        barbeiros.forEach(b => {
            const opt = document.createElement('option');
            opt.value = b._id;
            opt.textContent = b.nomeCompleto || b.nome;
            if (select) select.appendChild(opt);
        });

        if (select) {
            select.addEventListener('change', (e) => {
                // Recarrega a lista toda vez que o gerente muda a seleção
                carregarAgendamentos('gerente', e.target.value);
            });
        }
    } catch (erro) {
        console.error("Erro ao configurar filtros:", erro);
    }
}

async function cancelarAgendamento(idAgendamento) {
    // Confirmação de segurança para evitar cliques acidentais
    const confirmacao = await Swal.fire({
        title: 'Tem certeza?',
        text: "Deseja cancelar este horário?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545', // Vermelho para a ação de cancelar/excluir
        cancelButtonColor: '#433831',  // Marrom padrão da barbearia
        confirmButtonText: 'Sim, cancelar!',
        cancelButtonText: 'Não, voltar'
    });
    if (!confirmacao.isConfirmed) return;

    try {
        const resposta = await fetch(`${API_BASE_URL}/agendamentos/${idAgendamento}/cancelar`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const dados = await resposta.json();

        if (resposta.ok) {
            Swal.fire({
                icon: 'success',
                title: 'Sucesso!',
                text: 'Agendamento cancelado com sucesso!',
                confirmButtonColor: '#433831'
            });
            window.location.reload(); // Recarrega a tela para atualizar a cor do status
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Ops...',
                text: dados.message || 'Erro ao cancelar. Tente novamente.',
                confirmButtonColor: '#433831'
            });
        }
    } catch (erro) {
        console.error("Erro ao cancelar:", erro);
        Swal.fire({
            icon: 'error',
            title: 'Erro!',
            text: 'Erro de conexão com o servidor.',
            confirmButtonColor: '#433831'
        });
    }
}