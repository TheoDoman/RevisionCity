# Revision City 🎓

The ultimate IGCSE revision platform with AI-powered notes, flashcards, quizzes, and more — all aligned to the Cambridge syllabus.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL)
- **Payments:** Stripe
- **AI Content:** Claude Haiku
- **Hosting:** Vercel

## Features

### Revision Methods (7 total)
1. **Notes** - Structured revision notes per subtopic
2. **Flashcards** - Spaced repetition cards
3. **Quizzes** - Multiple choice, fill-in-the-blank, true/false
4. **Practice Questions** - Exam-style with mark schemes
5. **Active Recall** - Open-ended explanation prompts
6. **Mind Maps** - Visual topic overviews
7. **Summary Sheets** - Quick reference one-pagers

### Subjects (11 for v1)
Mathematics, English, Biology, Chemistry, Physics, French, Spanish, Business, Economics, History, Geography

### Subscription Tiers
- **Free Trial** - 1 day, limited access
- **Pro** - £4.99/month, full access
- **Premium** - £8.99/month, full access + AI tutor

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Stripe account
- Anthropic API key (for content generation)

### 1. Clone and Install

```bash
git clone <your-repo>
cd revision-city
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema from `supabase/schema.sql`
3. Copy your project URL and keys from Settings > API

### 3. Set Up Stripe

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Create two products in the Stripe Dashboard:
   - Pro: £4.99/month
   - Premium: £8.99/month
3. Copy the price IDs

### 4. Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PRO_PRICE_ID=price_xxx
STRIPE_PREMIUM_PRICE_ID=price_xxx

ANTHROPIC_API_KEY=sk-ant-xxx

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Seed the Database

Option A - Quick start with placeholder content (no API key needed):
```bash
npm run db:seed
```

Option B - Generate AI content (requires Anthropic API key):
```bash
npm run content:generate
```

The seed script creates the full structure with placeholder content. The generate script replaces it with AI-generated content (estimated cost: £5-15).

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment to Vercel

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add all environment variables in Vercel dashboard
4. Deploy!

## Project Structure

```
revision-city/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── page.tsx           # Homepage
│   │   ├── subjects/          # Subject listing
│   │   ├── subject/[slug]/    # Subject detail
│   │   │   └── [topic]/       # Topic with revision methods
│   │   └── pricing/           # Pricing page
│   ├── components/
│   │   ├── layout/            # Header, Footer, etc.
│   │   ├── ui/                # Reusable UI components
│   │   └── revision/          # Revision method components
│   ├── lib/
│   │   ├── supabase.ts        # Database client
│   │   ├── store.ts           # Zustand state management
│   │   └── utils.ts           # Utility functions
│   └── types/
│       └── index.ts           # TypeScript types
├── scripts/
│   └── generate-content.ts    # AI content generation
├── supabase/
│   └── schema.sql             # Database schema
└── public/                    # Static assets
```

## Next Steps (Post-MVP)

- [ ] Implement Stripe payment flow
- [ ] Add authentication with Supabase Auth
- [ ] Build flashcard spaced repetition algorithm
- [ ] Create interactive mind map component
- [ ] Add AI tutor chat (Premium feature)
- [ ] Progress tracking and analytics
- [ ] Expand to Edexcel exam board

## License

MIT
