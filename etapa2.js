// Configurações da API do JSONBin
const API_URL = "https://api.jsonbin.io/v3/b/6765548bad19ca34f8de4586";
const API_KEY = "$2a$10$oCxIAsUt8iE0U3g08fKK9OYyAqJ09/mkZRrUNIVdny/uyRP90wAjG";

// Função para carregar os dados do JSONBin
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
            return result.record || {};
        } else {
            console.error("Erro ao carregar os dados:", response.statusText);
            return {};
        }
    } catch (error) {
        console.error("Erro ao carregar os dados:", error);
        return {};
    }
}

// Função para salvar os dados no JSONBin
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

// Função para carregar os participantes
async function loadParticipants() {
    const data = await loadData();
    return data.participants || [];
}

// Função para carregar as relações fixas
async function loadFixedPairs() {
    const data = await loadData();
    return data.fixedPairs || [];
}

// Função para inicializar os blocos
async function initializeBlocks() {
    const participants = await loadParticipants();
    const fixedPairs = await loadFixedPairs();

    // Cria os mini-blocos baseados nas relações fixas
    const blocks = [];
    fixedPairs.forEach(({ giver, receiver }) => {
        const existingBlock = blocks.find(block => block.includes(giver) || block.includes(receiver));
        if (existingBlock) {
            if (!existingBlock.includes(giver)) existingBlock.push(giver);
            if (!existingBlock.includes(receiver)) existingBlock.push(receiver);
        } else {
            blocks.push([giver, receiver]);
        }
    });

    // Adiciona os participantes que não estão em blocos
    participants.forEach(participant => {
        if (!blocks.some(block => block.includes(participant))) {
            blocks.push([participant]);
        }
    });

    console.log("Blocos iniciais:", blocks);

    // Salva os blocos no JSONBin
    const data = await loadData();
    data.blocks = blocks.map(block => block.join("/"));
    await saveData(data);

    return blocks;
}

// Função para inicializar a página
async function initializePage() {
    const participants = await loadParticipants();

    const checklistContainer = document.getElementById('participantsChecklist');
    checklistContainer.innerHTML = '';

    participants.forEach((participant, index) => {
        const div = document.createElement('div');
        div.className = 'participant-item';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `participant-${index}`;
        checkbox.name = participant;
        checkbox.value = participant;

        const label = document.createElement('label');
        label.htmlFor = `participant-${index}`;
        label.innerText = participant;

        const arrow = document.createElement('span');
        arrow.className = 'arrow';
        arrow.innerHTML = '&#x2192;';
        arrow.style.display = 'none';

        const dropdown = document.createElement('select');
        dropdown.id = `dropdown-${index}`;
        dropdown.disabled = true;
        dropdown.innerHTML = `<option value="" disabled selected>Sorteado</option>`;

        participants.filter(p => p !== participant).forEach(p => {
            const option = document.createElement('option');
            option.value = p;
            option.innerText = p;
            dropdown.appendChild(option);
        });

        checkbox.onchange = () => {
            dropdown.disabled = !checkbox.checked;
            arrow.style.display = checkbox.checked ? 'inline-block' : 'none';
            if (!checkbox.checked) dropdown.value = "";
        };

        div.appendChild(checkbox);
        div.appendChild(label);
        div.appendChild(arrow);
        div.appendChild(dropdown);
        checklistContainer.appendChild(div);
    });
}

// Função para salvar relações fixas
async function saveFixedPairs() {
    const participants = await loadParticipants();
    const fixedPairs = [];

    participants.forEach((participant, index) => {
        const checkbox = document.getElementById(`participant-${index}`);
        const dropdown = document.getElementById(`dropdown-${index}`);

        if (checkbox.checked && dropdown.value) {
            fixedPairs.push({
                giver: participant,
                receiver: dropdown.value
            });
        }
    });

    console.log("Relações fixas salvas:", fixedPairs);

    const data = await loadData();
    data.fixedPairs = fixedPairs;
    await saveData(data);

    // Atualiza os blocos
    await initializeBlocks();

    // Redireciona para a página de sorteio realizado
    window.location.href = 'sorteio_realizado.html';
}

// Inicializa a página ao carregar
document.addEventListener('DOMContentLoaded', async () => {
    await initializePage();

    const nextButton = document.getElementById('next-button');
    if (nextButton) {
        nextButton.addEventListener('click', saveFixedPairs);
    }
});
