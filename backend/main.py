from contextlib import asynccontextmanager

from fastapi import FastAPI

from database import Base, engine
import models


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Importing models above registers them with SQLAlchemy before create_all runs.
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="TransitOps API", lifespan=lifespan)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/")
def root():
    return {"message": "TransitOps API is running"}
