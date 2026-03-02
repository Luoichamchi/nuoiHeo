# Nuoi Heo Polling (Internal Web App)

Web app full-stack for internal betting/polling with 2 options (A/B), automatic debt calculation, and summary table + pie chart.

## Stack
- Next.js (App Router) + TypeScript
- Prisma + SQLite
- Tailwind CSS
- Recharts

## Key Features
- Login by `userId + PIN`
- Member voting (A/B), editable before `lockAt`
- Admin user management (create/update/activate, avatar upload)
  - `userId` must be entered manually when creating user and must be unique
- Admin match management (rules, penalty amount, lock time, set result)
- CSV vote import by admin (`userId` or `fullName`, `choice`)
- Payment recording (partial payment supported)
- Summary table and pie chart
- Top debtors highlight (top 3 including ties at position 3)

## Project Structure

```txt
src/
  app/
    (auth)/login/page.tsx
    (member)/vote/page.tsx
    (member)/summary/page.tsx
    admin/users/page.tsx
    admin/matches/page.tsx
    admin/matches/[id]/import/page.tsx
    admin/payments/page.tsx
    api/... (route handlers)
  modules/
    auth/
    users/
    matches/
    votes/
    settlement/
    summary/
  components/
    ui/
    charts/
    tables/
    forms/
  lib/
    db.ts
    auth.ts
    csv.ts
    money.ts
    validators.ts
prisma/
  schema.prisma
  migrations/
```

## Setup

1. Copy env file:
```bash
cp .env.example .env
```

2. Install dependencies:
```bash
npm install
```

3. Generate Prisma client + migrate DB:
```bash
npm run prisma:generate
npm run prisma:migrate -- --name init
```
If `prisma:migrate` shows `Schema engine error`, run:
```bash
RUST_LOG=trace npm run prisma:migrate -- --name init
```

4. Seed sample data:
```bash
npm run prisma:seed
```

5. Run app:
```bash
npm run dev
```

## Seed Accounts
- Admin:
  - `userId`: `admin-seed`
  - `pin`: `123456`
- Members:
  - `member-seed-0..4`
  - `pin`: `000000`

## CSV Import Format
Sample: `docs/import-votes-template.csv`

Required columns:
- `choice`: `A` or `B`
- At least one identifier:
  - `userId`, or
  - `fullName` (exact match, case-insensitive)

## Main APIs
- Auth: `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- Member: `GET /api/matches/active`, `POST /api/matches/:id/vote`, `GET /api/summary`
- Admin users: `GET/POST /api/admin/users`, `PATCH /api/admin/users/:id`, `POST /api/admin/users/:id/avatar`
- Admin matches: `GET/POST /api/admin/matches`, `PATCH /api/admin/matches/:id`, `POST /api/admin/matches/:id/result`, `POST /api/admin/matches/:id/import-votes`
- Payments: `POST /api/admin/payments`, `GET /api/admin/summary`

## Notes
- This repository was scaffolded manually due restricted network in the current coding environment.
- After running `npm install`, run lint/build locally to verify environment-specific behavior.
