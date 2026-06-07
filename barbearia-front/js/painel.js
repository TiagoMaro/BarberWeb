// js/painel.js

const token = localStorage.getItem('token');
if (!token) window.location.href = 'login.html';

document.addEventListener('DOMContentLoaded', iniciarPainel);

// 1. VERIFICAÇÃO DE SEGURANÇA E CARREGAMENTO
async function iniciarPainel() {
    try {
        // Valida quem está acessando a página
        const respostaPerfil = await fetch(`${API_BASE_URL}/user/perfil`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const usuarioLogado = await respostaPerfil.json();

        // Expulsa intrusos que tentarem digitar painel.html na URL
        if (usuarioLogado.cargo !== 'gerente') {
            alert("Acesso Negado. Esta página é restrita a gerentes.");
            window.location.href = 'index.html';
            return;
        }

        // Se for gerente, carrega a lista de todos os usuários
        carregarUsuarios();
        carregarServicos(); 
        carregarEstatisticasDashboard()

    } catch (erro) {
        console.error("Erro ao validar acesso:", erro);
        alert("Erro de conexão com o servidor.");
        window.location.href = 'index.html';
    }
}

// 2. BUSCAR TODOS OS USUÁRIOS NO BANCO
async function carregarUsuarios() {
    const tbody = document.getElementById('tabelaUsuarios');
    
    try {
        // Sem filtro de cargo, a nossa API deve retornar todo mundo
        const resposta = await fetch(`${API_BASE_URL}/user`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const respostaJson = await resposta.json();
        
        // Trava de segurança para caso a API retorne { dados: [...] } ou direto o array [...]
        const usuarios = respostaJson.dados || respostaJson;

        tbody.innerHTML = ''; // Limpa a tabela

        if (!usuarios || usuarios.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Nenhum usuário encontrado.</td></tr>';
            return;
        }

        usuarios.forEach(user => {
            const tr = document.createElement('tr');
            
            // Define quais opções estarão selecionadas no menu suspenso
            const selCliente = user.cargo === 'cliente' ? 'selected' : '';
            const selBarbeiro = user.cargo === 'barbeiro' ? 'selected' : '';
            const selGerente = user.cargo === 'gerente' ? 'selected' : '';

            tr.innerHTML = `
                <td>${user.nomeCompleto || user.nome}</td>
                <td>${user.email}</td>
                <td>
                    <select id="selectCargo_${user._id}" class="select-cargo">
                        <option value="cliente" ${selCliente}>Cliente</option>
                        <option value="barbeiro" ${selBarbeiro}>Barbeiro</option>
                        <option value="gerente" ${selGerente}>Gerente</option>
                    </select>
                </td>
                <td>
                    <button class="btn-atualizar" onclick="atualizarCargo('${user._id}')">
                        Salvar Cargo
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (erro) {
        console.error("Erro ao carregar usuários:", erro);
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: red;">Erro ao carregar lista de usuários.</td></tr>';
    }
}

// 3. ENVIAR A PROMOÇÃO/REBAIXAMENTO PARA A API
async function atualizarCargo(userId) {
    // Pega o valor que o gerente selecionou naquele momento
    const novoCargo = document.getElementById(`selectCargo_${userId}`).value;

    const confirmar = confirm(`Tem certeza que deseja alterar o cargo deste usuário para ${novoCargo.toUpperCase()}?`);
    if (!confirmar) return;

    try {
        // Dispara para aquela rota PATCH que criamos anteriormente
        const resposta = await fetch(`${API_BASE_URL}/user/${userId}/cargo`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ novoCargo: novoCargo })
        });

        const dados = await resposta.json();

        if (resposta.ok) {
            alert(dados.message || "Cargo atualizado com sucesso!");
            // Não precisa dar reload na página inteira, a alteração visual já está feita, 
            // mas podemos chamar carregarUsuarios() novamente se preferir.
        } else {
            alert(dados.message || "Erro ao atualizar cargo.");
        }

    } catch (erro) {
        console.error("Erro ao atualizar cargo:", erro);
        alert("Erro de conexão com o servidor.");
    }
}

// ==========================================
// MÓDULO DE GESTÃO DE SERVIÇOS
// ==========================================

// 1. Carregar a lista de serviços
async function carregarServicos() {
    const tbody = document.getElementById('tabelaServicos');
    if (!tbody) return;
    
    try {
        const resposta = await fetch(`${API_BASE_URL}/servicos`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const respostaJson = await resposta.json();
        const servicos = respostaJson.dados || respostaJson;

        tbody.innerHTML = ''; 

        if (!servicos || servicos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Nenhum serviço cadastrado.</td></tr>';
            return;
        }

        servicos.forEach(servico => {
            const tr = document.createElement('tr');
            
            const preco = servico.preco ? `R$ ${servico.preco.toFixed(2)}` : 'R$ 0,00';
            
            // CORREÇÃO AQUI: Mudou de servico.duracao para servico.duracao_minutos
            const duracao = servico.duracao_minutos ? `${servico.duracao_minutos} min` : '--';

            tr.innerHTML = `
                <td><strong>${servico.nome}</strong></td>
                <td>${preco}</td>
                <td>${duracao}</td>
                <td>
                    <button onclick="abrirModalEdicao('${servico._id}', '${servico.nome}', ${servico.preco}, ${servico.duracao_minutos})" style="background-color: #ffc107; color: #000; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-weight: bold; margin-right: 5px;">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    
                    <button onclick="deletarServico('${servico._id}')" style="background-color: #dc3545; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-weight: bold;">
                        <i class="fas fa-trash"></i> Desativar
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (erro) {
        console.error("Erro ao carregar serviços:", erro);
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: red;">Erro ao carregar serviços.</td></tr>';
    }
}

// 2. Cadastrar novo serviço
const formNovoServico = document.getElementById('formNovoServico');
if (formNovoServico) {
    formNovoServico.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nome = document.getElementById('nomeServico').value.trim();
        const preco = parseFloat(document.getElementById('precoServico').value);
        
        // CORREÇÃO AQUI: Captura o valor na variável que o backend espera
        const duracao_minutos = parseInt(document.getElementById('duracaoServico').value);
        const descricao = "Sem descrição"; // Enviando um texto padrão para satisfazer o req.body

        try {
            const resposta = await fetch(`${API_BASE_URL}/servicos`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                // CORREÇÃO AQUI: Payload perfeitamente alinhado com o desestruturador do Controller
                body: JSON.stringify({ nome, descricao, preco, duracao_minutos })
            });

            const dados = await resposta.json();

            if (resposta.status === 201 || resposta.ok) {
                alert("Serviço cadastrado com sucesso!");
                formNovoServico.reset(); 
                carregarServicos(); // Atualiza a tabela imediatamente
            } else {
                alert(dados.message || "Erro ao cadastrar serviço.");
            }
        } catch (erro) {
            console.error("Erro ao salvar serviço:", erro);
            alert("Erro de conexão com o servidor.");
        }
    });
}

// 3. Excluir um serviço
async function deletarServico(id) {
    const confirmar = confirm("Tem certeza que deseja desativar este serviço?");
    if (!confirmar) return;

    try {
        // Ajustado para a sua nova rota PATCH de inativação
        const resposta = await fetch(`${API_BASE_URL}/servicos/${id}/inativar`, {
            method: 'PATCH',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (resposta.ok) {
            alert("Serviço desativado com sucesso!");
            carregarServicos(); // Recarrega a tabela
        } else {
            const dados = await resposta.json();
            alert(dados.message || "Erro ao desativar serviço.");
        }
    } catch (erro) {
        console.error("Erro ao deletar serviço:", erro);
        alert("Erro de conexão com o servidor.");
    }
}

async function carregarEstatisticasDashboard() {
    try {
        const resposta = await fetch(`${API_BASE_URL}/agendamentos/dashboard/estatisticas`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!resposta.ok) throw new Error("Erro ao buscar indicadores");

        const dados = await resposta.json();

        // Injeta os valores capturados diretamente nos elementos HTML correspondentes
        document.getElementById('statAgendamentos').innerText = dados.totalAgendamentos || 0;
        document.getElementById('statClientes').innerText = dados.totalClientes || 0;
        
        // Formata o faturamento como moeda brasileira (R$)
        if (dados.faturamentoHoje !== undefined) {
            document.getElementById('statFaturamento').innerText = dados.faturamentoHoje.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            });
        }

    } catch (erro) {
        console.error("Erro ao carregar blocos de estatísticas:", erro);
    }
}

function abrirModalEdicao(id, nome, preco, duracao) {
    document.getElementById('editServicoId').value = id;
    document.getElementById('editNomeServico').value = nome;
    document.getElementById('editPrecoServico').value = preco;
    document.getElementById('editDuracaoServico').value = duracao;
    
    // Altera o display de 'none' para 'flex' para mostrar a janela
    document.getElementById('modalEditarServico').style.display = 'flex';
}

// Função para fechar o modal
function fecharModalEdicao() {
    document.getElementById('modalEditarServico').style.display = 'none';
}

// Função que escuta o clique no "Salvar Alterações" do Modal
const formEditarServico = document.getElementById('formEditarServico');
if (formEditarServico) {
    formEditarServico.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = document.getElementById('editServicoId').value;
        const nome = document.getElementById('editNomeServico').value.trim();
        const preco = parseFloat(document.getElementById('editPrecoServico').value);
        const duracao_minutos = parseInt(document.getElementById('editDuracaoServico').value);
        const descricao = "Sem descrição"; // Mantendo o padrão que seu backend exige

        try {
            // Dispara para a sua rota PUT que já estava configurada!
            const resposta = await fetch(`${API_BASE_URL}/servicos/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nome, descricao, preco, duracao_minutos })
            });

            if (resposta.ok) {
                alert("Serviço atualizado com sucesso!");
                fecharModalEdicao(); // Esconde a janelinha
                carregarServicos(); // Atualiza a tabela com o novo preço/nome
            } else {
                const dados = await resposta.json();
                alert(dados.message || "Erro ao atualizar serviço.");
            }
        } catch (erro) {
            console.error("Erro ao atualizar serviço:", erro);
            alert("Erro de conexão com o servidor.");
        }
    });
}