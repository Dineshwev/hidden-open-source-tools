# The Cloud Rain 🌧️

> [!IMPORTANT]
> **Note for Contributors:** The `core/` folder contains the **COMPLETE** Next.js serverless application. Despite the folder name, this is NOT a traditional frontend-only project. All backend logic runs as Vercel serverless functions inside `core/app/api/`.

**The Cloud Rain** is a modern, open-source platform designed to help developers discover high-quality resources. It features a unique "Mystery Box" reward system where users can unlock curated tools, alongside a massive directory of free developer resources.

---

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript & JavaScript
- **Database & Storage**: Supabase (PostgreSQL + S3-compatible Storage)
- **Authentication**: Firebase Auth (Client) + Firebase Admin (Server)
- **Styling**: Tailwind CSS & Framer Motion
- **3D Graphics**: Three.js (React Three Fiber)
- **Deployment**: Vercel (Serverless)

---

## ✨ Features

- **📦 Mystery Box Engine**: A rarity-weighted reward system for discovering tools without duplicates.
- **🛠️ Free Tools Directory**: 153+ curated resources for developers, designers, and creators.
- **🛡️ Admin Moderation**: A hidden, multi-segment route for approving/rejecting scraped tools and manual uploads.
- **💬 Community Queries**: An anonymous messaging system with public "General Queries" answers.

---

## 📂 Project Structure

```text
core/                    # Complete Next.js app
├── app/                 # Routes + API endpoints
│   ├── page.tsx         # Homepage
│   ├── layout.tsx       # Global layout
│   ├── api/             # Serverless API routes
│   │   ├── admin/       # Admin endpoints
│   │   ├── mystery/     # Mystery box endpoints
│   │   ├── files/       # File endpoints
│   │   └── contact/     # Contact endpoints
│   ├── mystery-box/     # Mystery box page
│   ├── free-tools/      # Free tools directory
│   ├── contact/         # Contact page
│   └── general-queries/ # Public Q&A page
├── components/          # Reusable UI components
├── lib/                 # Business logic + helpers
│   ├── backend_lib/     # Supabase clients
│   ├── services/        # Service layer
│   └── utils/           # Utilities
├── store/               # Zustand state
└── styles/              # Global CSS
```

---

## 🤖 Automated Scraper (Separate Repo)

This project relies on a separate automated web scraper repository. The scraper runs via **GitHub Actions** daily and submits discoveries to the `scraped_tools` table with a `pending` status.

**Scraper logic covers:**
- awesome-selfhosted list
- free-for-dev list
- templatemo.com
- creative-tim.com (free templates)
- GitHub course repositories

Once scraped, items appear in your **Control Room** for manual review.

---

## 🛡️ Admin Control Room

The platform includes a hidden, secure admin panel for platform moderation.
- **Location**: `/control-room/[secret-path]/`
- **Features**:
  - **Scraped Tools**: Accept, Reject, or Edit pending scraped items.
  - **Messages**: View incoming user queries and post public/private replies.
  - **Upload**: Manually upload new files directly to Supabase storage.
- **Security**: Access is protected by the `ADMIN_SECRET` environment variable and URL obfuscation.

---

## ⚙️ Setup Guide

### 1. Prerequisites
- Node.js 18.x or higher
- [Supabase](https://supabase.com/) account
- [Firebase](https://firebase.google.com/) project
- [Vercel](https://vercel.com/) account

### 2. Environment Variables
Copy `.env.example` to `.env.local` and fill in the following:

| Variable | Description |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin key for server-side database access |
| `ADMIN_SECRET` | Master password for the Admin Panel |
| `ADMIN_PANEL_ROUTE_SECRET` | The multi-segment "hidden" path (e.g., `a/b/c/d`) |

### 3. Installation
```bash
cd core
npm install
npm run dev
```

---

## 🤝 Contributing

We welcome contributions! Please follow the patterns in `lib/services`. Test your changes locally before submitting a PR. Keep the designs "Premium & Futuristic"!

---

## 📄 License

This project is licensed under the **MIT License**.
