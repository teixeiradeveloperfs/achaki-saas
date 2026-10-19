# Deploy em VPS

Este guia configura uma VPS Ubuntu/Debian para rodar o Achaki com Node.js, PostgreSQL, Redis, PM2 e Nginx. O deploy automático é feito pelo GitHub Actions via SSH.

## 1. Preparar a VPS

```bash
sudo apt update
sudo apt install -y git curl nginx postgresql redis-server
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

Verifique:

```bash
node --version
npm --version
pm2 --version
```

## 2. Criar usuário e diretório

Use um usuário dedicado para não executar a aplicação como `root`:

```bash
sudo adduser --disabled-password --gecos '' achaki
sudo mkdir -p /var/www/achaki
sudo chown -R achaki:achaki /var/www/achaki
sudo -iu achaki
```

Clone o repositório:

```bash
git clone git@github.com:teixeiradeveloperfs/achaki-saas.git /var/www/achaki
cd /var/www/achaki
```

Se o repositório for privado, configure uma chave SSH de deploy no usuário `achaki` e adicione a chave pública em GitHub → Settings → Deploy keys.

## 3. Criar banco PostgreSQL

```bash
sudo -u postgres psql
```

```sql
CREATE USER achaki WITH PASSWORD 'troque-esta-senha';
CREATE DATABASE achaki OWNER achaki;
\q
```

O Redis pode ficar acessível somente localmente:

```bash
redis-cli ping
```

## 4. Configurar produção

```bash
sudo -iu achaki
cd /var/www/achaki
cp backend/.env.example backend/.env.production
nano backend/.env.production
```

Exemplo mínimo:

```env
NODE_ENV=production
PORT=36628
DATABASE_URL=postgres://achaki:troque-esta-senha@localhost:5432/achaki
REDIS_URL=redis://localhost:6379
CORS_ORIGINS=https://app.seudominio.com,https://admin.seudominio.com
SESSION_TTL_HOURS=12
TRUST_PROXY=true
SETTINGS_ENCRYPTION_KEY=gere-uma-chave-aleatoria-com-mais-de-32-caracteres
SHOPEE_AFFILIATE_API_URL=https://open-api.affiliate.shopee.com.br/graphql
SHOPEE_AFFILIATE_TIMEOUT_MS=15000
```

Gere uma chave segura com `openssl rand -base64 48`. Crie também os ambientes dos painéis:

```bash
cat > frontend/.env.production <<'EOF'
VITE_API_URL=https://api.seudominio.com
EOF

cat > admin/.env.production <<'EOF'
VITE_API_URL=https://api.seudominio.com
EOF
```

Esses arquivos não devem ser commitados. O `.gitignore` já ignora arquivos `.env.*`, exceto `.env.example`.

## 5. Primeiro deploy manual

```bash
cd /var/www/achaki
npm ci --prefix backend
npm ci --prefix frontend
npm ci --prefix admin

npm run build --prefix backend
npm run build --prefix frontend
npm run build --prefix admin
npm run db:migrate:prod --prefix backend

pm2 start ecosystem.config.cjs --update-env
pm2 save
```

Ative o PM2 no boot e execute o comando indicado pelo próprio PM2:

```bash
pm2 startup systemd
pm2 save
```

Para os próximos deploys, use o script repetível:

```bash
/var/www/achaki/scripts/deploy-vps.sh
```

## 6. Configurar Nginx

O exemplo [`nginx/achaki.conf`](nginx/achaki.conf) usa:

- `app.seudominio.com` para o frontend;
- `admin.seudominio.com` para o painel administrativo;
- `api.seudominio.com` para a API.

Configure os registros DNS A dos três subdomínios apontando para o IP da VPS e instale o arquivo:

```bash
sudo cp docs/nginx/achaki.conf /etc/nginx/sites-available/achaki
sudo ln -s /etc/nginx/sites-available/achaki /etc/nginx/sites-enabled/achaki
sudo nginx -t
sudo systemctl reload nginx
```

## 7. HTTPS com Certbot

Depois que o DNS estiver propagado:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx \
  -d app.seudominio.com \
  -d admin.seudominio.com \
  -d api.seudominio.com
sudo certbot renew --dry-run
```

## 8. Deploy automático pelo GitHub Actions

No repositório do GitHub, abra Settings → Secrets and variables → Actions e crie:

- `VPS_HOST`: IP ou hostname da VPS;
- `VPS_USER`: `achaki`;
- `VPS_SSH_KEY`: chave privada usada para acessar a VPS;
- `VPS_PORT`: opcional, normalmente `22`.

O arquivo [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) executa o deploy em todo push na branch `main`. Também é possível iniciar manualmente em Actions → Deploy production → Run workflow.

Para validar na VPS:

```bash
sudo -iu achaki
cd /var/www/achaki
git remote -v
./scripts/deploy-vps.sh
pm2 status
curl http://localhost:36628/health
```

## 9. Diagnóstico rápido

```bash
pm2 status
pm2 logs achaki-api
sudo systemctl status nginx
sudo nginx -t
curl http://localhost:36628/health
```

Se a API estiver saudável localmente, mas não externamente, verifique Nginx, DNS, firewall e certificados. Se houver erro de CORS, confira se `CORS_ORIGINS` contém exatamente as URLs públicas, sem barra final.
