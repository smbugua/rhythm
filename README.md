# Luna - Period Tracker

A simple, privacy-focused period tracking web app built with Next.js 14 and Supabase.

## Features

- Google OAuth authentication
- Calendar view with period tracking
- Mark period start/end dates
- Add notes (symptoms, mood, etc.)
- Cycle statistics:
  - Average cycle length (last 3 cycles)
  - Average period duration
  - Predicted next period date
  - **Fertile window & ovulation prediction** (based on [Stanford Children's Health guidelines](https://www.stanfordchildrens.org/en/topic/default?id=ovulation-date-calculator-41-OvulationCalc))
- Fertility tracking:
  - Green-highlighted fertile window on calendar (5 days before ovulation + ovulation day)
  - Ovulation day indicator with special border
  - Click on fertile days to see "High likelihood of pregnancy" popup
  - Dedicated green Fertile Window card in stats panel
- Personalized dashboard:
  - Time-based greeting with user's name
  - Cycle phase indicator (menstrual, follicular, ovulation, luteal)
  - Daily insights showing cycle day and days until next period
  - Phase-specific health tips and recommendations
- Mood & symptom tracking:
  - Quick mood selector (5-point scale with emojis)
  - Energy level tracking
  - Symptom tags (cramps, headache, bloating, etc.)
  - 7-day and 30-day trend analysis
  - Visual mood chart
  - Top symptoms summary
- Mobile-responsive design

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Google OAuth)
- **Deployment**: Vercel

## Setup

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd luna
npm install
```

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)

2. Run the database schema in the SQL Editor:
   - Go to SQL Editor in your Supabase dashboard
   - Copy the contents of `supabase/schema.sql`
   - Run the query

3. Configure Google OAuth:
   - Go to Authentication > Providers > Google
   - Enable Google provider
   - Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Add the Client ID and Client Secret to Supabase
   - Add your app URL to authorized redirect URIs: `https://your-project.supabase.co/auth/v1/callback`

4. Get your API keys:
   - Go to Settings > API
   - Copy the Project URL and anon/public key

### 3. Environment Variables

Create a `.env.local` file:

```bash
cp .env.example .env.local
```

Fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment to Vercel

1. Push your code to GitHub

2. Import project in [Vercel](https://vercel.com/new)

3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. Deploy

5. Update Supabase OAuth settings:
   - Add your Vercel URL to Site URL in Authentication > URL Configuration
   - Add `https://your-app.vercel.app/auth/callback` to Redirect URLs

## Database Schema

### Tables

**profiles**
- `user_id` (uuid, primary key)
- `email` (text)
- `created_at` (timestamp)

**cycle_entries**
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key)
- `entry_date` (date)
- `entry_type` ('period_start' | 'period_end')
- `notes` (text, nullable)
- `created_at` (timestamp)

## Project Structure

```
/src
  /app
    /auth          # Login page
    /dashboard     # Main app (protected)
    layout.tsx     # Root layout
    page.tsx       # Redirect handler
  /components
    Calendar.tsx   # Calendar view
    StatsPanel.tsx # Statistics cards
    EntryModal.tsx # Date entry dialog
    Header.tsx     # Navigation header
    /ui            # shadcn/ui components
  /lib
    supabase.ts        # Browser client
    supabase-server.ts # Server client
    cycle-utils.ts     # Cycle calculations
    utils.ts           # Utilities
  middleware.ts        # Auth protection
/supabase
  schema.sql           # Database schema
```

## License

MIT
