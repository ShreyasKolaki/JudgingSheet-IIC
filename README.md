# JudgingSheet — Multi-Role Judging Dashboard & Leaderboard System

A full-stack real-time judging system built for events like Hackathons, Ideathons, and RoboWars. Replaces traditional spreadsheet-based judging with automated, role-based evaluation and a live leaderboard.

## Project Structure

```
├── judgeviewB/   # FastAPI Backend (Python)
└── judgeviewF/   # React Frontend (TanStack Start + Vite)
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TanStack Router, Vite, Tailwind CSS |
| Backend | FastAPI, Python |
| Database | MongoDB Atlas |
| Deployment | Render (backend), Cloudflare Workers (frontend) |

## Features

- 🔐 **Multi-role login** — Admin, Judge, Team Leader
- 📝 **Score entry** — Judges submit scores (0–10) per criterion
- 🏆 **Live leaderboard** — Auto-refreshes every 5 seconds
- ⚖️ **Weighted scoring** — Criteria can have custom weights
- 🔢 **Priority tie-breaking** — Ties broken by priority-ordered criteria
- ⚡ **Real-time updates** — No manual calculation needed

## User Roles

| Role | Access |
|------|--------|
| **Admin** | Create events, define criteria (weight + priority), view leaderboard |
| **Judge** | Select event → select team → submit scores |
| **Team Leader** | View own scores, view leaderboard (read-only) |

## Getting Started

### Backend
```bash
cd judgeviewB
pip install -r requirements.txt
# Create a .env file (see .env.example)
uvicorn app.main:app --reload
```

### Frontend
```bash
cd judgeviewF
npm install
# Create a .env file with VITE_API_URL=http://localhost:8000/api
npm run dev
```

## Environment Variables

### Backend (`judgeviewB/.env`)
```
MONGO_URI=your_mongodb_connection_string
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
ADMIN_EMAIL=admin@gmail.com
ADMIN_PASSWORD=your_password
JUDGE_HACKATHON_EMAIL=judge1@gmail.com
JUDGE_HACKATHON_PASSWORD=judge1
JUDGE_IDEATHON_EMAIL=judge2@gmail.com
JUDGE_IDEATHON_PASSWORD=judge2
JUDGE_ROBOWARS_EMAIL=judge3@gmail.com
JUDGE_ROBOWARS_PASSWORD=judge3
```

### Frontend (`judgeviewF/.env`)
```
VITE_API_URL=http://localhost:8000/api
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login (returns JWT token) |
| GET | `/api/events/` | List all events |
| POST | `/api/events/` | Create event (Admin) |
| GET | `/api/criteria/{event_id}` | Get criteria for event |
| POST | `/api/criteria/` | Create criterion (Admin) |
| GET | `/api/teams/{event_id}` | Get teams for event |
| POST | `/api/scores/` | Submit scores (Judge) |
| GET | `/api/scores/{event_id}/{team_id}` | Get team scores |
| GET | `/api/leaderboard/{event_id}` | Get live leaderboard |

Full interactive docs available at `/docs` when backend is running.
