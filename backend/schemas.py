from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# --- User Schemas ---
class UserBase(BaseModel):
    email: EmailStr
    role: str = "developer"

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# --- Policy Schemas ---
class PolicyBase(BaseModel):
    name: str
    description: Optional[str] = None
    rego_code: str
    is_active: bool = True

class PolicyCreate(PolicyBase):
    pass

class Policy(PolicyBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True

# --- Scan Result Schemas ---
class ScanResultBase(BaseModel):
    repository_name: str
    commit_sha: str
    status: str
    details: str

class ScanResultCreate(ScanResultBase):
    pass

class ScanResult(ScanResultBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True
