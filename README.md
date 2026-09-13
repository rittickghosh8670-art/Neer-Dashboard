# LBS Trading Dashboard

Backtest journal, live trade tracker and AI-powered analytics for the LBS strategy (MNQ / MGC).

## Stack
- **Backend:** Spring Boot 3.1.4 (Java 17, Maven)
- **Frontend:** React 18 + TypeScript (Vite)
- **Analytics:** Python FastAPI (GARCH regime detection + Claude insights)
- **Database:** PostgreSQL 16
- **Orchestration:** Docker Compose

## Local Setup

### macOS / Linux

1. Copy `.env.example` to `.env` and fill in values (DB creds, Anthropic API key).
2. Run everything:
   ```bash
   docker-compose up --build
   ```
3. Access:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080/api/health
   - Analytics API: http://localhost:8000/health

### Windows

**Prerequisites:**
- [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/) with the **WSL2 backend** enabled (default on modern installs). During Docker Desktop setup, when prompted, choose "Use WSL 2 instead of Hyper-V."
- Git for Windows (or clone via GitHub Desktop).
- PowerShell 5.1+ (built into Windows) or PowerShell 7.

**Setup:**
1. Clone the repo:
   ```powershell
   git clone https://github.com/rittickghosh8670-art/Neer-Dashboard.git
   cd Neer-Dashboard
   ```
2. Run the setup script (creates `.env`, opens it for editing, builds and starts all containers):
   ```powershell
   .\scripts\setup-windows.ps1
   ```
   If PowerShell blocks the script with an execution policy error, run once:
   ```powershell
   Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
   ```
3. Check status any time:
   ```powershell
   .\scripts\status-windows.ps1
   ```
4. Access the same URLs as above (localhost works identically on Windows via Docker Desktop's port forwarding).

**Windows-specific notes:**
- Line endings are enforced via `.gitattributes` — Dockerfiles, `.sh`, `.sql`, and YAML files always use LF, even after `git clone` on Windows. This prevents "exec format error" issues that occur when Linux containers try to run CRLF-terminated shell scripts.
- The backup feature (`pg_dump`/`psql`) runs **inside** the backend Docker container, which is Linux-based — no need to install Postgres client tools natively on Windows.
- If Docker Desktop uses Hyper-V instead of WSL2, file-system performance for bind-mounted volumes (`./data/uploads`, `./data/backups`) will be noticeably slower. Switch to WSL2 backend in Docker Desktop Settings > General.

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

## Enrichment Template

`templates/trade_enrichment_template.xlsx` — Excel template for capturing
trade enrichment data (signature, IB type, S/R quality, target/management R
outcomes, notes) while backtesting in FX Replay. Fill it in, copy the columns
into your FX Replay CSV export (matched by `id`), then import the combined
CSV via the dashboard's Import CSV page. Includes dropdown validation on enum
columns and an Instructions sheet.

Regenerate with: `python3 scripts/generate_enrichment_template.py`

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
