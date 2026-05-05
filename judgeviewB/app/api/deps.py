from fastapi import Depends, HTTPException
from app.core.dependencies import get_current_user

def require_admin(user=Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    return user

def require_judge(user=Depends(get_current_user)):
    if user.get("role") != "judge":
        raise HTTPException(status_code=403, detail="Judge only")
    return user

def require_team(user=Depends(get_current_user)):
    if user.get("role") != "team":
        raise HTTPException(status_code=403, detail="Team only")
    return user