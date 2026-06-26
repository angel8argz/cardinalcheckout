# CardinalCheckout

A modern equipment checkout and lending platform, built as a cleaner
alternative to WebCheckout for university tech desks. First target user: the
Lathrop Tech Desk at Stanford.

## Status

Early development. This build is a runnable skeleton with the Cardinal-themed
console shell (dark sidebar + top header), a live staff dashboard, and an Active
Loans view — all reading from the database. Checkout, Return, Resources,
Patrons, and Settings are nav links to placeholder pages. The functional
checkout/return flows, patron pages, inventory editing, reservations,
notifications, and auth are not built yet.

## Stack

- Next.js 15 (App Router, TypeScript)
- PostgreSQL
- Prisma
- Tailwind CSS v3
- lucide-react (icons)

## Prerequisites

- Node.js 18.18+ (tested on 18.20)
- Docker (for the local Postgres database)

> Note: Tailwind is pinned to v3 because Tailwind v4's native build requires
> Node 20+. If you move to Node 20+, you can upgrade to Tailwind v4.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure environment variables. Copy the example and adjust if your local
   Postgres differs:

   ```bash
   cp .env.example .env
   ```

   Required variable:

   - `DATABASE_URL` — Postgres connection string. The default matches the
     bundled `docker-compose.yml`:
     `postgresql://cardinal:localdev@localhost:5432/cardinalcheckout?schema=public`

   `.env` is gitignored; never commit credentials.

3. Start the database:

   ```bash
   docker compose up -d db
   ```

4. Create the schema:

   ```bash
   npx prisma migrate dev
   ```

5. Seed synthetic data (categories, items, patrons, and a mix of active,
   overdue, due-today, and returned loans):

   ```bash
   npm run seed
   ```

6. Run the dev server:

   ```bash
   npm run dev
   ```

   Open http://localhost:3000 — the root redirects to `/dashboard`.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run migrate` — `prisma migrate dev`
- `npm run seed` — load synthetic seed data (safe to re-run)
- `npm run db:reset` — drop, re-migrate, and re-seed the database

## Data model

`Category`, `Item`, `Patron`, `Loan`, `Policy`. See `prisma/schema.prisma`.
Item barcodes are preserved from WebCheckout so existing physical labels keep
working. All development data is synthetic — never load real student records
(FERPA).
