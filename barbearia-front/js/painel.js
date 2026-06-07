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
            
            // Tratamento caso o preço venha nulo do banco
            const preco = servico.preco ? `R$ ${servico.preco.toFixed(2)}` : 'R$ 0,00';
            const duracao = servico.duracao ? `${servico.duracao} min` : '--';

            tr.innerHTML = `
                <td><strong>${servico.nome || servico.titulo}</strong></td>
                <td>${preco}</td>
                <td>${duracao}</td>
                <td>
                    <button onclick="deletarServico('${servico._id}')" style="background-color: #dc3545; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-weight: bold;">
                        <i class="fas fa-trash"></i> Excluir
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
        const duracao = parseInt(document.getElementById('duracaoServico').value);

        try {
            const resposta = await fetch(`${API_BASE_URL}/servicos`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nome, preco, duracao })
            });

            const dados = await resposta.json();

            if (resposta.status === 201 || resposta.ok) {
                alert("Serviço cadastrado com sucesso!");
                formNovoServico.reset(); // Limpa os campos
                carregarServicos(); // Atualiza a tabela na hora
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
    const confirmar = confirm("Tem certeza que deseja excluir este serviço? Esta ação não pode ser desfeita.");
    if (!confirmar) return;

    try {
        const resposta = await fetch(`${API_BASE_URL}/servicos/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (resposta.ok) {
            alert("Serviço excluído com sucesso!");
            carregarServicos(); // Recarrega a tabela para remover o item
        } else {
            const dados = await resposta.json();
            alert(dados.message || "Erro ao excluir serviço.");
        }
    } catch (erro) {
        console.error("Erro ao deletar serviço:", erro);
        alert("Erro de conexão com o servidor.");
    }
}