# LBS Trading Dashboard

Backtest journal, live trade tracker, and AI-powered analytics for the LBS strategy (MNQ / MGC).

## Stack
- **Backend:** Spring Boot 3.1.4 (Java 17, Maven)
- **Frontend:** React 18 + TypeScript (Vite)
- **Analytics:** Python FastAPI (GARCH regime detection + Claude insights)
- **Database:** PostgreSQL 16
- **Orchestration:** Docker Compose

## Local Setup

1. Copy `.env.example` to `.env` and fill in values (DB creds, Anthropic API key).
2. Run everything:
   ```bash
   docker-compose up
   ```
3. Access:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080/api/health
   - Analytics API: http://localhost:8000/health

## Running Backend Without Docker (dev mode)

```bash
cd backend
mvn spring-boot:run
```

> Note: if your machine sits behind a corporate Maven mirror that doesn't proxy
> Maven Central fully, use the bundled override settings:
> ```bash
> mvn -s settings-local.xml spring-boot:run
> ```
> `settings-local.xml` forces direct resolution against Maven Central and is
> only needed on restricted corporate networks.

## Data Persistence

Postgres data lives in the `postgres_data` Docker volume. It survives
`docker-compose stop/start` and `docker-compose down`. It is **deleted** by
`docker-compose down -v` — avoid that unless you intend to wipe data.

To move data between machines, use the in-app **Settings > Backup & Restore**
page (creates a plain SQL dump under `data/backups/`, downloadable and
re-uploadable), or manually via `pg_dump` / `psql`.

> Note: running the backend outside Docker requires `postgresql-client`
> (`pg_dump` / `psql`) installed locally for the backup feature to work.

## Feature Overview

- **Backtest Journal** — import FX Replay CSV exports, auto-classifies
  session window from timestamp, manual enrichment (signature, IB type,
  VWAP side, 5min MS direction, S/R zones, classic level, grade, notes,
  screenshot).
- **Live Trade Tracker** — manual trade entry with the same enrichment
  fields, live equity curve / PnL calendar / metrics.
- **Analytics** — win rate, profit factor, expectancy, Sharpe ratio, max
  drawdown, equity curve, PnL calendar, breakdowns by session window /
  signature / regime.
- **AI Insights** — select trades, ask Claude (Opus, with Sonnet fallback)
  a question or run a general review; optionally attach a trade chart
  screenshot for visual analysis.
- **Regime Classification** — GARCH(1,1) based volatility + trend
  classification (`trending_high_vol`, `trending_low_vol`,
  `ranging_high_vol`, `ranging_low_vol`) tagged per trade.
- **Backup & Restore** — one-click SQL dump/restore for moving data
  between machines.

## API Reference (Backend)

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/backtest/import` | POST | Import FX Replay CSV |
| `/api/trades` | GET | List trades (filterable) |
| `/api/trades/{id}` | GET/PATCH/DELETE | Single trade / enrich / delete |
| `/api/trades/{id}/image` | POST/GET | Upload / fetch trade screenshot |
| `/api/live` | GET/POST | List / log live trades |
| `/api/live/{id}` | PUT/DELETE | Update / delete live trade |
| `/api/metrics` | GET | Computed performance metrics |
| `/api/regime/classify` | POST | Classify regime (ad hoc) |
| `/api/regime/classify/{tradeId}` | POST | Classify + persist onto trade |
| `/api/ai/insight` | POST | Claude analysis of selected trades |
| `/api/backup` | GET/POST | List / create backups |
| `/api/backup/{file}/download` | GET | Download a backup |
| `/api/backup/restore` | POST | Restore from uploaded SQL file |

## Project Structure

```
backend/     Spring Boot REST API + JPA + Flyway migrations
frontend/    React dashboard (backtest journal, live tracker, analytics, AI insights)
analytics/   Python FastAPI (GARCH regime classification, Claude insights)
data/        Uploaded trade images and DB backups (gitignored)
docs/        Strategy PDF and architecture diagram
```
