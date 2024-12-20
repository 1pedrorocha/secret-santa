// Configurações da API do JSONBin
const API_URL = "https://api.jsonbin.io/v3/b/6765548bad19ca34f8de4586";
const API_KEY = "$2a$10$oCxIAsUt8iE0U3g08fKK9OYyAqJ09/mkZRrUNIVdny/uyRP90wAjG";

// Função para carregar os blocos do JSONBin
async function loadBlocks() {
    try {
        const response = await fetch(API_URL, {
            method: "GET",
            headers: {
                "X-Master-Key": API_KEY,
            },
        });
        if (response.ok) {
            const result = await response.json();
            return result.record.blocks || [];
        } else {
            console.error("Erro ao carregar os blocos:", response.statusText);
            return [];
        }
    } catch (error) {
        console.error("Erro ao carregar os blocos:", error);
        return [];
    }
}

// Função para embaralhar um array
function shuffleArray(array) {
    const shuffled = array.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Função para expandir blocos em uma sequência
function expandBlocks(blocks) {
    const expanded = [];
    blocks.forEach(block => {
        expanded.push(...block.split("/"));
    });
    return expanded;
}

// Função para criar pares do sorteio
function createPairs(sequence) {
    const pairs = new Map();
    for (let i = 0; i < sequence.length; i++) {
        const giver = sequence[i];
        const receiver = sequence[(i + 1) % sequence.length];
        pairs.set(giver, receiver);
    }
    return pairs;
}

// Função para carregar os botões dos participantes
function loadParticipantButtons(pairs) {
    const container = document.getElementById('participantButtons');
    container.innerHTML = ''; // Limpa o container

    Array.from(pairs.keys()).sort().forEach(participant => {
        const button = document.createElement('button');
        button.className = 'participant-button';
        button.innerText = participant;
        button.onclick = () => showConfirmationModal(participant, pairs);
        container.appendChild(button);
    });
}

// Função para revelar quem o participante tirou
function revealSelection(participant, pairs) {
    const mainContent = document.querySelector('main');
    const resultContainer = document.getElementById('revealResult');

    const selected = pairs.get(participant);
    document.getElementById('revealTitle').innerText = `Oi, ${participant}!`;
    document.getElementById('revealSubtitle').innerText = "Seu amigo secreto é...";
    document.getElementById('revealFriend').innerText = selected || "Nenhum amigo selecionado";
    document.getElementById('revealDate').innerText = "25/12/2024";

    // Troca visibilidade
    mainContent.classList.add('hidden');
    resultContainer.classList.remove('hidden');
}

// Função para esconder o resultado
function hideRevealResult() {
    const mainContent = document.querySelector('main');
    const resultContainer = document.getElementById('revealResult');

    // Restaura visibilidade
    resultContainer.classList.add('hidden');
    mainContent.classList.remove('hidden');
}

// Função para mostrar o modal de confirmação
function showConfirmationModal(participant, pairs) {
    const modal = document.getElementById('confirmationModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const confirmButton = document.getElementById('confirmButton');

    // Define o título e a mensagem do modal
    modalTitle.innerText = `Você é ${participant}?`;
    modalMessage.innerHTML = `A surpresa é parte da diversão do amigo secreto. Revele o nome com atenção para não comprometer o sorteio.`;
    confirmButton.innerText = `Sim, eu sou ${participant}`;
    confirmButton.onclick = () => {
        revealSelection(participant, pairs);
        closeModal(); // Fechar o modal após a confirmação
    };

    modal.style.display = 'flex';
}

// Função para fechar o modal
function closeModal() {
    const modal = document.getElementById('confirmationModal');
    modal.style.display = 'none';
}

// Carregar e processar os blocos ao carregar a página
document.addEventListener('DOMContentLoaded', async () => {
    const blocks = await loadBlocks();
    if (blocks.length === 0) {
        console.error("Nenhum bloco encontrado.");
        return;
    }

    console.log("Blocos carregados:", blocks);

    // Randomiza a ordem dos blocos e expande a sequência
    const shuffledBlocks = shuffleArray(blocks);
    const sequence = expandBlocks(shuffledBlocks);
    console.log("Sequência final:", sequence);

    // Cria os pares do sorteio
    const pairs = createPairs(sequence);
    console.log("Pares criados:", Array.from(pairs));

    // Exibe os botões dos participantes
    loadParticipantButtons(pairs);
});
