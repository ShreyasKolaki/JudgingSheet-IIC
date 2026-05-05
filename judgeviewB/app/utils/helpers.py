# app/utils/helpers.py

from bson import ObjectId


def serialize_mongo_doc(doc):
    if not doc:
        return doc

    doc["id"] = str(doc["_id"])
    del doc["_id"]
    return doc


def serialize_mongo_list(docs):
    return [serialize_mongo_doc(doc) for doc in docs]