from fastapi import HTTPException, Security, status
from fastapi.security import APIKeyHeader

# Ek header key check setup karein
API_KEY_NAME = "X-OTP-Token"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)

def verify_authentication_token(token: str = Security(api_key_header)):
    # Yahan aap check karenge jo token user bhej raha hai wo valid hai ya nahi
    # Agar token theek nahi hai ya missing hai tou error throw karein
    if not token or token != "Aapka_Generated_Token_Ya_Value": 
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized! Pehle OTP verify karein."
        )
    return token
