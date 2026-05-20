# Deamaclub

Viral videos, fights, hip hop, sports, wild moments and street culture — a Bloomberg-grade publishing platform with the visual energy of WSHH.

Live site: **[deamaclub.com](https://deamaclub.com)**

## Stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** — dark + red accent theme (`tailwind.config.ts`)
- **Prisma** + **PostgreSQL** — content & view tracking
- **NextAuth.js** — admin login (credentials provider, bcrypt hashes, JWT sessions)
- **Cloudflare** — Images + Stream for media delivery (with local fallback for dev)
- **PM2** + **Nginx** — production process manager and reverse proxy

## Features

- Homepage with trending hero + paginated grid
- Video pages: embedded player (Cloudflare Stream / YouTube / direct mp4), share buttons (Facebook, X, WhatsApp, copy link), comments, related videos sidebar, multiple ad slots
- Category pages: News, Fights, Hip Hop, Sports, Wild, Celebrity
- Full-text-ish search (`/search?q=...`)
- Protected admin dashboard at `/admin` (CRUD posts, thumbnail upload, publish/unpublish, mark trending)
- SEO: dynamic `<title>`/OG tags, `sitemap.xml`, `robots.txt`, VideoObject JSON-LD on every video page
- Named ad placement zones (`data-ad-zone`) ready for Raptive / Mediavine / Google Ad Manager header bidding
- Per-IP-hash view dedup (30-min window) so passive crawlers don't inflate counts
- Mobile-first responsive design, lazy images via `next/image`, Inter + Anton (display) via `next/font`

## Local development

```bash
# 1. Install deps
npm install

# 2. Configure env
cp .env.example .env
# Edit DATABASE_URL, NEXTAUTH_SECRET (openssl rand -base64 32), etc.

# 3. Set up the DB
npx prisma migrate dev --name init
npm run db:seed   # creates categories + admin user from ADMIN_EMAIL/ADMIN_PASSWORD

# 4. Run
npm run dev
```

Visit:

- `http://localhost:3000` — homepage
- `http://localhost:3000/login` — admin login (use the seeded email/password)
- `http://localhost:3000/admin` — dashboard

## Project layout

```
src/
├── app/
│   ├── api/
│   │   ├── admin/posts/        # POST/PATCH/DELETE
│   │   ├── admin/upload/       # Cloudflare Images (with local fallback)
│   │   ├── auth/[...nextauth]/ # NextAuth handler
│   │   ├── comments/           # GET + POST public comments
│   │   └── views/              # POST view increment (dedupe by ip hash)
│   ├── admin/                  # protected dashboard (middleware-gated)
│   ├── category/[slug]/        # category index
│   ├── search/                 # search results
│   ├── video/[slug]/           # video detail with JSON-LD
│   ├── login/
│   ├── sitemap.ts / robots.ts
│   ├── layout.tsx / page.tsx
│   └── globals.css
├── components/                 # Header, Footer, AdSlot, VideoGrid, VideoPlayer, …
├── lib/                        # prisma client, auth options, post queries, utils
├── types/                      # next-auth augmentation
└── middleware.ts               # protects /admin/*
prisma/
├── schema.prisma
└── seed.ts
```

## Deployment

Step-by-step Ubuntu VPS deploy with Nginx, PM2, Certbot SSL: see **[DEPLOY.md](./DEPLOY.md)**.

Configs included:

- `nginx.conf` — `deamaclub.com` reverse proxy with HSTS, rate-limited `/api/`, static cache, www→apex redirect, Let's Encrypt block
- `ecosystem.config.js` — PM2 cluster (max CPUs) with log paths and 512 MB restart guard

## Ad placement zones

Every `<AdSlot />` renders a `data-ad-zone="..."` div sized to standard IAB dimensions. Zones in use:

| Zone id                  | Page             | IAB size  |
| ------------------------ | ---------------- | --------- |
| `leaderboard-top`        | global header    | 728×90    |
| `home-sidebar-1`         | homepage         | 300×600   |
| `home-sidebar-2`         | homepage         | 300×250   |
| `infeed-*`               | feed (every 8th) | fluid     |
| `article-top/mid/bottom` | video page       | 728×90 / fluid |
| `video-sidebar-1/2`      | video page       | 300×600 / 300×250 |
| `cat-{slug}-sidebar-*`   | category pages   | 300×600 / 300×250 |
| `search-sidebar-1`       | search           | 300×600   |

To wire a network: add their loader (Raptive / Mediavine / GPT) in the root layout, then map each `data-ad-zone` to the network's slot config.

## License

Proprietary © Deamaclub. All rights reserved.
