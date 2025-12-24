/* ==========================================================================
   0. CONFIGURAÇÃO DE ÁUDIO E VIBRAÇÃO
   ========================================================================== */
const audioTimer = new Audio('/static/treinos/sons/timer.mp3');
const audioPR = new Audio('/static/treinos/sons/pr.mp3');

audioTimer.volume = 0.4; 
audioPR.volume = 0.4;

function feedbackSensorial(tipo) {
    try {
        if (tipo === 'timer') {
            audioTimer.currentTime = 0; 
            audioTimer.play().catch(e => console.log("Audio bloqueado pelo navegador"));
            
            if (navigator.vibrate) navigator.vibrate(800); 
        } 
        else if (tipo === 'pr') {
            audioPR.currentTime = 0;
            audioPR.play().catch(e => console.log("Audio bloqueado"));
            
            if (navigator.vibrate) navigator.vibrate([100, 50, 100]); 
        }
    } catch (err) {
        console.log("Erro no feedback sensorial:", err);
    }
}

/* ==========================================================================
   1. CONFIGURAÇÕES E UTILITÁRIOS GLOBAIS
   ========================================================================== */

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

if (!document.getElementById('spin-style')) {
    const style = document.createElement('style');
    style.id = 'spin-style';
    style.innerHTML = `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`;
    document.head.appendChild(style);
}

document.addEventListener("DOMContentLoaded", function() {
    document.querySelectorAll('select').forEach(sel => atualizarCorSelect(sel));
});


/* ==========================================================================
   2. SISTEMA DE CRONÔMETRO (REST TIMER)
   ========================================================================== */
let timerInterval = null;
let tempoRestante = 90;
let tempoTotal = 90;
let isTimerRunning = false;

function iniciarCronometro(segundos = 90) {
    const painel = document.getElementById('restTimer');
    const barra = document.getElementById('timerProgress');
    
    if(!painel) return;

    clearInterval(timerInterval);
    tempoRestante = segundos;
    tempoTotal = segundos;
    isTimerRunning = true;

    painel.classList.add('active');
    painel.style.transform = "translateY(0)"; 
    
    atualizarDisplayTimer();

    timerInterval = setInterval(() => {
        tempoRestante--;
        atualizarDisplayTimer();

        if(barra) {
            const pct = (tempoRestante / tempoTotal) * 100;
            barra.style.width = `${pct}%`;
        }

        if (tempoRestante <= 0) {
            pararCronometro();
            
            audioTimer.currentTime = 0;
            audioTimer.play().catch(e => console.log("Autoplay bloqueado pelo navegador"));

            if (navigator.vibrate) navigator.vibrate(800);
            
            showToast("⏰ Descanso Finalizado!", "gold");
        }
    }, 1000);
}

function pararCronometro() {
    clearInterval(timerInterval);
    isTimerRunning = false;
    const painel = document.getElementById('restTimer');
    
    if(painel) {
        painel.classList.remove('active');
        painel.style.transform = "translateY(110%)"; // Desce a barrinha
    }
}

function ajustarTempo(segundos) {
    tempoRestante += segundos;
    if (tempoRestante < 0) tempoRestante = 0;
    
    if (tempoRestante > tempoTotal) tempoTotal = tempoRestante;
    
    atualizarDisplayTimer();

    if (!isTimerRunning && tempoRestante > 0) {
        iniciarCronometro(tempoRestante);
    }
}

function atualizarDisplayTimer() {
    const el = document.getElementById('timerDisplay');
    if(!el) return;
    
    const m = Math.floor(tempoRestante / 60);
    const s = tempoRestante % 60;
    el.innerText = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}


/* ==========================================================================
   3. INTERFACE VISUAL (UI)
   ========================================================================== */

function atualizarCorSelect(selectElement) {
    if (!selectElement) return;
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    const color = selectedOption.getAttribute('data-cor') || '#fff';
    selectElement.style.color = color;
    selectElement.style.borderColor = color;
}

function adicionarLinhaNaTabela(exercicioId, data) {
    console.log("=== ADICIONANDO LINHA ===", data);

    const listaDiv = document.getElementById(`lista_series_${exercicioId}`);

    if (!listaDiv) {
        console.error(`ERRO: Não encontrei a div id="lista_series_${exercicioId}"`);
        alert("Erro visual: A lista de séries não foi encontrada no HTML.");
        return;
    }
    
    const cor = data.metodo_cor || data.cor || '#ffffff';
    const sigla = data.metodo_sigla || data.sigla || 'N';
    const reps = data.reps || data.repeticoes || '0';
    const peso = data.peso || '0';

    const novaLinha = document.createElement('div');
    novaLinha.className = 'saved-set';
    novaLinha.id = `linha_serie_${data.serie_id}`;
    
    novaLinha.style.animation = "fadeIn 0.5s ease"; 
    novaLinha.style.display = "flex";
    novaLinha.style.alignItems = "center";
    novaLinha.style.justifyContent = "space-between";
    novaLinha.style.padding = "10px 0";
    novaLinha.style.borderBottom = "1px solid rgba(255,255,255,0.1)";

    novaLinha.innerHTML = `
        <div class="saved-set-info" style="display: flex; align-items: center;">
            <span class="saved-method" style="color: ${cor}; border: 1px solid ${cor}; padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; font-weight: 700; margin-right: 10px; min-width: 25px; text-align: center;">
                ${sigla}
            </span>
            <span style="color: #fff; font-weight: 600;">
                ${peso}kg <span style="color:#71717a; font-weight:400; margin: 0 5px;">x</span> ${reps}
            </span>
        </div>
        <button class="btn-delete" onclick="excluirSerie(${data.serie_id})" style="background: none; border: none; color: #52525b; padding: 5px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
    `;
    
    listaDiv.appendChild(novaLinha);
}

function showToast(message, type = 'normal') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        container.style.cssText = "position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 9999; display: flex; flex-direction: column; gap: 10px; width: 90%; max-width: 400px; pointer-events: none;";
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    if (type === 'gold') toast.style.borderColor = '#fbbf24';
    
    toast.innerHTML = `<span>${message}</span>`;
    
    container.appendChild(toast);
    
    // Remove após 4 segundos
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    }, 4000);
}


/* ==========================================================================
   4. AÇÕES DE TREINO (API)
   ========================================================================== */

function salvarSerie(treinoId, exercicioId) {
    const tipoInput = document.getElementById(`tipo_${exercicioId}`);
    const pesoInput = document.getElementById(`peso_${exercicioId}`);
    const repsInput = document.getElementById(`reps_${exercicioId}`);
    const btn = document.getElementById(`btn_${exercicioId}`);

    if (!pesoInput || !repsInput || !btn) {
        console.error(`Erro: Elementos do exercício ${exercicioId} não encontrados.`);
        return;
    }

    const tipoId = tipoInput ? tipoInput.value : null;

    const peso = pesoInput.value.replace(',', '.');
    const reps = repsInput.value;

    if (!peso || !reps) { 
        alert("Preencha Carga e Repetições."); 
        return; 
    }

    const originalContent = btn.innerHTML;
    btn.innerHTML = `<svg class="animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" style="width:20px; height:20px; animation: spin 1s linear infinite;"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>`;
    btn.disabled = true;

    fetch(`/api/salvar_serie/${treinoId}/${exercicioId}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({ metodo_id: tipoId, peso: peso, reps: reps })
    })
    .then(r => r.json())
    .then(data => {
        if(data.status === 'sucesso') {
            
            if (data.is_pr) {
                showToast("🏆 Novo Recorde Pessoal!", "gold");

                const audioPR = new Audio('/static/treinos/sons/pr.mp3');
                audioPR.volume = 0.4; 
                audioPR.play().catch(e => console.log("Audio autoplay bloqueado"));

                if (navigator.vibrate) navigator.vibrate([100, 50, 100]); 
            }
            // --------------------------------------------

            adicionarLinhaNaTabela(exercicioId, data);

            repsInput.value = '';
            repsInput.focus(); 
            iniciarCronometro(90); 
        } else {
            alert("Erro: " + data.msg);
        }
    })
    .catch((err) => {
        console.error("Erro no fetch:", err);
        alert("Erro de conexão.");
    })
    .finally(() => {
        btn.disabled = false;
        btn.innerHTML = originalContent;
    });
}

function excluirSerie(serieId) {
    if(!confirm("Excluir esta série?")) return;
    
    const linha = document.getElementById(`linha_serie_${serieId}`);
    if(linha) linha.style.opacity = '0.5';

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

function salvarNota(exercicioId) {
    const input = document.getElementById(`nota_${exercicioId}`);
    
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
            input.style.borderColor = 'var(--primary)';
            setTimeout(() => { input.style.borderColor = 'transparent'; }, 1000);
        }
    });
}

/* ==========================================================================
   5. GERENCIAMENTO DE EXERCÍCIOS (ADD/REMOVE)
   ========================================================================== */

function adicionarExercicio(exercicioId) {
    if (typeof GLOBAL_TREINO_ID === 'undefined') { 
        console.error("ID do treino não definido"); 
        return; 
    }
    window.location.href = `/add_ex_treino/${GLOBAL_TREINO_ID}/${exercicioId}/`;
}

function removerExercicioDoTreino(exercicioId) {
    if (!confirm("Tem certeza que deseja remover este exercício do treino atual?")) return;

    const url = `/api/rem_ex_treino/${GLOBAL_TREINO_ID}/${exercicioId}/`;

    fetch(url)
    .then(response => response.json())
    .then(data => {
        if (data.status === 'ok') {
            const card = document.getElementById(`card_exercicio_${exercicioId}`);
            if (card) {
                card.style.transition = "all 0.4s ease";
                card.style.opacity = "0";
                card.style.transform = "translateX(50px)";
                setTimeout(() => card.remove(), 400);
            } else {
                location.reload();
            }
        } else {
            alert("Erro ao remover.");
        }
    })
    .catch(() => alert("Erro de conexão."));
}

/* ==========================================================================
   6. MODAIS E FILTROS
   ========================================================================== */

function abrirModalExercicios() {
    const modal = document.getElementById('modalExercicios');
    if(modal) {
        modal.style.display = 'flex'; // Flex para centralizar
        const campo = document.getElementById('inputBuscaExercicios');
        if (campo) { 
            campo.value = ''; 
            campo.focus(); 
            filtrarExercicios(); 
        }
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
        const texto = itens[i].textContent || itens[i].innerText;
        if (texto.toUpperCase().indexOf(filtro) > -1) {
            itens[i].style.display = "flex"; 
        } else {
            itens[i].style.display = "none";
        }
    }
}