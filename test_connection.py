from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

uri = os.getenv("MONGO_URI")

client = MongoClient(uri)

try:
    print(client.list_database_names())
    print("Connected successfully")
except Exception as e:
    print("Connection failed:", e)