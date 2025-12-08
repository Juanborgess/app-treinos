from django.core.management.base import BaseCommand
from treinos.models import Exercicio

class Command(BaseCommand):
    help = 'Atualiza a biblioteca de exercícios com grupos musculares específicos'

    def handle(self, *args, **kwargs):
        # NOVA BIBLIOTECA DETALHADA
        biblioteca = {
            'PEITO': [
                'Supino Reto (Barra)', 'Supino Reto (Halteres)', 'Supino Reto (Máquina)',
                'Supino Inclinado (Barra)', 'Supino Inclinado (Halteres)', 'Supino Inclinado (Máquina)',
                'Supino Declinado', 'Crucifixo (Halteres)', 'Crucifixo (Máquina/Peck Deck)',
                'Crossover (Polia Alta)', 'Crossover (Polia Média)', 'Crossover (Polia Baixa)',
                'Flexão de Braço', 'Mergulho (Paralelas)', 'Pullover (Haltere)'
            ],
            'COSTAS': [
                'Puxada Alta (Frente)', 'Puxada Alta (Triângulo)', 'Puxada Alta (Pegada Supinada)',
                'Barra Fixa (Pronada)', 'Barra Fixa (Supinada)',
                'Remada Curvada (Barra)', 'Remada Curvada (Supinada)', 'Remada Unilateral (Serrote)',
                'Remada Baixa (Triângulo)', 'Remada Cavalinho', 'Remada Máquina',
                'Pulldown (Polia)'
            ],
            'TRAPEZIO': [
                'Encolhimento (Halteres)', 'Encolhimento (Barra)', 'Face Pull (Polia)'
            ],
            'QUADRICEPS': [
                'Agachamento Livre', 'Agachamento Smith', 'Agachamento Frontal', 'Agachamento Hack',
                'Leg Press 45º', 'Leg Press Horizontal', 'Cadeira Extensora', 'Agachamento Búlgaro', 'Passada', 'Afundo (Halteres)'
            ],
            'POSTERIOR': [
                'Mesa Flexora', 'Cadeira Flexora', 'Flexora em Pé',
                'Stiff (Barra)', 'Stiff (Halteres)', 'RDL (Romanian Deadlift)', 'Bom dia'
            ],
            'GLUTEOS': [
                'Elevação Pélvica (Barra)', 'Elevação Pélvica (Máquina)', 'Cadeira Abdutora', 'Glúteo Caneleira'
            ],
            'PANTURRILHA': [
                'Panturrilha em Pé (Máquina)', 'Panturrilha Sentado', 'Panturrilha no Leg Press'
            ],
            'OMBRO_ANT': [
                'Desenvolvimento (Barra)', 'Desenvolvimento (Halteres)', 'Desenvolvimento (Máquina)',
                'Desenvolvimento Arnold', 'Elevação Frontal (Halteres)', 'Elevação Frontal (Barra)', 'Elevação Frontal (Corda)'
            ],
            'OMBRO_LAT': [
                'Elevação Lateral (Halteres)', 'Elevação Lateral (Polia)', 'Elevação Lateral (Máquina)'
            ],
            'OMBRO_POST': [
                'Crucifixo Inverso (Halteres)', 'Crucifixo Inverso (Máquina)', 'Peck Deck Inverso'
            ],
            'BICEPS': [
                'Rosca Direta (Barra)', 'Rosca Direta (Halteres)', 'Rosca Direta (Polia)',
                'Rosca Martelo', 'Rosca Scott (Máquina)', 'Rosca Scott (Barra W)',
                'Rosca Concentrada'
            ],
            'TRICEPS': [
                'Tríceps Corda', 'Tríceps Barra Reta', 'Tríceps Testa (Barra W)',
                'Tríceps Francês (Haltere)', 'Tríceps Banco', 'Tríceps Coice'
            ],
            'ANTEBRACO': [
                'Rosca Inversa', 'Rosca Punho'
            ],
            'ABS': [
                'Abdominal Supra (Chão)', 'Abdominal Infra', 'Abdominal Remador',
                'Prancha Isométrica', 'Prancha Lateral',
                'Abdominal na Polia (Crunch)', 'Elevação de Pernas (Barra Fixa)',
                'Russian Twist'
            ],
            'LOMBAR': [
                'Extensão de Tronco (Banco Romano)', 'Levantamento Terra'
            ]
        }

        total_atualizado = 0
        total_criado = 0
        
        for grupo_novo, lista_nomes in biblioteca.items():
            for nome in lista_nomes:
                # update_or_create: Se achar o exercício pelo nome, ATUALIZA o grupo.
                # Se não achar, CRIA com o grupo novo.
                obj, created = Exercicio.objects.update_or_create(
                    nome=nome,
                    usuario=None, # Apenas exercícios do sistema
                    defaults={'grupo_muscular': grupo_novo} # <--- A Mágica: Atualiza para a nova categoria
                )
                if created:
                    total_criado += 1
                else:
                    total_atualizado += 1

        self.stdout.write(self.style.SUCCESS(f'Concluído! {total_criado} criados, {total_atualizado} atualizados para novas categorias.'))