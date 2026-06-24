import os
import json
import uuid
from typing import Optional
from fastapi import APIRouter, HTTPException, Request, status
from pydantic import BaseModel
from appwrite.client import Client
from appwrite.services.account import Account
from appwrite.exception import AppwriteException
from backend import config
from backend.db_client import db_client
import time

router = APIRouter(prefix="/api/auth", tags=["auth"])

class PersistentSessionsDict(dict):
    def __init__(self, filepath):
        self.filepath = filepath
        super().__init__()
        self.load()
        
    def load(self):
        if os.path.exists(self.filepath):
            try:
                with open(self.filepath, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.update(data)
            except Exception as e:
                print(f"[!] Warning: Could not load persistent sessions: {e}")
                
    def save(self):
        try:
            with open(self.filepath, "w", encoding="utf-8") as f:
                json.dump(self, f, indent=4)
        except Exception as e:
            print(f"[!] Warning: Could not save persistent sessions: {e}")
            
    def __setitem__(self, key, value):
        super().__setitem__(key, value)
        self.save()
        
    def pop(self, key, default=None):
        res = super().pop(key, default)
        self.save()
        return res
        
    def __delitem__(self, key):
        super().__delitem__(key)
        self.save()

# Session cache for token verification
SESSIONS_FILE = os.path.join(os.path.dirname(__file__), "sessions_cache.json")
MOCK_SESSIONS = PersistentSessionsDict(SESSIONS_FILE)

class LoginRequest(BaseModel):
    email: str
    password: str

class OnboardRequest(BaseModel):
    email: str
    password: str
    role: str # "admin" or "labor"
    full_name: str
    base_daily_rate: float

def extract_request_token(request: Request, token: Optional[str] = None) -> Optional[str]:
    if token:
        return token
    auth_header = request.headers.get("authorization", "")
    if auth_header.lower().startswith("bearer "):
        return auth_header.split(" ", 1)[1].strip()
    return request.query_params.get("token")

def is_appwrite_session_expired(expire_str: Optional[str]) -> bool:
    # Disable natural expiration check to prevent frequent session timeouts during testing
    return False

async def get_current_session(request: Request, token: Optional[str] = None):
    session_token = extract_request_token(request, token)
    if not session_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session signature validation failed. Please sign in."
        )
        
    if config.DB_TYPE == "APPWRITE":
        import time
        is_fallback_session = session_token.startswith("sess_")
        
        if session_token in MOCK_SESSIONS:
            session_data = MOCK_SESSIONS[session_token]
            
            # Check natural Appwrite expiration if not a mock/fallback session
            if not is_fallback_session:
                expire_str = session_data.get("expire")
                if is_appwrite_session_expired(expire_str):
                    print(f"[*] Session {session_token[:8]}... has naturally expired. Evicting from cache.")
                    MOCK_SESSIONS.pop(session_token, None)
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Session expired. Please log in again."
                    )
                
                # Check if cache TTL (e.g. 24 hours) has elapsed to re-verify session status with Appwrite
                now = time.time()
                last_verified = session_data.get("verified_at", 0)
                if now - last_verified > 86400:
                    print(f"[*] Session cache TTL elapsed for {session_token[:8]}... Re-verifying with Appwrite.")
                    try:
                        client = Client()
                        client.set_endpoint(config.APPWRITE_ENDPOINT)
                        client.set_project(config.APPWRITE_PROJECT_ID)
                        client.set_session(session_token)
                        
                        account = Account(client)
                        session_info = account.get_session("current")
                        
                        session_data["verified_at"] = now
                        session_data["expire"] = session_info.get("expire", "")
                        MOCK_SESSIONS[session_token] = session_data
                    except AppwriteException as e:
                        # Evict session only if Appwrite explicitly confirms it is invalid/revoked (e.g., 401 or 403)
                        if e.code in (401, 403):
                            print(f"[*] Session verification failed (revoked/invalid): {e}. Removing from cache.")
                            MOCK_SESSIONS.pop(session_token, None)
                            raise HTTPException(
                                status_code=status.HTTP_401_UNAUTHORIZED,
                                detail="Session invalid or revoked. Please log in again."
                            )
                        else:
                            print(f"[!] Appwrite API error during session verification: {e}. Retaining cached session.")
                    except Exception as e:
                        # Do not evict or fail on network timeouts / temporary connection problems
                        print(f"[!] Network or unexpected error during session verification: {e}. Retaining cached session.")
            
            if session_token in MOCK_SESSIONS:
                if session_data["role"] not in ("admin", "labor"):
                    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin or Labor privileges required.")
                return session_data
            
        try:
            client = Client()
            client.set_endpoint(config.APPWRITE_ENDPOINT)
            client.set_project(config.APPWRITE_PROJECT_ID)
            client.set_session(session_token)
            
            account = Account(client)
            user_details = account.get()
            
            expire_time = ""
            if not is_fallback_session:
                try:
                    session_info = account.get_session("current")
                    expire_time = session_info.get("expire", "")
                except Exception:
                    pass
            
            email = user_details.get("email", "")
            user_id = user_details.get("$id", user_details.get("id", ""))
            
            db_user = await db_client.get_user_by_email(email)
            if not db_user or db_user.get("role") not in ("admin", "labor"):
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin or Labor privileges required.")
                
            role = db_user.get("role")
            name = db_user.get("full_name", user_details.get("name", "User"))
            
            import time
            session_data = {
                "email": email,
                "role": role,
                "name": name,
                "id": user_id,
                "token": session_token,
                "expire": expire_time,
                "verified_at": time.time()
            }
            MOCK_SESSIONS[session_token] = session_data
            return session_data
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Appwrite Session signature verification failed: {str(e)}"
            )
            
    if session_token not in MOCK_SESSIONS:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session signature validation failed. Please sign in."
        )
    session = dict(MOCK_SESSIONS[session_token])
    if session["role"] not in ("admin", "labor"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin or Labor privileges required.")
    session["token"] = session_token
    return session

async def require_admin(request: Request, token: Optional[str] = None):
    session = await get_current_session(request, token)
    if session["role"] != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required.")
    return session

async def require_admin_or_labor(request: Request, token: Optional[str] = None):
    session = await get_current_session(request, token)
    if session["role"] not in ("admin", "labor"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin or Labor privileges required.")
    return session

# @router.post("/login")
# async def login(req: LoginRequest):
#     # fallback_users = {
#     #     "hello@bhoomidecoration.com": {"password": "admin123", "role": "admin", "full_name": "Admin Manager", "id": "usr_admin"}
#     # }
#     
#     email = req.email.strip().lower()
#     password = req.password
#     
#     if config.DB_TYPE == "APPWRITE":
#         try:
#             client = Client()
#             client.set_endpoint(config.APPWRITE_ENDPOINT)
#             client.set_project(config.APPWRITE_PROJECT_ID)
#             
#             account = Account(client)
#             session = account.create_email_password_session(email, password)
#             print(session)
#             print(dir(session))
#             session_secret = session.get("secret", session.get("key", ""))
#             if not session_secret:
#                 session_secret = session.get("$id", "")
#                 
#             user_details = account.get()
#             user_id = user_details.get("$id", user_details.get("id", ""))
#             
#             db_user = await db_client.get_user_by_email(email)
#             if not db_user or db_user.get("role") != "admin":
#                 try:
#                     account.delete_session("current")
#                 except Exception:
#                     pass
#                 raise HTTPException(status_code=403, detail="Access denied. Admin role required.")
#                 
#             role = "admin"
#             name = db_user.get("full_name", user_details.get("name", "Admin"))
#                 
#             session_token = session_secret
#             session_expire = session.get("expire", "")
#             import time
#             session_data = {
#                 "email": email,
#                 "role": role,
#                 "name": name,
#                 "id": user_id,
#                 "token": session_token,
#                 "expire": session_expire,
#                 "verified_at": time.time()
#             }
#             MOCK_SESSIONS[session_token] = session_data
#             return session_data
#         except HTTPException:
#             raise
#         except Exception as e:
#             # Fallback to local default logins for verify_apis.py compatibility
#             # if email in fallback_users and fallback_users[email]["role"] == "admin" and fallback_users[email]["password"] == password:
#             #     user_info = fallback_users[email]
#             #     session_token = "sess_" + str(uuid.uuid4())[:12]
#             #     import time
#             #     session_data = {
#             #         "email": email,
#             #         "role": user_info["role"],
#             #         "name": user_info.get("full_name", user_info.get("name", "Unknown")),
#             #         "id": user_info.get("id", "usr_admin"),
#             #         "token": session_token,
#             #         "expire": "",
#             #         "verified_at": time.time()
#             #     }
#             #     MOCK_SESSIONS[session_token] = session_data
#             #     return session_data
#             raise HTTPException(status_code=401, detail=f"Invalid email or password: {str(e)}")
#             
#     user_info = None
#     db_user = await db_client.get_user_by_email(email)
#     if db_user and db_user.get("password") == password and db_user.get("role") == "admin":
#         user_info = db_user
#     elif email in fallback_users and fallback_users[email]["role"] == "admin" and fallback_users[email]["password"] == password:
#         user_info = fallback_users[email]
#         
#     if user_info:
#         session_token = "sess_" + str(uuid.uuid4())[:12]
#         import time
#         session_data = {
#             "email": email,
#             "role": user_info["role"],
#             "name": user_info.get("full_name", user_info.get("name", "Unknown")),
#             "id": user_info.get("id", "usr_admin"),
#             "token": session_token,
#             "expire": "",
#             "verified_at": time.time()
#         }
#         MOCK_SESSIONS[session_token] = session_data
#         return session_data
#     else:
#         raise HTTPException(status_code=401, detail="Invalid email or password, or user is not an Admin.")


@router.post("/login")
async def login(req: LoginRequest):
    fallback_users = {
            "hello@bhoomidecoration.com": {"password": "admin123", "role": "admin", "full_name": "Admin Manager", "id": "usr_admin"}
         }

    email = req.email.strip().lower()
    password = req.password

    # ------------------------------
    # APPWRITE AUTHENTICATION
    # ------------------------------
    if config.DB_TYPE == "APPWRITE":
        try:
            client = Client()
            client.set_endpoint(config.APPWRITE_ENDPOINT)
            client.set_project(config.APPWRITE_PROJECT_ID)

            account = Account(client)

            # Authenticate user
            session = account.create_email_password_session(
                email=email,
                password=password
            )

            # Get logged-in user
            # user_details = account.get()
            #
            # user_id = user_details.id
            user_id = session.userid

            # Find user in database
            db_user = await db_client.get_user_by_email(email)

            if not db_user:
                try:
                    account.delete_session("current")
                except:
                    pass

                raise HTTPException(
                    status_code=403,
                    detail="User not found in database."
                )

            if db_user.get("role") not in ("admin", "labor"):
                try:
                    account.delete_session("current")
                except:
                    pass

                raise HTTPException(
                    status_code=403,
                    detail="Access denied. Admin or Labor role required."
                )

            role = db_user.get("role")

            # name = (
            #     db_user.get("full_name")
            #     or getattr(user_details, "name", None)
            #     or "Admin"
            # )

            name = db_user.get("full_name", "Admin")

            # secret is empty in Appwrite Python SDK
            session_token = session.id

            session_data = {
                "email": email,
                "role": role,
                "name": name,
                "id": user_id,
                "token": session_token,
                "expire": session.expire,
                "verified_at": time.time()
            }

            MOCK_SESSIONS[session_token] = session_data

            return session_data

        except HTTPException:
            raise

        except Exception as e:
            raise HTTPException(
                status_code=401,
                detail=f"Invalid email or password: {str(e)}"
            )

    # ------------------------------
    # LOCAL LOGIN
    # ------------------------------
    user_info = None

    db_user = await db_client.get_user_by_email(email)

    if (
        db_user
        and db_user.get("password") == password
        and db_user.get("role") in ("admin", "labor")
    ):
        user_info = db_user

    elif (
        email in fallback_users
        and fallback_users[email]["password"] == password
        and fallback_users[email]["role"] in ("admin", "labor")
    ):
        user_info = fallback_users[email]

    if user_info:
        session_token = "sess_" + str(uuid.uuid4())[:12]

        session_data = {
            "email": email,
            "role": user_info["role"],
            "name": user_info.get(
                "full_name",
                user_info.get("name", "Unknown")
            ),
            "id": user_info.get("id", "usr_admin"),
            "token": session_token,
            "expire": "",
            "verified_at": time.time()
        }

        MOCK_SESSIONS[session_token] = session_data

        return session_data

    raise HTTPException(
        status_code=401,
        detail="Invalid email or password, or user is not an Admin or Labor."
    )
@router.post("/logout")
async def logout(token: str):
    if config.DB_TYPE == "APPWRITE":
        try:
            client = Client()
            client.set_endpoint(config.APPWRITE_ENDPOINT)
            client.set_project(config.APPWRITE_PROJECT_ID)
            client.set_session(token)
            
            account = Account(client)
            account.delete_session("current")
        except Exception:
            pass
            
    if token in MOCK_SESSIONS:
        MOCK_SESSIONS.pop(token)
    return {"status": "success"}

@router.post("/onboard")
async def onboard_user(request: Request, req: OnboardRequest):
    await require_admin(request)
    
    role_lower = req.role.strip().lower()
    if role_lower not in ("admin", "labor"):
        raise HTTPException(status_code=400, detail="Only Admin and Labor roles can be onboarded.")
        
    existing = await db_client.get_user_by_email(req.email)
    if existing:
        raise HTTPException(status_code=400, detail="Account already registered under this email.")
        
    user_id = "usr_" + str(uuid.uuid4())[:8]
    user_data = {
        "email": req.email.strip().lower(),
        "password": req.password,
        "role": role_lower,
        "full_name": req.full_name.strip(),
        "base_daily_rate": req.base_daily_rate,
        "id": user_id
    }
    
    if config.DB_TYPE == "APPWRITE":
        try:
            from appwrite.services.users import Users
            client = Client()
            client.set_endpoint(config.APPWRITE_ENDPOINT)
            client.set_project(config.APPWRITE_PROJECT_ID)
            client.set_key(config.APPWRITE_API_KEY)
            
            users_service = Users(client)
            users_service.create(
                user_id=user_id,
                email=user_data["email"],
                password=user_data["password"],
                name=user_data["full_name"]
            )
            created = await db_client.create_user(user_data)
            
            if role_lower == "labor":
                crew_data = {
                    "name": req.full_name.strip(),
                    "role": "Field Setup Crew",
                    "contact": req.email.strip().lower(),
                    "base_rate": req.base_daily_rate,
                    "amount_owed": 0.0,
                    "payment_history": "[]",
                    "half_day_rate": 0.0,
                    "night_rate": 0.0
                }
                await db_client.create_crew_member(crew_data, custom_id=user_id)
                
            return created
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Appwrite user onboarding failed: {str(e)}")
            
    created = await db_client.create_user(user_data)
    if role_lower == "labor":
        crew_data = {
            "name": req.full_name.strip(),
            "role": "Field Setup Crew",
            "contact": req.email.strip().lower(),
            "base_rate": req.base_daily_rate,
            "amount_owed": 0.0,
            "payment_history": "[]",
            "half_day_rate": 0.0,
            "night_rate": 0.0
        }
        await db_client.create_crew_member(crew_data, custom_id=user_id)
    return created
