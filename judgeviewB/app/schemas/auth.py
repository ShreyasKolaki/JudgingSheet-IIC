from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    role: str


class LoginResponse(BaseModel):
    token: str
    role: str
    email: EmailStr
    name: str