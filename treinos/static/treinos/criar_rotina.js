/* Módulo de Criação de Rotina - Filtro de Exercícios */

function filtrarGrid() {
    // 1. Pega o texto digitado
    const input = document.getElementById('filtroExercicios');
    const filtro = input.value.toUpperCase();
    
    // 2. Pega todos os itens da grid
    const grid = document.getElementById('gridExercicios');
    const itens = grid.getElementsByTagName('div'); // Cada exercício está num <div>

    // 3. Loop para esconder ou mostrar
    for (let i = 0; i < itens.length; i++) {
        const label = itens[i].getElementsByTagName('label')[0];
        if (label) {
            const texto = label.textContent || label.innerText;
            if (texto.toUpperCase().indexOf(filtro) > -1) {
                itens[i].style.display = ""; // Mostra
            } else {
                itens[i].style.display = "none"; // Esconde
            }
        }
    }
}