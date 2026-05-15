# Weekly Roundup Content Generation - Setup Guide

This guide covers the new `npm run weekly-content` script that auto-generates weekly roundup content for The Cloud Rain.

## What Was Added

### Files Created
1. **`scripts/generate-weekly-content.ts`** — Main generation script
2. **`database/create_weekly_roundups_table.sql`** — Supabase table migration
3. **`app/weekly-roundups/[slug]/page.tsx`** — Dynamic roundup display page

### Files Updated
1. **`package.json`** — Added `"weekly-content": "tsx scripts/generate-weekly-content.ts"`
2. **`app/weekly-roundups/page.tsx`** — Now fetches roundups from database instead of hardcoded items

## Setup Steps

### Step 1: Create the Supabase Table

Execute this SQL in your Supabase SQL Editor:

```bash
# Copy and run the SQL from:
database/create_weekly_roundups_table.sql
```

This creates:
- `weekly_roundups` table with proper schema
- Indexes for performance
- Auto-update trigger for `updated_at` timestamp

### Step 2: Optional - Set Up News API (Recommended)

To include trending tech news in your roundups:

1. Sign up at [newsapi.org](https://newsapi.org) (free tier: 100 requests/day)
2. Get your API key
3. Add to `.env.local`:
   ```
   NEWS_API_KEY=your_api_key_here
   ```

Without this, the script will skip news summaries but still work fine.

### Step 3: Run the Script

```bash
# Generate this week's roundup content
npm run weekly-content
```

The script will:
- ✅ Fetch 5 approved tools from your database
- ✅ Generate compelling summaries using Groq API
- ✅ Select 2-3 tools from same category for comparison
- ✅ Summarize trending tech news (if NEWS_API_KEY is set)
- ✅ Save everything to `weekly_roundups` table with status=`draft`

**Output Example:**
```
🚀 Generating weekly roundup content...
🤖 Using Groq model: llama-3.1-8b-instant
✅ Groq model is available.

📅 Generating roundup for week of: May 15, 2026

📝 Fetching featured tools...
✅ Got 5 featured tools

✍️ Generating summaries for featured tools...
⏳ Summarizing: Tool Name (1/5)
✅ Summarized: Tool Name
...

🎉 Weekly content generation complete!
📊 Summary:
   - Featured tools: 5
   - Comparison tools: 3
   - News items: 3
```

### Step 4: Publish the Roundup

After reviewing the generated content in Supabase, publish it:

```sql
UPDATE weekly_roundups 
SET status = 'published' 
WHERE slug = 'weekly-roundup-2026-05-15';
```

Once published:
- ✅ Appears on `/weekly-roundups` main page
- ✅ Accessible at `/weekly-roundups/weekly-roundup-2026-05-15`
- ✅ Shows in listing with tool previews

## Generated Roundup Structure

Each roundup contains:

### 1. Featured Tools (5)
- Tool name, category, stars
- Engaging 1-2 sentence summary
- Link to tool

### 2. Comparison Table
- 2-3 tools from same category
- Comparison: stars, language, license
- Brief comparison paragraph

### 3. Tech News (3-5 items)
- News headline
- Developer-focused summary
- Source attribution

## Database Schema

```sql
weekly_roundups {
  id UUID PRIMARY KEY
  title TEXT -- e.g. "Weekly Roundup - May 15, 2026"
  slug TEXT -- e.g. "weekly-roundup-2026-05-15"
  week_date DATE -- Start date of the week
  featured_tools JSONB -- Array of 5 tools with summaries
  comparison_table JSONB -- Category + 2-3 tool comparison
  news_summaries JSONB -- Array of news items
  status TEXT -- 'draft' or 'published'
  created_at TIMESTAMP
  updated_at TIMESTAMP
}
```

### Sample Featured Tool Object
```json
{
  "name": "Docker",
  "slug": "docker",
  "category": "Containerization",
  "github_stars": 75000,
  "summary": "Docker containers enable reliable, reproducible deployments across dev, staging, and production with minimal overhead.",
  "url": "https://docker.com"
}
```

### Sample Comparison Data
```json
{
  "category": "Containerization",
  "tools": [
    {
      "name": "Docker",
      "stars": 75000,
      "language": "Go",
      "license": "Apache 2.0",
      "url": "https://docker.com"
    }
  ]
}
```

## API Integration Details

### Groq API
- **Model**: `llama-3.1-8b-instant` (configurable)
- **Used for**: Tool summaries, comparisons, news summaries
- **Rate limiting**: Configurable delay (default 5.5s)
- **Retry logic**: 3 attempts with exponential backoff

### News API
- **Service**: newsapi.org
- **Endpoints**: `/v2/everything` for trending tech news
- **Keywords**: open source, developer tools, self-hosting, AI, productivity
- **Fallback**: Script continues if NEWS_API_KEY not set

### Supabase
- **Uses**: Service Role Key (from `SUPABASE_SERVICE_ROLE_KEY`)
- **Operations**: Read from `open_source_tools`, write to `weekly_roundups`
- **Performance**: Indexed queries for fast lookups

## Environment Variables Required

**Essential** (existing):
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GROQ_API_KEY`
- `GROQ_MODEL` (optional, defaults to `llama-3.1-8b-instant`)

**Optional** (for news):
- `NEWS_API_KEY` — From newsapi.org
- `GROQ_DELAY_MS` — Override rate limit delay (default: 5500ms)

## Troubleshooting

### Script fails with "No approved tools found"
**Fix**: Ensure you have at least 5 approved tools in your `open_source_tools` table with `status = 'approved'`

### News summaries are skipped
**Expected**: If `NEWS_API_KEY` is not set. Set it to enable news summaries.

### Rate limit errors from Groq
**Fix**: The script automatically retries with backoff. Increase `GROQ_DELAY_MS` if rate limiting persists:
```bash
GROQ_DELAY_MS=8000 npm run weekly-content
```

### Roundup doesn't show on website
**Check**:
1. SQL migration was run successfully
2. Roundup `status` is set to `'published'` (not `'draft'`)
3. `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set (for frontend reads)

## Automating Weekly Generation

To run this automatically every Thursday:

### Option 1: GitHub Actions
```yaml
# .github/workflows/weekly-roundup.yml
name: Generate Weekly Roundup
on:
  schedule:
    - cron: '0 9 * * 4'  # Every Thursday at 9 AM UTC

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run weekly-content
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_KEY }}
          GROQ_API_KEY: ${{ secrets.GROQ_KEY }}
          NEWS_API_KEY: ${{ secrets.NEWS_API_KEY }}
```

### Option 2: Vercel Cron (if deployed on Vercel)
Create an API route that calls the script via a scheduled function.

## Code Style Notes

The script follows patterns from `generate-tool-content.ts`:
- Similar error handling and retry logic
- Rate limiting with configurable delays
- Structured interfaces for type safety
- Console logging with emoji indicators
- Environment variable validation at startup

## Next Steps

1. ✅ Run the SQL migration to create `weekly_roundups` table
2. ✅ (Optional) Get a free NEWS_API_KEY and add to `.env.local`
3. ✅ Run `npm run weekly-content` to generate first roundup
4. ✅ Review content in Supabase
5. ✅ Update status to `published` to make it visible
6. ✅ (Optional) Set up GitHub Actions for weekly automation

The roundup will now appear on:
- **Main page**: `/weekly-roundups`
- **Individual page**: `/weekly-roundups/weekly-roundup-2026-05-15`
