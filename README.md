# Diet Tracker API

A calorie/macro tracking REST API with multi-user accounts, manual food entry, and TDEE-based goal calculation. Built for the [Diet Tracker App](https://github.com) frontend.

## Tech Stack

| Layer | Choice |
|---|---|
| Runtime | Node.js |
| Framework | Express 5 |
| Query Builder | Knex.js |
| Database | PostgreSQL (Neon) |
| Auth | bcrypt + JWT |

## Quick Start

```bash
# 1. Clone and install
git clone <repo-url>
cd diet-tracker-api
npm install

# 2. Configure environment
cp .env.example .env
# Fill in DATABASE_URL (Neon) and JWT_SECRET

# 3. Run migrations
npm run migrate:latest

# 4. Start dev server
npm run dev
```

Hit `GET http://localhost:3000/health` — should return `{ "status": "ok", "database": "connected" }`.

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `JWT_SECRET` | Secret key for JWT signing (64+ hex chars) |
| `PORT` | Server port (default: `3000`) |

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with hot reload (`tsx watch`) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Start compiled server |
| `npm run migrate:latest` | Run pending migrations |
| `npm run migrate:rollback` | Rollback last batch |
| `npm run migrate:make` | Create a new migration file |

## API Endpoints

### Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | No | Create account (`username`, `password`) → JWT |
| `POST` | `/api/auth/login` | No | Login (`username`, `password`) → JWT |

### Food Entries

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/entries?date=YYYY-MM-DD` | Bearer | List entries for a date |
| `POST` | `/api/entries` | Bearer | Create entry |
| `PUT` | `/api/entries/:id` | Bearer | Edit own entry |
| `DELETE` | `/api/entries/:id` | Bearer | Delete own entry |

**Entry fields:** `date`, `time`, `meal_type` (breakfast/lunch/dinner/snack), `name`, `weight_g`, `calories_per_100g`, `protein_per_100g`, `carbs_per_100g`, `fat_per_100g`

Generated columns (`calories`, `protein`, `carbs`, `fat`) are computed server-side — never sent in request body.

### Goals

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/goals` | Bearer | Get daily targets |
| `PUT` | `/api/goals` | Bearer | Manual override (upserts) |

### Profile & TDEE

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/profile` | Bearer | Fetch saved profile |
| `POST` | `/api/profile` | Bearer | Save profile → calculate TDEE → upsert goals |

**Profile fields:** `age`, `sex` (male/female), `height_cm`, `weight_kg`, `activity_level` (sedentary/light/moderate/active/very_active), `goal_type` (cut/maintain/bulk)

TDEE is calculated using the **Mifflin-St Jeor** formula. Macros: protein = 1.6g/kg, fat = 25% of calories, carbs = remainder.

### Presets

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/presets` | Bearer | List saved quick-add foods |
| `POST` | `/api/presets` | Bearer | Save new preset (`name`, per-100g values) |

### Health

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | No | Health check (tests DB connection) |

## Auth

All protected endpoints require `Authorization: Bearer <token>`. Tokens expire after 1 year. Every failure path (missing, malformed, altered, or expired token) returns `401` with a JSON `{ "error": "..." }` body.

Register accounts manually via `POST /api/auth/register` — there is no signup UI.

## Database

**Engine:** PostgreSQL via Neon (free tier)

**Tables:**

| Table | Purpose |
|---|---|
| `users` | Accounts (username, password_hash) |
| `food_entries` | Food logs with generated macro columns |
| `user_goals` | Daily calorie/macro targets (one row per user) |
| `user_profile` | TDEE calculator inputs (one row per user) |
| `food_presets` | Saved quick-add foods |

All owner tables have `user_id` foreign keys with `ON DELETE CASCADE`. The `food_entries` table has PostgreSQL generated columns for `calories`, `protein`, `carbs`, and `fat` computed as `weight_g / 100 * COALESCE(per_100g_value, 0)`.

## Date Handling

- All dates use strict `YYYY-MM-DD` format (local browser time, never UTC-derived)
- The server overrides node-postgres's `DATE` parser to return raw strings, preventing off-by-one bugs
- `time` is stored as plain `TIME` with no timezone

## Project Structure

```
src/
  server.ts                  # Express app entry
  db.ts                      # Knex instance + pg type parser
  lib/
    calculateGoals.ts        # Mifflin-St Jeor TDEE calculator
  middleware/
    requireAuth.ts           # JWT verification middleware
  routes/
    auth.ts                  # Register + login
    entries.ts               # Food entry CRUD
    goals.ts                 # Goal targets
    profile.ts               # Profile + TDEE
    presets.ts               # Quick-add presets
  types/
    express.d.ts             # Request type extension
migrations/                  # Knex migration files
knexfile.js                  # Knex config (dev/prod)
```

## License

ISC
