# GNR8

Science-based fitness and training, powered by your genetics.

## Setup

1. **Copy environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set:
   - `DATABASE_URL` – your PostgreSQL connection string (e.g. from [Neon](https://neon.tech))
   - `NEXTAUTH_SECRET` – run `openssl rand -base64 32` to generate
   - `NEXTAUTH_URL` – `http://localhost:3000` for local dev
   - `BLOB_READ_WRITE_TOKEN` – (optional) Vercel Blob token for admin DNA lab file uploads; if unset, uploads are disabled

2. **Install dependencies** (if not already)
   ```bash
   npm install
   ```

3. **Create the database schema**
   ```bash
   npm run db:migrate
   ```
   (Or `npx prisma db push` for a quick sync without migration history.)

4. **Create the first admin user**
   ```bash
   npm run db:seed
   ```
   Default: `admin@gnr8.com` / `changeme123`. Override with `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD`.

5. **Run the app**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000). Log in as admin and go to `/admin`, or sign up as a client and use `/dashboard`.

## Scripts

- `npm run dev` – start dev server
- `npm run build` – build for production
- `npm run start` – start production server
- `npm run test` – run tests
- `npm run test:coverage` – run tests with coverage
- `npm run db:generate` – generate Prisma client
- `npm run db:migrate` – run migrations
- `npm run db:seed` – seed first admin user
- `npm run db:push` – push schema to DB without migrations

## Branding (GNR8)

The app uses a teal color palette sourced from [gnr8.org](https://www.gnr8.org/). Palette and tokens are in `app/globals.css`:

- **Brand**: `--brand` (#0d9488), `--brand-hover` (#0f766e), `--brand-muted`, `--brand-foreground`
- **Surfaces**: `--surface`, `--surface-card`, `--surface-elevated` (warm, not pure white)
- **Gradients**: `--gradient-page`, `--gradient-hero`, `--gradient-cta`
- **Section accents**: `--section-primary` (teal), `--section-cool` (soft blue), `--section-warm` (amber) for nav and card accents

**Logo**: A placeholder logo is at `public/logo.svg`. Replace with the official GNR8 logo from [gnr8.org](https://www.gnr8.org/) or from Nicole; the header and landing page reference `/logo.svg`. Favicon: `app/icon.tsx` (brand-colored "G"); update to use the real logo if desired.
