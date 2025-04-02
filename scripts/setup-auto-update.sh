#!/bin/bash

# Script para configurar a atualização automática do GitHub a cada hora
# Este script configura um cron job para executar auto-update.sh a cada hora

# Tornar os scripts executáveis
chmod +x "$(dirname "$0")/auto-push.sh"
chmod +x "$(dirname "$0")/auto-update.sh"

# Verificar se o cron job já existe
if crontab -l 2>/dev/null | grep -q "auto-update.sh"; then
  echo "O cron job de atualização já está configurado."
else
  # Obter o caminho absoluto do diretório do projeto
  PROJECT_DIR=$(cd "$(dirname "$0")/.." && pwd)
  
  # Obter a crontab atual
  (crontab -l 2>/dev/null || echo "") > /tmp/current_crontab
  
  # Adicionar o job para executar a cada hora
  echo "0 * * * * cd $PROJECT_DIR && ./scripts/auto-update.sh >> $PROJECT_DIR/auto-update.log 2>&1" >> /tmp/current_crontab
  
  # Instalar a nova crontab
  crontab /tmp/current_crontab
  
  # Limpar arquivo temporário
  rm /tmp/current_crontab
  
  echo "Cron job configurado para atualizar o GitHub a cada hora."
fi

echo "Você pode executar './scripts/auto-update.sh' manualmente a qualquer momento para fazer uma atualização imediata."