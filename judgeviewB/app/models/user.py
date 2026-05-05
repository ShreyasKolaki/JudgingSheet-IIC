def user_model(user) -> dict:
    return {
        "email": user.get("email"),
        "role": user.get("role")
    }