from bson import ObjectId
from app.database.collections import get_criteria_collection
from app.utils.helpers import serialize_mongo_list, serialize_mongo_doc


def get_criteria(event_id: str):
    criteria = list(get_criteria_collection().find({"event_id": event_id}))
    return serialize_mongo_list(criteria)


def create_criteria(data: dict):
    result = get_criteria_collection().insert_one(data)
    crit = get_criteria_collection().find_one({"_id": result.inserted_id})
    return serialize_mongo_doc(crit)


def update_criteria(criteria_id: str, data: dict):
    get_criteria_collection().update_one(
        {"_id": ObjectId(criteria_id)},
        {"$set": data}
    )
    crit = get_criteria_collection().find_one({"_id": ObjectId(criteria_id)})
    return serialize_mongo_doc(crit)


def delete_criteria(criteria_id: str):
    get_criteria_collection().delete_one({"_id": ObjectId(criteria_id)})
    return {"ok": True}