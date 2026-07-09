#!/usr/bin/env bash
# One-command deploy for deamaclub.com
# Usage: ./deploy.sh "commit message"
set -euo pipefail

SERVER="root@204.48.24.230"
APP_DIR="/var/www/deamaclub"

git add -A
git commit -m "${1:-deploy}" || echo "nothing to commit"
git push origin main

ssh "$SERVER" "cd $APP_DIR \
  && git pull --ff-only origin main \
  && npm ci --omit=optional \
  && npx prisma migrate deploy \
  && npm run build \
  && pm2 reload deamaclub --update-env"

echo "✅ Deployed — verifying..."
curl -s -o /dev/null -w "https://deamaclub.com/ -> %{http_code}\n" https://deamaclub.com/
