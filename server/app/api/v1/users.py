import os
import time
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.models.friendship import Friendship
from app.schemas.user import (
    UserResponse,
    UserUpdate,
    UserWithStatusResponse,
    FriendAddRequest,
)
from app.services.online_manager import online_manager

router = APIRouter(prefix="/users", tags=["users"])

UPLOAD_DIR = "static/avatars"
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE = 2 * 1024 * 1024  # 2MB


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)) -> User:
    return current_user


@router.patch("/me", response_model=UserResponse)
async def update_profile(
    user_in: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> User:
    if user_in.username is not None:
        username = user_in.username.strip()
        if not username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username cannot be empty",
            )
        if username != current_user.username:
            result = await db.execute(select(User).where(User.username == username))
            if result.scalar_one_or_none():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Username already taken",
                )
            current_user.username = username
            db.add(current_user)
            await db.flush()

    return current_user


@router.post("/me/avatar", response_model=UserResponse)
async def upload_avatar(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> User:
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    _, ext = os.path.splitext(file.filename or "")
    ext = ext.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file extension. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported content type. Allowed: {', '.join(ALLOWED_MIME_TYPES)}",
        )

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds the 2MB limit",
        )

    if current_user.avatar_path:
        old_path = current_user.avatar_path.lstrip("/")
        if os.path.exists(old_path) and old_path.startswith(UPLOAD_DIR):
            try:
                os.remove(old_path)
            except Exception:
                pass

    filename = f"{current_user.id}_avatar_{int(time.time())}{ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    with open(file_path, "wb") as f:
        f.write(content)

    current_user.avatar_path = f"/{file_path}"
    db.add(current_user)
    await db.flush()

    return current_user


@router.get("/profile/{user_id}", response_model=UserResponse)
async def get_user_profile(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> User:
    """Get public profile info of another user."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return user


@router.get("/friends", response_model=list[UserWithStatusResponse])
async def list_friends(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list:
    result = await db.execute(
        select(User)
        .join(Friendship, Friendship.friend_id == User.id)
        .where(Friendship.user_id == current_user.id)
    )
    friends = result.scalars().all()

    response = []
    for friend in friends:
        response.append(
            {
                "id": friend.id,
                "username": friend.username,
                "level": friend.level,
                "avatar_path": friend.avatar_path,
                "online": online_manager.is_online(friend.id),
            }
        )
    return response


@router.post("/friends/add", status_code=status.HTTP_201_CREATED)
async def add_friend(
    request: FriendAddRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, str]:
    target_username = request.username.strip()
    if target_username == current_user.username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot add yourself as a friend",
        )
    result = await db.execute(select(User).where(User.username == target_username))
    friend = result.scalar_one_or_none()
    if not friend:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    existing = await db.execute(
        select(Friendship).where(
            Friendship.user_id == current_user.id,
            Friendship.friend_id == friend.id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are already friends with this user",
        )

    friendship1 = Friendship(user_id=current_user.id, friend_id=friend.id)
    friendship2 = Friendship(user_id=friend.id, friend_id=current_user.id)
    db.add_all([friendship1, friendship2])
    await db.flush()

    return {"status": "success", "message": f"Successfully added {target_username} as a friend"}


@router.delete("/friends/{friend_id}")
async def remove_friend(
    friend_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, str]:
    result = await db.execute(
        select(Friendship).where(
            Friendship.user_id == current_user.id,
            Friendship.friend_id == friend_id,
        )
    )
    friendship = result.scalar_one_or_none()
    if not friendship:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Friend relationship not found",
        )

    await db.execute(
        delete(Friendship).where(
            (Friendship.user_id == current_user.id) & (Friendship.friend_id == friend_id)
        )
    )
    await db.execute(
        delete(Friendship).where(
            (Friendship.user_id == friend_id) & (Friendship.friend_id == current_user.id)
        )
    )
    await db.flush()

    return {"status": "success", "message": "Successfully removed friend"}
