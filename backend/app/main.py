from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routes import users, events, swaps


def create_app() -> FastAPI:
    app = FastAPI(title="ServiceHive SlotSwapper", version="1.0.0")

    # CORS for local frontend
    origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Create tables on startup
    @app.on_event("startup")
    def on_startup():
        Base.metadata.create_all(bind=engine)

    # Routers
    app.include_router(users.router)
    app.include_router(events.router)
    app.include_router(swaps.router)

    return app


app = create_app()


