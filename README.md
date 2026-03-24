# Portfolio Universe - Mystery Download Box

Portfolio Universe is a production-ready open-source platform where users unlock random digital resources after an ad flow, contribute files back to the community, and rely on admin moderation to keep the ecosystem safe.

## Stack

- Frontend: Next.js 14 App Router, TypeScript, Tailwind CSS, Framer Motion, Three.js, Zustand
- Backend: Node.js, Express, Prisma ORM, PostgreSQL, JWT, Multer
- Ops readiness: Docker, environment templates, rate limiting, structured logging

## Features

- Mystery box engine with rarity weighting and duplicate avoidance
- JWT auth with protected dashboard-ready flows
- Moderated upload pipeline with malware scan simulation
- Admin analytics and approval queue
- Contributor points, streaks, and leaderboard foundations
- Open-source contributor docs and issue templates

## Project Structure

```text
root/
  frontend/
    app/
    components/
    lib/
    store/
    styles/
  backend/
    prisma/
    src/
      config/
      controllers/
      lib/
      middleware/
      routes/
      services/
      utils/
      validators/
  database/
  assets/
  .github/
```

## Setup

### 1. Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure environment files

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

### 3. Start PostgreSQL and run Prisma

```bash
docker compose up -d postgres
cd backend
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

### 4. Run the apps

```bash
cd backend && npm run dev
cd frontend && npm run dev
```

## Important Notes

- Uploaded files are stored in `assets/uploads/`
- Preview assets can live in `assets/previews/`
- `database/schema.sql` is included for SQL-first inspection, but Prisma is the source of truth
- GitHub publishing is intentionally left as an extension point rather than hardcoded automation

## Open Source Workflow

- Read [CONTRIBUTING.md](c:\Users\ASUS\OneDrive\Desktop\None\CONTRIBUTING.md)
- Use the issue templates in `.github/ISSUE_TEMPLATE/`
- Keep business logic in backend services and UI logic in reusable frontend components
