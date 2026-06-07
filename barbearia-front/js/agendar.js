// js/agendar.js

const token = localStorage.getItem('token');
if (!token) {
    window.location.href = 'login.html';
}

// Objeto central que armazena as escolhas do cliente
const bookingData = { 
    funcionario: '', 
    servico: '', 
    data: '', 
    horario: '' 
};

// ==========================================
// 1. COMPONENTE DE SERVIÇOS (DINÂMICO)
// ==========================================
async function renderizarServicos() {
    const container = document.getElementById('servicos-list');
    try {
        const resposta = await fetch(`${API_BASE_URL}/servicos`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const servicos = await resposta.json();
        container.innerHTML = ''; 

        servicos.forEach(servico => {
            const div = document.createElement('div');
            div.className = 'selectable-item';
            div.textContent = servico.nome; 
            div.setAttribute('data-value', servico._id); 

            div.addEventListener('click', () => {
                document.querySelectorAll('#servicos-list .selectable-item').forEach(i => i.classList.remove('selected'));
                div.classList.add('selected');
                bookingData.servico = servico._id;
                updateSummary();
            });
            container.appendChild(div);
        });
    } catch (erro) {
        container.innerHTML = '<p>Erro ao carregar serviços.</p>';
    }
}

// ==========================================
// 2. COMPONENTE DE FUNCIONÁRIOS (DINÂMICO)
// ==========================================
async function renderizarBarbeiros() {
    const container = document.getElementById('funcionarios-list');
    try {
        const resposta = await fetch(`${API_BASE_URL}/user?cargo=barbeiro`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const barbeiros = await resposta.json();
        container.innerHTML = ''; 

        barbeiros.forEach(barbeiro => {
            const div = document.createElement('div');
            div.className = 'selectable-item';
            div.textContent = barbeiro.nomeCompleto; 
            div.setAttribute('data-value', barbeiro._id); 

            div.addEventListener('click', () => {
                document.querySelectorAll('#funcionarios-list .selectable-item').forEach(i => i.classList.remove('selected'));
                div.classList.add('selected');
                bookingData.funcionario = barbeiro._id;
                updateSummary();
            });
            container.appendChild(div);
        });
    } catch (erro) {
        container.innerHTML = '<p>Erro ao carregar barbeiros.</p>';
    }
}

// ==========================================
// 3. CALENDÁRIO INTELIGENTE (DINÂMICO)
// ==========================================
function renderizarCalendario() {
    const container = document.getElementById('calendar-dates');
    const headerMesAno = document.getElementById('calendar-month-year');
    container.innerHTML = '';

    const hoje = new Date();
    const mesAtual = hoje.getMonth(); 
    const anoAtual = hoje.getFullYear();

    const nomesMeses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    headerMesAno.textContent = `${nomesMeses[mesAtual]} ${anoAtual}`;

    const primeiroDiaDaSemana = new Date(anoAtual, mesAtual, 1).getDay();
    const diasNoMes = new Date(anoAtual, mesAtual + 1, 0).getDate();

    for (let i = 0; i < primeiroDiaDaSemana; i++) {
        const divEmpty = document.createElement('div');
        divEmpty.className = 'empty';
        container.appendChild(divEmpty);
    }

    for (let day = 1; day <= diasNoMes; day++) {
        const divDay = document.createElement('div');
        divDay.textContent = day;
        
        if (day < hoje.getDate()) {
            divDay.style.opacity = '0.3';
            divDay.style.cursor = 'not-allowed';
        } else {
            divDay.addEventListener('click', () => {
                const selected = container.querySelector('.selected-date');
                if (selected) selected.classList.remove('selected-date');
                divDay.classList.add('selected-date');
                
                const diaFormatado = String(day).padStart(2, '0');
                const mesFormatado = String(mesAtual + 1).padStart(2, '0');
                bookingData.data = `${diaFormatado}/${mesFormatado}/${anoAtual}`;
                updateSummary();
            });
        }
        container.appendChild(divDay);
    }
}

// ==========================================
// 4. SELEÇÃO DE HORÁRIOS (MANTIDA!)
// ==========================================
const hourItems = document.querySelectorAll('.hour-item');
hourItems.forEach(hour => {
    hour.addEventListener('click', () => {
        hourItems.forEach(h => h.classList.remove('selected-hour'));
        hour.classList.add('selected-hour');
        bookingData.horario = hour.getAttribute('data-time');
        updateSummary();
    });
});

// ==========================================
// 5. ATUALIZAR RESUMO DA TELA
// ==========================================
function updateSummary() {
    const summaryText = document.getElementById('summary-text');
    if (bookingData.funcionario || bookingData.servico || bookingData.data || bookingData.horario) {
        summaryText.innerHTML = `
            <p style="margin-bottom: 8px;"><strong>Profissional:</strong> <br><span>${bookingData.funcionario ? 'Selecionado ✓' : 'Não selecionado'}</span></p>
            <p style="margin-bottom: 8px;"><strong>Serviço:</strong> <br><span>${bookingData.servico ? 'Selecionado ✓' : 'Não selecionado'}</span></p>
            <p style="margin-bottom: 8px;"><strong>Data:</strong> <br><span>${bookingData.data || 'Não selecionada'}</span></p>
            <p><strong>Horário:</strong> <br><span>${bookingData.horario || 'Não selecionado'}</span></p>
        `;
    }
}

// ==========================================
// 6. BOTÃO DE CONFIRMAÇÃO (ENVIO PARA A API)
// ==========================================
document.getElementById('btn-submit-booking').addEventListener('click', async () => {
    if (!bookingData.funcionario || !bookingData.servico || !bookingData.data || !bookingData.horario) {
        alert('Por favor, selecione todas as opções antes de confirmar!');
        return;
    }

    const partesData = bookingData.data.split('/');
    const dia = partesData[0];
    const mes = partesData[1];
    const ano = partesData[2];
    
    const dataHoraIso = `${ano}-${mes}-${dia}T${bookingData.horario}:00`;

    const payload = {
        data_hora: dataHoraIso,
        barbeiro: bookingData.funcionario,
        servico: bookingData.servico
    };

    try {
        const btn = document.getElementById('btn-submit-booking');
        btn.innerText = "Agendando...";
        btn.disabled = true;

        const resposta = await fetch(`${API_BASE_URL}/agendamentos/agendar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const dados = await resposta.json();

        if (resposta.status === 201) {
            alert('Agendamento realizado com sucesso!');
            window.location.reload(); 
        } else {
            alert(dados.message || 'Erro ao agendar horário.');
            btn.innerText = "Confirmar";
            btn.disabled = false;
        }

    } catch (erro) {
        console.error('Erro na requisição:', erro);
        alert('Erro ao conectar com o servidor.');
        const btn = document.getElementById('btn-submit-booking');
        btn.innerText = "Confirmar";
        btn.disabled = false;
    }
});

// Inicializa as funções dinâmicas ao carregar a página
renderizarServicos();
renderizarBarbeiros();
renderizarCalendario();