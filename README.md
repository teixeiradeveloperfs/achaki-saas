# Achaki SaaS

Plataforma para coletar, organizar e acompanhar ofertas de programas de afiliados.

O projeto é dividido em três aplicações:

- `frontend`: painel principal para usuários;
- `admin`: painel administrativo;
- `backend`: API NestJS com PostgreSQL, Redis e Drizzle ORM.

## Stack

- React + Vite + TypeScript
- NestJS + Fastify
- PostgreSQL 17
- Redis 7
- Drizzle ORM
- PM2 + Nginx para produção

## Requisitos

- Node.js 22 ou superior
- npm 10 ou superior
- Docker e Docker Compose para desenvolvimento local

## Desenvolvimento local

Suba os serviços de infraestrutura:

```bash
docker compose up -d
```

Configure o ambiente da API:

```bash
cp backend/.env.example backend/.env.development
```

Edite `backend/.env.development` com, no mínimo:

```env
NODE_ENV=development
PORT=36628
DATABASE_URL=postgres://achaki:achaki@localhost:5432/achaki
REDIS_URL=redis://localhost:6379
CORS_ORIGINS=http://localhost:5173,http://localhost:5174
SETTINGS_ENCRYPTION_KEY=uma-chave-local-com-pelo-menos-32-caracteres
```

Crie os ambientes dos painéis:

```env
# frontend/.env.development
PORT=5173
VITE_API_URL=http://localhost:36628

# admin/.env.development
PORT=5174
VITE_API_URL=http://localhost:36628
```

Instale as dependências e prepare o banco:

```bash
cd backend && npm ci && npm run db:migrate && npm run db:seed
cd ../frontend && npm ci
cd ../admin && npm ci
```

Inicie cada aplicação em um terminal:

```bash
cd backend && npm run start:dev
cd frontend && npm run dev
cd admin && npm run dev
```

URLs locais:

- App: <http://localhost:5173>
- Admin: <http://localhost:5174>
- API: <http://localhost:36628>
- Health check: <http://localhost:36628/health>

## Variáveis de ambiente

O arquivo `backend/.env.example` documenta as variáveis da API. Nunca versione `.env.development`, `.env.production` ou credenciais de provedores.

Em produção, o backend precisa de `DATABASE_URL`, `REDIS_URL`, `CORS_ORIGINS`, `SETTINGS_ENCRYPTION_KEY` e `NODE_ENV=production`. As credenciais da Shopee são configuradas pelo painel administrativo quando necessário.

## Scripts principais

### Backend

```bash
npm run start:dev       # desenvolvimento com watch
npm run build           # compila para dist/
npm run db:migrate      # migra banco de desenvolvimento
npm run db:migrate:prod # migra banco de produção
npm run lint            # lint
npm test                # testes
```

### Frontend e Admin

```bash
npm run dev
npm run build
npm run lint
```

## Deploy em VPS

O deploy recomendado usa GitHub Actions para disparar o deploy a cada push na branch `main`, SSH para executar o script na VPS, Nginx para servir os dois painéis e PM2 para manter o backend ativo.

O passo a passo completo está em [`docs/deploy-vps.md`](docs/deploy-vps.md).

Arquivos usados pelo fluxo:

- [`ecosystem.config.cjs`](ecosystem.config.cjs): processo do backend no PM2;
- [`scripts/deploy-vps.sh`](scripts/deploy-vps.sh): atualização, build, migração e reload;
- [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml): deploy automático via GitHub Actions;
- [`docs/nginx/achaki.conf`](docs/nginx/achaki.conf): exemplo de Nginx.

## Qualidade

Antes de abrir um pull request:

```bash
cd backend && npm run build && npm run lint && npm test
cd ../frontend && npm run build && npm run lint
cd ../admin && npm run build && npm run lint
```

## Licença

Projeto privado. Consulte os responsáveis antes de redistribuir qualquer parte do código ou dos ativos da marca.
