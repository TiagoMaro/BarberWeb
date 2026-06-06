const token = localStorage.getItem('token');

if (!token) {
    // Se não tem token, o usuário não está logado!
    window.location.href = 'login.html'; // Manda de volta pro login
}

// 2. DAR O FEEDBACK DE SUCESSO
// Como o código chegou até aqui, significa que o token existe.
document.addEventListener('DOMContentLoaded', () => {
    
    const statusUsuario = document.getElementById('statusUsuario');
    const btnSair = document.getElementById('btnSair');

    // Atualiza a tela para mostrar que está logado
    if (statusUsuario) {
        statusUsuario.textContent = '🟢 Você está logado no sistema!';
        // Dica: No futuro, podemos fazer um GET na rota de perfil para mostrar o nome real do usuário aqui!
    }

    // Mostra o botão de sair
    if (btnSair) {
        btnSair.style.display = 'inline-block';
        
        // 3. A LÓGICA DE LOGOUT
        btnSair.addEventListener('click', () => {
            // Remove o token do cofre do navegador
            localStorage.removeItem('token');
            
            // Redireciona para o login
            window.location.href = 'login.html';
        });
    }
});