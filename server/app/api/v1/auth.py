import os
import time
import secrets
import httpx
from urllib.parse import quote_plus
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db
from app.core.config import settings
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)) -> User:
    """Register a new user."""
    # Check if username already taken
    result = await db.execute(select(User).where(User.username == user_in.username))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered",
        )

    hashed = hash_password(user_in.password)
    user = User(username=user_in.username, hashed_password=hashed)
    db.add(user)
    await db.flush()
    return user


@router.post("/token")
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
) -> dict[str, str]:
    """Obtain a JWT access token using username and password."""
    result = await db.execute(select(User).where(User.username == form_data.username))
    user = result.scalar_one_or_none()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(subject=user.id)
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/42/login")
async def login_42() -> RedirectResponse:
    if not settings.FOURTYTWO_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="42 Client ID is not configured.",
        )
    authorize_url = (
        f"https://api.intra.42.fr/oauth/authorize"
        f"?client_id={settings.FOURTYTWO_CLIENT_ID}"
        f"&redirect_uri={quote_plus(settings.FOURTYTWO_REDIRECT_URI)}"
        f"&response_type=code"
    )
    return RedirectResponse(url=authorize_url)


@router.get("/42/callback")
async def callback_42(
    code: str,
    db: AsyncSession = Depends(get_db),
) -> RedirectResponse:
    if not settings.FOURTYTWO_CLIENT_ID or not settings.FOURTYTWO_CLIENT_SECRET:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="42 Client credentials are not configured.",
        )

    async with httpx.AsyncClient() as client:
        token_resp = await client.post(
            "https://api.intra.42.fr/oauth/token",
            data={
                "grant_type": "authorization_code",
                "client_id": settings.FOURTYTWO_CLIENT_ID,
                "client_secret": settings.FOURTYTWO_CLIENT_SECRET,
                "code": code,
                "redirect_uri": settings.FOURTYTWO_REDIRECT_URI,
            },
        )
        if token_resp.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to fetch token from 42 API: {token_resp.text}",
            )
        
        token_data = token_resp.json()
        access_token = token_data.get("access_token")

        me_resp = await client.get(
            "https://api.intra.42.fr/v2/me",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        if me_resp.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to fetch user details from 42 API",
            )
        
        me_data = me_resp.json()
        intra_id = me_data.get("id")
        login = me_data.get("login")

        if not intra_id or not login:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid user data returned from 42 API",
            )

        result = await db.execute(select(User).where(User.intra_id == intra_id))
        user = result.scalar_one_or_none()

        if not user:
            result_username = await db.execute(
                select(User).where(User.username == login)
            )
            if result_username.scalar_one_or_none():
                username = f"{login}_42_{secrets.token_hex(2)}"
            else:
                username = login
            random_pw = secrets.token_urlsafe(32)
            hashed = hash_password(random_pw)
            user = User(
                username=username,
                hashed_password=hashed,
                intra_id=intra_id,
            )
            db.add(user)
            await db.flush()

        image_data = me_data.get("image") or {}
        avatar_url = None
        if isinstance(image_data, dict):
            avatar_url = image_data.get("link")
            if not avatar_url:
                avatar_url = image_data.get("versions", {}).get("medium")
        if not avatar_url:
            avatar_url = me_data.get("image_url")

        if avatar_url:
            try:
                img_resp = await client.get(avatar_url)
                if img_resp.status_code == 200:
                    os.makedirs("static/avatars", exist_ok=True)
                    _, ext = os.path.splitext(avatar_url.split("?")[0])
                    if not ext or len(ext) > 5:
                        ext = ".jpg"
                    
                    if user.avatar_path:
                        old_path = user.avatar_path.lstrip("/")
                        if os.path.exists(old_path) and old_path.startswith("static/avatars"):
                            try:
                                os.remove(old_path)
                            except Exception:
                                pass

                    filename = f"{user.id}_avatar_{int(time.time())}{ext}"
                    file_path = f"static/avatars/{filename}"
                    with open(file_path, "wb") as f:
                        f.write(img_resp.content)
                    
                    user.avatar_path = f"/{file_path}"
                    db.add(user)
                    await db.flush()
            except Exception:
                pass

        await db.commit()

        local_token = create_access_token(subject=user.id)

        response = RedirectResponse(url=f"https://localhost/?username={user.username}&id={user.id}")
        response.set_cookie(
            key="access_token",
            value=local_token,
            httponly=True,
            secure=True,
            samesite="lax",
            max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )
        return response


