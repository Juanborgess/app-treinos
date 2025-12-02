/* Módulo de Dashboard - Gráficos com Chart.js */

let meuGrafico = null;

function carregarGrafico() {
    const select = document.getElementById('exercicioSelect');
    const exercicioId = select.value;
    const loading = document.getElementById('loading');
    
    // Mostra o spinner de carregando
    loading.style.display = 'block';

    // Busca os dados no Backend
    fetch(`/api/grafico/${exercicioId}/`)
        .then(response => response.json())
        .then(data => {
            loading.style.display = 'none';
            renderizarGrafico(data.labels, data.data);
        })
        .catch(error => {
            console.error("Erro ao carregar gráfico:", error);
            loading.style.display = 'none';
        });
}

function renderizarGrafico(labels, dados) {
    const ctx = document.getElementById('evolutionChart').getContext('2d');


    if (meuGrafico) {
        meuGrafico.destroy();
    }

    // Cria o gradiente Neon (Efeito visual)
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(34, 211, 238, 0.5)'); 
    gradient.addColorStop(1, 'rgba(34, 211, 238, 0)');   

    // Configuração do Chart.js
    meuGrafico = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels, // Eixo X (Datas)
            datasets: [{
                label: 'Carga Máxima (kg)',
                data: dados, 
                borderColor: '#22d3ee', 
                backgroundColor: gradient,
                borderWidth: 3,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#22d3ee',
                pointRadius: 5,
                pointHoverRadius: 7,
                fill: true,
                tension: 0.4 // Curva suave
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { 
                    labels: { color: '#fff', font: { size: 14 } } 
                },
                tooltip: {
                    backgroundColor: 'rgba(24, 24, 27, 0.9)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#3f3f46',
                    borderWidth: 1
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: { color: '#27272a' },
                    ticks: { color: '#a1a1aa' }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#a1a1aa' }
                }
            }
        }
    });
}