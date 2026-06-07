const token = localStorage.getItem('token');

if (!token) {
    // Se não tem token, o usuário não está logado!
    window.location.href = 'login.html'; // Manda de volta pro login
}