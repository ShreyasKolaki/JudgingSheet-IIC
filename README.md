# 🏆 Judging Dashboard & Leaderboard System

**🌐 Live Demo:** [https://judgeboard.aura-registration-portal.workers.dev](https://judgeboard.aura-registration-portal.workers.dev)  
**🎥 Video Demo:** [Watch on Google Drive](https://drive.google.com/file/d/1puM63LZSKr0tWTwSDgeL4Y3vRp5kQ29Z/view?usp=drive_link)

A Full Stack Judging Dashboard System designed for events like Hackathons, Ideathons, and RoboWars. This system replaces traditional spreadsheet-based judging with a real-time, automated, role-based evaluation system.

## 📌 Overview

The Judging Dashboard allows:
- **Judges** to enter scores seamlessly.
- **Admins** to control evaluation logic and criteria.
- **Teams** to track their performance.
- **System** to generate an automatic leaderboard with priority-based tie-breaking.

## 🎯 Core Problem Solved

Traditional judging systems suffer from manual calculation errors, lack of a real-time leaderboard, difficult comparison between teams, and lack of transparency. This system solves all of these using automation and structured evaluation.

## 👥 User Roles

### 1️⃣ Admin
- Controls the entire judging system.
- **Responsibilities:** Create/manage events, define judging criteria (0–10 range), assign priority/order (tie-breaker logic), assign weights to criteria, update judging structure, and view the leaderboard.
- **Special Logic:** Priority-based tie-breaking (see Scoring Logic).

### 2️⃣ Judge
- Logs in per event (e.g., Hackathon Judge, Ideathon Judge).
- **Responsibilities:** Select event, select team, enter scores for each criterion (0–10), and submit scores.
- Cannot modify criteria; works based on admin-defined structure. Data updates the leaderboard instantly.

### 3️⃣ Team Leader
- Login credentials linked to team data.
- **Responsibilities:** View their team’s scores and leaderboard, compare rankings.
- **Restrictions:** Read-only access; cannot edit anything.

#### 🧪 Pre-configured Team Logins (MongoDB Atlas)
Use these pre-configured credentials to test the team leader dashboard:

| Team Name | Team Leader Email | Password |
|-----------|-------------------|----------|
| Code Ninjas | `team1@gmail.com` | `password123` |
| Cyber Squad | `team2@gmail.com` | `password123` |
| Data Miners | `team3@gmail.com` | `password123` |
| Byte Benders | `team4@gmail.com` | `password123` |
| Tech Titans | `team5@gmail.com` | `password123` |
| AI Avengers | `team6@gmail.com` | `password123` |
| Quantum Coders | `team7@gmail.com` | `password123` |

## 🧮 Scoring Logic & Calculation

**Criteria Example:**
- Innovation (0–10)
- Technical Implementation (0–10)
- Feasibility (0–10)
- Presentation (0–10)
- Impact (0–10)

**Calculation:**
`Total Score = Sum (or Weighted Sum) of all criteria`

**Tie-Breaking (Priority Logic):**
If two teams have the same total score:
1. Compare the highest priority criterion.
2. The team with a higher score in that criterion wins.
3. If still tied → move to the next priority criterion.
4. If everything matches → same rank.

## ⚙️ System Flow

1. Admin logs in to create an event, define criteria, and assign priorities/weights.
2. Judges log in, select the event, and enter scores for teams.
3. Scores are stored in MongoDB.
4. FastAPI backend calculates totals and applies priority logic automatically.
5. Leaderboard updates in real-time.
6. All roles can view the sorted leaderboard.

## 📂 File Structure

```text
judgeview/
│
├── judgeviewB/                 # FastAPI Backend
│   ├── app/
│   │   ├── api/                # API Endpoints (routes)
│   │   │   ├── routes/
│   │   │   │   ├── admin.py
│   │   │   │   ├── criteria.py
│   │   │   │   ├── events.py
│   │   │   │   ├── leaderboard.py
│   │   │   │   └── scores.py
│   │   ├── core/               # Configuration and security
│   │   ├── db/                 # Database connection & models
│   │   ├── services/           # Business logic (Scoring, Tie-breaking)
│   │   │   └── score_service.py
│   │   └── main.py             # FastAPI entry point
│   ├── requirements.txt
│   └── .env                    # Backend environment variables
│
├── judgeviewF/                 # Frontend (React / Lovable UI / TanStack Start)
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Admin, Judge, and Team views
│   │   ├── lib/
│   │   │   └── api.ts          # API integration
│   │   └── App.tsx
│   ├── package.json
│   └── .env                    # Frontend environment variables
│
└── README.md
```

## ✨ Features
- **Real-time Leaderboard:** Automatically updates as judges submit scores.
- **Automatic Score Calculation:** Handles weighted criteria.
- **Priority-based Ranking:** Advanced tie-breaking based on criteria priority.
- **Multi-role Access:** Admin, Judge, and Team views.
- **Simple Login System:** Secure credentials stored in `.env` (No JWT overhead for simple setup).
- **Clean UI:** Intuitive dashboard for efficient score entry.

## 🚀 Setup Instructions

### Prerequisites
- Python 3.9+
- Node.js 18+
- MongoDB Atlas Account

### 1. Backend Setup (FastAPI)
```bash
# Navigate to backend directory
cd judgeviewB

# Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create a .env file and configure it
cat <<EOT >> .env
ADMIN_EMAIL=admin@gmail.com
ADMIN_PASSWORD=admin123
JUDGE_HACKATHON_EMAIL=judge1@gmail.com
JUDGE_HACKATHON_PASSWORD=judge1
MONGO_URI=your_mongodb_connection_string
SECRET_KEY=your_secret_key
APP_NAME="Judging System"
EOT

# Run the backend server
uvicorn app.main:app --reload
```
*The backend will run on `http://localhost:8000`. API docs at `http://localhost:8000/docs`.*

### 2. Frontend Setup
```bash
# Navigate to frontend directory
cd judgeviewF

# Install dependencies
npm install

# Create a .env file for frontend
echo "VITE_API_URL=http://localhost:8000" > .env

# Start the development server
npm run dev
```

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| **POST** | `/api/auth/login` | Simple role-based login verification |
| **GET** | `/api/events` | List all events |
| **POST** | `/api/events` | (Admin) Create a new event |
| **GET** | `/api/criteria/{event_id}` | Get criteria for an event |
| **POST** | `/api/criteria` | (Admin) Add criteria with priorities |
| **GET** | `/api/teams/{event_id}` | List teams for an event |
| **POST** | `/api/scores` | (Judge) Submit scores for a team |
| **GET** | `/api/leaderboard/{event_id}` | Get calculated and sorted leaderboard |

## 🛠️ Tech Stack
- **Frontend:** React, TanStack Start, TailwindCSS
- **Backend:** FastAPI, Python
- **Database:** MongoDB Atlas
- **Hosting:** Render (Backend), Cloudflare Workers (Frontend)
