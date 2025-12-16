document.addEventListener('DOMContentLoaded', function () {
    var el = document.getElementById('lista-exercicios');

    if (el) {
        var urlSalvar = el.getAttribute('data-url');
        var csrfToken = el.getAttribute('data-csrf');

        // 3. Ativa o SortableJS
        Sortable.create(el, {
            handle: '.handle', 
            animation: 150,    
            ghostClass: 'card-ghost', 

            onEnd: function (evt) {
                var novaOrdem = [];
                
                el.querySelectorAll('.item-exercicio').forEach(function (item) {
                    novaOrdem.push(item.getAttribute('data-id'));
                });

                fetch(urlSalvar, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken
                    },
                    body: JSON.stringify({
                        'ordem': novaOrdem
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'sucesso') {
                        console.log('Ordem salva!');
                    } else {
                        console.error('Erro ao salvar');
                    }
                })
                .catch(err => console.error('Erro de conexão:', err));
            }
        });
    }
});