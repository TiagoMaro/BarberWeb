// Objeto para guardar as escolhas do usuário
const bookingData = {
    funcionario: '',
    servico: '',
    data: '',
    horario: ''
};

// --- SELEÇÃO DE FUNCIONÁRIO E SERVIÇO ---
function setupSelectableGroup(containerId, dataKey) {
    const items = document.querySelectorAll(`#${containerId} .selectable-item`);
    items.forEach(item => {
        item.addEventListener('click', () => {
            items.forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');
            bookingData[dataKey] = item.getAttribute('data-value');
            updateSummary();
        });
    });
}
setupSelectableGroup('funcionarios-list', 'funcionario');
setupSelectableGroup('servicos-list', 'servico');

// --- SELEÇÃO DE HORÁRIOS ---
const hourItems = document.querySelectorAll('.hour-item');
hourItems.forEach(hour => {
    hour.addEventListener('click', () => {
        hourItems.forEach(h => h.classList.remove('selected-hour'));
        hour.classList.add('selected-hour');
        bookingData.horario = hour.getAttribute('data-time');
        updateSummary();
    });
});

// --- GERADOR DE CALENDÁRIO SIMPLES (Maio de 2026 como base) ---
const calendarDatesContainer = document.getElementById('calendar-dates');
const totalDays = 31;
const startDayOfWeek = 5; // Maio de 2026 começa em uma sexta-feira

// Renderizar dias vazios até o começo do mês
for (let i = 0; i < startDayOfWeek; i++) {
    const emptyDiv = document.createElement('div');
    emptyDiv.classList.add('empty');
    calendarDatesContainer.appendChild(emptyDiv);
}

// Criar os dias clicáveis
for (let day = 1; day <= totalDays; day++) {
    const dayDiv = document.createElement('div');
    dayDiv.innerText = day;
    dayDiv.addEventListener('click', () => {
        const selected = calendarDatesContainer.querySelector('.selected-date');
        if (selected) selected.classList.remove('selected-date');
        dayDiv.classList.add('selected-date');

        bookingData.data = `${day}/05/2026`;
        updateSummary();
    });
    calendarDatesContainer.appendChild(dayDiv);
}

// --- ATUALIZAR RESUMO (CONFIRMAÇÃO) ---
const summaryText = document.getElementById('summary-text');
function updateSummary() {
    if (bookingData.funcionario || bookingData.servico || bookingData.data || bookingData.horario) {
        summaryText.innerHTML = `
                    <p style="margin-bottom: 8px;"><strong>Profissional:</strong> <br><span>${bookingData.funcionario || 'Não selecionado'}</span></p>
                    <p style="margin-bottom: 8px;"><strong>Serviço:</strong> <br><span>${bookingData.servico || 'Não selecionado'}</span></p>
                    <p style="margin-bottom: 8px;"><strong>Data:</strong> <br><span>${bookingData.data || 'Não selecionada'}</span></p>
                    <p><strong>Horário:</strong> <br><span>${bookingData.horario || 'Não selecionado'}</span></p>
                `;
    }
}

// --- BOTÃO DE CONFIRMAÇÃO ---
document.getElementById('btn-submit-booking').addEventListener('click', () => {
    if (!bookingData.funcionario || !bookingData.servico || !bookingData.data || !bookingData.horario) {
        alert('Por favor, selecione todas as opções antes de confirmar!');
    } else {
        alert(`Agendamento realizado com sucesso!\n\nBarbeiro: ${bookingData.funcionario}\nServiço: ${bookingData.servico}\nData: ${bookingData.data}\nHora: ${bookingData.horario}`);
        // Aqui você integrará o envio para o banco de dados futuramente
    }
});