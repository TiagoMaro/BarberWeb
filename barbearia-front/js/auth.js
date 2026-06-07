document.getElementById('formLogin').addEventListener('submit', async function (event) {
    // IMPORTANTE: Isso impede que a página recarregue e pisque a tela
    event.preventDefault();

    // Captura o que o usuário digitou nos campos
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    try {
        // Dispara a requisição para a sua API
        const resposta = await fetch(`${API_BASE_URL}/user/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email, senhaHash: senha })
        });

        // Converte a resposta do servidor para JSON
        const dados = await resposta.json();

        // Se a API retornar status 200 (OK)
        if (resposta.ok) {
            // Guarda o token no navegador
            localStorage.setItem('token', dados.token);

            // Redireciona o usuário para a página de agenda/dashboard
            window.location.href = 'index.html';
        } else {
            // Se a senha estiver errada, mostra o erro da API
            Swal.fire({
                icon: 'error',
                title: 'Ops...',
                text: dados.message || 'Erro ao realizar login.',
                confirmButtonColor: '#433831'
            });
        }

    } catch (erro) {
        console.error('Erro na requisição:', erro);
        Swal.fire({
            icon: 'error',
            title: 'Erro!',
            text: 'Erro ao conectar com o servidor. Verifique se a API está rodando.',
            confirmButtonColor: '#433831'
        });
    }
});