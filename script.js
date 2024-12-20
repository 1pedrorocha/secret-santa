// Função para adicionar um novo input dinamicamente
function addNewInput() {
    const form = document.getElementById('participantForm');
    const inputCount = form.querySelectorAll('input[type="text"]').length + 1;

    // Cria o novo campo de input
    const newInput = document.createElement('input');
    newInput.name = `participant-${inputCount}`;
    newInput.type = 'text';
    newInput.inputMode = 'text';
    newInput.placeholder = `Adicione o nome do participante ${inputCount}`;
    newInput.autocomplete = 'off';
    newInput.spellcheck = 'false';
    newInput.setAttribute('data-lpignore', 'true');
    newInput.oninput = handleInput; // Adiciona evento para detectar entrada de texto

    form.appendChild(newInput);
}

// Função para lidar com a entrada no campo de texto
function handleInput(event) {
    const input = event.target;

    // Garante que o próximo input só seja criado ao digitar no atual
    if (!input.dataset.hasCreatedNext && input.value.trim() !== "") {
        addNewInput();
        input.dataset.hasCreatedNext = true; // Marca que o próximo input foi criado
    }
}

// Inicializa o formulário com o primeiro input
function initializeForm() {
    const form = document.getElementById('participantForm');
    form.innerHTML = ''; // Limpa o formulário para começar vazio

    // Cria o primeiro input
    const firstInput = document.createElement('input');
    firstInput.type = 'text';
    firstInput.placeholder = "Adicione o nome do primeiro participante";
    firstInput.oninput = handleInput; // Adiciona evento para entrada de texto

    form.appendChild(firstInput);
}

// Função para salvar os participantes e ir para a Etapa 2
function goToStep2() {
    const form = document.getElementById('participantForm');
    const inputs = form.querySelectorAll('input[type="text"]');
    const participants = [];

    inputs.forEach(input => {
        if (input.value.trim() !== '') {
            participants.push(input.value.trim());
        }
    });

    if (participants.length < 2) {
        alert("Adicione pelo menos 2 participantes antes de prosseguir!");
        return;
    }

    // Salva os participantes no Local Storage
    localStorage.setItem('Participants', JSON.stringify(participants));

    // Redireciona para a página da etapa 2
    window.location.href = 'etapa2.html';
}

// Função para limpar dados do projeto (se necessário)
function clearProjectData() {
    localStorage.removeItem('Participants');
    localStorage.removeItem('fixedPairs');
    localStorage.removeItem('FinalArray');
}

// Adiciona eventos ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    initializeForm();

    const nextButton = document.getElementById('next-button');
    if (nextButton) {
        nextButton.addEventListener('click', goToStep2);
    }
});


// Limpando local storage
document.addEventListener('DOMContentLoaded', () => {
    localStorage.clear(); // Limpa toda a Local Storage ao carregar a primeira página
});