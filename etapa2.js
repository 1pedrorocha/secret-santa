// Configurações da API do JSONBin
const API_URL = "https://api.jsonbin.io/v3/b/6765548bad19ca34f8de4586";
const API_KEY = "$2a$10$oCxIAsUt8iE0U3g08fKK9OYyAqJ09/mkZRrUNIVdny/uyRP90wAjG";

// Função para carregar participantes e exibir como checklist
async function loadParticipants() {
    const data = await loadDataFromJSONBin();
    const participants = data.participants || [];
    const fixedPairs = data.fixedPairs || [];

    console.log("Participantes carregados:", participants);
    console.log("Pares fixos carregados:", fixedPairs);

    const checklistContainer = document.getElementById('participantsChecklist');
    checklistContainer.innerHTML = "";

    participants.forEach((participant, index) => {
        const div = document.createElement('div');
        div.className = 'participant-item';

        // Criação do checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `participant-${index}`;
        checkbox.name = 'purchased';
        checkbox.value = participant;
        checkbox.onchange = () => toggleDropdown(index);

        // Criação do label
        const label = document.createElement('label');
        label.htmlFor = `participant-${index}`;
        label.innerText = participant;

        // Criação do dropdown
        const dropdown = document.createElement('select');
        dropdown.id = `dropdown-${index}`;
        dropdown.disabled = true; // Inicia desabilitado
        dropdown.innerHTML = `<option value="" disabled selected>Selecione quem este participante tirou</option>`;
        participants
            .filter(p => p !== participant) // Remove o próprio participante da lista
            .forEach(p => {
                const option = document.createElement('option');
                option.value = p;
                option.innerText = p;
                dropdown.appendChild(option);
            });

        // Adicionar elementos ao container
        div.appendChild(checkbox);
        div.appendChild(label);
        div.appendChild(dropdown);
        checklistContainer.appendChild(div);
    });
}

// Função para habilitar/desabilitar dropdown baseado no checkbox
function toggleDropdown(index) {
    const dropdown = document.getElementById(`dropdown-${index}`);
    const checkbox = document.getElementById(`participant-${index}`);
    dropdown.disabled = !checkbox.checked;

    // Limpa o valor selecionado se o checkbox for desmarcado
    if (!checkbox.checked) {
        dropdown.value = "";
    }
}

// Função para salvar as seleções no JSONBin
async function finalizeStep2() {
    const data = await loadDataFromJSONBin();
    const participants = data.participants || [];
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

    // Criar os blocos respeitando as relações fixas
    const blocks = createBlocks(participants, fixedPairs);

    console.log("Blocos formados:", blocks);

    // Salvar no JSONBin
    const updatedData = { participants, fixedPairs, blocks };
    await saveDataToJSONBin(updatedData);

    alert("Relações salvas com sucesso! Redirecionando para o sorteio...");
    window.location.href = 'sorteio_realizado.html';
}

// Função para criar blocos respeitando as relações fixas
function createBlocks(participants, fixedPairs) {
    const blocks = [];
    const used = new Set(); // Participantes já alocados em blocos

    // Cria um bloco para cada par fixo
    fixedPairs.forEach(pair => {
        const { giver, receiver } = pair;
        let merged = false;

        // Tente unir blocos existentes que contenham o "giver" ou o "receiver"
        blocks.forEach((block, index) => {
            const elements = block.split('/');
            if (elements.includes(giver)) {
                if (!elements.includes(receiver)) {
                    blocks[index] += `/${receiver}`;
                    used.add(receiver);
                }
                used.add(giver);
                merged = true;
            } else if (elements.includes(receiver)) {
                if (!elements.includes(giver)) {
                    blocks[index] = `${giver}/${block}`;
                    used.add(giver);
                }
                used.add(receiver);
                merged = true;
            }
        });

        // Se nenhum bloco existente foi unido, crie um novo bloco
        if (!merged) {
            blocks.push(`${giver}/${receiver}`);
            used.add(giver);
            used.add(receiver);
        }
    });

    // Adicione participantes que não estão em nenhum bloco como elementos individuais
    participants.forEach(participant => {
        if (!used.has(participant)) {
            blocks.push(participant);
        }
    });

    return blocks;
}

// Função para carregar dados do JSONBin
async function loadDataFromJSONBin() {
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

// Função para salvar dados no JSONBin
async function saveDataToJSONBin(data) {
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

// Adiciona eventos ao carregar a página
document.addEventListener('DOMContentLoaded', async () => {
    await loadParticipants();

    const nextButton = document.getElementById('next-button');
    if (nextButton) {
        nextButton.addEventListener('click', finalizeStep2);
    }
});
