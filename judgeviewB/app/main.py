# app/main.py
from fastapi import FastAPI
from app.api.router import api_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Judging System")

# Allow all origins during development.
# For production: replace "*" with your Cloudflare Workers URL after deploying frontend.
# Example: "https://tanstack-start-app.YOUR-NAME.workers.dev"
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,  # Must be False when allow_origins=["*"]
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")