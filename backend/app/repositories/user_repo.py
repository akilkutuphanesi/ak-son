from sqlalchemy.orm import Session, selectinload
from sqlalchemy import func
from app.models.user import User
from app.schemas.user import UserCreate
from app.core.security import get_password_hash

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def get_user_by_id(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

def get_all_users(db: Session):
    return db.query(User).all()

def get_all_users_with_relations(db: Session):
    return db.query(User).options(selectinload(User.questions), selectinload(User.answers)).all()

def get_user_by_username(db: Session, username: str):
    # Only match by email prefix because it's unique and contains no spaces (e.g. ahmet@iste.edu.tr -> @ahmet)
    return db.query(User).filter(func.lower(User.email).startswith(username.lower() + "@")).first()

def create_user(db: Session, user: UserCreate):
    # Şifreyi şifrele
    hashed_password = get_password_hash(user.password)
    
    # Kullanıcıyı oluştur (Department ve Display Name ile birlikte)
    db_user = User(
        email=user.email, 
        hashed_password=hashed_password,
        department=user.department,
        display_name=user.display_name,
        is_active=True
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user