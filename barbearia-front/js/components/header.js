function renderizarHeader() {
    const headerHTML = `
    <header class="navbar">
        <div class="nav-group">
            <a href="index.html" class="nav-link btn-left">HOME</a>
            <a href="agendar.html" class="nav-link btn-right">AGENDAR</a>
        </div>
        <div class="logo-text">Fauget<br>Barber</div>
        <div class="user-info">
            <span id="statusUsuario">Carregando...</span>
            <button id="btnSair" class="nav-link btn-right" style="display: none;">Sair</button>
        </div>
    </header>
    `;

    // 2. Procura a tag onde o cabeçalho deve nascer e injeta o HTML nela
    const headerContainer = document.getElementById('header-componente');
    if (headerContainer) {
        headerContainer.innerHTML = headerHTML;
    }

    // 3. Verifica o Login (A inteligência do componente)
    verificarEstadoLogin();
}

async function verificarEstadoLogin() {
    const token = localStorage.getItem('token');
    const statusUsuario = document.getElementById('statusUsuario');
    const btnSair = document.getElementById('btnSair');

    // Se não houver token, o usuário é apenas um visitante comum
    if (!token) {
        if (statusUsuario) {
            statusUsuario.innerHTML = '<a href="login.html" class="link-login">Fazer Login</a>';
        }
        return; 
    }

    // Se existe um token, vamos perguntar para a API quem é o dono dele
    try {
        const resposta = await fetch(`${API_BASE_URL}/user/perfil`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`, // Envia o token para passar pelo cão de guarda do backend
                'Content-Type': 'application/json'
            }
        });

        if (resposta.ok) {
            const usuario = await resposta.json();
            
            // MÁGICA AQUI: Exibe o nome real do banco de dados!
            if (statusUsuario) {
                statusUsuario.textContent = `👋 Olá, ${usuario.nomeCompleto.split(' ')[0]}`;
            }

            // Mostra o botão de sair
            if (btnSair) {
                btnSair.style.display = 'inline-block';
                btnSair.addEventListener('click', () => {
                    localStorage.removeItem('token');
                    window.location.href = 'login.html';
                });
            }
        } else {
            // Se o token for inválido ou estiver expirado, limpa o cofre e desloga
            localStorage.removeItem('token');
            if (statusUsuario) {
                statusUsuario.innerHTML = '<a href="login.html">Fazer Login</a>';
            }
        }

    } catch (erro) {
        console.error('Erro ao buscar dados do cabeçalho:', erro);
        if (statusUsuario) {
            statusUsuario.textContent = '🟢 Logado (Modo Offline)';
        }
    }
}

// 4. Executa a função assim que o arquivo é carregado
renderizarHeader();