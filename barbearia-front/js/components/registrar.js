// js/registrar.js

const formRegistrar = document.getElementById('formRegistrar');

if (formRegistrar) {
    formRegistrar.addEventListener('submit', async function (event) {
        event.preventDefault(); // Impede a página de recarregar

        // 1. Captura os valores digitados (Telefone ativado aqui!)
        const nome = document.getElementById('nome').value.trim();
        const sobrenome = document.getElementById('sobrenome').value.trim();
        const telefone = document.getElementById('telefone').value.trim();
        const email = document.getElementById('email').value.trim();
        const senha = document.getElementById('senha').value;
        const confirmarSenha = document.getElementById('confirmarSenha').value;

        // 2. Validação da Confirmação de Senha
        if (senha !== confirmarSenha) {
            Swal.fire({
                icon: 'error',
                title: 'Atenção!',
                text: 'As senhas não coincidem. Por favor, digite novamente.',
                confirmButtonColor: '#433831'
            });
            return;
        }

        // 3. Junta o nome e sobrenome
        const nomeCompleto = `${nome} ${sobrenome}`;

        // 4. Monta o pacote incluindo o telefone para a API
        const dadosNovoUsuario = {
            nomeCompleto: nomeCompleto,
            email: email,
            senhaHash: senha,
            telefone: telefone, // <-- Enviando o telefone para o banco de dados
            cargo: 'cliente'
        };

        try {
            // Dispara a requisição POST para o servidor
            const resposta = await fetch(`${API_BASE_URL}/user/registro`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dadosNovoUsuario)
            });

            const dados = await resposta.json();

            if (resposta.status === 201) {
                Swal.fire({
                    icon: 'success',
                    title: 'Bem-vindo!',
                    text: 'Conta criada com sucesso! Você já pode fazer o seu login.',
                    confirmButtonColor: '#433831'
                });
                window.location.href = 'login.html';
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Erro!',
                    text: dados.message || 'Erro ao criar conta. Verifique os dados.',
                    confirmButtonColor: '#433831'
                });
            }

        } catch (erro) {
            console.error('Erro na requisição de registro:', erro);
            Swal.fire({
                icon: 'error',
                title: 'Erro!',
                text: 'Erro ao conectar com o servidor. Verifique se a API está online.',
                confirmButtonColor: '#433831'
            });
        }
    });
}