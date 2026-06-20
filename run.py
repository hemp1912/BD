import sys
import subprocess
import os

def check_install_requirements():
    try:
        import fastapi
        import uvicorn
        import appwrite
        import dotenv
        print("[+] Dependencies verified (cached).")
    except ImportError:
        print("[*] Checking and installing Python dependencies...")
        req_path = os.path.join(os.path.dirname(__file__), "requirements.txt")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", req_path])
            print("[+] Dependencies verified.")
        except Exception as e:
            print(f"[!] Failed to install dependencies: {e}")
            sys.exit(1)

def run_api_verification():
    import sys
    if "--verify" in sys.argv:
        print("[*] Running automated backend tests...")
        verify_script = os.path.join(os.path.dirname(__file__), "backend", "verify_apis.py")
        try:
            subprocess.check_call([sys.executable, verify_script])
            print("[+] All integration checks passed.")
        except Exception as e:
            print(f"[!] API Verification tests failed: {e}")
    else:
        print("[*] Skipping automated backend tests. Use --verify to run them.")

def start_server():
    print("[*] Launching Bhoomi Decoration Web Server at http://127.0.0.1:8000 ...")
    try:
        import uvicorn
        uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
    except KeyboardInterrupt:
        print("\n[-] Web server stopped.")
    except Exception as e:
        print(f"[!] Server execution error: {e}")

if __name__ == "__main__":
    check_install_requirements()
    run_api_verification()
    start_server()
