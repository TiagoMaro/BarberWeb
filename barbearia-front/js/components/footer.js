function renderizarFooter() {
    const footerHTML = `
        <div class="footer-col">
            <p><strong>A excelência em cada detalhe.</strong></p>
            <br>
            <p>Políticas de Privacidade.<br>Todos Termos Reservados.</p>
        </div>

        <div class="footer-col footer-logo">
            <div class="logo-text">Fauget<br>Barber</div>
        </div>

        <div class="footer-col right-aligned-content">
            <div class="info-block">
                <p><strong>Redes sociais.</strong></p>
                <div class="social-icons">
                    <a href="https://instagram.com" target="_blank" title="Instagram"><i
                            class="fa-brands fa-instagram"></i></a>
                    <a href="https://wa.me/seunumeroaqui" target="_blank" title="WhatsApp"><i
                            class="fa-brands fa-whatsapp"></i></a>
                    <a href="https://facebook.com" target="_blank" title="Facebook"><i
                            class="fa-brands fa-facebook-f"></i></a>
                </div>
                <p><strong>Localização.</strong></p>
                <p>R. Konrad Adenauer, 442 - Tarumã, Curitiba - PR, 82820-540</p>
            </div>
        </div>
    `;

    const footerContainer = document.getElementById('footer-componente');
    if (footerContainer) {
        footerContainer.innerHTML = footerHTML;
    }

    document.body.appendChild(footer);
}

renderizarFooter();