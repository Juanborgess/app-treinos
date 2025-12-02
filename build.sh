#!/usr/bin/env bash
# exit on error
set -o errexit

# 1. Instala todas as dependências
pip install -r requirements.txt

# 2. Coleta todos os arquivos estáticos (CSS, JS)
python manage.py collectstatic --no-input

# 3. Cria as tabelas no banco de dados
python manage.py migrate