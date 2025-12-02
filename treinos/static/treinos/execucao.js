/* JUAN BORGES DEV - MÓDULO DE EXECUÇÃO (ATUALIZADO) */

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function atualizarCorSelect(selectElement) {
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    const color = selectedOption.getAttribute('data-cor') || '#fff';
    selectElement.style.color = color;
    selectElement.style.borderColor = color;
}

// Inicializa as cores dos selects ao carregar
document.addEventListener("DOMContentLoaded", function() {
    document.querySelectorAll('select').forEach(sel => atualizarCorSelect(sel));
});

// --- SALVAR SÉRIE ---
function salvarSerie(treinoId, exercicioId) {
    const tipoInput = document.getElementById(`tipo_${exercicioId}`);
    const pesoInput = document.getElementById(`peso_${exercicioId}`);
    const repsInput = document.getElementById(`reps_${exercicioId}`);
    const btn = document.getElementById(`btn_${exercicioId}`);
    const listaDiv = document.getElementById(`lista_series_${exercicioId}`);

    const tipoId = tipoInput.value;
    const peso = pesoInput.value;
    const reps = repsInput.value;

    if (!peso || !reps) { alert("Preencha Carga e Repetições."); return; }

    // Feedback visual no botão
    const originalBtn = btn.innerHTML;
    btn.innerHTML = `<svg class="animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" style="width:20px; height:20px;"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>`;
    btn.disabled = true;

    fetch('/api/salvar_serie/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({
            treino_id: treinoId,
            exercicio_id: exercicioId,
            peso: peso,
            repeticoes: reps,
            tipo: tipoId
        })
    })
    .then(response => response.json())
    .then(data => {
        btn.disabled = false;
        btn.innerHTML = originalBtn;

        if(data.status === 'sucesso') {
            // VERIFICAÇÃO DE PR (RECORDE)
            if (data.is_pr && typeof showToast === "function") {
                showToast("🏆 Novo Recorde Pessoal!", "gold");
                if (navigator.vibrate) navigator.vibrate(200);
            }

            // CRIAÇÃO VISUAL (LIMPA E USANDO CLASSES CSS)
            const novaLinha = document.createElement('div');
            novaLinha.className = 'saved-set'; // Usa a classe do CSS novo
            novaLinha.id = `linha_serie_${data.serie_id}`;
            
            // Note que removi os style="..." gigantescos. O CSS cuida disso agora.
            novaLinha.innerHTML = `
                <div class="saved-set-info">
                    <span class="saved-method" style="color: ${data.metodo_cor}; border: 1px solid ${data.metodo_cor}; padding: 2px 8px; border-radius: 6px; font-size: 0.7rem; font-weight: 700; margin-right: 12px; white-space: nowrap;">
                        ${data.metodo_sigla}
                    </span>
                    <span style="color: #fff; font-weight: 600; font-size: 1rem;">
                        ${peso}kg <span style="color:#71717a; margin:0 5px; font-weight:400;">x</span> ${reps}
                    </span>
                </div>
                
                <button class="btn-delete" onclick="excluirSerie(${data.serie_id})">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
            `;
            
            listaDiv.appendChild(novaLinha);
            
            // Limpa os campos
            pesoInput.value = '';
            repsInput.value = '';
            pesoInput.focus();

            // Inicia o cronômetro (Se a função existir)
            if (typeof iniciarCronometro === "function") {
                iniciarCronometro(90);
            }
        }
    })
    .catch(error => {
        console.error(error);
        btn.disabled = false;
        btn.innerHTML = originalBtn;
    });
}

// --- EXCLUIR SÉRIE ---
function excluirSerie(serieId) {
    if(!confirm("Excluir esta série?")) return;
    
    fetch(`/api/excluir_serie/${serieId}/`)
    .then(r => r.json())
    .then(d => {
        if(d.status === 'sucesso') {
            const linha = document.getElementById(`linha_serie_${serieId}`);
            if(linha) linha.remove();
        }
    });
}

// --- MODAL E GERENCIAMENTO DE EXERCÍCIOS ---
function abrirModalExercicios() {
    document.getElementById('modalExercicios').style.display = 'block';
    
    const campoBusca = document.getElementById('inputBuscaExercicios');
    if (campoBusca) {
        campoBusca.value = ''; 
        filtrarExercicios();   
        campoBusca.focus();    
    }
}

function fecharModalExercicios() {
    document.getElementById('modalExercicios').style.display = 'none';
}

function adicionarExercicio(exercicioId) {
    // GLOBAL_TREINO_ID deve ser definido no HTML
    fetch(`/api/add_ex_treino/${GLOBAL_TREINO_ID}/${exercicioId}/`)
    .then(r => r.json())
    .then(d => {
        if(d.status === 'sucesso') location.reload();
    });
}

function removerExercicioDoTreino(exercicioId) {
    if(!confirm("Remover este exercício do treino atual?")) return;
    
    fetch(`/api/rem_ex_treino/${GLOBAL_TREINO_ID}/${exercicioId}/`)
    .then(r => r.json())
    .then(d => {
        if(d.status === 'sucesso') location.reload();
    });
}

// --- NOTAS DE AJUSTE ---
function salvarNota(exercicioId) {
    const input = document.getElementById(`nota_${exercicioId}`);
    const status = document.getElementById(`status_nota_${exercicioId}`);
    const texto = input.value;

    fetch('/api/salvar_anotacao/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({
            exercicio_id: exercicioId,
            texto: texto
        })
    })
    .then(r => r.json())
    .then(d => {
        if(d.status === 'sucesso') {
            status.style.display = 'inline';
            setTimeout(() => { status.style.display = 'none'; }, 2000);
            input.style.borderColor = 'rgba(255,255,255,0.1)'; // Volta cor normal
        }
    });
}

/* --- MÓDULO DE CRONÔMETRO --- */
let timerInterval = null;
let tempoRestante = 90;
let tempoTotal = 90;

function iniciarCronometro(segundos = 90) {
    const painel = document.getElementById('restTimer');
    const display = document.getElementById('timerDisplay');
    const barra = document.getElementById('timerProgress');
    
    clearInterval(timerInterval);
    tempoRestante = segundos;
    tempoTotal = segundos;
    
    painel.classList.add('active');
    atualizarDisplay();

    timerInterval = setInterval(() => {
        tempoRestante--;
        atualizarDisplay();
        const porcentagem = (tempoRestante / tempoTotal) * 100;
        barra.style.width = `${porcentagem}%`;

        if (tempoRestante <= 0) {
            pararCronometro();
            if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
        }
    }, 1000);
}

function pararCronometro() {
    clearInterval(timerInterval);
    document.getElementById('restTimer').classList.remove('active');
}

function ajustarTempo(segundos) {
    tempoRestante += segundos;
    if (tempoRestante < 0) tempoRestante = 0;
    if (tempoRestante > tempoTotal) tempoTotal = tempoRestante; 
    atualizarDisplay();
}

function atualizarDisplay() {
    const minutos = Math.floor(tempoRestante / 60);
    const segs = tempoRestante % 60;
    document.getElementById('timerDisplay').innerText = 
        `${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
}

// Toast Function (Corrigida para criar o container se não existir)
function showToast(message, type = 'normal') {
    let container = document.querySelector('.toast-container');
    
    // --- A CORREÇÃO ESTÁ AQUI ---
    // Se não existir o container na tela, o JS cria um agora
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // HTML interno do Toast
    toast.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.style.display='none'" style="background:none; border:none; color:rgba(255,255,255,0.5); cursor:pointer; font-size:1.2rem; margin-left:10px;">&times;</button>
    `;
    
    container.appendChild(toast);
    
    // Animação de saída
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.5s forwards';
        setTimeout(() => toast.remove(), 500);
    }, 4000);
}


/* --- SISTEMA DE BUSCA INSTANTÂNEA --- */
function filtrarExercicios() {
    // 1. Pega o que o usuário digitou
    const input = document.getElementById('inputBuscaExercicios');
    const filtro = input.value.toUpperCase(); // Transforma em MAIÚSCULO para facilitar
    
    // 2. Pega a lista e todos os itens
    const lista = document.getElementById("listaExerciciosModal");
    const itens = lista.getElementsByClassName('item-exercicio');

    // 3. Loop em cada exercício para ver se combina
    for (let i = 0; i < itens.length; i++) {
        const textoItem = itens[i].innerText || itens[i].textContent;
        
        // Se o texto do item contém o que foi digitado...
        if (textoItem.toUpperCase().indexOf(filtro) > -1) {
            itens[i].style.display = ""; // Mostra (flex ou block padrão)
            itens[i].style.cssText = "padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); color: white; cursor: pointer; display: flex; justify-content: space-between; align-items: center;"; // Força o estilo original
        } else {
            itens[i].style.display = "none"; // Esconde
        }
    }
}