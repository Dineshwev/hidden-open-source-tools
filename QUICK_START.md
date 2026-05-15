# 🚀 Quick Start - Weekly Roundup System

## In 3 Steps

### Step 1: SQL Migration (1 minute)
Run this SQL in your Supabase SQL Editor:
```sql
-- Copy and paste from: database/create_weekly_roundups_table.sql
```

### Step 2: Get News API Key (Optional, 2 minutes)
```bash
# Visit https://newsapi.org (free tier available)
# Add to .env.local:
NEWS_API_KEY=your_key_here
```

### Step 3: Generate Roundup (3 minutes)
```bash
npm run weekly-content
```

---

## What Gets Created

A new roundup in your Supabase `weekly_roundups` table with:
- ✅ 5 featured tools with AI summaries
- ✅ 2-3 tool comparison
- ✅ 3-5 trending tech news items (if NEWS_API_KEY set)

**Status**: `draft` (review before publishing)

---

## Publish It

```sql
UPDATE weekly_roundups 
SET status = 'published' 
WHERE week_date = '2026-05-15';
```

Then visit: `https://thecloudrain.org/weekly-roundups`

✨ Done! Your roundup is live.

---

## Full Docs

- **Setup Guide**: `WEEKLY_ROUNDUP_SETUP.md`
- **Implementation**: `IMPLEMENTATION_CHECKLIST.md`
- **Reference**: `WEEKLY_ROUNDUP_README.md`

---

## Commands

```bash
# Generate this week's roundup
npm run weekly-content

# With custom rate limiting (if hitting limits)
GROQ_DELAY_MS=8000 npm run weekly-content

# With custom Groq model
GROQ_MODEL=llama-3.1-70b-versatile npm run weekly-content
```

---

## URL Formats

Once published:
- **List**: `/weekly-roundups`
- **Individual**: `/weekly-roundups/weekly-roundup-2026-05-15`

---

## Troubleshooting

**News items missing?** → Set `NEWS_API_KEY` (optional)

**Script fails?** → Check Groq/Supabase env vars are set

**Roundup not showing?** → Make sure `status = 'published'` in DB

---

That's it! 🎉
