from app.database.mongodb import db

def get_users_collection():
    return db["users"]

def get_events_collection():
    return db["events"]

def get_criteria_collection():
    return db["criteria"]

def get_teams_collection():
    return db["teams"]

def get_scores_collection():
    return db["scores"]

def get_results_collection():
    return db["results"]