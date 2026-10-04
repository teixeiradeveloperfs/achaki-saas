# Achaki

Plataforma para coletar e organizar ofertas de programas de afiliados. O projeto contém:

- `frontend`: painel do usuário;
- `admin`: painel administrativo;
- `backend`: API NestJS, PostgreSQL/Drizzle e Redis;
- `docker-compose.yml`: PostgreSQL e Redis para desenvolvimento local.

## Desenvolvimento local

```bash
docker compose up -d

cd backend
npm install
npm run db:migrate
npm run db:seed
npm run start:dev
```

Em outros terminais:

```bash
cd frontend && npm install && npm run dev
cd admin && npm install && npm run dev
```

Antes de iniciar o backend, crie `backend/.env.development` usando as variáveis documentadas em `backend/.env.example`, com `NODE_ENV=development`. Configure URLs, origens CORS, chave de criptografia e credenciais de infraestrutura nos arquivos locais de ambiente. Arquivos `.env` não são versionados.

## Qualidade

Cada aplicação possui scripts de `build` e `lint`. O backend também possui testes com Vitest:

```bash
cd backend
npm run build
npm run lint
npm test
```
