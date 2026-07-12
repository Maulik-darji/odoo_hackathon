from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import Base, engine
from app.core.config import settings
from app.api.v1 import analytics, auth, drivers, expenses, maintenance, seed, trips, users, vehicles
import app.models


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,        prefix=f"{settings.API_V1_STR}/auth",        tags=["auth"])
app.include_router(users.router,       prefix=f"{settings.API_V1_STR}/users",       tags=["users"])
app.include_router(vehicles.router,    prefix=f"{settings.API_V1_STR}/vehicles",    tags=["vehicles"])
app.include_router(drivers.router,     prefix=f"{settings.API_V1_STR}/drivers",     tags=["drivers"])
app.include_router(trips.router,       prefix=f"{settings.API_V1_STR}/trips",       tags=["trips"])
app.include_router(expenses.router,    prefix=f"{settings.API_V1_STR}/expenses",    tags=["expenses"])
app.include_router(maintenance.router, prefix=f"{settings.API_V1_STR}/maintenance", tags=["maintenance"])
app.include_router(analytics.router,   prefix=f"{settings.API_V1_STR}/analytics",   tags=["analytics"])
app.include_router(seed.router,        prefix=f"{settings.API_V1_STR}/seed",         tags=["seed"])

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/")
def root():
    return {"message": "Welcome to TransitOps API"}
