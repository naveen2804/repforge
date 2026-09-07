# RepForge

A workout-planning and tracking PWA. Static frontend on GitHub Pages, data in Supabase,
installable to the home screen on Android and iOS.

**Live:** https://naveen2804.github.io/repforge/

## What it does

- **876 exercises** from [free-exercise-db](https://github.com/yuhonas/free-exercise-db)
  (public domain), each with demo photos, step-by-step instructions, primary/secondary
  muscles, equipment and a YouTube link.
- **Browse by body part** (chest, back, shoulders, biceps, triceps, forearms, core,
  quads, hamstrings, glutes, calves), **by equipment**, and by compound/isolation.
- **14 ready-made plans** chosen by situation rather than muscle group — your first week
  in a gym, coming back after months off, twenty minutes to spare, a hotel room with no
  kit, a back or a knee that is complaining, or a day where you feel rough and just want
  to move. Each explains who it is for and how to run it, and pre-fills the sets and reps.
- **Nine built-in splits** — Push, Pull, Legs, Upper, Lower, Full Body, Core, Arms,
  Cardio — each editable before you start, plus your own saved templates.
- **Workout logger** with reps/weight or duration, RPE, a rest timer, set-by-set ticking,
  inline reordering, and a reminder of what you lifted last time.
- **History and progress** — session log, weekly volume, day streak, body-part split,
  per-exercise charts and personal records.
- **A guided tour on first run** that walks through each screen, plus a ⓘ next to any bit
  of jargon and a full glossary.
- **Accounts** — username and password, one private data set per person.
- Light/dark theme (light by default), kg/lb, JSON and CSV export.

## Setup

### 1. Supabase — one-time, two manual steps

Both are in the [Supabase dashboard](https://supabase.com/dashboard) for the project.

**a. Create the schema.** Open **SQL Editor → New query**, paste all of
[`supabase/schema.sql`](supabase/schema.sql), and run it. It creates the tables, indexes,
row-level-security policies and the sign-up trigger.

**b. Turn off e-mail confirmation.** Go to **Authentication → Sign In / Providers →
Email** and switch **Confirm email** off, then save.

RepForge signs people in with a plain username, which it maps onto a synthetic address in
the `.invalid` domain — reserved by RFC 2606, so it can never reach a real inbox. With
confirmation left on, Supabase would try to mail that address and sign-up would fail.

### 2. Deploy

Push to `main`. The [workflow](.github/workflows/deploy.yml) builds and publishes to
GitHub Pages. In **Settings → Pages**, set **Source** to **GitHub Actions** once.

### 3. Create accounts

Open the site and use **Create account**. Passwords are at least 8 characters. There is
no e-mail on file, so **there is no password reset** — if a password is lost, the account
has to be recreated from the Supabase dashboard. Settings → Export is the backup.

## Local development

```bash
npm install
cp .env.example .env      # then fill in your Supabase URL and anon key
npm run dev
```

`npm run build` produces `dist/`. `npm run typecheck` runs the TypeScript project build.

### Regenerating the exercise data

`public/exercises.json` and `public/ex/**` are committed, so neither CI nor a fresh clone
needs to rebuild them. To refresh from upstream:

```bash
npm run data                          # clones free-exercise-db into a temp dir
npm run data -- /path/to/checkout      # or point at an existing checkout
node scripts/generate-icons.mjs        # app icons, if the mark ever changes
```

The script slims the catalogue, re-tags muscles onto the app's body-part filters, and
re-encodes the 1,746 demo photos to 420px WebP — 101 MB of JPEG becomes about 20 MB.

## How it is put together

| Layer | Choice |
|---|---|
| Frontend | Vite + React 19 + TypeScript, plain CSS with custom properties |
| Routing | `HashRouter` — GitHub Pages serves static files only and would 404 on deep links |
| PWA | `vite-plugin-pwa`; app shell and catalogue precached, exercise photos cached lazily |
| Data | Supabase Postgres via PostgREST, row level security scoped to `auth.uid()` |
| Hosting | GitHub Pages via Actions |

A few decisions worth knowing about:

- **The workout in progress lives in `localStorage`, not Supabase.** Set entry stays
  instant and works with no signal; the whole session is written in one transaction-ish
  batch when you tap Finish.
- **Weights are always stored in kg.** The kg/lb setting only affects display, so
  switching units never rewrites history.
- **Stats are computed client-side** from the sets you have logged — no aggregate tables
  to keep in step. Personal records, streaks and charts are all derived on the fly.
- **The exercise catalogue is static**, bundled with the app rather than stored in
  Supabase: it is read-only, rarely changes, and this way it works offline.
- **Body parts and splits are drawn, not emoji.** `BodyMap` renders a figure with the
  worked muscles highlighted, because there is no honest emoji for "back" or
  "hamstrings" — and the same component previews a whole split by lighting up several
  muscles at once.
- **Training guidance is general fitness information, not medical advice**, and the plans
  that touch on illness or joint pain say so on the plan itself.

## Security

Every table has row level security enabled with a policy of `user_id = auth.uid()`, so
each account can only read and write its own rows. The Supabase anon key is embedded in
the build — that is how Supabase is designed to work on a static site, and it grants
nothing on its own without valid credentials.

## Credits

Exercise data and photos: [free-exercise-db](https://github.com/yuhonas/free-exercise-db),
public domain.
