from django.core.management.base import BaseCommand
from treinos.models import Metodo

class Command(BaseCommand):
    help = 'Popula o banco de dados com os métodos de treino essenciais (N, DS, RP, etc.)'

    def handle(self, *args, **kwargs):
        metodos_essenciais = [
            {'nome': 'Normal', 'sigla': 'N', 'cor': '#FFFFFF'},
            {'nome': 'Aquecimento', 'sigla': 'W', 'cor': '#F59E0B'},
            {'nome': 'Dropset', 'sigla': 'DS', 'cor': '#A855F7'},
            {'nome': 'Rest Pause', 'sigla': 'RP', 'cor': '#14B8A6'},
            {'nome': 'Falha Total', 'sigla': 'F', 'cor': '#EF4444'},
            {'nome': 'Isometria', 'sigla': 'ISO', 'cor': '#3B82F6'},
        ]

        total_criado = 0
        for dados in metodos_essenciais:
            obj, created = Metodo.objects.get_or_create(
                sigla=dados['sigla'],
                usuario=None,
                defaults={'nome': dados['nome'], 'cor': dados['cor']}
            )
            if created:
                total_criado += 1

        self.stdout.write(self.style.SUCCESS(f'Sucesso! {total_criado} métodos essenciais adicionados.'))