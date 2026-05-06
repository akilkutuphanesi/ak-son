from sqlalchemy.orm import Session
from app.models.favorite import Favorite

def add_favorite(db: Session, user_id: int, question_id: int = None, answer_id: int = None):
    fav = Favorite(user_id=user_id, question_id=question_id, answer_id=answer_id)
    db.add(fav)
    db.commit()
    db.refresh(fav)
    return fav

def remove_favorite(db: Session, user_id: int, question_id: int = None, answer_id: int = None):
    query = db.query(Favorite).filter(Favorite.user_id == user_id)
    if question_id:
        query = query.filter(Favorite.question_id == question_id)
    if answer_id:
        query = query.filter(Favorite.answer_id == answer_id)
    fav = query.first()
    if fav:
        db.delete(fav)
        db.commit()
        return True
    return False

def is_favorited(db: Session, user_id: int, question_id: int = None, answer_id: int = None):
    query = db.query(Favorite).filter(Favorite.user_id == user_id)
    if question_id:
        query = query.filter(Favorite.question_id == question_id)
    if answer_id:
        query = query.filter(Favorite.answer_id == answer_id)
    return query.first() is not None

def get_favorites_by_user(db: Session, user_id: int):
    return db.query(Favorite).filter(Favorite.user_id == user_id).order_by(Favorite.created_at.desc()).all()

def get_favorite_count(db: Session, question_id: int = None, answer_id: int = None):
    query = db.query(Favorite)
    if question_id:
        query = query.filter(Favorite.question_id == question_id)
    if answer_id:
        query = query.filter(Favorite.answer_id == answer_id)
    return query.count()

def get_favorited_question_ids(db: Session, user_id: int):
    """Kullanıcının favorilediği soru ID'lerini döndür"""
    favs = db.query(Favorite.question_id).filter(
        Favorite.user_id == user_id,
        Favorite.question_id.isnot(None)
    ).all()
    return {f[0] for f in favs}
