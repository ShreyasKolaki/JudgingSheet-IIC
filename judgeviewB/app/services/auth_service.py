# app/services/auth_service.py

import os
from fastapi import HTTPException
from app.core.security import create_access_token


def authenticate_user(email: str, password: str, role: str):
    # Admin
    if role == "admin":
        if email == os.getenv("ADMIN_EMAIL") and password == os.getenv("ADMIN_PASSWORD"):
            return generate_token(email, role, "Admin")

    # Judge (example: hackathon)
    if role == "judge":
        if email == os.getenv("JUDGE_HACKATHON_EMAIL") and password == os.getenv("JUDGE_HACKATHON_PASSWORD"):
            return generate_token(email, role, "Judge")

    raise HTTPException(status_code=401, detail="Invalid credentials")


def generate_token(email: str, role: str, name: str):
    token = create_access_token({
        "email": email,
        "role": role
    })

    return {
        "token": token,
        "role": role,
        "email": email,
        "name": name
    }