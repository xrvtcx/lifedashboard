# Rachel's Life Dashboard

Tasks, habits, a weekly command-center, a quarterly big-picture view, and a
side-quest tracker, in one small Next.js app. Built with the App Router,
Drizzle ORM, and Neon Postgres, meant for Vercel and protected by a single
shared password.

## What's inside

- **Week View** (home page, `/`) — the daily-driver tab: a checklist pulled
  from Tasks, an hourly daily schedule, a gym-session toggle, a weekly focus
  with sub-goals, a reflections box, and a snapshot of your active side
  quests. Navigate to previous/next weeks. Checking something off here pops
  confetti with a synthesized "pop" sound (Web Audio API, no audio file).
- **Tasks** — full task list: status, priority, due dates. The Week View
  checklist is just this same data, filtered to the displayed week.
- **Habit Tracker** — a weekly grid (days across the top, habits down the
  side), split into Daily / Devotional sections. Each habit has a custom
  icon, color, and weekly goal (e.g. 5/7 days). An overall completion score
  sits at the top, color-coded summary cards at the bottom, and a "Manage
  habits" modal handles add/edit/reorder/delete.
- **Finance** — the original cash-flow tracker: income/expense transactions,
  Personal vs Business, with a 6-month chart.
- **Notes** — quick notes with pinning.
- **Quarter View** — the big-picture tab: Personal/Business account balances
  (credit cards, savings, etc.), a 13-week gym consistency chart, collapsible
  goal sections by category (Finance/Health/Business/Personal) with progress
  bars, an achievements log, and a parking lot for ideas. Everything (goals,
  achievements) is tagged to a quarter like `2026-Q3`, and you can page
  between quarters to see history stack up.
- **Side Quests** — a filterable list (certifications, exam prep, reading,
  hobbies, etc.) with color-coded category labels, a progress bar, and
  toggle/delete controls. The Week View's "current side quest" panel shows
  whichever of these are marked active.
- A single shared-password gate protecting the whole app.

## A few structural decisions worth knowing about

I built this from your spec directly rather than asking more questions, but
a few things were judgment calls — flagging them so you can redirect me if
you'd rather they work differently:

- **Week View replaced the old Overview as the home page (`/`).** It's the
  tab you said you'll open daily, so it made sense as the default. The old
  aggregated Overview widgets are gone — Week View + Quarter View now cover
  that ground between them.
- **The standalone Goals page is retired**, folded into Quarter View's
  categorized quarterly goals instead (Finance/Health/Business/Personal).
  I kept the old `goals` table in the schema untouched (just unused) so
  `db:push` won't drop anything you may have already entered there — say
  the word if you'd like it cleaned out for real.
- **Confetti + sound is scoped to the Week View** (checklist tasks, gym
  toggle, weekly focus goals) since that's where you asked for it. Happy to
  extend it to Habit Tracker or Side Quest check-offs too if you'd like.
- **Finance now means two things**, on purpose: `/finance` is the existing
  cash-flow tracker (income/expense over time); Quarter View's finance
  section is account *balances* (what you owe/have right now) plus
  quarter-tagged financial goals. They're separate tables.
- **The Parking Lot always shows everything**, regardless of which quarter
  you're viewing — ideas are meant to persist until you act on them, not
  disappear when the quarter rolls over. Achievements, by contrast, are
  filtered to the quarter you're looking at.
- **The gym consistency chart is scoped to the selected quarter's ~13
  weeks** (a calendar quarter is naturally about 13 weeks), so paging
  quarters in Quarter View also pages the chart.
- **The daily schedule shows one day at a time** via tabs (Mon–Sun) with
  hourly rows from 6am–10pm, rather than a full 7×17 grid — easier to
  actually use. Change the `HOURS` array in
  `app/(dashboard)/_week/daily-schedule.tsx` if you want a different range.
- **Habit Tracker always shows the current week** (no back-navigation) since
  weekly goals reset weekly by nature — let me know if you'd like history.

## Stack

Next.js 14 (App Router, Server Actions), Drizzle ORM on
`@neondatabase/serverless`, Tailwind CSS, Recharts, `lucide-react` (habit
icons). No new environment variables were needed for this round.

## Project structure

```
app/
  (dashboard)/
    page.tsx            # Week View (home)
    _week/               # Week View's components + actions (not a route —
                          # the leading underscore opts it out of routing)
    tasks/  habits/  finance/  notes/  quarter/  side-quests/
  login/
db/
  schema.ts              # all tables
lib/
  week.ts, quarter.ts     # date math for week/quarter navigation
  celebrate.ts             # confetti + Web Audio pop sound
  habit-icons.ts, habit-colors.ts
```

## Updating your database

Since this adds a lot of new tables and columns, re-run the push after
pulling these changes:

```bash
npm install        # picks up the new lucide-react dependency
npm run db:push
```

This is additive — new tables and new columns with defaults — so it won't
touch your existing tasks, habits, notes, or transactions. The one
intentionally-unused exception is the legacy `goals` table (see above).

Everything else in the original README (Neon setup, Vercel deploy, the
password gate) is unchanged — see below.

---

## 1. Local setup

```bash
npm install
cp .env.example .env
```

## 2. Create the Neon database

1. [neon.tech](https://neon.tech) → sign up → new project.
2. **Connection Details** → copy the pooled connection string into
   `DATABASE_URL` in `.env`.
3. Set `APP_PASSWORD` (whatever you want to log in with) and `SESSION_SECRET`
   (any long random string, e.g. `openssl rand -hex 32`).

## 3. Push the schema

```bash
npm run db:push
```

Optional sample data: `npm run db:seed`.

## 4. Run it locally

```bash
npm run dev
```

Visit `http://localhost:3000` — you'll hit `/login` first.

## 5. Deploy to Vercel

1. Push to GitHub:
   ```bash
   git init && git add . && git commit -m "Initial commit"
   gh repo create logbook-dashboard --private --source=. --push
   ```
2. [vercel.com/new](https://vercel.com/new) → import the repo (auto-detected
   as Next.js, no config needed).
3. Add `DATABASE_URL`, `APP_PASSWORD`, `SESSION_SECRET` under **Project
   Settings → Environment Variables** before the first deploy.
4. Deploy.

### Vercel CLI alternative

```bash
npm i -g vercel
vercel
vercel env add DATABASE_URL production
vercel env add APP_PASSWORD production
vercel env add SESSION_SECRET production
vercel --prod
```

## Notes on the password gate

One shared password for the whole app (`APP_PASSWORD`), checked via a signed
cookie in `middleware.ts`. Meant for "only I know the URL and password"
personal use, not real multi-user auth. NextAuth.js would be the natural
upgrade path if you ever want individual accounts.

## Possible extensions

- Bank sync (e.g. Plaid) instead of manual balance entry
- Recurring tasks/habits
- Drag-and-drop habit reordering instead of up/down buttons
- Weekly email digest
- Multi-user accounts

None of these are built in — happy to add any of them next.
