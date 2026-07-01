import sys
import os
import asyncio

sys.path.append(r"H:\CODE (HEM)\Somthing Crazy")

from backend.db_client import db_client
import backend.config as config

async def main():
    try:
        res = await asyncio.to_thread(
            db_client.databases.list_documents,
            db_client.db_id,
            config.APPWRITE_SETTINGS_COLLECTION_ID,
        )
        print("ALL DOCUMENTS IN SETTINGS COLLECTION:")
        docs = db_client._get_documents_list(res)
        for doc in docs:
            cleaned = db_client._clean_doc(doc)
            print(f"ID: {cleaned.get('id')}")
            for k, v in cleaned.items():
                print(f"  {k}: {v}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
