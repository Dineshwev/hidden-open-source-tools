# The Cloud Rain

**The Cloud Rain** is a curated museum of hidden open-source tools: lightweight, practical alternatives to expensive SaaS platforms. It helps developers, indie hackers, students, self-hosters, and curious builders discover useful tools that are often buried under hype, noisy rankings, or enterprise marketing.

## What is The Cloud Rain?

The Cloud Rain is a discovery-first platform built to surface high-quality open-source software that deserves more attention. Instead of acting like a generic software catalog, it focuses on handpicked tools, context-rich writeups, and a browsing experience that helps people uncover genuinely useful products across categories like developer tools, self-hosting, productivity, AI, and infrastructure.

It is designed for builders who want more control, lower costs, and better transparency than closed SaaS products usually offer. Whether someone is replacing a paid workflow, exploring self-hosted options, or simply looking for underrated tools, The Cloud Rain gives them a more curated path than a search engine or a crowded marketplace.

What makes it different is the editorial layer. Unlike AlternativeTo, it is not just a broad alternatives database. Unlike GitHub, it is not a raw code-hosting platform that assumes users already know what to search for. Unlike Product Hunt, it is not driven by launch-day momentum. The Cloud Rain is built as a long-term museum of hidden open-source gems, with curation, storytelling, and discovery at the center.

## Live Site

[https://thecloudrain.org](https://thecloudrain.org)

## Features

- 300+ curated open-source tools with dedicated pages
- 25+ deep-dive articles in the Article Museum
- GitHub stars, forks, and primary language pulled live from the GitHub API
- Category filters for exploring tools by focus area, including Developer Tools and Self-Hosting
- Mystery Box for random tool discovery
- Weekly Roundups to spotlight new tools and trends
- AI-generated tool descriptions powered by Groq
- Admin panel with a moderation workflow for reviewing and managing content

## Tech Stack

- Next.js 14 App Router + TypeScript
- Tailwind CSS + Framer Motion
- Supabase (PostgreSQL)
- Firebase Auth
- Vercel deployment

## Local Development

1. Clone the repository:

   ```bash
   git clone https://github.com/Dineshwev/hidden-open-source-tools.git
   ```

2. Move into the app directory:

   ```bash
   cd hidden-open-source-tools
   cd core
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Copy the environment template and add your local values:

   ```bash
   cp .env.example .env.local
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

The app will start locally with the Next.js development server from the `core/` directory.

## Environment Variables

The following variables are used for local development and production deployment. Do not commit real secrets to the repository.

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Public Supabase project URL used by the app and server helpers. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public Supabase anon key used for client-side access where needed. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side Supabase service role key used for admin workflows, moderation, and data sync scripts. |
| `SUPABASE_STORAGE_BUCKET` | Name of the Supabase storage bucket used for uploaded assets. |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase web API key for client-side authentication setup. |
| `FIREBASE_PROJECT_ID` | Firebase project identifier. In this repo, set this as `NEXT_PUBLIC_FIREBASE_PROJECT_ID` in `.env.local`. |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain for sign-in flows. |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket identifier for client configuration. |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID for client configuration. |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID for the web application. |
| `FIREBASE_CLIENT_EMAIL` | Firebase Admin service account client email for server-side verification. |
| `FIREBASE_PRIVATE_KEY` | Firebase Admin private key for server-side authentication and secure API operations. |
| `GITHUB_TOKEN` | GitHub token used to fetch repository metadata such as stars, forks, and language. |
| `GROQ_API_KEY` | Groq API key used for AI-generated tool descriptions and content workflows. |
| `ADMIN_SECRET` | Secret used to protect admin authentication and moderation routes. |
| `ADMIN_PANEL_ROUTE_SECRET` | Hidden multi-segment admin route used to obscure the control room path. |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL used for metadata, SEO, and absolute links. |

## Contributing

Contributions are welcome from developers, writers, researchers, and open-source enthusiasts.

- **Tools**: Submit hidden or underrated open-source tools that deserve visibility, especially practical alternatives to paid SaaS products.
- **Articles**: Contribute deep-dive content, comparisons, roundups, or explainers that help readers understand when and why to use a tool.
- **Code**: Improve the platform experience, fix bugs, refine discovery flows, or strengthen the moderation and content systems.

If you want to contribute, fork the repo, create a focused branch, make your changes, and open a pull request with a clear description. For additional workflow guidance, see [CONTRIBUTING.md](./CONTRIBUTING.md).

## Stats

- 477 pages indexed by Google
- 2,000+ monthly impressions and growing
- Built by one person: Dinesh Regar, B.Tech ECE student

## Support This Project

The Cloud Rain is built and maintained by a single B.Tech ECE student with no external funding.

If this project has helped you discover useful tools, saved you time, or introduced you to open-source software you now use, consider supporting it.

Your support helps cover:

- Domain and infrastructure costs
- Time spent curating, writing, and maintaining 300+ tool pages and 25+ deep-dive articles
- Continued development of new features

[![GitHub Sponsors](https://img.shields.io/github/sponsors/Dineshwev?style=social)](https://github.com/sponsors/Dineshwev)

Even a one-time contribution makes a difference.

## License

This project is licensed under the [MIT License](./LICENSE).
