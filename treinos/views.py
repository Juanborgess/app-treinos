import json
from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login
from django.contrib.auth.forms import UserCreationForm
from django.contrib import messages
from django.db.models import Q, Sum, F, Max
from django.db.models import Count
from django.views.decorators.csrf import csrf_exempt
from .models import Rotina, Exercicio
from django.utils import timezone 
from .models import Rotina, Exercicio, Treino 

from .models import (
    Rotina, TreinoRealizado, Exercicio, SerieRealizada, 
    Metodo, Anotacao, PesoUsuario, MedidaCorporal
)
from .forms import RotinaForm, ExercicioForm, MetodoForm, CustomUserCreationForm

def cadastro(request):
    if request.method == 'POST':
        # USAMOS O NOVO FORMULÁRIO SEGURO
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, f"Bem-vindo à elite, {user.username}!")
            return redirect('home')
        else:
            messages.error(request, "Erro ao criar conta. Verifique os dados.")
    else:
        form = CustomUserCreationForm() # USAMOS O NOVO FORMULÁRIO SEGURO
    
    return render(request, 'treinos/cadastro.html', {'form': form})

@login_required(login_url='/login/')
def home(request):
    rotinas = Rotina.objects.filter(usuario=request.user)
    return render(request, 'treinos/home.html', {'rotinas': rotinas})

@login_required(login_url='/login/')
def dashboard(request):
    exercicios = Exercicio.objects.filter(
        serierealizada__treino__rotina__usuario=request.user
    ).distinct()
    return render(request, 'treinos/dashboard.html', {'exercicios': exercicios})

@login_required(login_url='/login/')
def perfil(request):
    user = request.user
    
    # 1. Estatísticas de Treino
    total_treinos = TreinoRealizado.objects.filter(rotina__usuario=user, finalizado=True).count()
    dados_volume = SerieRealizada.objects.filter(treino__rotina__usuario=user).aggregate(
        tonelagem=Sum(F('peso') * F('repeticoes'))
    )
    volume_kg = dados_volume['tonelagem'] or 0
    
    if volume_kg >= 1000: volume_display = f"{volume_kg/1000:.1f} Toneladas"
    else: volume_display = f"{volume_kg} Kg"

    # 2. Nível
    if volume_kg < 10000: nivel, cor_nivel = "Iniciante", "#ffffff"
    elif volume_kg < 100000: nivel, cor_nivel = "Intermediário", "#22d3ee"
    elif volume_kg < 500000: nivel, cor_nivel = "Avançado", "#a855f7"
    else: nivel, cor_nivel = "Elite", "#fbbf24"

    # 3. Histórico de Peso
    historico_peso = PesoUsuario.objects.filter(usuario=user).order_by('-data')
    pesos_grafico = list(historico_peso.order_by('data'))
    labels_peso = [p.data.strftime('%d/%m') for p in pesos_grafico]
    data_peso = [float(p.peso) for p in pesos_grafico]

    # 4. MEDIDAS CORPORAIS (Recupera a última medição para mostrar na tela)
    ultima_medida = MedidaCorporal.objects.filter(usuario=user).order_by('-data').first()

    return render(request, 'treinos/perfil.html', {
        'total_treinos': total_treinos,
        'volume_display': volume_display,
        'nivel': nivel, 'cor_nivel': cor_nivel,
        'historico_peso': historico_peso,
        'labels_peso': labels_peso, 'data_peso': data_peso,
        'medidas': ultima_medida # <--- Enviando as medidas para o HTML
    })

@login_required(login_url='/login/')
def adicionar_peso(request):
    if request.method == "POST":
        peso = request.POST.get('peso')
        if peso:
            PesoUsuario.objects.create(usuario=request.user, peso=peso)
            messages.success(request, "Peso registrado!")
    return redirect('perfil')

@login_required(login_url='/login/')
def registrar_medidas(request):
    """ Salva todas as medidas corporais vindas do formulário """
    if request.method == "POST":
        # Cria o objeto com todos os campos do formulário
        MedidaCorporal.objects.create(
            usuario=request.user,
            pescoco=request.POST.get('pescoco') or None,
            ombro=request.POST.get('ombro') or None,
            peito=request.POST.get('peito') or None,
            cintura=request.POST.get('cintura') or None,
            biceps_e=request.POST.get('biceps_e') or None,
            biceps_d=request.POST.get('biceps_d') or None,
            antebraco_e=request.POST.get('antebraco_e') or None,
            antebraco_d=request.POST.get('antebraco_d') or None,
            coxa_e=request.POST.get('coxa_e') or None,
            coxa_d=request.POST.get('coxa_d') or None,
            panturrilha_e=request.POST.get('panturrilha_e') or None,
            panturrilha_d=request.POST.get('panturrilha_d') or None,
            gordura=request.POST.get('gordura') or None
        )
        messages.success(request, "Medidas atualizadas com sucesso!")
    return redirect('perfil')

# ============================================================================
# 3. CRIAÇÃO DE DADOS
# ============================================================================

@login_required(login_url='/login/')
def criar_rotina(request):
    if request.method == 'POST':
        form = RotinaForm(request.user, request.POST)
        if form.is_valid():
            rotina = form.save(commit=False)
            rotina.usuario = request.user
            rotina.save()
            form.save_m2m()
            messages.success(request, "Nova rotina criada!")
            return redirect('home')
    else:
        form = RotinaForm(request.user)
    return render(request, 'treinos/criar_rotina.html', {'form': form})

@login_required(login_url='/login/')
def criar_exercicio(request):
    treino_id_origem = request.GET.get('treino_id')
    if request.method == 'POST':
        form = ExercicioForm(request.POST)
        if form.is_valid():
            exercicio = form.save(commit=False)
            exercicio.usuario = request.user
            exercicio.save()
            messages.success(request, f"Exercício '{exercicio.nome}' criado!")
            if treino_id_origem:
                treino = get_object_or_404(TreinoRealizado, id=treino_id_origem)
                treino.rotina.exercicios.add(exercicio)
                return redirect('treino_em_andamento', treino_id=treino_id_origem)
            return redirect('criar_rotina')
    else:
        form = ExercicioForm()
    return render(request, 'treinos/criar_exercicio.html', {'form': form})

@login_required(login_url='/login/')
def criar_metodo(request):
    if request.method == 'POST':
        form = MetodoForm(request.POST)
        if form.is_valid():
            metodo = form.save(commit=False)
            metodo.usuario = request.user
            metodo.save()
            messages.success(request, "Método criado!")
            return redirect('home')
    else:
        form = MetodoForm()
    return render(request, 'treinos/criar_metodo.html', {'form': form})

# ============================================================================
# 4. EXECUÇÃO
# ============================================================================

@login_required(login_url='/login/')
def detalhe_rotina(request, id):
    rotina = get_object_or_404(Rotina, id=id, usuario=request.user)
    exercicios_ordenados = rotina.get_exercicios_ordenados()
    
    ids_existentes = [e.id for e in exercicios_ordenados]
    outros_exercicios = Exercicio.objects.exclude(id__in=ids_existentes)
    # ------------------------

    return render(request, 'treinos/detalhe_rotina.html', {
        'rotina': rotina,
        'exercicios': exercicios_ordenados,
        'outros_exercicios': outros_exercicios 
    })

@login_required(login_url='/login/')
def iniciar_treino(request, rotina_id):
    rotina = get_object_or_404(Rotina, id=rotina_id, usuario=request.user)
    
    treino = Treino.objects.create(
        rotina=rotina,
        usuario=request.user,
        data=timezone.now(),
        finalizado=False
    )
    
    exercicios = rotina.get_exercicios_ordenados()
    
    return render(request, 'treinos/treino_em_andamento.html', {
        'rotina': rotina,
        'exercicios': exercicios,
        'treino': treino
    })

@login_required(login_url='/login/')
def treino_em_andamento(request, treino_id):
    treino = get_object_or_404(TreinoRealizado, id=treino_id, rotina__usuario=request.user)
    metodos = Metodo.objects.filter(Q(usuario=None) | Q(usuario=request.user))
    todos_exercicios = Exercicio.objects.filter(Q(usuario=None) | Q(usuario=request.user)).order_by('nome')
    
    series_feitas = SerieRealizada.objects.filter(treino=treino).order_by('id')
    series_por_exercicio = {}
    for serie in series_feitas:
        eid = serie.exercicio.id
        if eid not in series_por_exercicio: series_por_exercicio[eid] = []
        series_por_exercicio[eid].append(serie)

    exercicios_com_historico = []
    for exercicio in treino.rotina.exercicios.all():
        ultimo = TreinoRealizado.objects.filter(
            rotina__usuario=request.user, finalizado=True, serierealizada__exercicio=exercicio
        ).exclude(id=treino.id).order_by('-data').first()

        if ultimo:
            antigas = SerieRealizada.objects.filter(treino=ultimo, exercicio=exercicio).order_by('id')
            txt = " | ".join([f"{s.peso}kg-{s.repeticoes}" for s in antigas])
            exercicio.ghost_set = f"Último: {txt}"
        else:
            exercicio.ghost_set = "Primeira vez!"
        
        nota = Anotacao.objects.filter(usuario=request.user, exercicio=exercicio).first()
        exercicio.nota_pessoal = nota.texto if nota else ""
        exercicios_com_historico.append(exercicio)

    return render(request, 'treinos/treino_em_andamento.html', {
        'treino': treino, 'metodos': metodos, 
        'series_por_exercicio': series_por_exercicio,
        'exercicios': exercicios_com_historico,
        'todos_exercicios': todos_exercicios
    })

@login_required(login_url='/login/')
def finalizar_treino(request, treino_id):
    treino = get_object_or_404(TreinoRealizado, id=treino_id, rotina__usuario=request.user)
    treino.finalizado = True
    treino.save()
    messages.success(request, "Treino concluído! 💪")
    return redirect('home')

@login_required(login_url='/login/')
def cancelar_treino(request, treino_id):
    treino = get_object_or_404(Treino, id=treino_id, usuario=request.user)
    
    rotina_id = treino.rotina.id 
    
    treino.delete()
    
    return redirect('detalhe_rotina', id=rotina_id)


@login_required(login_url='/login/')
def salvar_serie(request):
    if request.method == "POST":
        dados = json.loads(request.body)
        
        exercicio_id = dados['exercicio_id']
        peso_novo = float(dados['peso'])
        
        # 1. BUSCAR RECORDE ANTIGO
        recorde_atual = SerieRealizada.objects.filter(
            treino__rotina__usuario=request.user,
            exercicio_id=exercicio_id
        ).aggregate(Max('peso'))['peso__max'] or 0
        
        bateu_recorde = peso_novo > recorde_atual
        
        # ISSO VAI APARECER NO SEU TERMINAL PRETO PARA DEBUGAR:
        print(f"--- CHECK DO PR ---")
        print(f"Recorde Antigo: {recorde_atual} kg")
        print(f"Peso Novo: {peso_novo} kg")
        print(f"Resultado: {'É NOVO RECORDE! 🏆' if bateu_recorde else 'Não foi recorde'}")
        print("-------------------")

        metodo_id = dados.get('tipo')
        metodo = Metodo.objects.get(id=metodo_id)

        nova_serie = SerieRealizada.objects.create(
            treino_id=dados['treino_id'],
            exercicio_id=exercicio_id,
            peso=peso_novo,
            repeticoes=dados['repeticoes'],
            metodo=metodo
        )
        
        return JsonResponse({
            'status': 'sucesso',
            'serie_id': nova_serie.id,
            'metodo_sigla': metodo.sigla,
            'metodo_cor': metodo.cor,
            'is_pr': bateu_recorde 
        })
        
    return JsonResponse({'status': 'erro'}, status=400)

@login_required(login_url='/login/')
def excluir_serie(request, serie_id):
    serie = get_object_or_404(SerieRealizada, id=serie_id, treino__rotina__usuario=request.user)
    serie.delete()
    return JsonResponse({'status': 'sucesso'})

@login_required(login_url='/login/')
def salvar_anotacao(request):
    if request.method == "POST":
        data = json.loads(request.body)
        Anotacao.objects.update_or_create(
            usuario=request.user, exercicio_id=data['exercicio_id'],
            defaults={'texto': data.get('texto')}
        )
        return JsonResponse({'status': 'sucesso'})
    return JsonResponse({'status': 'erro'}, status=400)

@login_required(login_url='/login/')
def api_dados_grafico(request, exercicio_id):
    series = SerieRealizada.objects.filter(
        exercicio_id=exercicio_id, treino__rotina__usuario=request.user
    ).order_by('treino__data')
    dados = {}
    for s in series:
        dt = s.treino.data.strftime('%d/%m')
        if dt not in dados or s.peso > dados[dt]: dados[dt] = s.peso
    return JsonResponse({'labels': list(dados.keys()), 'data': list(dados.values())})

@login_required(login_url='/login/')
def api_adicionar_exercicio_treino(request, treino_id, exercicio_id):
    treino = get_object_or_404(TreinoRealizado, id=treino_id, rotina__usuario=request.user)
    ex = get_object_or_404(Exercicio, id=exercicio_id)
    treino.rotina.exercicios.add(ex)
    return JsonResponse({'status': 'sucesso'})

@login_required(login_url='/login/')
def api_remover_exercicio_treino(request, treino_id, exercicio_id):
    treino = get_object_or_404(TreinoRealizado, id=treino_id)
    ex = get_object_or_404(Exercicio, id=exercicio_id)
    treino.rotina.exercicios.remove(ex)
    SerieRealizada.objects.filter(treino=treino, exercicio=ex).delete()
    return JsonResponse({'status': 'sucesso'})


# 1. EDITAR ROTINA
@login_required(login_url='/login/')
def editar_rotina(request, rotina_id):
    rotina = get_object_or_404(Rotina, id=rotina_id, usuario=request.user)
    
    if request.method == 'POST':
        form = RotinaForm(request.user, request.POST, instance=rotina)
        if form.is_valid():
            form.save()
            messages.success(request, "Rotina atualizada!")
            return redirect('home')
    else:
        form = RotinaForm(request.user, instance=rotina)
    
    return render(request, 'treinos/criar_rotina.html', {'form': form})

# 2. DUPLICAR ROTINA
@login_required(login_url='/login/')
def duplicar_rotina(request, rotina_id):
    rotina_original = get_object_or_404(Rotina, id=rotina_id, usuario=request.user)
    
    rotina_original.pk = None 
    rotina_original.nome = f"{rotina_original.nome} (Cópia)"
    rotina_original.save()
    
    rotina_original.exercicios.set(Rotina.objects.get(id=rotina_id).exercicios.all())
    
    messages.success(request, "Rotina duplicada com sucesso!")
    return redirect('home')

# 3. EXCLUIR ROTINA
@login_required(login_url='/login/')
def excluir_rotina(request, rotina_id):
    rotina = get_object_or_404(Rotina, id=rotina_id, usuario=request.user)
    rotina.delete()
    messages.success(request, "Rotina excluída.")
    return redirect('home')

@login_required(login_url='/login/')
def estatisticas(request):
    # 1. Busca todas as séries do usuário
    # 2. Agrupa por 'exercicio__grupo_muscular'
    # 3. Conta quantos IDs existem em cada grupo
    dados = SerieRealizada.objects.filter(
        treino__rotina__usuario=request.user
    ).values('exercicio__grupo_muscular').annotate(total=Count('id')).order_by('-total')

    # Preparar dados para o Chart.js
    mapa_nomes = dict(Exercicio.GRUPOS)
    
    labels = []
    data = []
    
    for item in dados:
        nome_grupo = mapa_nomes.get(item['exercicio__grupo_muscular'], item['exercicio__grupo_muscular'])
        labels.append(nome_grupo)
        data.append(item['total'])

    return render(request, 'treinos/estatisticas.html', {
        'labels': labels,
        'data': data
    })
    
@login_required(login_url='/login/')
def reordenar_rotina(request, rotina_id):
    if request.method == "POST":
        try:
            rotina = Rotina.objects.get(id=rotina_id, usuario=request.user)
            dados = json.loads(request.body)
            nova_ordem = dados.get('ordem', []) # Recebe uma lista [10, 5, 2]
            
            # Transforma a lista em texto "10,5,2" e salva
            rotina.ordem_exercicios = ",".join(map(str, nova_ordem))
            rotina.save()
            
            return JsonResponse({'status': 'sucesso'})
        except Exception as e:
            return JsonResponse({'status': 'erro', 'msg': str(e)}, status=400)
    return JsonResponse({'status': 'erro'}, status=400)


@login_required(login_url='/login/')
def substituir_exercicio(request, rotina_id):
    if request.method == "POST":
        try:
            rotina = get_object_or_404(Rotina, id=rotina_id, usuario=request.user)
            data = json.loads(request.body)
            
            id_antigo = str(data.get('id_antigo'))
            id_novo = str(data.get('id_novo'))
            
            exercicio_antigo = Exercicio.objects.get(id=id_antigo)
            exercicio_novo = Exercicio.objects.get(id=id_novo)
            
            rotina.exercicios.remove(exercicio_antigo)
            rotina.exercicios.add(exercicio_novo)
            
            if rotina.ordem_exercicios:
                lista_ids = rotina.ordem_exercicios.split(',')
                
                if id_antigo in lista_ids:
                    index = lista_ids.index(id_antigo)
                    lista_ids[index] = id_novo
                    rotina.ordem_exercicios = ",".join(lista_ids)
                    rotina.save()
            
            return JsonResponse({'status': 'sucesso'})
            
        except Exception as e:
            return JsonResponse({'status': 'erro', 'msg': str(e)}, status=400)
            
    return JsonResponse({'status': 'erro'}, status=400)