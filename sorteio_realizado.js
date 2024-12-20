// Função para carregar os blocos salvos no Local Storage, randomizar e desfazer os blocos
function performDraw() {
    const blocks = JSON.parse(localStorage.getItem('Blocks')) || [];

    console.log("Blocos recebidos:", blocks);

    // Randomizar a ordem dos blocos
    const shuffledBlocks = shuffleArray(blocks);
    console.log("Blocos randomizados:", shuffledBlocks);

    // Desfazer os blocos, mantendo a ordem interna
    const finalSequence = [];
    shuffledBlocks.forEach(block => {
        const items = block.split('/'); // Divide o bloco em seus elementos
        finalSequence.push(...items);
    });

    console.log("Sequência final após desfazer os blocos:", finalSequence);

    // Criar pares do sorteio
    const pairs = new Map();
    for (let i = 0; i < finalSequence.length; i++) {
        const current = finalSequence[i];
        const next = finalSequence[(i + 1) % finalSequence.length]; // Conecta o último ao primeiro
        pairs.set(current, next);
    }

    console.log("Pares finais do sorteio:", Array.from(pairs));

    // Salvar no Local Storage para uso posterior
    localStorage.setItem('FinalArray', JSON.stringify(Array.from(pairs)));

    return pairs;
}

// Função para carregar os botões dos participantes
function loadParticipantButtons() {
    const participants = JSON.parse(localStorage.getItem('Participants')) || [];
    const pairs = new Map(JSON.parse(localStorage.getItem('FinalArray')) || []);
    const container = document.getElementById('participantButtons');

    // Ordenar os nomes dos participantes em ordem alfabética
    const sortedParticipants = participants.sort();

    sortedParticipants.forEach((participant) => {
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

    console.log("Revelando seleção:", participant, "->", selected);

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
    modalMessage.innerHTML = `
        Se você revelar o nome de outro participante, estragará o sorteio e terá que ser repetido.
    `;
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

// Função para embaralhar um array
function shuffleArray(array) {
    const shuffled = array.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Carregar os botões e realizar o sorteio ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    const pairs = performDraw(); // Realiza o sorteio
    if (pairs) {
        loadParticipantButtons(); // Gera os botões
        console.log("Sorteio realizado com sucesso. Resultado:", Array.from(pairs));
    } else {
        console.error("Erro crítico ao realizar o sorteio. Verifique os blocos.");
    }
});
