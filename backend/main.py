from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import models, database
from .routers import auth, policies, webhooks

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="DeployGuard API", description="DevSecOps Policy Enforcement Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For demo purposes allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(policies.router)
app.include_router(webhooks.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to DeployGuard API"}
