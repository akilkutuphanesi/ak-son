from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# ── OLUŞTURMA ────────────────────────────────────────────────
class RoomCreate(BaseModel):
    name:            str = Field(..., min_length=3, max_length=80)
    topic:           str = Field(..., min_length=3, max_length=120)
    department:      Optional[str] = None
    description:     Optional[str] = Field(None, max_length=500)
    max_participants: int = Field(default=10, ge=2, le=30)
    is_public:       bool = True

# ── KATILIMCI ─────────────────────────────────────────────────
class ParticipantInfo(BaseModel):
    user_id:      int
    display_name: Optional[str]
    avatar_url:   Optional[str]
    joined_at:    datetime

    class Config:
        from_attributes = True

# ── ODA YANITI ────────────────────────────────────────────────
class RoomResponse(BaseModel):
    id:                  int
    name:                str
    topic:               str
    department:          Optional[str]
    description:         Optional[str]
    host_id:             int
    host_name:           Optional[str]
    max_participants:    int
    is_public:           bool
    status:              str
    created_at:          datetime
    participant_count:   int

    class Config:
        from_attributes = True

# ── MESAJ ─────────────────────────────────────────────────────
class MessageCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=500)

class MessageResponse(BaseModel):
    id:           int
    room_id:      int
    sender_id:    Optional[int]
    sender_name:  Optional[str]
    sender_avatar: Optional[str]
    content:      str
    is_system:    bool
    is_hidden:    bool
    sent_at:      datetime

    class Config:
        from_attributes = True

# ── ŞİKAYET ───────────────────────────────────────────────────
class ReportCreate(BaseModel):
    reason:      str = Field(..., pattern="^(spam|offensive|off_topic|other)$")
    description: Optional[str] = Field(None, max_length=500)
    message_id:  Optional[int] = None

class ReportResponse(BaseModel):
    id:          int
    room_id:     int
    reporter_id: int
    reason:      str
    description: Optional[str]
    status:      str
    created_at:  datetime

    class Config:
        from_attributes = True

# ── SEANS ─────────────────────────────────────────────────────
class SessionResponse(BaseModel):
    id:             int
    session_number: int
    type:           str
    started_at:     datetime
    ended_at:       Optional[datetime]
    duration_secs:  int

    class Config:
        from_attributes = True
