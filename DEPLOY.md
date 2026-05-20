# Deploying Deamaclub to an Ubuntu VPS

Target: a clean Ubuntu 22.04 / 24.04 LTS VPS (DigitalOcean, Hetzner, Vultr, etc.) with `deamaclub.com` and `www.deamaclub.com` DNS A-records pointing at it.

This guide uses **Supabase** for the database (managed Postgres, free tier covers a launch) and **Cloudflare Stream** for video hosting. No Docker, no local Postgres needed.

## 1. Initial server hardening

```bash
ssh root@your-server-ip

# Create a non-root user
adduser deploy
usermod -aG sudo deploy

# Lock down SSH (recommended: copy your key first)
sed -i 's/^#\?PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
systemctl restart ssh

# Firewall
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
```

Switch to the `deploy` user: `su - deploy`.

## 2. Install Node.js 20, Nginx, Certbot

```bash
# Node 20 via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2
sudo npm i -g pm2

# Nginx + Certbot (no local Postgres — using Supabase)
sudo apt-get install -y nginx certbot python3-certbot-nginx
```

## 3. Provision the database (Supabase)

1. Create a project at [supabase.com](https://supabase.com) — pick a region near your VPS.
2. In the project dashboard click **Connect** → the modal lists three connection methods:
   - **Direct connection** — IPv6 only (unless you buy the IPv4 add-on)
   - **Transaction pooler** — also IPv6 only by default
   - **Session pooler (Shared Pooler)** — IPv4 ✓, hostname `aws-1-<region>.pooler.supabase.com:5432`
3. On any IPv4-only network (most VPS providers' default networking, and most home/office networks), use the **Session pooler** URL for both `DATABASE_URL` and `DIRECT_URL`:

```env
DATABASE_URL="postgresql://postgres.PROJECT_REF:PASSWORD@aws-1-<region>.pooler.supabase.com:5432/postgres"
DIRECT_URL="postgresql://postgres.PROJECT_REF:PASSWORD@aws-1-<region>.pooler.supabase.com:5432/postgres"
```

Username format is `postgres.<project-ref>` (with the dot), where `<project-ref>` is the 20-char string from the dashboard URL bar.

Then in `prisma/schema.prisma` the datasource block already declares both:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### If you want the transaction pooler (better for many ephemeral connections)

Enable Supabase's **dedicated IPv4 add-on** ($4/mo) on the project, then switch `DATABASE_URL` to:

```env
DATABASE_URL="postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1"
```

Session pooler is fine for the PM2-cluster setup in this guide — each Node process holds a long-lived connection. Transaction pooler matters when many short-lived workers compete (serverless / lambdas / many cron jobs).

> **Tip:** keep the Supabase service-role key out of `.env` — we only need the connection strings. Supabase Auth and Storage aren't used; we're treating it as a plain Postgres host.

## 4. Deploy the code

```bash
sudo mkdir -p /var/www/deamaclub
sudo chown -R deploy:deploy /var/www/deamaclub
cd /var/www
git clone git@github.com:YOUR_GH_USERNAME/deamaclub.git
cd deamaclub

# Production env
cp .env.example .env.production
nano .env.production   # fill in real values: DATABASE_URL, NEXTAUTH_SECRET, etc.

# Install + build
npm ci
npx prisma migrate deploy   # applies migrations to Supabase via DIRECT_URL
npm run db:seed             # creates categories + admin user
npm run build
```

Generate `NEXTAUTH_SECRET` with: `openssl rand -base64 32`.

## 5. Start with PM2

```bash
cd /var/www/deamaclub
pm2 start ecosystem.config.js --env production
pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u deploy --hp /home/deploy
```

Verify locally: `curl -I http://127.0.0.1:3000` → should return 200.

## 6. Nginx + SSL

```bash
sudo cp /var/www/deamaclub/nginx.conf /etc/nginx/sites-available/deamaclub.com
sudo ln -s /etc/nginx/sites-available/deamaclub.com /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t

# First start without SSL block uncommented? Use Certbot's nginx plugin to auto-edit:
sudo certbot --nginx -d deamaclub.com -d www.deamaclub.com \
    --redirect --agree-tos -m you@deamaclub.com -n

sudo systemctl reload nginx
```

Certbot installs a systemd timer that auto-renews; verify with `sudo certbot renew --dry-run`.

## 7. Updates / redeploys

```bash
cd /var/www/deamaclub
git pull
npm ci
npx prisma migrate deploy
npm run build
pm2 reload deamaclub --update-env
```

A simple `deploy.sh` you can drop in the repo:

```bash
#!/usr/bin/env bash
set -euo pipefail
cd /var/www/deamaclub
git pull --ff-only
npm ci --omit=optional
npx prisma migrate deploy
npm run build
pm2 reload deamaclub --update-env
```

## 8. Ad network onboarding

Ad placements are pre-wired with `data-ad-zone` attributes (see `src/components/AdSlot.tsx`):

- `leaderboard-top` — global above-the-fold leaderboard
- `home-sidebar-1`, `home-sidebar-2` — homepage sidebar
- `infeed-*` — in-feed natives (every 8th card)
- `article-top`, `article-mid`, `article-bottom` — video page placements
- `video-sidebar-1`, `video-sidebar-2` — video page sidebar
- `cat-{slug}-sidebar-1/2` — per-category sidebars

To wire Raptive / Mediavine / Google Ad Manager:

1. Add the publisher script tag in `src/app/layout.tsx` (inside `<head>` via `next/script`).
2. Map each `data-ad-zone` to the publisher's slot definitions.
3. The placeholder div sizing in `AdSlot.tsx` is intentionally close to standard IAB sizes so CLS stays low — adjust only if your network requires it.

## 9. Backups

Supabase takes **daily automated backups** on every paid tier (Pro and above) and retains them for 7 days; Free-tier projects can be exported manually from **Project Settings → Database → Backups**. If you want a redundant off-site dump, run this cron on the VPS using the direct connection string:

```bash
# /etc/cron.daily/deamaclub-pgdump  (requires postgresql-client only)
sudo apt-get install -y postgresql-client
cat <<'CRON' | sudo tee /etc/cron.daily/deamaclub-pgdump
#!/usr/bin/env bash
set -euo pipefail
TS=$(date -u +%Y%m%d)
DIR=/var/backups/deamaclub
mkdir -p "$DIR"
# DIRECT_URL is in /var/www/deamaclub/.env.production; export it for pg_dump
source <(grep -E '^DIRECT_URL=' /var/www/deamaclub/.env.production | sed 's/^/export /')
pg_dump "$DIRECT_URL" | gzip > "$DIR/deamaclub-$TS.sql.gz"
find "$DIR" -mtime +14 -delete
CRON
sudo chmod +x /etc/cron.daily/deamaclub-pgdump
```

## 10. Monitoring

- `pm2 monit` — live process view.
- `pm2 logs deamaclub` — tail app logs.
- `sudo tail -f /var/log/nginx/access.log /var/log/nginx/error.log`.
- Consider attaching the server to UptimeRobot / BetterStack for external pings.
