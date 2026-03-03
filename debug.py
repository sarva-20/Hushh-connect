# debug_users.py

from services.mongo import get_database

db = get_database()

print(list(db.users.find()))