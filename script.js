const API_URL = "https://api.jsonbin.io/v3/b/6765548bad19ca34f8de4586"; // Substitua pelo seu Bin ID
const API_KEY = "$2a$10$oCxIAsUt8iE0U3g08fKK9OYyAqJ09/mkZRrUNIVdny/uyRP90wAjG"; // Substitua pela sua API Key

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
    newInput.oninput = handleInput;

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
    firstInput.name = `participant-1`;
    firstInput.type = 'text';
    firstInput.inputMode = 'text';
    firstInput.placeholder = "Adicione o nome do primeiro participante";
    firstInput.autocomplete = 'off';
    firstInput.spellcheck = 'false';
    firstInput.setAttribute('data-lpignore', 'true');
    firstInput.oninput = handleInput;

    form.appendChild(firstInput);
}

// Função para salvar os participantes e ir para a Etapa 2
async function goToStep2() {
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

    // Limpa os dados existentes no JSONBin
    await clearData();

    // Salva os novos participantes no JSONBin
    const data = { participants }; // Atualiza apenas os participantes
    await saveData(data);

    // Redireciona para a próxima etapa
    window.location.href = 'etapa2.html';
}

// Função para limpar os dados no JSONBin
async function clearData() {
    try {
        const response = await fetch(API_URL, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-Master-Key": API_KEY,
            },
            body: JSON.stringify({}), // Envia um objeto vazio para limpar os dados
        });

        if (response.ok) {
            console.log("Dados antigos removidos com sucesso.");
        } else {
            console.error("Erro ao limpar os dados:", response.statusText);
        }
    } catch (error) {
        console.error("Erro ao limpar os dados (exceção):", error);
    }
}

// Função para salvar dados no JSONBin
async function saveData(data) {
    try {
        const response = await fetch(API_URL, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-Master-Key": API_KEY,
            },
            body: JSON.stringify(data),
        });
        if (response.ok) {
            console.log("Dados salvos com sucesso!");
        } else {
            console.error("Erro ao salvar os dados:", response.statusText);
        }
    } catch (error) {
        console.error("Erro ao salvar os dados:", error);
    }
}

// Função para carregar dados do JSONBin
async function loadData() {
    try {
        const response = await fetch(API_URL, {
            method: "GET",
            headers: {
                "X-Master-Key": API_KEY,
            },
        });
        if (response.ok) {
            const result = await response.json();
            return result.record;
        } else {
            console.error("Erro ao carregar os dados:", response.statusText);
            return null;
        }
    } catch (error) {
        console.error("Erro ao carregar os dados:", error);
        return null;
    }
}

// Adiciona eventos ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    initializeForm();

    const nextButton = document.getElementById('next-button');
    if (nextButton) {
        nextButton.addEventListener('click', goToStep2);
    }
});



// salvando

async function saveData(data) {
    const loadingMessage = document.getElementById("loadingMessage");
    if (loadingMessage) loadingMessage.style.display = "block";

    console.log("Iniciando a gravação no JSONBin...");
    console.log("Dados a serem salvos:", data);

    try {
        const response = await fetch(API_URL, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-Master-Key": API_KEY,
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            console.log("Dados salvos com sucesso!");
            const result = await response.json();
            console.log("Resposta do servidor:", result);
        } else {
            console.error("Erro ao salvar os dados:", response.status, response.statusText);
        }
    } catch (error) {
        console.error("Erro ao salvar os dados (exceção):", error);
    } finally {
        if (loadingMessage) loadingMessage.style.display = "none";
    }
}
