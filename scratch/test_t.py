import asyncio
from backend.db_client import db_client

async def main():
    all_t = await db_client.get_testimonials()
    print("TESTIMONIALS:", all_t)

if __name__ == "__main__":
    asyncio.run(main())
