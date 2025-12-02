from django.contrib import admin
from .models import Exercicio, Rotina, TreinoRealizado, SerieRealizada, Metodo

admin.site.register(Exercicio)
admin.site.register(Rotina)
admin.site.register(TreinoRealizado)
admin.site.register(SerieRealizada)


@admin.register(Metodo)
class MetodoAdmin(admin.ModelAdmin):
    list_display = ('nome', 'sigla', 'cor')