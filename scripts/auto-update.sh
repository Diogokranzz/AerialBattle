#!/bin/bash

# Script para facilitar a atualização automática do repositório
# Executa o script de push com uma mensagem de atualização automática

# Ir para a raiz do projeto
cd "$(dirname "$0")/.."

# Verificar se o GITHUB_TOKEN está disponível
if [ -z "$GITHUB_TOKEN" ]; then
  echo "ERRO: Token do GitHub não encontrado!"
  echo "Por favor, certifique-se de que a variável de ambiente GITHUB_TOKEN está definida."
  exit 1
fi

# Mensagem padrão para o commit
MENSAGEM="Atualização automática: $(date +%Y-%m-%d_%H-%M-%S)"

# Executar o script de push com a mensagem
./scripts/auto-push.sh "$MENSAGEM"

echo "Repositório atualizado automaticamente!"