// Função para carregar participantes e exibir como checklist
function loadParticipants() {
    const participants = JSON.parse(localStorage.getItem('Participants')) || [];
    const checklistContainer = document.getElementById('participantsChecklist');

    // Limpar o container antes de adicionar elementos
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

// Função para validar e salvar as seleções
function finalizeSelection() {
    const participants = JSON.parse(localStorage.getItem('Participants')) || [];
    const fixedPairs = new Map();

    participants.forEach((participant, index) => {
        const checkbox = document.getElementById(`participant-${index}`);
        const dropdown = document.getElementById(`dropdown-${index}`);

        if (checkbox.checked && dropdown.value) {
            fixedPairs.set(participant, dropdown.value);
        }
    });

    console.log("Relações fixas:", Array.from(fixedPairs));

    // Criar blocos a partir das relações fixas
    createBlocks(participants, fixedPairs);

    alert("Seleções salvas com sucesso! Redirecionando para o sorteio...");
    window.location.href = "sorteio_realizado.html"; // Redireciona para a próxima etapa
}

// Função para criar e consolidar blocos a partir das relações fixas
function createBlocks(participants, fixedPairs) {
    const miniBlocks = []; // Para armazenar os mini-blocos inicialmente

    // Cria mini-blocos a partir das relações fixas
    fixedPairs.forEach((value, key) => {
        miniBlocks.push([key, value]);
    });

    console.log("Mini-blocos iniciais:", miniBlocks);

    // Consolidar mini-blocos em blocos maiores
    const consolidated = consolidateBlocksWithOrder(miniBlocks);

    // Adiciona participantes que não fazem parte de nenhum bloco
    participants.forEach((participant) => {
        const alreadyInBlock = consolidated.some(block => block.includes(participant));
        if (!alreadyInBlock) {
            consolidated.push([participant]); // Adiciona como um bloco isolado
        }
    });

    // Transforma cada bloco em uma string única
    const finalBlocks = consolidated.map(block => block.join('/'));

    console.log("Blocos finais consolidados:", finalBlocks);
    localStorage.setItem('Blocks', JSON.stringify(finalBlocks));
}

// Função para consolidar mini-blocos com base nas interseções
function consolidateBlocksWithOrder(miniBlocks) {
    let merged = true;

    while (merged) {
        merged = false;

        for (let i = 0; i < miniBlocks.length; i++) {
            for (let j = i + 1; j < miniBlocks.length; j++) {
                const block1 = miniBlocks[i];
                const block2 = miniBlocks[j];

                // Caso 1: Conecta pelo final do bloco1 com o início do bloco2
                if (block1[block1.length - 1] === block2[0]) {
                    miniBlocks[i] = [...block1, ...block2.slice(1)];
                    miniBlocks.splice(j, 1);
                    merged = true;
                    break;
                }

                // Caso 2: Conecta pelo início do bloco1 com o final do bloco2
                if (block2[block2.length - 1] === block1[0]) {
                    miniBlocks[i] = [...block2, ...block1.slice(1)];
                    miniBlocks.splice(j, 1);
                    merged = true;
                    break;
                }
            }
            if (merged) break;
        }
    }

    return miniBlocks;
}

// Adiciona evento ao botão "Sortear"
document.getElementById('sortButton').addEventListener('click', finalizeSelection);

// Evento para carregar os participantes ao carregar a página
document.addEventListener('DOMContentLoaded', loadParticipants);
