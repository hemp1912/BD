import os
os.environ["AUTO_BOOTSTRAP_SCHEMA"] = "false"

import asyncio
import traceback
from backend.db_client import db_client

async def main():
    print("--- Testing get_testimonials() ---")
    try:
        testimonials = await db_client.get_testimonials()
        print(f"Success! Got {len(testimonials)} testimonials:")
        for t in testimonials:
            print(f"  ID={t.get('id')}, name={t.get('name')}, approved={t.get('approved')}")
    except Exception as e:
        print("ERROR:")
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
