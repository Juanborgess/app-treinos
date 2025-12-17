
document.addEventListener('DOMContentLoaded', function() {
    

    let exercicioParaSair = null;
    const modal = document.getElementById('modal-troca');


    window.abrirModalTroca = function(idAntigo) {
        exercicioParaSair = idAntigo;
        if (modal) modal.style.display = 'flex';
    }

   
    window.fecharModal = function() {
        if (modal) modal.style.display = 'none';
        exercicioParaSair = null;
    }

  
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) window.fecharModal();
        });
    }


    window.confirmarTroca = function(idNovo) {
        if (!exercicioParaSair || !modal) return;

        const url = modal.getAttribute('data-url');
        const csrfToken = modal.getAttribute('data-csrf');

        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify({
                'id_antigo': exercicioParaSair,
                'id_novo': idNovo
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'sucesso') {
                location.reload(); 
            } else {
                alert('Erro ao trocar: ' + data.msg);
            }
        })
        .catch(err => console.error('Erro:', err));
    }

    window.filtrarOpcoesTroca = function() {
        const input = document.getElementById('inputBuscaTroca');
        const termo = input.value.toLowerCase();
        
        const opcoes = document.querySelectorAll('.opcao-troca');
        let encontrouAlgum = false;

        opcoes.forEach(opcao => {
            const nome = opcao.getAttribute('data-nome');
            
            if (nome.includes(termo)) {
                opcao.style.display = 'flex';
                encontrouAlgum = true;
            } else {
                opcao.style.display = 'none';
            }
        });

        const msgVazia = document.getElementById('msgNenhumEncontrado');
        if (msgVazia) {
            msgVazia.style.display = encontrouAlgum ? 'none' : 'block';
        }
    }
    
    const funcaoAbrirOriginal = window.abrirModalTroca;
    window.abrirModalTroca = function(idAntigo) {
        funcaoAbrirOriginal(idAntigo);
        
        const input = document.getElementById('inputBuscaTroca');
        if (input) {
            input.value = '';
            window.filtrarOpcoesTroca(); 
            input.focus(); 
        }
    }

});