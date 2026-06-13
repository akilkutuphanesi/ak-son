from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any
from datetime import datetime, timedelta
import os
import json
from pydantic import BaseModel

from app.core.database import get_db
from app.routers.auth_router import get_current_user
from app.models.user import User
from app.models.question import Question
from app.models.answer import Answer
from app.models.department import Department
from app.models.announcement import Announcement
from app.models.audit_log import AuditLog
from app.models.room_report import RoomReport
from app.models.study_room import StudyRoom
from app.schemas.user import UserResponse

router = APIRouter(prefix="/admin", tags=["Admin"])

# Admin yetkisi kontrolü için yardımcı fonksiyon
def check_admin(current_user: User):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu işleme yetkiniz yok. Sadece yöneticiler erişebilir."
        )

# 1. DİNAMİK İSTATİSTİKLER (Dashboard İçin)
@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_admin(current_user)
    
    # İstatistikleri veritabanından çek
    total_users = db.query(User).count()
    total_questions = db.query(Question).count()
    
    # Çözülen Sorular (En az 1 cevabı olan benzersiz soru sayısı)
    solved_questions = db.query(Answer.question_id).distinct().count()
    
    # Basit bir simülasyon (Gerçek dünyada aktif kullanıcıyı Redis ile vb. tutarız)
    active_users = db.query(User).filter(User.is_active == True).count()
    
    return {
        "stats": [
            { "title": "Toplam Kullanıcı", "value": str(total_users), "increase": "+1", "color": "text-blue-400" },
            { "title": "Aktif Hesap", "value": str(active_users), "increase": "Tümü", "color": "text-emerald-400" },
            { "title": "Toplam İçerik", "value": str(total_questions), "increase": "+1", "color": "text-amber-400" },
            { "title": "Çözülen Sorular", "value": str(solved_questions), "increase": "+1", "color": "text-purple-400" }
        ]
    }

@router.get("/stats/chart")
def get_chart_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    check_admin(current_user)
    today = datetime.now().date()
    data = []
    days_tr = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"]
    for i in range(6, -1, -1):
        target_date = today - timedelta(days=i)
        q_count = db.query(Question).filter(func.date(Question.created_at) == target_date).count()
        a_count = db.query(Answer).filter(func.date(Answer.created_at) == target_date).count()
        val = q_count + a_count
        data.append({
            "day": days_tr[target_date.weekday()],
            "val": val if val > 0 else 5 # Show a tiny bar even if 0
        })
    return data

# 2. TÜM KULLANICILAR (UsersTab İçin)
@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_admin(current_user)
    
    users = db.query(User).all()
    return users

class UserUpdateDTO(BaseModel):
    name: str
    email: str
    no: str
    dept: str
    reputation: int
    badge: str

@router.put("/users/{user_id}")
def update_user(user_id: int, dto: UserUpdateDTO, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    check_admin(current_user)
    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    u.display_name = dto.name
    u.email = dto.email
    u.department = dto.dept
    u.manual_reputation = dto.reputation
    u.manual_badge = dto.badge
    db.commit()
    return {"message": "Kullanıcı güncellendi"}

class BulkDeleteDTO(BaseModel):
    ids: List[int]

@router.post("/users/bulk-delete")
def bulk_delete_users(dto: BulkDeleteDTO, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    check_admin(current_user)
    db.query(User).filter(User.id.in_(dto.ids)).delete(synchronize_session=False)
    db.commit()
    return {"message": f"{len(dto.ids)} kullanıcı silindi"}

# 3. İÇERİKLER (ContentTab İçin - Sorular)
@router.get("/contents")
def get_all_contents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_admin(current_user)
    
    questions = db.query(Question).all()
    
    result = []
    for q in questions:
        author_name = q.owner.display_name if q.owner and q.owner.display_name else (q.owner.email.split('@')[0] if q.owner else "İsimsiz")
        
        result.append({
            "id": q.id,
            "author": author_name,
            "title": q.title,
            "content": q.content,
            "reports": 0, # Şimdilik sahte
            "status": "Askıya Alındı" if q.is_suspended else "Yayında",
            "category": "Genel", # Question modelinde şimdilik kategori yok
            "date": q.created_at.strftime("%d.%m.%Y %H:%M") if q.created_at else "Bilinmiyor"
        })
        
    # Tarihe göre en yeniler üstte olsun diye ters çeviriyoruz
    result.reverse()
    return result

# 4. İÇERİK SİLME
from app.models.notification import Notification
from app.models.favorite import Favorite

@router.delete("/contents/{content_id}")
def delete_content(
    content_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_admin(current_user)
    
    question = db.query(Question).filter(Question.id == content_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="İçerik bulunamadı")
        
    # Soruya ait tüm verileri sil
    db.query(Notification).filter(Notification.question_id == question.id).delete(synchronize_session=False)
    db.query(Answer).filter(Answer.question_id == question.id).delete(synchronize_session=False)
    db.query(Favorite).filter(Favorite.question_id == question.id).delete(synchronize_session=False)
    
    db.delete(question)
    db.commit()
    
    return {"message": "İçerik başarıyla silindi"}

# 5. İÇERİK ASKIYA ALMA / YAYINA ALMA
@router.patch("/contents/{content_id}/toggle-status")
def toggle_content_status(
    content_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_admin(current_user)
    
    question = db.query(Question).filter(Question.id == content_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="İçerik bulunamadı")
        
    question.is_suspended = not question.is_suspended
    db.commit()
    
    return {"message": "İçerik durumu güncellendi", "new_status": "Askıya Alındı" if question.is_suspended else "Yayında"}

@router.post("/contents/bulk-delete")
def bulk_delete_contents(dto: BulkDeleteDTO, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    check_admin(current_user)
    for q_id in dto.ids:
        db.query(Notification).filter(Notification.question_id == q_id).delete(synchronize_session=False)
        db.query(Answer).filter(Answer.question_id == q_id).delete(synchronize_session=False)
        db.query(Favorite).filter(Favorite.question_id == q_id).delete(synchronize_session=False)
    db.query(Question).filter(Question.id.in_(dto.ids)).delete(synchronize_session=False)
    db.commit()
    return {"message": "Seçili içerikler silindi"}

@router.get("/contents/{content_id}/answers")
def get_content_answers(content_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    check_admin(current_user)
    answers = db.query(Answer).filter(Answer.question_id == content_id).all()
    return [{"id": a.id, "content": a.content, "author": a.owner.display_name if a.owner and a.owner.display_name else "Bilinmiyor", "is_hidden": a.is_hidden} for a in answers]

@router.delete("/answers/{answer_id}")
def delete_answer_admin(answer_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    check_admin(current_user)
    db.query(Answer).filter(Answer.id == answer_id).delete()
    db.commit()
    return {"message": "Yanıt silindi"}

@router.patch("/answers/{answer_id}/hide")
def hide_answer_admin(answer_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    check_admin(current_user)
    ans = db.query(Answer).filter(Answer.id == answer_id).first()
    if ans:
        ans.is_hidden = not ans.is_hidden
        db.commit()
        return {"message": "Yanıt durumu değiştirildi", "is_hidden": ans.is_hidden}
    raise HTTPException(status_code=404)

# AYARLAR (JSON BASED)
SETTINGS_FILE = os.path.join(os.path.dirname(__file__), "..", "core", "settings.json")

def get_settings_data():
    if not os.path.exists(SETTINGS_FILE):
        return {"maintenance": False, "registrations": True, "autoBan": False, "bannedWords": "küfür, argo, reklam"}
    with open(SETTINGS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

@router.get("/settings")
def get_admin_settings(current_user: User = Depends(get_current_user)):
    check_admin(current_user)
    return get_settings_data()

@router.post("/settings")
def save_admin_settings(settings: dict, current_user: User = Depends(get_current_user)):
    check_admin(current_user)
    with open(SETTINGS_FILE, "w", encoding="utf-8") as f:
        json.dump(settings, f, ensure_ascii=False, indent=2)
    return {"message": "Ayarlar kaydedildi"}

# ----------------- FAZ 2 ENDPOINTLERI -----------------

class DepartmentDTO(BaseModel):
    name: str

@router.get("/departments")
def get_departments(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    check_admin(current_user)
    depts = db.query(Department).all()
    return [{"id": d.id, "name": d.name, "students": d.students, "status": "Aktif" if d.is_active else "Pasif"} for d in depts]

@router.post("/departments")
def add_department(dto: DepartmentDTO, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    check_admin(current_user)
    d = Department(name=dto.name)
    db.add(d)
    db.commit()
    db.refresh(d)
    return {"id": d.id, "name": d.name, "students": d.students, "status": "Aktif" if d.is_active else "Pasif"}

@router.delete("/departments/{dept_id}")
def delete_department(dept_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    check_admin(current_user)
    db.query(Department).filter(Department.id == dept_id).delete()
    db.commit()
    return {"message": "Bölüm silindi"}

class AnnouncementDTO(BaseModel):
    title: str
    content: str
    priority: str
    target: str

@router.get("/announcements")
def get_announcements(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    check_admin(current_user)
    anns = db.query(Announcement).order_by(Announcement.id.desc()).all()
    return [{
        "id": a.id, "title": a.title, "content": a.content, "priority": a.priority, 
        "target": a.target, "date": a.date.strftime("%d.%m.%Y") if a.date else "",
        "views": 0, "status": "Yayında" if a.is_active else "Taslak"
    } for a in anns]

@router.post("/announcements")
def add_announcement(dto: AnnouncementDTO, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    check_admin(current_user)
    a = Announcement(title=dto.title, content=dto.content, priority=dto.priority, target=dto.target)
    db.add(a)
    db.commit()
    db.refresh(a)
    return {"message": "Duyuru oluşturuldu"}

@router.delete("/announcements/{ann_id}")
def delete_announcement(ann_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    check_admin(current_user)
    db.query(Announcement).filter(Announcement.id == ann_id).delete()
    db.commit()
    return {"message": "Duyuru silindi"}

@router.get("/audit-logs")
def get_audit_logs(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    check_admin(current_user)
    logs = db.query(AuditLog).order_by(AuditLog.id.desc()).limit(100).all()
    return [{
        "id": l.id, "admin": l.admin_name, "action": l.action, "details": l.details,
        "time": l.created_at.strftime("%H:%M") if l.created_at else "",
        "date": l.created_at.strftime("%d.%m.%Y") if l.created_at else ""
    } for l in logs]

@router.get("/study-rooms")
def get_study_rooms(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    check_admin(current_user)
    rooms = db.query(StudyRoom).all()
    return [{
        "id": r.id, "name": r.name, "topic": r.topic, "dept": "Genel", 
        "host": r.owner_id, "participants": len(r.participants) if r.participants else 0, "max": r.capacity, "session": 1,
        "isBreak": False, "isPublic": not r.is_private, "messages": 0, "reports": len(r.reports) if r.reports else 0,
        "status": "active" if r.is_active else "closed", "createdAt": r.created_at.strftime("%H:%M"), "duration": "1s"
    } for r in rooms]

@router.delete("/study-rooms/{room_id}")
def delete_study_room(room_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    check_admin(current_user)
    db.query(StudyRoom).filter(StudyRoom.id == room_id).delete()
    db.commit()
    return {"message": "Oda kapatıldı/silindi"}

@router.get("/study-rooms/reports")
def get_study_room_reports(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    check_admin(current_user)
    reports = db.query(RoomReport).all()
    return [{
        "id": rep.id, "roomId": rep.room_id, "roomName": rep.room.name if rep.room else "Bilinmiyor",
        "reporter": rep.reporter.display_name if rep.reporter and rep.reporter.display_name else "Bilinmiyor", 
        "reason": rep.reason, "message": rep.description,
        "status": rep.status, "time": rep.created_at.strftime("%H:%M") if rep.created_at else ""
    } for rep in reports]

@router.patch("/study-rooms/reports/{rep_id}/{action}")
def update_room_report(rep_id: int, action: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    check_admin(current_user)
    rep = db.query(RoomReport).filter(RoomReport.id == rep_id).first()
    if rep:
        rep.status = "resolved" if action == "resolve" else "dismissed"
        db.commit()
    return {"message": "Durum güncellendi"}
