from fastapi import APIRouter, HTTPException
import os
from app.core.security import create_access_token

router = APIRouter()

from app.database.collections import get_users_collection

@router.post("/login")
def login(data: dict):
    email = data.get("email")
    password = data.get("password")
    role = data.get("role")

    # Admin
    if role == "admin":
        if email == os.getenv("ADMIN_EMAIL") and password == os.getenv("ADMIN_PASSWORD"):
            token = create_access_token({"email": email, "role": role})
            return {"token": token, "role": role, "email": email, "name": "Admin"}

    # Judges
    if role == "judge":
        judges = [
            (os.getenv("JUDGE_HACKATHON_EMAIL"), os.getenv("JUDGE_HACKATHON_PASSWORD")),
            (os.getenv("JUDGE_IDEATHON_EMAIL"), os.getenv("JUDGE_IDEATHON_PASSWORD")),
            (os.getenv("JUDGE_ROBOWARS_EMAIL"), os.getenv("JUDGE_ROBOWARS_PASSWORD"))
        ]
        for j_email, j_pass in judges:
            if email == j_email and password == j_pass:
                token = create_access_token({"email": email, "role": role})
                return {"token": token, "role": role, "email": email, "name": "Judge"}

    # Team Leader (from DB)
    if role == "team_leader":
        users_col = get_users_collection()
        user = users_col.find_one({"email": email, "password": password, "role": "team_leader"})
        if user:
            token = create_access_token({"email": email, "role": role})
            team_name = user.get("team_name", "")
            return {"token": token, "role": role, "email": email, "name": team_name or "Team Leader", "team_name": team_name}

    raise HTTPException(status_code=401, detail="Invalid credentials")