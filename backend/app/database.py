from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from app.config import get_settings

settings = get_settings()

# Render/Neon dan la URL como postgres://, pero SQLAlchemy necesita postgresql://
db_url = settings.DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

is_sqlite = db_url.startswith("sqlite")

# connect_args y pool solo aplican según el motor
if is_sqlite:
    engine = create_engine(
        db_url,
        connect_args={"check_same_thread": False},
        echo=False,
    )

    @event.listens_for(engine, "connect")
    def _set_sqlite_pragma(dbapi_connection, _connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()
else:
    # PostgreSQL (Neon, Supabase, Render Postgres...)
    # pool_pre_ping evita conexiones muertas tras el spin-down del plan gratuito
    engine = create_engine(
        db_url,
        pool_pre_ping=True,
        pool_recycle=300,
        echo=False,
    )


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass
