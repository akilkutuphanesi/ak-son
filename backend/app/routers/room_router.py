from fastapi import APIRouter, Depends, HTTPException, status, Query, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from jose import JWTError, jwt

from app.core.database import get_db
from app.routers.auth_router import get_current_user
from app.models.user import User
from app.models.study_room import StudyRoom
from app.models.room_participant import RoomParticipant
from app.models.room_message import RoomMessage
from app.models.room_session import RoomSession
from app.models.room_report import RoomReport
from app.models.room_join_request import RoomJoinRequest
from app.schemas.room import (
    RoomCreate, RoomResponse,
    MessageCreate, MessageResponse,
    ReportCreate, ReportResponse,
    SessionResponse
)

router = APIRouter(prefix="/rooms", tags=["Study Rooms"])


# ── YARDIMCI FONKSİYONLAR ────────────────────────────────────

def room_to_response(room: StudyRoom) -> dict:
    """StudyRoom ORM nesnesini response dict'e çevirir."""
    host_name = None
    if room.host:
        host_name = room.host.display_name or room.host.email.split("@")[0]
    return {
        "id":                room.id,
        "name":              room.name,
        "topic":             room.topic,
        "department":        room.department,
        "description":       room.description,
        "host_id":           room.host_id,
        "host_name":         host_name,
        "max_participants":  room.max_participants,
        "is_public":         room.is_public,
        "status":            room.status,
        "created_at":        room.created_at,
        "participant_count": room.active_participant_count,
    }

def message_to_response(msg: RoomMessage) -> dict:
    sender_name   = None
    sender_avatar = None
    if msg.sender:
        sender_name   = msg.sender.display_name or msg.sender.email.split("@")[0]
        sender_avatar = msg.sender.avatar_url
    return {
        "id":           msg.id,
        "room_id":      msg.room_id,
        "sender_id":    msg.sender_id,
        "sender_name":  sender_name,
        "sender_avatar": sender_avatar,
        "content":      msg.content,
        "is_system":    msg.is_system,
        "is_hidden":    msg.is_hidden,
        "sent_at":      msg.sent_at,
    }


# ── 1. AKTIF ODALARI LİSTELE ─────────────────────────────────

@router.get("", response_model=List[RoomResponse])
def list_rooms(
    department: Optional[str] = Query(None, description="Bölüme göre filtrele"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Aktif/mola durumundaki odaları listeler."""
    query = db.query(StudyRoom).filter(StudyRoom.status != "closed")
    if department:
        query = query.filter(StudyRoom.department == department)
    rooms = query.order_by(StudyRoom.created_at.desc()).all()
    return [room_to_response(r) for r in rooms]


# ── 2. ODA OLUŞTUR ───────────────────────────────────────────

@router.post("", response_model=RoomResponse, status_code=status.HTTP_201_CREATED)
def create_room(
    data: RoomCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Yeni çalışma odası oluşturur. Kullanıcı aynı anda yalnızca 1 aktif oda açabilir."""
    # Zaten aktif odası var mı? Varsa otomatik kapat ve temizle!
    existing_rooms = db.query(StudyRoom).filter(
        StudyRoom.host_id == current_user.id,
        StudyRoom.status != "closed"
    ).all()
    for er in existing_rooms:
        er.status = "closed"
        er.closed_at = datetime.now()
        er.closed_by = current_user.id
        db.query(RoomParticipant).filter(
            RoomParticipant.room_id == er.id,
            RoomParticipant.is_active == True
        ).update({"is_active": False, "left_at": datetime.now()})
    db.commit()

    room = StudyRoom(
        name=data.name,
        topic=data.topic,
        department=data.department or current_user.department,
        description=data.description,
        host_id=current_user.id,
        max_participants=data.max_participants,
        is_public=data.is_public,
    )
    db.add(room)
    db.flush()  # id almak için

    # Host'u otomatik katılımcı olarak ekle
    participant = RoomParticipant(room_id=room.id, user_id=current_user.id)
    db.add(participant)

    # İlk sistem mesajı
    system_msg = RoomMessage(
        room_id=room.id,
        content=f"🏠 Oda oluşturuldu. Hoş geldiniz!",
        is_system=True
    )
    db.add(system_msg)

    # İlk Pomodoro seansını başlat
    session = RoomSession(room_id=room.id, session_number=1, type="work", duration_secs=1500)
    db.add(session)

    db.commit()
    db.refresh(room)
    return room_to_response(room)


# ── 3. ODA DETAYI ────────────────────────────────────────────

@router.get("/{room_id}", response_model=RoomResponse)
def get_room(
    room_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    room = db.query(StudyRoom).filter(StudyRoom.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Oda bulunamadı")
    return room_to_response(room)


# ── 4. ODAYA KATIL ───────────────────────────────────────────

@router.post("/{room_id}/join", response_model=RoomResponse)
def join_room(
    room_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    room = db.query(StudyRoom).filter(StudyRoom.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Oda bulunamadı")
    if room.status == "closed":
        raise HTTPException(status_code=400, detail="Bu oda kapatılmış")
    
    # Kurucu (host) odaya katılırken kapasite sınırına takılmamalıdır
    if room.active_participant_count >= room.max_participants and room.host_id != current_user.id:
        raise HTTPException(status_code=400, detail="Oda dolu")

    # Mükerrer kayıt önleme: Zaten katılım kaydı var mı (aktif veya pasif)?
    participant = db.query(RoomParticipant).filter(
        RoomParticipant.room_id == room_id,
        RoomParticipant.user_id == current_user.id
    ).first()

    if participant:
        if not participant.is_active:
            participant.is_active = True
            participant.joined_at = datetime.now()
            participant.left_at   = None
            
            # Sistem mesajı
            name = current_user.display_name or current_user.email.split("@")[0]
            msg  = RoomMessage(room_id=room_id, content=f"👋 {name} odaya katıldı.", is_system=True)
            db.add(msg)
    else:
        # Yeni katılımcı kaydı
        participant = RoomParticipant(room_id=room_id, user_id=current_user.id)
        db.add(participant)

        # Sistem mesajı
        name = current_user.display_name or current_user.email.split("@")[0]
        msg  = RoomMessage(room_id=room_id, content=f"👋 {name} odaya katıldı.", is_system=True)
        db.add(msg)

    db.commit()
    db.refresh(room)
    return room_to_response(room)


# ── 5. ODADAN AYRIL ──────────────────────────────────────────

@router.post("/{room_id}/leave")
def leave_room(
    room_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    room = db.query(StudyRoom).filter(StudyRoom.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Oda bulunamadı")

    participant = db.query(RoomParticipant).filter(
        RoomParticipant.room_id == room_id,
        RoomParticipant.user_id == current_user.id,
        RoomParticipant.is_active == True
    ).first()

    if participant:
        participant.is_active = False
        participant.left_at   = datetime.now()

        name = current_user.display_name or current_user.email.split("@")[0]
        msg  = RoomMessage(room_id=room_id, content=f"👋 {name} odadan ayrıldı.", is_system=True)
        db.add(msg)

    db.commit()
    return {"message": "Odadan ayrıldınız"}


# ── 6. ODAYI KAPAT (Host veya Admin) ─────────────────────────

@router.post("/{room_id}/close")
async def close_room(
    room_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    room = db.query(StudyRoom).filter(StudyRoom.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Oda bulunamadı")

    if room.host_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Sadece oda sahibi veya admin kapatabilir")

    room.status    = "closed"
    room.closed_at = datetime.now()
    room.closed_by = current_user.id

    # Tüm aktif katılımcıları çıkar
    db.query(RoomParticipant).filter(
        RoomParticipant.room_id == room_id,
        RoomParticipant.is_active == True
    ).update({"is_active": False, "left_at": datetime.now()})

    msg = RoomMessage(room_id=room_id, content="🔒 Oda kapatıldı.", is_system=True)
    db.add(msg)
    db.commit()

    # Real-time WebSocket Bildirimi: Odanın kapatıldığını tüm üyelere duyur
    await manager.broadcast(room_id, {
        "type": "room_closed",
        "timestamp": datetime.now().isoformat()
    })

    return {"message": "Oda kapatıldı"}



# ── 7. MESAJ GEÇMİŞİ ─────────────────────────────────────────

@router.get("/{room_id}/messages")
def get_messages(
    room_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    room = db.query(StudyRoom).filter(StudyRoom.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Oda bulunamadı")

    messages = (
        db.query(RoomMessage)
        .filter(RoomMessage.room_id == room_id, RoomMessage.is_hidden == False)
        .order_by(RoomMessage.sent_at.asc())
        .offset(skip).limit(limit)
        .all()
    )
    return [message_to_response(m) for m in messages]


# ── 8. MESAJ GÖNDER (HTTP — Faz 2'de WS ile değişecek) ───────

@router.post("/{room_id}/messages")
def send_message(
    room_id: int,
    data: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    room = db.query(StudyRoom).filter(StudyRoom.id == room_id).first()
    if not room or room.status == "closed":
        raise HTTPException(status_code=400, detail="Aktif bir oda bulunamadı")

    # Odada aktif mi?
    participant = db.query(RoomParticipant).filter(
        RoomParticipant.room_id == room_id,
        RoomParticipant.user_id == current_user.id,
        RoomParticipant.is_active == True
    ).first()
    if not participant:
        raise HTTPException(status_code=403, detail="Bu odada değilsiniz")

    msg = RoomMessage(room_id=room_id, sender_id=current_user.id, content=data.content)
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return message_to_response(msg)


# ── 9. KATILIMCİ LİSTESİ ─────────────────────────────────────

@router.get("/{room_id}/participants")
def get_participants(
    room_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    participants = db.query(RoomParticipant).filter(
        RoomParticipant.room_id == room_id,
        RoomParticipant.is_active == True
    ).all()
    return [
        {
            "user_id":      p.user_id,
            "display_name": p.user.display_name or p.user.email.split("@")[0] if p.user else "Anonim",
            "avatar_url":   p.user.avatar_url if p.user else None,
            "joined_at":    p.joined_at,
        }
        for p in participants
    ]


# ── 10. ŞİKAYET ──────────────────────────────────────────────

@router.post("/{room_id}/reports", status_code=status.HTTP_201_CREATED)
def report_room(
    room_id: int,
    data: ReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    room = db.query(StudyRoom).filter(StudyRoom.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Oda bulunamadı")

    report = RoomReport(
        room_id=room_id,
        message_id=data.message_id,
        reporter_id=current_user.id,
        reason=data.reason,
        description=data.description,
    )
    db.add(report)
    db.commit()
    return {"message": "Şikayetiniz alındı, incelenecektir."}


# ── 11. MEVCUT SEANS BİLGİSİ ─────────────────────────────────

@router.get("/{room_id}/session")
def get_current_session(
    room_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = (
        db.query(RoomSession)
        .filter(RoomSession.room_id == room_id, RoomSession.ended_at == None)
        .order_by(RoomSession.started_at.desc())
        .first()
    )
    if not session:
        raise HTTPException(status_code=404, detail="Aktif seans yok")
    return {
        "id":             session.id,
        "session_number": session.session_number,
        "type":           session.type,
        "started_at":     session.started_at,
        "duration_secs":  session.duration_secs,
    }


# ── 12. ADMİN: TÜM ODALAR ────────────────────────────────────

@router.get("/admin/all")
def admin_list_rooms(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Yalnızca adminler erişebilir")
    rooms = db.query(StudyRoom).order_by(StudyRoom.created_at.desc()).all()
    return [room_to_response(r) for r in rooms]


# ── 13. ADMİN: ODAYI ZORLA KAPAT ─────────────────────────────

@router.post("/admin/{room_id}/force-close")
def admin_force_close(
    room_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Yalnızca adminler erişebilir")

    room = db.query(StudyRoom).filter(StudyRoom.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Oda bulunamadı")

    room.status    = "closed"
    room.closed_at = datetime.now()
    room.closed_by = current_user.id

    db.query(RoomParticipant).filter(
        RoomParticipant.room_id == room_id,
        RoomParticipant.is_active == True
    ).update({"is_active": False, "left_at": datetime.now()})

    msg = RoomMessage(room_id=room_id, content="🔒 Oda yönetici tarafından kapatıldı.", is_system=True)
    db.add(msg)
    db.commit()
    return {"message": "Oda zorla kapatıldı"}


# ── 14. ADMİN: ŞİKAYETLERİ LİSTELE ──────────────────────────

@router.get("/admin/reports")
def admin_list_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Yalnızca adminler erişebilir")
    reports = db.query(RoomReport).order_by(RoomReport.created_at.desc()).all()
    return [
        {
            "id":          r.id,
            "room_id":     r.room_id,
            "reporter":    r.reporter.display_name or r.reporter.email.split("@")[0] if r.reporter else "Anonim",
            "reason":      r.reason,
            "description": r.description,
            "status":      r.status,
            "created_at":  r.created_at,
        }
        for r in reports
    ]


# ── 15. ADMİN: ŞİKAYETİ ÇÖZÜMLÜ İŞARETLE ────────────────────

@router.patch("/admin/reports/{report_id}")
def admin_resolve_report(
    report_id: int,
    action: str = Query(..., pattern="^(resolved|dismissed)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Yalnızca adminler erişebilir")

    report = db.query(RoomReport).filter(RoomReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Şikayet bulunamadı")

    report.status      = action
    report.resolved_by = current_user.id
    db.commit()
    return {"message": f"Şikayet '{action}' olarak işaretlendi"}


# ── 16. ODADAN KULLANICI AT (HOST) ───────────────────────────
@router.post("/{room_id}/kick/{user_id}")
async def kick_participant(
    room_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    room = db.query(StudyRoom).filter(StudyRoom.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Oda bulunamadı")

    if room.host_id != current_user.id:
        raise HTTPException(status_code=403, detail="Yalnızca oda sahibi katılımcıları atabilir")

    if user_id == room.host_id:
        raise HTTPException(status_code=400, detail="Kendinizi odadan atamazsınız")

    participant = db.query(RoomParticipant).filter(
        RoomParticipant.room_id == room_id,
        RoomParticipant.user_id == user_id,
        RoomParticipant.is_active == True
    ).first()

    if not participant:
        raise HTTPException(status_code=404, detail="Katılımcı odada bulunamadı")

    participant.is_active = False
    participant.left_at   = datetime.now()

    # Sistem mesajı
    kicked_user = db.query(User).filter(User.id == user_id).first()
    name = kicked_user.display_name or kicked_user.email.split("@")[0] if kicked_user else "Bilinmeyen Kullanıcı"
    msg  = RoomMessage(room_id=room_id, content=f"🚫 {name} odadan atıldı.", is_system=True)
    db.add(msg)
    db.commit()

    # Real-time WebSocket Bildirimleri
    await manager.send_to_user(room_id, user_id, {"type": "kicked"})
    await manager.broadcast(room_id, {
        "type": "system",
        "content": f"🚫 {name} odadan atıldı.",
        "timestamp": datetime.now().isoformat()
    })
    await manager.broadcast(room_id, {
        "type": "participants",
        "users": manager.room_users(room_id),
        "count": manager.participant_count(room_id)
    })

    return {"message": f"{name} odadan atıldı"}


# ── 17. ODAYA KATILMA İSTEĞİ GÖNDER ──────────────────────────
@router.post("/{room_id}/request-join")
async def request_join_room(
    room_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    room = db.query(StudyRoom).filter(StudyRoom.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Oda bulunamadı")
    if room.status == "closed":
        raise HTTPException(status_code=400, detail="Bu oda kapatılmış")
    
    # Kurucu (host) odaya katılırken/istek gönderirken kapasite sınırına takılmamalıdır
    if room.active_participant_count >= room.max_participants and room.host_id != current_user.id:
        raise HTTPException(status_code=400, detail="Oda dolu")

    # Oda sahibi ise direkt onaylı sayılır
    if room.host_id == current_user.id:
        return {"status": "already_approved", "message": "Oda sahibisiniz."}

    # Zaten aktif katılımcı ise direkt onaylı sayılır
    existing_participant = db.query(RoomParticipant).filter(
        RoomParticipant.room_id == room_id,
        RoomParticipant.user_id == current_user.id,
        RoomParticipant.is_active == True
    ).first()
    if existing_participant:
        return {"status": "already_approved", "message": "Zaten odadasınız."}

    # Zaten bekleyen bir isteği var mı?
    req = db.query(RoomJoinRequest).filter(
        RoomJoinRequest.room_id == room_id,
        RoomJoinRequest.user_id == current_user.id,
        RoomJoinRequest.status == "pending"
    ).first()

    if not req:
        req = RoomJoinRequest(room_id=room_id, user_id=current_user.id, status="pending")
        db.add(req)
        db.commit()
        db.refresh(req)

    # Oda kurucusuna WebSocket üzerinden canlı istek gönder
    display_name = current_user.display_name or current_user.email.split("@")[0]
    avatar_url   = current_user.avatar_url
    await manager.broadcast(room_id, {
        "type": "join_request",
        "request_id": req.id,
        "user_id": current_user.id,
        "display_name": display_name,
        "avatar_url": avatar_url,
        "timestamp": datetime.now().isoformat()
    })

    return {"status": "pending", "request_id": req.id}


# ── 18. BEKLEYEN İSTEKLERİ LİSTELE (HOST İÇİN) ────────────────
@router.get("/{room_id}/pending-requests")
def get_pending_requests(
    room_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    room = db.query(StudyRoom).filter(StudyRoom.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Oda bulunamadı")
    if room.host_id != current_user.id:
        raise HTTPException(status_code=403, detail="Yalnızca oda sahibi istekleri görebilir")

    requests = db.query(RoomJoinRequest).filter(
        RoomJoinRequest.room_id == room_id,
        RoomJoinRequest.status == "pending"
    ).all()

    return [
        {
            "id": r.id,
            "user_id": r.user_id,
            "display_name": r.user.display_name or r.user.email.split("@")[0] if r.user else "Bilinmeyen Kullanıcı",
            "avatar_url": r.user.avatar_url if r.user else None,
            "created_at": r.created_at
        }
        for r in requests
    ]


# ── 19. İSTEĞİ ONAYLA (HOST) ─────────────────────────────────
@router.post("/requests/{request_id}/approve")
async def approve_join_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    req = db.query(RoomJoinRequest).filter(RoomJoinRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="İstek bulunamadı")

    room = db.query(StudyRoom).filter(StudyRoom.id == req.room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Oda bulunamadı")

    if room.host_id != current_user.id:
        raise HTTPException(status_code=403, detail="Yalnızca oda sahibi istekleri onaylayabilir")

    if req.status != "pending":
        raise HTTPException(status_code=400, detail="Bu istek zaten sonuçlandırılmış")

    # Katılımcıyı odaya ekle
    req.status = "approved"
    
    # Mükerrer kayıt önleme: Zaten katılım kaydı var mı (aktif veya pasif)?
    participant = db.query(RoomParticipant).filter(
        RoomParticipant.room_id == req.room_id,
        RoomParticipant.user_id == req.user_id
    ).first()
    
    if participant:
        if not participant.is_active:
            participant.is_active = True
            participant.joined_at = datetime.now()
            participant.left_at   = None
            
            # Sistem mesajı
            name = req.user.display_name or req.user.email.split("@")[0] if req.user else "Bilinmeyen"
            msg = RoomMessage(room_id=req.room_id, content=f"👋 {name} odaya katıldı.", is_system=True)
            db.add(msg)
    else:
        # Yeni katılımcı kaydı
        participant = RoomParticipant(room_id=req.room_id, user_id=req.user_id)
        db.add(participant)

        # Sistem mesajı
        name = req.user.display_name or req.user.email.split("@")[0] if req.user else "Bilinmeyen"
        msg = RoomMessage(room_id=req.room_id, content=f"👋 {name} odaya katıldı.", is_system=True)
        db.add(msg)

    db.commit()

    # Canlı bildirim gönder: İstek gönderen kullanıcıyı yönlendir ve odayı güncelle
    await manager.broadcast(req.room_id, {
        "type": "request_approved",
        "request_id": request_id,
        "user_id": req.user_id
    })

    # Katılımcı listesini güncelle
    await manager.broadcast(req.room_id, {
        "type": "participants",
        "users": manager.room_users(req.room_id),
        "count": manager.participant_count(req.room_id),
    })

    return {"message": "Katılım isteği onaylandı."}


# ── 20. İSTEĞİ REDDET (HOST) ──────────────────────────────────
@router.post("/requests/{request_id}/reject")
async def reject_join_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    req = db.query(RoomJoinRequest).filter(RoomJoinRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="İstek bulunamadı")

    room = db.query(StudyRoom).filter(StudyRoom.id == req.room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Oda bulunamadı")

    if room.host_id != current_user.id:
        raise HTTPException(status_code=403, detail="Yalnızca oda sahibi istekleri reddedebilir")

    if req.status != "pending":
        raise HTTPException(status_code=400, detail="Bu istek zaten sonuçlandırılmış")

    req.status = "rejected"
    db.commit()

    # Canlı bildirim gönder
    await manager.broadcast(req.room_id, {
        "type": "request_rejected",
        "request_id": request_id,
        "user_id": req.user_id
    })

    return {"message": "Katılım isteği reddedildi."}


# ══════════════════════════════════════════════════════════════
# ══  FAZ 2: WEBSOCKET  ═══════════════════════════════════════
# ══════════════════════════════════════════════════════════════

from app.core.ws_manager import manager
from app.core.security import SECRET_KEY, ALGORITHM
from app.core.database import SessionLocal
from app.repositories import user_repo


def _ws_get_db():
    """WebSocket için ayrı DB session (Depends kullanılamaz)."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _ws_verify_token(token: str, db: Session):
    """JWT token doğrulama — WS bağlantısında kullanılır."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return None
    except JWTError:
        return None
    return user_repo.get_user_by_email(db, email=email)


@router.websocket("/ws/{room_id}")
async def room_websocket(websocket: WebSocket, room_id: int):
    """
    Çalışma odası WebSocket bağlantısı.
    Bağlantı: ws://host/rooms/ws/{room_id}?token=JWT_TOKEN

    Gelen mesaj tipleri (client → server):
      { "type": "chat",  "content": "Merhaba!" }
      { "type": "timer", "action": "start|pause|reset", "duration": 1500 }

    Giden mesaj tipleri (server → client):
      { "type": "chat",        ... }
      { "type": "system",      ... }
      { "type": "timer",       ... }
      { "type": "participants", "users": [...] }
    """
    # ── 1. Token doğrula ──────────────────────────────────────
    # WebSocket query params fonksiyon argümanı olarak gelmiyor
    token = websocket.query_params.get("token", "")

    db_gen = _ws_get_db()
    db = next(db_gen)

    user = _ws_verify_token(token, db)
    if not user:
        await websocket.close(code=4001, reason="Geçersiz token")
        try:
            next(db_gen)
        except StopIteration:
            pass
        return

    display_name = user.display_name or user.email.split("@")[0]
    avatar_url   = user.avatar_url

    # ── 2. Oda var mı, açık mı? ──────────────────────────────
    room = db.query(StudyRoom).filter(StudyRoom.id == room_id).first()
    if not room or room.status == "closed":
        await websocket.close(code=4002, reason="Oda kapalı veya bulunamadı")
        try:
            next(db_gen)
        except StopIteration:
            pass
        return

    # ── 3. Bağlan ─────────────────────────────────────────────
    await manager.connect(room_id, websocket, user.id, display_name, avatar_url)

    # Katılımcıyı veritabanında aktif yap (senkronizasyon için)
    try:
        participant = db.query(RoomParticipant).filter(
            RoomParticipant.room_id == room_id,
            RoomParticipant.user_id == user.id
        ).first()
        if participant:
            participant.is_active = True
            db.commit()
    except Exception as db_err:
        print(f"WS connect DB update error: {db_err}")

    # Bağlanan kullanıcıya güncel süreyi hemen gönder (senkronizasyon için)
    timer_state = manager.get_timer_state(room_id)
    await websocket.send_json({
        "type": "timer",
        "action": "sync",
        "is_running": timer_state["is_running"],
        "duration": timer_state["duration"],
        "remaining": timer_state["remaining"],
        "timer_type": timer_state["timer_type"],
        "session": timer_state["session"],
    })

    # Katılım bildirimini broadcast et
    await manager.broadcast(room_id, {
        "type": "system",
        "content": f"👋 {display_name} odaya bağlandı.",
        "timestamp": datetime.now().isoformat(),
    })

    # Güncel katılımcı listesini gönder
    await manager.broadcast(room_id, {
        "type": "participants",
        "users": manager.room_users(room_id),
        "count": manager.participant_count(room_id),
    })

    # ── 4. Mesaj döngüsü ─────────────────────────────────────
    try:
        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type", "")

            if msg_type == "chat":
                content = data.get("content", "").strip()
                if not content or len(content) > 500:
                    continue

                # DB'ye kaydet
                db_msg = RoomMessage(
                    room_id=room_id,
                    sender_id=user.id,
                    content=content,
                )
                db.add(db_msg)
                db.commit()
                db.refresh(db_msg)

                # Broadcast
                await manager.broadcast(room_id, {
                    "type":        "chat",
                    "id":          db_msg.id,
                    "sender_id":   user.id,
                    "sender_name": display_name,
                    "sender_avatar": avatar_url,
                    "content":     content,
                    "timestamp":   db_msg.sent_at.isoformat(),
                })

            elif msg_type == "timer":
                # Timer'ı sadece oda sahibi değiştirebilir!
                if user.id != room.host_id:
                    continue

                action = data.get("action", "sync")
                duration = data.get("duration")
                remaining = data.get("remaining")
                timer_type = data.get("timer_type")
                session = data.get("session")

                manager.update_timer(
                    room_id=room_id,
                    action=action,
                    duration=duration,
                    remaining=remaining,
                    timer_type=timer_type,
                    session=session
                )

                # Güncel durumu tüm odaya ilet
                state = manager.get_timer_state(room_id)
                await manager.broadcast(room_id, {
                    "type":       "timer",
                    "action":     action,
                    "is_running": state["is_running"],
                    "duration":   state["duration"],
                    "remaining":  state["remaining"],
                    "timer_type": state["timer_type"],
                    "session":    state["session"],
                    "by":         display_name,
                    "timestamp":  datetime.now().isoformat(),
                })

    except WebSocketDisconnect:
        pass
    except Exception:
        pass
    finally:
        # ── 5. Bağlantı koptu ────────────────────────────────
        manager.disconnect(room_id, websocket)

        # Katılımcıyı veritabanında pasif yap (Çok önemli!)
        try:
            participant = db.query(RoomParticipant).filter(
                RoomParticipant.room_id == room_id,
                RoomParticipant.user_id == user.id,
                RoomParticipant.is_active == True
            ).first()
            if participant:
                participant.is_active = False
                participant.left_at   = datetime.now()
                db.commit()
        except Exception as db_err:
            print(f"WS disconnect DB update error: {db_err}")

        await manager.broadcast(room_id, {
            "type": "system",
            "content": f"👋 {display_name} ayrıldı.",
            "timestamp": datetime.now().isoformat(),
        })
        await manager.broadcast(room_id, {
            "type": "participants",
            "users": manager.room_users(room_id),
            "count": manager.participant_count(room_id),
        })

        try:
            next(db_gen)
        except StopIteration:
            pass

