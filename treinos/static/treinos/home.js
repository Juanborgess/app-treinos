/* Lógica da Home (Menus e Interações) */

function toggleMenu(event, menuId) {
    event.preventDefault(); 
    event.stopPropagation(); 
    
    const menuAtual = document.getElementById(menuId);
    const estaAberto = menuAtual.style.display === 'block';

    // 1. PRIMEIRO: Fechar TODOS os menus e resetar o Z-Index de TODOS os cards
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        menu.style.display = 'none';
        // Pega o card pai desse menu e devolve pro nível 1
        const cardPai = menu.closest('.card');
        if (cardPai) {
            cardPai.style.zIndex = '1';
        }
    });

    // 2. SEGUNDO: Se o menu clicado não estava aberto, abra-o agora
    if (!estaAberto) {
        menuAtual.style.display = 'block';
        
        // TRUQUE DE MESTRE: Traz este card específico para a frente de tudo
        const cardPai = menuAtual.closest('.card');
        if (cardPai) {
            cardPai.style.zIndex = '100'; // Fica acima do card de baixo
        }
    }
}

// Fecha o menu se clicar em qualquer lugar fora dele
document.addEventListener('click', function(e) {
    if (!e.target.closest('.options-btn')) {
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.style.display = 'none';
            
            // Reseta o z-index de todo mundo ao clicar fora
            const cardPai = menu.closest('.card');
            if (cardPai) {
                cardPai.style.zIndex = '1';
            }
        });
    }
});