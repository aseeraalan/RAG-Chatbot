from datetime import datetime, timedelta, timezone

import jwt

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import (
    HTTPBearer,
    HTTPAuthorizationCredentials,
)

from jwt.exceptions import InvalidTokenError
from pwdlib import PasswordHash
from pydantic import BaseModel
from pydantic_settings import (
    BaseSettings,
    SettingsConfigDict,
)

from agent_runner import run_agent


# --------------------------------------------------
# Create FastAPI app
# --------------------------------------------------

app = FastAPI()


# --------------------------------------------------
# Frontend addresses allowed to call backend
# --------------------------------------------------

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# Authentication settings loaded from .env
# --------------------------------------------------

class Settings(BaseSettings):

    secret_key: str

    algorithm: str = "HS256"

    access_token_expire_minutes: int = 30


    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )


settings = Settings()


# --------------------------------------------------
# Password hashing
# --------------------------------------------------

password_hash = (
    PasswordHash.recommended()
)


# --------------------------------------------------
# Read Authorization: Bearer <token>
# --------------------------------------------------

security = HTTPBearer()


# --------------------------------------------------
# Temporary fake user database
# --------------------------------------------------

users = {}


# --------------------------------------------------
# Pydantic schemas
# --------------------------------------------------

class EchoRequest(BaseModel):

    message: str


class EchoResponse(BaseModel):

    message: str


class SignupRequest(BaseModel):

    username: str

    password: str


class LoginRequest(BaseModel):

    username: str

    password: str


class TokenResponse(BaseModel):

    access_token: str

    token_type: str


# --------------------------------------------------
# Create JWT access token
# --------------------------------------------------

def create_access_token(
    username: str
):

    expiration = (
        datetime.now(
            timezone.utc
        )
        + timedelta(
            minutes=(
                settings.access_token_expire_minutes
            )
        )
    )


    payload = {
        "sub": username,
        "exp": expiration,
    }


    token = jwt.encode(
        payload,

        settings.secret_key,

        algorithm=settings.algorithm,
    )


    return token


# --------------------------------------------------
# Get currently authenticated user
# --------------------------------------------------

def get_current_user(
    credentials: HTTPAuthorizationCredentials
    = Depends(security),
):

    token = (
        credentials.credentials
    )


    try:

        payload = jwt.decode(
            token,

            settings.secret_key,

            algorithms=[
                settings.algorithm
            ],
        )


        username = payload.get(
            "sub"
        )


        if username is None:

            raise HTTPException(
                status_code=(
                    status.HTTP_401_UNAUTHORIZED
                ),

                detail="Invalid token",
            )


    except InvalidTokenError:

        raise HTTPException(
            status_code=(
                status.HTTP_401_UNAUTHORIZED
            ),

            detail=(
                "Invalid or expired token"
            ),
        )


    if username not in users:

        raise HTTPException(
            status_code=(
                status.HTTP_401_UNAUTHORIZED
            ),

            detail=(
                "User does not exist"
            ),
        )


    return username


# --------------------------------------------------
# Basic routes
# --------------------------------------------------

@app.get("/")
async def root():

    return {
        "message": "Hello World"
    }


@app.get("/hello")
async def hello():

    return {
        "message": "Hello from FastAPI!"
    }


# --------------------------------------------------
# Signup route
# --------------------------------------------------

@app.post("/auth/signup")
async def signup(
    request: SignupRequest
):

    if request.username in users:

        raise HTTPException(
            status_code=400,

            detail=(
                "Username already exists"
            ),
        )


    hashed_password = (
        password_hash.hash(
            request.password
        )
    )


    users[request.username] = {
        "username": request.username,

        "hashed_password":
            hashed_password,
    }


    return {
        "message":
            "Account created successfully"
    }


# --------------------------------------------------
# Login route
# --------------------------------------------------

@app.post(
    "/auth/login",

    response_model=TokenResponse,
)
async def login(
    request: LoginRequest
):

    user = users.get(
        request.username
    )


    if user is None:

        raise HTTPException(
            status_code=401,

            detail=(
                "Incorrect username "
                "or password"
            ),
        )


    password_is_correct = (
        password_hash.verify(
            request.password,

            user[
                "hashed_password"
            ],
        )
    )


    if not password_is_correct:

        raise HTTPException(
            status_code=401,

            detail=(
                "Incorrect username "
                "or password"
            ),
        )


    token = create_access_token(
        request.username
    )


    return {
        "access_token": token,
        "token_type": "bearer",
    }


# --------------------------------------------------
# Protected ADK Agent route
# --------------------------------------------------

@app.post(
    "/echo",

    response_model=EchoResponse,
)
async def echo(
    request: EchoRequest,

    current_user: str = Depends(
        get_current_user
    ),
):

    # Do not send empty messages to the agent.
    if not request.message.strip():

        raise HTTPException(
            status_code=400,

            detail=(
                "Message cannot be empty"
            ),
        )


    try:

        # ------------------------------------------
        # Send the user's message to ADK
        # ------------------------------------------

        answer = await run_agent(
            message=request.message,
            user_id=current_user,
        )


        # ------------------------------------------
        # Return the agent's response
        # ------------------------------------------

        return {
            "message": answer
        }


    except Exception as error:

        # Show actual error in FastAPI terminal
        # for debugging.
        print(
            f"Agent error: {error}"
        )


        # Send a clean error to frontend.
        raise HTTPException(
            status_code=503,

            detail=(
                "The AI assistant is "
                "temporarily unavailable. "
                "Please try again."
            ),
        )