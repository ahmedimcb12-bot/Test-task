from fastapi import APIRouter, Depends, HTTPException, status, Security
from fastapi.security import APIKeyHeader
from ..schema.auth import SendOTPRequest, VerifyOTPRequest
import secrets

router = APIRouter()

# Global storage for verified OTP token
# (Testing ke liye global variable hai, production mein isey Redis/DB mein hona chahiye)
GENERATE_TOKEN = None 

# Header Key Configuration
API_KEY_NAME = "X-OTP-Token"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)


@router.post("/send-otp")
def authentication(data: SendOTPRequest):
    global random_string
    random_string = secrets.token_urlsafe(6)[:6]
    print(f"OTP is: {random_string}")  
    return {"string": random_string}  


@router.post("/verify-otp")
def verify_otp(data_otp: VerifyOTPRequest):
    global GENERATE_TOKEN
    if data_otp.otp != random_string:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid OTP! Access Denied."
        )
    
    # OTP sahi hone par secure token generate karein
    GENERATE_TOKEN = secrets.token_hex(16)
    
    return {
        "message": "OTP Verified Successfully!",
        "X-OTP-Token": GENERATE_TOKEN  # User is token ko save karega
    }


# === AAPKA AUTHENTICATION LOCK FUNCTION ===
def verify_authentication_token(token: str = Security(api_key_header)):
    # Yeh check karega ke incoming request ka token generated token se match karta hai ya nahi
    if not token or token != GENERATE_TOKEN: 
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized! Pehle OTP verify karein aur valid header token bhein."
        )
    return token
