from bson import ObjectId
from app.database.collections import get_events_collection
from app.utils.helpers import serialize_mongo_list, serialize_mongo_doc


def get_all_events():
    events = list(get_events_collection().find())
    return serialize_mongo_list(events)


def create_event(name: str):
    result = get_events_collection().insert_one({"name": name})
    event = get_events_collection().find_one({"_id": result.inserted_id})
    return serialize_mongo_doc(event)


def update_event(event_id: str, name: str):
    get_events_collection().update_one(
        {"_id": ObjectId(event_id)},
        {"$set": {"name": name}}
    )
    event = get_events_collection().find_one({"_id": ObjectId(event_id)})
    return serialize_mongo_doc(event)


def delete_event(event_id: str):
    get_events_collection().delete_one({"_id": ObjectId(event_id)})
    return {"ok": True}