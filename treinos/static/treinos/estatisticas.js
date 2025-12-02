/* Módulo de Estatísticas - Gráfico Polar */

document.addEventListener('DOMContentLoaded', function() {
    const ctx = document.getElementById('muscleChart');
    
    // Verifica se o elemento existe e se temos dados globais definidos no HTML
    if (ctx && typeof CHART_LABELS !== 'undefined' && typeof CHART_DATA !== 'undefined') {
        
        // Se não tiver dados (tudo zero ou vazio), não desenha
        if (CHART_DATA.length === 0) return;

        new Chart(ctx, {
            type: 'polarArea', 
            data: {
                labels: CHART_LABELS, // Pega da variável global
                datasets: [{
                    data: CHART_DATA, // Pega da variável global
                    backgroundColor: [
                        'rgba(34, 211, 238, 0.6)',  // Ciano
                        'rgba(168, 85, 247, 0.6)',  // Roxo
                        'rgba(239, 68, 68, 0.6)',   // Vermelho
                        'rgba(245, 158, 11, 0.6)',  // Laranja
                        'rgba(16, 185, 129, 0.6)',  // Verde
                        'rgba(59, 130, 246, 0.6)',  // Azul
                    ],
                    borderWidth: 0 // Remove borda branca padrão que fica feia no escuro
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        grid: { color: '#333' }, // Linhas da teia escuras
                        ticks: { display: false, backdropColor: 'transparent' }, // Remove fundo branco dos números
                        pointLabels: {
                            display: true,
                            centerPointLabels: true,
                            font: { size: 12, family: 'Inter' },
                            color: '#a1a1aa' // Cor do texto dos grupos (Peito, Costas...)
                        }
                    }
                },
                plugins: {
                    legend: { 
                        position: 'bottom',
                        labels: { 
                            color: '#fff', // Legenda Branca
                            padding: 20,
                            font: { family: 'Inter', size: 12 }
                        }
                    }
                }
            }
        });
    }
});