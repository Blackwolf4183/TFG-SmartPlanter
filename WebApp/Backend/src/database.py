from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "postgresql://postgres.cdonsnkoajckoaeybgay:49Aa1GCuzXwq3Tak@aws-0-eu-west-2.pooler.supabase.com:5432/postgres"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()