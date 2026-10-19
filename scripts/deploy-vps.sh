#!/usr/bin/env bash
set -Eeuo pipefail

APP_DIR="${APP_DIR:-/var/www/achaki}"
BRANCH="${DEPLOY_BRANCH:-main}"

cd "$APP_DIR"

echo "==> Atualizando código (${BRANCH})"
git fetch origin "$BRANCH"
git pull --ff-only origin "$BRANCH"

echo "==> Instalando dependências"
npm ci --prefix backend
npm ci --prefix frontend
npm ci --prefix admin

echo "==> Compilando aplicações"
npm run build --prefix backend
npm run build --prefix frontend
npm run build --prefix admin

echo "==> Aplicando migrações"
npm run db:migrate:prod --prefix backend

echo "==> Recarregando API"
pm2 startOrReload ecosystem.config.cjs --update-env
pm2 save

echo "==> Deploy concluído"
