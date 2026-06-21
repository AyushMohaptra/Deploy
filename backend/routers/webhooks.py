from fastapi import APIRouter, Depends, Request, BackgroundTasks
from sqlalchemy.orm import Session
import json
from .. import schemas, models, database
from .dependencies import get_db
from ..scanner import scan_github_repo

router = APIRouter(
    prefix="/webhooks",
    tags=["CI/CD Webhooks"]
)

@router.post("/github")
async def github_webhook(request: Request, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    payload = await request.json()
    
    # Parse payload
    repo_name = payload.get("repository", {}).get("full_name", "unknown/repo")
    commit_sha = payload.get("after", "unknown-sha")
    
    # Trigger real background OSV scan
    background_tasks.add_task(scan_github_repo, repo_name, commit_sha, db)
    
    return {"message": f"Webhook received. Real OSV scan triggered for {repo_name}."}

@router.get("/scans", response_model=list[schemas.ScanResult])
def get_scans(db: Session = Depends(get_db)):
    scans = db.query(models.ScanResult).order_by(models.ScanResult.created_at.desc()).limit(50).all()
    return scans
