# Contributing to The Cloud Rain 
Thanks for helping build The Cloud Rain .

## Workflow

1. Fork the repository and create a feature branch.
2. Keep pull requests focused and well-described.
3. Add comments where business logic is non-obvious.
4. Update docs when behavior or setup changes.

## Local Setup

1. Start PostgreSQL with `docker compose up -d postgres`
2. Configure `backend/.env`
3. Run `npm install` in `backend/` and `frontend/`
4. Generate Prisma client with `npm run prisma:generate`

## Pull Request Checklist

- Explain the user-facing change
- Note any migrations or environment changes
- Include screenshots for UI changes
- Mention follow-up work if something is intentionally stubbed
