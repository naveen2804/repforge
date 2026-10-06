# RepForge

A workout-planning and tracking PWA. Static frontend on GitHub Pages, accounts and data in Firebase,
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
- **Accounts** — username and password, one private data set per person, or a guest
  mode that keeps workouts on one device until they are saved to an account.
- Light/dark theme (light by default), kg/lb, JSON and CSV export.

## Setup

### 1. Firebase — one-time setup

In the [Firebase console](https://console.firebase.google.com/) for the project:

- **Authentication → Sign-in method:** enable **Email/Password** and **Anonymous**.
- **Firestore Database:** create it in production mode.
- **Project settings → Your apps:** register a web app and copy its config into
  `.env.production` (see `.env.example`).
- Publish [`firestore.rules`](firestore.rules) — paste it into **Firestore → Rules**, or run
  `node scripts/migrate-from-supabase.mjs <service-account.json> --rules-only`.

RepForge signs people in with a plain username, which it maps onto a synthetic address in
the `.invalid` domain — reserved by RFC 2606, so it can never reach a real inbox. Firebase
allows one account per address, which is also what keeps usernames unique.

### 2. Deploy

Push to `main`. The [workflow](.github/workflows/deploy.yml) builds and publishes to
GitHub Pages. In **Settings → Pages**, set **Source** to **GitHub Actions** once.

### 3. Create accounts

Open the site and use **Create account**. Passwords are at least 8 characters. There is
no e-mail on file, so **there is no password reset** — if a password is lost, the account
has to be recreated from the Firebase console. **Continue as guest** skips the
username entirely; a guest can save their account from Settings later. Settings → Export is the backup.

## Local development

```bash
npm install
cp .env.example .env      # then fill in your Firebase web config
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
| Data | Firebase Auth + Cloud Firestore (lite SDK), security rules scoped to `request.auth.uid` |
| Hosting | GitHub Pages via Actions |

A few decisions worth knowing about:

- **The workout in progress lives in `localStorage`, not Firestore.** Set entry stays
  instant and works with no signal; the whole session is written as one document when
  you tap Finish.
- **One Firestore document per workout**, with its exercises and sets nested inside, so
  loading history costs one read per workout — well inside the free tier's 50k reads/day.
- **Weights are always stored in kg.** The kg/lb setting only affects display, so
  switching units never rewrites history.
- **Stats are computed client-side** from the sets you have logged — no aggregate tables
  to keep in step. Personal records, streaks and charts are all derived on the fly.
- **The exercise catalogue is static**, bundled with the app rather than stored in
  Firestore: it is read-only, rarely changes, and this way it works offline.
- **Body parts and splits are drawn, not emoji.** `BodyMap` renders a figure with the
  worked muscles highlighted, because there is no honest emoji for "back" or
  "hamstrings" — and the same component previews a whole split by lighting up several
  muscles at once.
- **Training guidance is general fitness information, not medical advice**, and the plans
  that touch on illness or joint pain say so on the plan itself.

## Security

Everything a user owns lives under `users/{uid}`, and [`firestore.rules`](firestore.rules)
lets a signed-in user read and write that subtree and nothing else. Guests get a uid too,
so the same rule covers them. The Firebase web config is embedded in the build — that is
how Firebase is designed to work on a static site, and it grants nothing on its own.

The project moved from Supabase in October 2026, because the free tier pauses after a
week of inactivity. Accounts kept their uids and bcrypt password hashes
([`scripts/migrate-from-supabase.mjs`](scripts/migrate-from-supabase.mjs)).

## Credits

Exercise data and photos: [free-exercise-db](https://github.com/yuhonas/free-exercise-db),
public domain.
