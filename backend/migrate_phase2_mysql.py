from app.core.database import engine, Base
from app.models.department import Department
from app.models.announcement import Announcement
from app.models.audit_log import AuditLog

def migrate():
    Base.metadata.create_all(bind=engine, tables=[
        Department.__table__,
        Announcement.__table__,
        AuditLog.__table__
    ])
    print("Tablolar başarıyla oluşturuldu: departments, announcements, audit_logs")

if __name__ == "__main__":
    migrate()
