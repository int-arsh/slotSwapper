# ServiceHive SlotSwapper - Backend

FastAPI backend for the ServiceHive SlotSwapper peer-to-peer time-slot swapping system.

## Setup

```bash
cd serviceHive/backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Open the interactive API docs at `http://127.0.0.1:8000/docs`.

## Tech
- SQLite + SQLAlchemy ORM
- FastAPI
- Auth: JWT (PyJWT) + bcrypt

## Auth Endpoints
- POST `/signup` - Create user
  - Request:
    ```json
    { "name": "Alice", "email": "alice@example.com", "password": "secret" }
    ```
- POST `/login` - Obtain JWT
  - Request:
    ```json
    { "email": "alice@example.com", "password": "secret" }
    ```
  - Response:
    ```json
    { "access_token": "<jwt>", "token_type": "bearer", "expires_in": 1800 }
    ```

Use the token as `Authorization: Bearer <jwt>` for protected routes.

## Event Routes (Auth required)
- GET `/events` - List my events
- POST `/events` - Create event
  ```json
  {
    "title": "Shift A",
    "start_time": "2025-01-01T09:00:00",
    "end_time": "2025-01-01T17:00:00",
    "status": "SWAPPABLE"
  }
  ```
- PUT `/events/{id}` - Update event
- DELETE `/events/{id}` - Delete event

## Swap Routes (Auth required)
- GET `/swappable-slots` - Swappable events owned by others
- POST `/swap-request`
  ```json
  { "my_slot_id": 1, "their_slot_id": 2 }
  ```
- POST `/swap-response/{request_id}`
  ```json
  { "accept": true }
  ```

## Notes
- Tables are created automatically on startup.
- Default CORS allows `http://localhost:5173`.
- For production, change the `SECRET_KEY` in `app/auth.py` and use environment variables.


