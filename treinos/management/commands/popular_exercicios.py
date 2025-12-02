from django.core.management.base import BaseCommand
from treinos.models import Exercicio

class Command(BaseCommand):
    help = 'Popula o banco de dados com uma biblioteca padrão de exercícios'

    def handle(self, *args, **kwargs):
        # Dicionário: GRUPO -> Lista de Exercícios
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
                'Levantamento Terra', 'Pulldown (Polia)', 'Face Pull (Polia)'
            ],
            'PERNAS': [
                'Agachamento Livre', 'Agachamento Smith', 'Agachamento Frontal', 'Agachamento Hack',
                'Leg Press 45º', 'Leg Press Horizontal',
                'Cadeira Extensora', 'Mesa Flexora', 'Cadeira Flexora', 'Flexora em Pé',
                'Stiff (Barra)', 'Stiff (Halteres)', 'RDL (Romanian Deadlift)',
                'Afundo (Halteres)', 'Passada', 'Agachamento Búlgaro',
                'Elevação Pélvica (Barra)', 'Cadeira Adutora', 'Cadeira Abdutora',
                'Panturrilha em Pé (Máquina)', 'Panturrilha Sentado', 'Panturrilha no Leg Press'
            ],
            'OMBROS': [
                'Desenvolvimento (Barra)', 'Desenvolvimento (Halteres)', 'Desenvolvimento (Máquina)',
                'Desenvolvimento Arnold', 'Elevação Lateral (Halteres)', 'Elevação Lateral (Polia)',
                'Elevação Frontal (Halteres)', 'Elevação Frontal (Barra)', 'Elevação Frontal (Corda)',
                'Crucifixo Inverso (Halteres)', 'Crucifixo Inverso (Máquina)',
                'Encolhimento (Halteres)', 'Encolhimento (Barra)'
            ],
            'BRACOS': [
                'Rosca Direta (Barra)', 'Rosca Direta (Halteres)', 'Rosca Direta (Polia)',
                'Rosca Martelo', 'Rosca Scott (Máquina)', 'Rosca Scott (Barra W)',
                'Rosca Concentrada', 'Rosca Inversa',
                'Tríceps Corda', 'Tríceps Barra Reta', 'Tríceps Testa (Barra W)',
                'Tríceps Francês (Haltere)', 'Tríceps Banco', 'Tríceps Coice'
            ],
            'ABS': [
                'Abdominal Supra (Chão)', 'Abdominal Infra', 'Abdominal Remador',
                'Prancha Isométrica', 'Prancha Lateral',
                'Abdominal na Polia (Crunch)', 'Elevação de Pernas (Barra Fixa)',
                'Russian Twist'
            ]
        }

        total_criado = 0
        
        for grupo, lista_nomes in biblioteca.items():
            for nome in lista_nomes:
                # get_or_create evita duplicatas se rodar o comando 2 vezes
                obj, created = Exercicio.objects.get_or_create(
                    nome=nome,
                    usuario=None, # IMPORTANTE: None significa que é do Sistema (Global)
                    defaults={'grupo_muscular': grupo}
                )
                if created:
                    total_criado += 1

        self.stdout.write(self.style.SUCCESS(f'Sucesso! {total_criado} novos exercícios adicionados à biblioteca.'))