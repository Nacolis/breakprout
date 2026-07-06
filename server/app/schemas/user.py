from typing import Optional
from pydantic import BaseModel


class UserBase(BaseModel):
    username: str


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: int
    level: int
    avatar_path: Optional[str] = None

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    username: Optional[str] = None


class UserWithStatusResponse(UserResponse):
    online: bool


class FriendAddRequest(BaseModel):
    username: str

