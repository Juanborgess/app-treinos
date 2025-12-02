import os
from django.contrib.auth import get_user_model

# Carrega o Django para que possamos usar o banco de dados
import django
django.setup()

User = get_user_model()

# Puxa as credenciais de variáveis de ambiente do Render
ADMIN_USERNAME = os.environ.get('ADMIN_USERNAME', 'admin')
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'admin@example.com')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD')

# Tenta criar o usuário apenas se ele não existir
if not User.objects.filter(username=ADMIN_USERNAME).exists():
    print(f"Criando superusuário {ADMIN_USERNAME} de forma não interativa...")

    if ADMIN_PASSWORD:
        User.objects.create_superuser(
            ADMIN_USERNAME,
            ADMIN_EMAIL,
            ADMIN_PASSWORD
        )
        print("Superusuário criado com sucesso no banco Neon!")
    else:
        print("ERRO: ADMIN_PASSWORD não definida no Render. Não foi possível criar o usuário.")
else:
    print("Superusuário já existe. Pulando a criação.")