# ServiceHive SlotSwapper – Monorepo

This repository contains both the FastAPI backend and the React (Vite) frontend for the ServiceHive SlotSwapper application.

## Overview & Design Choices
- **Domain**: Peer-to-peer time-slot swapping between users' calendar events.
- **Backend**: FastAPI + SQLAlchemy (SQLite). Simple, reliable, file-based DB for local/dev; easy to port to Postgres via `DATABASE_URL`.
- **Auth**: JWT (HS256) + bcrypt. Token stored client-side; sent via `Authorization: Bearer <token>`.
- **Models**:
  - `User`: accounts with hashed passwords
  - `Event`: user-owned time slots with status `BUSY | SWAPPABLE | SWAP_PENDING`
  - `SwapRequest`: tracks requests and status `PENDING | ACCEPTED | REJECTED`
- **Swap Logic**: When a request is created, both slots become `SWAP_PENDING`. On accept, event owners are swapped atomically and both become `BUSY`; on reject, both revert to `SWAPPABLE`.
- **Frontend**: React + Vite, React Router, Axios, Context API for auth. Tailwind for quick styling.

## Project Structure

```
slotSwapper/
├── backend/            # FastAPI app (SQLite + SQLAlchemy, JWT auth)
└── frontend/           # React + Vite app (Axios, React Router, Tailwind)
```

## Prerequisites
- Python 3.10+
- Node.js 18+ and npm

---

## Backend (FastAPI)

### 1) Create and activate a virtual environment
```bash
cd slotSwapper/backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
```

### 2) Install dependencies
```bash
pip install -r requirements.txt
```

### 3) (Optional) Configure environment
Set a strong JWT secret:
```bash
export SECRET_KEY="<your-long-random-secret>"   # PowerShell: $env:SECRET_KEY="..."
```

### 4) Run the API server
```bash
uvicorn app.main:app --reload
```

API docs: `http://127.0.0.1:8000/docs`

### API Endpoints

| Method | Path                         | Auth | Description                          |
|--------|------------------------------|------|--------------------------------------|
| POST   | `/signup`                    | No   | Create user                          |
| POST   | `/login`                     | No   | Login, returns JWT                   |
| GET    | `/events/`                    | Yes  | List current user’s events           |
| POST   | `/events/`                    | Yes  | Create event                         |
| PUT    | `/events/{id}`               | Yes  | Update event                         |
| DELETE | `/events/{id}`               | Yes  | Delete event                         |
| GET    | `/swappable-slots`           | Yes  | Swappable events of other users      |
| POST   | `/swap-request`              | Yes  | Create swap request                  |
| GET    | `/swap-requests/incoming`    | Yes  | Incoming swap requests               |
| GET    | `/swap-requests/outgoing`    | Yes  | Outgoing swap requests               |
| POST   | `/swap-response/{request_id}`| Yes  | Accept/Reject a swap request         |

Use the Swagger UI for payloads and examples: `http://127.0.0.1:8000/docs`.

CORS is enabled for `http://localhost:5173`.

---

## Frontend (React + Vite)

### 1) Install and run
```bash
cd slotSwapper/frontend
npm install
npm run dev
```

App: `http://localhost:5173`

### Pages
- `/signup` – Create account
- `/login` – Login (stores JWT in localStorage)
- `/dashboard` – Manage my events
- `/marketplace` – View other users’ swappable slots and request swaps
- `/requests` – View/respond to swap requests

The frontend uses Axios with an interceptor to attach `Authorization: Bearer <token>` to API calls targeting `http://127.0.0.1:8000`.

---

## Development Notes
- Database: SQLite file `slot_swapper.db` in `backend/`
- Tables auto-create on backend startup
- Change or rotate `SECRET_KEY` on production and keep it out of source control
- If you change backend base URL/port, update `frontend/src/api/axiosInstance.js`

### Environment
- Copy `backend/.env.example` to `backend/.env` and set a strong `SECRET_KEY`.
- By default the app uses SQLite; optionally set `DATABASE_URL`.

---

## Quick Smoke Test
1) Start backend, open docs at `http://127.0.0.1:8000/docs`
2) Sign up a user, then login to get a token
3) Start frontend at `http://localhost:5173`
4) Login, create events, mark as SWAPPABLE, and try swap flows

---

## Assumptions & Challenges
- **Assumptions**
  - Events are user-owned single blocks; no recurring logic or overlap validation.
  - A swap only involves two events; multi-party swaps are out of scope.
  - Acceptance swaps ownership without changing time values.
- **Challenges**
  - Ensuring atomic swap acceptance: handled via a DB transaction guard; if any step fails, the request is rolled back.
  - Simple request discovery: added endpoints for incoming/outgoing requests for a clean UI.
  - Token handling on the client: Axios interceptors clear token and redirect on 401.

## License
MIT (or your preferred license)


