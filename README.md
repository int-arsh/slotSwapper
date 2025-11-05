# ServiceHive SlotSwapper – Monorepo

This repository contains both the FastAPI backend and the React (Vite) frontend for the ServiceHive SlotSwapper application.

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

### Key Endpoints
- POST `/signup` – Create user
- POST `/login` – JWT login
- GET `/events` – List my events
- POST `/events` – Create event
- PUT `/events/{id}` – Update event
- DELETE `/events/{id}` – Delete event
- GET `/swappable-slots` – Browse others' swappable events
- POST `/swap-request` – Create swap request
- GET `/swap-requests/incoming` – Incoming swap requests
- GET `/swap-requests/outgoing` – Outgoing swap requests
- POST `/swap-response/{request_id}` – Accept/Reject swap

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

---

## Quick Smoke Test
1) Start backend, open docs at `http://127.0.0.1:8000/docs`
2) Sign up a user, then login to get a token
3) Start frontend at `http://localhost:5173`
4) Login, create events, mark as SWAPPABLE, and try swap flows

---

## License
MIT (or your preferred license)


