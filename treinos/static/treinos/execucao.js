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

// --- 2. INTERFACE (CORES DOS SELECTS) ---
function atualizarCorSelect(selectElement) {
    if (!selectElement) return;
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    // Garante que pega branco se não tiver cor definida
    const color = selectedOption.getAttribute('data-cor') || '#fff';
    selectElement.style.color = color;
    selectElement.style.borderColor = color;
}

// Inicializa cores ao carregar a página
document.addEventListener("DOMContentLoaded", function() {
    document.querySelectorAll('select').forEach(sel => atualizarCorSelect(sel));
});

// --- 3. DESENHAR LINHA NA TABELA (VISUAL) ---
function adicionarLinhaNaTabela(exercicioId, data) {
    const listaDiv = document.getElementById(`lista_series_${exercicioId}`);
    
    // Segurança: Se por algum motivo o HTML não tiver a lista, para aqui
    if (!listaDiv) { console.error("Lista não encontrada para o ex: " + exercicioId); return; }
    
    const novaLinha = document.createElement('div');
    novaLinha.className = 'saved-set';
    novaLinha.id = `linha_serie_${data.serie_id}`;
    novaLinha.style.animation = "fadeIn 0.5s";
    
    // HTML INJETADO (Usa as variáveis novas metodo_cor e metodo_sigla)
    novaLinha.innerHTML = `
        <div class="saved-set-info">
            <span class="saved-method" style="color: ${data.metodo_cor}; border: 1px solid ${data.metodo_cor}; padding: 2px 8px; border-radius: 6px; font-size: 0.7rem; font-weight: 700; margin-right: 12px; white-space: nowrap;">
                ${data.metodo_sigla}
            </span>
            <span style="color: #fff; font-weight: 600; font-size: 1rem;">
                ${data.peso}kg <span style="color:#71717a; margin:0 5px; font-weight:400;">x</span> ${data.reps}
            </span>
        </div>
        <button class="btn-delete" onclick="excluirSerie(${data.serie_id})">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
    `;
    
    listaDiv.appendChild(novaLinha);
}

// --- 4. SALVAR SÉRIE (CORE) ---
function salvarSerie(treinoId, exercicioId) {
    const tipoInput = document.getElementById(`tipo_${exercicioId}`);
    const pesoInput = document.getElementById(`peso_${exercicioId}`);
    const repsInput = document.getElementById(`reps_${exercicioId}`);
    const btn = document.getElementById(`btn_${exercicioId}`);

    if (!pesoInput || !repsInput) return; // Segurança básica

    const tipoId = tipoInput.value;
    const peso = pesoInput.value;
    const reps = repsInput.value;

    if (!peso || !reps) { alert("Preencha Carga e Repetições."); return; }

    // Efeito de Loading no botão
    const originalBtn = btn.innerHTML;
    btn.innerHTML = `<svg class="animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" style="width:20px; height:20px; animation: spin 1s linear infinite;"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>`;
    btn.disabled = true;

    // URL corrigida com os IDs
    const url = `/api/salvar_serie/${treinoId}/${exercicioId}/`;

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({
            metodo_id: tipoId,
            peso: peso,
            reps: reps
        })
    })
    .then(response => {
        if (!response.ok) throw new Error("Erro na requisição");
        return response.json();
    })
    .then(data => {
        if(data.status === 'sucesso') {
            // 1. Notificação de Recorde (PR)
            if (data.is_pr && typeof showToast === "function") {
                showToast("🏆 Novo Recorde Pessoal!", "gold");
                if (navigator.vibrate) navigator.vibrate(200);
            }

            // 2. Desenha a linha na tela
            adicionarLinhaNaTabela(exercicioId, data);
            
            // 3. Limpa Repetições mas mantém Peso (Melhor UX)
            repsInput.value = '';
            // Foca no campo de repetições para agilizar a próxima série
            repsInput.focus(); 

            // 4. Inicia Timer (se existir)
            if (typeof iniciarCronometro === "function") iniciarCronometro(90);
        } else {
            alert("Erro: " + data.msg);
        }
    })
    .catch(error => {
        console.error(error);
        alert("Erro ao salvar. Verifique sua conexão.");
    })
    .finally(() => {
        btn.disabled = false;
        btn.innerHTML = originalBtn;
    });
}

// --- 5. EXCLUIR SÉRIE ---
function excluirSerie(serieId) {
    if(!confirm("Excluir esta série?")) return;
    
    const linha = document.getElementById(`linha_serie_${serieId}`);
    if(linha) linha.style.opacity = '0.5'; // Feedback visual imediato

    fetch(`/api/excluir_serie/${serieId}/`, {
        method: 'POST',
        headers: { 'X-CSRFToken': getCookie('csrftoken') }
    })
    .then(r => r.json())
    .then(d => {
        if(d.status === 'sucesso') {
            if(linha) linha.remove();
        } else {
            if(linha) linha.style.opacity = '1';
            alert("Erro ao excluir.");
        }
    });
}

// --- 6. ADICIONAR / REMOVER EXERCÍCIOS (DINÂMICO) ---
function adicionarExercicio(exercicioId) {
    // GLOBAL_TREINO_ID vem do HTML (Script no final do body)
    if (typeof GLOBAL_TREINO_ID === 'undefined') { console.error("ID do treino não definido"); return; }
    
    fetch(`/api/add_ex_treino/${GLOBAL_TREINO_ID}/${exercicioId}/`)
    .then(r => r.json())
    .then(d => {
        if(d.status === 'sucesso') location.reload(); // Recarrega para mostrar o exercício novo
    });
}

function removerExercicioDoTreino(exercicioId) {
    if(!confirm("Remover este exercício do treino atual?")) return;
    if (typeof GLOBAL_TREINO_ID === 'undefined') return;

    fetch(`/api/rem_ex_treino/${GLOBAL_TREINO_ID}/${exercicioId}/`)
    .then(r => r.json())
    .then(d => {
        if(d.status === 'sucesso') location.reload();
    });
}

// --- 7. MODAIS E BUSCA ---
function abrirModalExercicios() {
    const modal = document.getElementById('modalExercicios');
    if(modal) {
        modal.style.display = 'block';
        const campo = document.getElementById('inputBuscaExercicios');
        if (campo) { campo.value = ''; campo.focus(); filtrarExercicios(); }
    }
}

function fecharModalExercicios() {
    const modal = document.getElementById('modalExercicios');
    if(modal) modal.style.display = 'none';
}

function filtrarExercicios() {
    const input = document.getElementById('inputBuscaExercicios');
    const filtro = input.value.toUpperCase();
    const lista = document.getElementById("listaExerciciosModal");
    const itens = lista.getElementsByClassName('item-exercicio');

    for (let i = 0; i < itens.length; i++) {
        const texto = itens[i].innerText || itens[i].textContent;
        if (texto.toUpperCase().indexOf(filtro) > -1) {
            itens[i].style.display = "";
            // Restaura o estilo flex original
            itens[i].style.cssText = "padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); color: white; cursor: pointer; display: flex; justify-content: space-between; align-items: center;";
        } else {
            itens[i].style.display = "none";
        }
    }
}

// --- 8. NOTAS DE AJUSTE (Autosalave) ---
function salvarNota(exercicioId) {
    const input = document.getElementById(`nota_${exercicioId}`);
    const status = document.getElementById(`status_nota_${exercicioId}`);
    
    fetch('/api/salvar_anotacao/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({
            exercicio_id: exercicioId,
            texto: input.value
        })
    })
    .then(r => r.json())
    .then(d => {
        if(d.status === 'sucesso') {
            if(status) {
                status.style.display = 'inline';
                setTimeout(() => { status.style.display = 'none'; }, 2000);
            }
            input.style.borderColor = 'rgba(255,255,255,0.1)';
        }
    });
}

// --- 9. CRONÔMETRO ---
let timerInterval = null;
let tempoRestante = 90;
let tempoTotal = 90;

function iniciarCronometro(segundos = 90) {
    const painel = document.getElementById('restTimer');
    const barra = document.getElementById('timerProgress');
    
    if(!painel) return; // Se não tiver timer na tela, não faz nada

    clearInterval(timerInterval);
    tempoRestante = segundos;
    tempoTotal = segundos;
    
    painel.classList.add('active');
    atualizarDisplay();

    timerInterval = setInterval(() => {
        tempoRestante--;
        atualizarDisplay();
        
        // Atualiza barra de progresso
        if(barra) {
            const pct = (tempoRestante / tempoTotal) * 100;
            barra.style.width = `${pct}%`;
        }

        if (tempoRestante <= 0) {
            pararCronometro();
            if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
        }
    }, 1000);
}

function pararCronometro() {
    clearInterval(timerInterval);
    const painel = document.getElementById('restTimer');
    if(painel) painel.classList.remove('active');
}

function ajustarTempo(segundos) {
    tempoRestante += segundos;
    if (tempoRestante < 0) tempoRestante = 0;
    atualizarDisplay();
}

function atualizarDisplay() {
    const el = document.getElementById('timerDisplay');
    if(!el) return;
    const m = Math.floor(tempoRestante / 60);
    const s = tempoRestante % 60;
    el.innerText = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// --- 10. TOAST NOTIFICATIONS (Avisos) ---
function showToast(message, type = 'normal') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    
    container.appendChild(toast);
    
    // Animação de entrada e saída
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.5s forwards';
        setTimeout(() => toast.remove(), 500);
    }, 5000);
}

// Garante animação do Spinner
if (!document.getElementById('spin-style')) {
    const style = document.createElement('style');
    style.id = 'spin-style';
    style.innerHTML = `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`;
    document.head.appendChild(style);
}