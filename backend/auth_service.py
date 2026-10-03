import datetime
import hashlib
import secrets
import jwt
from sqlalchemy.orm import Session
from database import User, SessionLocal

SECRET_KEY = "coconut_ai_secret_key_2026_super_secure"
ALGORITHM = "HS256"
TOKEN_EXPIRE_HOURS = 24

def hash_password(password: str) -> str:
    """Hashes plain text password securely using PBKDF2-HMAC-SHA256 with random salt."""
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
    return f"{salt}${key.hex()}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies plain password against stored salted hash."""
    try:
        if '$' not in hashed_password:
            return False
        salt, key_hex = hashed_password.split('$', 1)
        new_key = hashlib.pbkdf2_hmac('sha256', plain_password.encode('utf-8'), salt.encode('utf-8'), 100000)
        return secrets.compare_digest(new_key.hex(), key_hex)
    except Exception:
        return False

def create_access_token(data: dict) -> str:
    """Generates a JWT token for logged in user."""
    to_encode = data.copy()
    expire = datetime.datetime.utcnow() + datetime.timedelta(hours=TOKEN_EXPIRE_HOURS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def register_user(name: str, email: str, password: str, db: Session = None):
    """Registers a new user into SQLite database."""
    close_session = False
    if db is None:
        db = SessionLocal()
        close_session = True

    try:
        existing = db.query(User).filter(User.email == email.lower().strip()).first()
        if existing:
            raise ValueError("An account with this email address already exists.")

        hashed = hash_password(password)
        new_user = User(
            name=name.strip(),
            email=email.lower().strip(),
            password_hash=hashed
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        token = create_access_token({"sub": str(new_user.id), "email": new_user.email})

        return {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
            "token": token
        }
    finally:
        if close_session:
            db.close()

def login_user(email: str, password: str, db: Session = None):
    """Authenticates user and returns access token."""
    close_session = False
    if db is None:
        db = SessionLocal()
        close_session = True

    try:
        user = db.query(User).filter(User.email == email.lower().strip()).first()
        if not user or not verify_password(password, user.password_hash):
            raise ValueError("Invalid email address or password.")

        token = create_access_token({"sub": str(user.id), "email": user.email})

        return {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "token": token
        }
    finally:
        if close_session:
            db.close()

def decode_token(token: str):
    """Decodes JWT access token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except Exception:
        return None
