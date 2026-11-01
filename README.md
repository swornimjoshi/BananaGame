# 🍌 Banana Math Game

A full-stack, real-time math puzzle game built with React, Node.js/Express, and MySQL.

## Tech Stack
- **Frontend**: React 18, Vite, Framer Motion, Lucide Icons, Canvas Confetti
- **Audio**: Web Audio API (native synthesized game sound effects)
- **Backend**: Node.js, Express, Helmet, CORS, Cookie-Parser, Rate-Limiting
- **Database**: MySQL (InnoDB, indexed transactions)
- **Authentication**: JWT stored in `httpOnly` secure cookies with refresh token rotation

---

## Quick Start

### 1. Configure Environment Variables
Edit `backend/.env` and set your MySQL password:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=banana_game
JWT_SECRET=banana_game_jwt_secret_super_long_key_change_me_2024
JWT_REFRESH_SECRET=banana_game_refresh_secret_super_long_key_change_me_2024
FRONTEND_URL=http://localhost:5173
BANANA_API_URL=https://marcconrad.com/uob/banana/
```

### 2. Initialize the Database
Run the automated initialization script from the root directory:
```bash
npm run init-db
```
*(This automatically connects to MySQL, creates the database `banana_game`, and runs `schema.sql`)*

### 3. Start Both Backend & Frontend
Run both dev servers concurrently with a single command:
```bash
npm run dev
```
Open **http://localhost:5173** in your browser to play!

---

## Project Structure

```
BananaGame/
├── package.json              # Root scripts (npm run dev, init-db, build)
├── scripts/
│   └── dev.js                # Concurrent runner for Backend + Frontend
├── backend/
│   ├── config/db.js          # MySQL connection pool
│   ├── controllers/          # Auth, Game, Leaderboard, Profile controllers
│   ├── database/schema.sql   # Database tables schema
│   ├── middleware/           # JWT auth, optionalAuth, rate limiting, error handling
│   ├── routes/               # API route definitions
│   ├── scripts/init-db.js    # One-click DB initialization script
│   └── server.js             # Express application entrypoint
└── frontend/
    ├── src/
    │   ├── api/axios.js      # Axios instance with cookie handling & token refresh interceptor
    │   ├── components/       # Navbar, Timer, NumberPad, ProtectedRoute
    │   ├── context/          # AuthContext for global user state
    │   ├── hooks/useGame.js  # Game state machine & timer hook
    │   ├── pages/            # Home, Game, Leaderboard, Profile, Login, Register
    │   └── utils/audio.js    # Web Audio sound synthesizer (clicks, chimes, buzzers)
    └── vite.config.js        # Vite dev server with /api proxy
```

---

## Features & Security

- **Progressive 3-Step Hint System**:
  - **Step 1 (Range & Parity)**: Reveals whether the answer is Even/Odd and in Low (0–4) or High (5–9) range (-15 pts).
  - **Step 2 (Eliminate 4 Choices)**: Crosses out and disables 4 wrong numbers on the keypad (-35 pts).
  - **Step 3 (50/50 Showdown)**: Eliminates 8 wrong choices, leaving only 2 candidate numbers (-60 pts).
- **Mandatory Authentication to Play**: Game routes and APIs are strictly protected. Unauthenticated visitors are guided to sign in, with seamless redirect back to the puzzle after login.
- **Dynamic Point System**:
  - **+100 Base Points** awarded for correct answers.
  - **Speed Bonus** up to +50 points for quick answers within the 30s window.
  - **Streak Multipliers**: 1.5× at streak 3, 2× at streak 6, and 3× at streak 10.
  - Transparent itemized score breakdown modal on completion.
- **Mistake Feedback with Vibration & Screen Shake**:
  - Intense shake keyframe animation on incorrect answers.
  - Device haptic feedback (`navigator.vibrate`) on supported hardware and mobile devices.
  - Mistake buzzer sound and streak reset.
- **Server-Side Solution Verification**: Puzzle solutions are fetched and validated entirely server-side; solutions are never exposed to the client bundle or network payload.
- **Anti-Cheat Expiry**: Questions have a strict 30s timer (+ 5s server grace window). Stale/unanswered sessions auto-expire on the server and reset streaks to prevent waiting out difficult puzzles.
- **Public & Competitive Leaderboard**: View daily, weekly, and all-time rankings. Click any player to inspect their public stats modal.
- **Zero-Dependency Sound Effects**: Built with native browser Web Audio API with a one-click mute/unmute toggle.
- **Secure Authentication**: 
  - `httpOnly`, `SameSite=lax` cookies (immune to XSS token theft).
  - Refresh tokens stored as SHA-256 hashes in MySQL with automatic single-use rotation.
  - Password hashing with bcrypt (12 salt rounds).
  - Express rate limiters on authentication and game endpoints.
# BananaGame
