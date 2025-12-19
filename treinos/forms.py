from django import forms
from django.db.models import Q 
from .models import Rotina, Exercicio, Metodo
from django.contrib.auth.forms import UserCreationForm


class CustomUserCreationForm(UserCreationForm):
    email = forms.EmailField(required=True, label="Email (Obrigatório para recuperação)")
    class Meta(UserCreationForm.Meta):
        fields = UserCreationForm.Meta.fields + ('email',)

class RotinaForm(forms.ModelForm):
    class Meta:
        model = Rotina
        fields = ['nome', 'exercicios']
        labels = {'nome': 'Nome do Treino (Ex: Treino A)'}
    
    # Checkbox inteligente
    exercicios = forms.ModelMultipleChoiceField(
        queryset=Exercicio.objects.none(),
        widget=forms.CheckboxSelectMultiple,
        label="Quais exercícios?"
    )

    # O "Construtor" do formulário recebe o usuário logado
    def __init__(self, user, *args, **kwargs):
        super(RotinaForm, self).__init__(*args, **kwargs)
        # Filtra: Exercícios sem dono (Sistema) OU Exercícios desse usuário
        self.fields['exercicios'].queryset = Exercicio.objects.filter(
            Q(usuario=None) | Q(usuario=user)
        )

    def clean_exercicios(self):
        exercicios = self.cleaned_data.get('exercicios')
        if not exercicios:
            raise forms.ValidationError("Selecione pelo menos um exercício!")
        return exercicios

class ExercicioForm(forms.ModelForm):
    class Meta:
        model = Exercicio
        fields = ['nome', 'grupo_muscular']
        widgets = {
            'nome': forms.TextInput(attrs={
                'class': 'form-control', 
                'placeholder': 'Ex: Supino Reto',
                'style': 'background: #18181b; color: white; border: 1px solid #333; border-radius: 12px; padding: 15px;'
            }),
            'grupo_muscular': forms.Select(attrs={
                'class': 'form-control',
                'style': 'background: #18181b; color: white; border: 1px solid #333; border-radius: 12px; padding: 15px;'
            })
        }

    def clean_nome(self):
        nome_original = self.cleaned_data.get('nome')
        if nome_original:
            nome_limpo = " ".join(nome_original.split()).title()
        else:
            return nome_original

        existe = Exercicio.objects.filter(nome__iexact=nome_limpo).exclude(pk=self.instance.pk).exists()

        if existe:
            raise forms.ValidationError(f"O exercício '{nome_limpo}' já existe na biblioteca!")

        return nome_limpo

# Formulário para criar Método Novo (Com seletor de cor!)
class MetodoForm(forms.ModelForm):
    class Meta:
        model = Metodo
        fields = ['nome', 'sigla', 'cor']
        widgets = {
            'nome': forms.TextInput(attrs={'placeholder': 'Ex: Rest Pause', 'style': 'width: 100%; background: #09090b; color: #fff; padding: 10px; border-radius: 8px;'}),
            'sigla': forms.TextInput(attrs={'placeholder': 'RP', 'style': 'width: 100%; background: #09090b; color: #fff; padding: 10px; border-radius: 8px;'}),
            'cor': forms.TextInput(attrs={'type': 'color', 'style': 'width: 100%; height: 50px; border: none; background: none;'}),
        }