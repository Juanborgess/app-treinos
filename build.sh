#!/usr/bin/env bash
# exit on error
set -o errexit

# 1. Instala as dependências
pip install -r requirements.txt

# 2. Coleta arquivos estáticos
python manage.py collectstatic --no-input

# 3. CRIA AS TABELAS
python manage.py migrate

# 4. PASSO NOVO: POPULA O BANCO DE DADOS com exercícios e métodos
python manage.py popular_metodos
python manage.py popular_exercicios