from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator
from django.utils import timezone

# 1. EXERCÍCIOS
class Exercicio(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    
    GRUPOS = [
        # Superiores - Empurrar
        ('PEITO', 'Peitoral'),
        ('OMBRO_ANT', 'Deltoide Anterior'),
        ('OMBRO_LAT', 'Deltoide Lateral'),
        ('OMBRO_POST', 'Deltoide Posterior'),
        ('TRICEPS', 'Tríceps'),
        
        # Superiores - Puxar
        ('COSTAS', 'Dorsais'),
        ('TRAPEZIO', 'Trapézio'),
        ('BICEPS', 'Bíceps'),
        ('ANTEBRACO', 'Antebraço'),
        
        # Inferiores
        ('QUADRICEPS', 'Quadríceps'),
        ('POSTERIOR', 'Posterior de Coxa'),
        ('GLUTEOS', 'Glúteos'),
        ('PANTURRILHA', 'Panturrilhas'),
        
        # Core / Outros
        ('ABS', 'Abdômen'),
        ('LOMBAR', 'Lombar'),
        ('CARDIO', 'Cardio'),
    ]
    
    nome = models.CharField(max_length=100)
    grupo_muscular = models.CharField(max_length=20, choices=GRUPOS)
    
    def __str__(self):
        return self.nome

# 2. MÉTODOS (Drop-set, etc)
class Metodo(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    nome = models.CharField(max_length=50)
    sigla = models.CharField(max_length=5)
    cor = models.CharField(max_length=7, default='#FFFFFF')

    def __str__(self):
        return self.nome

# 3. ROTINAS
class Rotina(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE)
    nome = models.CharField(max_length=50)
    exercicios = models.ManyToManyField(Exercicio)

    def __str__(self):
        return f"{self.nome} de {self.usuario.username}"

# 4. TREINOS REALIZADOS
class TreinoRealizado(models.Model):
    rotina = models.ForeignKey(Rotina, on_delete=models.SET_NULL, null=True, blank=True)
    data = models.DateTimeField(auto_now_add=True)
    finalizado = models.BooleanField(default=False)

    def __str__(self):
        nome_rotina = self.rotina.nome if self.rotina else "Rotina Arquivada"
        return f"{nome_rotina} em {self.data.strftime('%d/%m/%Y')}"

# 5. SÉRIES
class SerieRealizada(models.Model):
    treino = models.ForeignKey(TreinoRealizado, on_delete=models.CASCADE)
    exercicio = models.ForeignKey(Exercicio, on_delete=models.CASCADE)
    metodo = models.ForeignKey(Metodo, on_delete=models.SET_NULL, null=True)
    peso = models.DecimalField(max_digits=6, decimal_places=2, validators=[MinValueValidator(0.1)])
    repeticoes = models.IntegerField(validators=[MinValueValidator(1)])
    
    def __str__(self):
        return f"{self.exercicio.nome}: {self.peso}kg"

# 6. ANOTAÇÕES DE AJUSTE
class Anotacao(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE)
    exercicio = models.ForeignKey(Exercicio, on_delete=models.CASCADE)
    texto = models.TextField(blank=True, null=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('usuario', 'exercicio')

# 7. HISTÓRICO DE PESO (A que estava faltando!)
class PesoUsuario(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE)
    peso = models.DecimalField(max_digits=5, decimal_places=2) 
    data = models.DateField(default=timezone.now)

    def __str__(self):
        return f"{self.usuario.username} - {self.peso}kg"

# 8. MEDIDAS CORPORAIS (A nova que vamos usar agora)
class MedidaCorporal(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE)
    data = models.DateField(default=timezone.now)
    
    cintura = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    pescoco = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    ombro = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    peito = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    
    biceps_e = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    biceps_d = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    antebraco_e = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    antebraco_d = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    
    coxa_e = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    coxa_d = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    panturrilha_e = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    panturrilha_d = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    
    gordura = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True)

    def __str__(self):
        return f"Medidas de {self.usuario.username} em {self.data}"