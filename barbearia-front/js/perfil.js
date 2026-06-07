// js/perfil.js

const token = localStorage.getItem('token');
if (!token) {
    window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', carregarDadosPerfil);

// 1. CARREGAR OS DADOS DO USUÁRIO LOGADO
async function carregarDadosPerfil() {
    try {
        const resposta = await fetch(`${API_BASE_URL}/user/perfil`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!resposta.ok) throw new Error("Erro ao carregar perfil");

        const usuario = await resposta.json();

        // Preenche os campos de texto com o que está no banco de dados
        document.getElementById('nomeCompleto').value = usuario.nomeCompleto || '';
        document.getElementById('email').value = usuario.email || '';

        // SE FOR GERENTE: Revela o bloco com o link para o painel de controle
        if (usuario.cargo === 'gerente') {
            document.getElementById('secaoGerente').style.display = 'block';
        }

    } catch (erro) {
        console.error(erro);
        alert("Erro ao carregar os dados do seu perfil.");
    }
}

// 2. ENVIAR AS ALTERAÇÕES PARA O BACKEND
const formPerfil = document.getElementById('formPerfil');
if (formPerfil) {
    formPerfil.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nomeCompleto = document.getElementById('nomeCompleto').value.trim();
        const email = document.getElementById('email').value.trim();
        const novaSenha = document.getElementById('novaSenha').value;
        const confirmarNovaSenha = document.getElementById('confirmarNovaSenha').value;

        // Validação básica de senha se o usuário digitou algo
        if (novaSenha && novaSenha !== confirmarNovaSenha) {
            alert("As novas senhas não coincidem!");
            return;
        }

        // Monta o payload dinamicamente (só envia senha se ela foi preenchida)
        const payload = {
            nomeCompleto,
            email
        };
        if (novaSenha) {
            payload.senhaHash = novaSenha;
        }

        try {
            const btn = document.getElementById('btnSalvarPerfil');
            btn.innerText = "Salvando...";
            btn.disabled = true;

            const resposta = await fetch(`${API_BASE_URL}/user/perfil`, {
                method: 'PUT', // Ou PATCH, dependendo de como está configurado no seu router
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const dados = await resposta.json();

            if (resposta.ok) {
                alert("Perfil atualizado com sucesso!");
                window.location.reload(); // Recarrega para limpar os campos de senha
            } else {
                alert(dados.message || "Erro ao atualizar dados.");
                btn.innerText = "Salvar Alterações";
                btn.disabled = false;
            }

        } catch (erro) {
            console.error(erro);
            alert("Erro de conexão com o servidor.");
            const btn = document.getElementById('btnSalvarPerfil');
            btn.innerText = "Salvar Alterações";
            btn.disabled = false;
        }
    });
}