#!/bin/bash

# Script para atualização automática do repositório GitHub
# Usage: ./auto-push.sh "Mensagem do commit"

# Verifica se o token do GitHub está disponível
if [ -z "$GITHUB_TOKEN" ]; then
  echo "Erro: Token do GitHub não encontrado!"
  exit 1
fi

# Configura as credenciais do Git
git config --global credential.helper store
git config --global user.name "Atualização Automática"
git config --global user.email "auto-update@example.com"

# Adiciona todas as alterações
git add .

# Cria um commit com a mensagem fornecida ou uma mensagem padrão
COMMIT_MESSAGE=${1:-"Atualização automática: $(date +%Y-%m-%d_%H-%M-%S)"}
git commit -m "$COMMIT_MESSAGE"

# Push para o GitHub usando o token
git push https://$GITHUB_TOKEN@github.com/Diogokranzz/AerialBattle.git main

echo "Repositório atualizado com sucesso!"