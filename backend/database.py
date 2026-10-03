import os
import datetime
import pandas as pd
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import declarative_base, sessionmaker, relationship

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(BACKEND_DIR)
DB_PATH = os.path.join(BACKEND_DIR, "coconut_system.db")

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    predictions = relationship("PredictionRecord", back_populates="user")

class PredictionRecord(Base):
    __tablename__ = "predictions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    filename = Column(String(255), nullable=False)
    prediction = Column(String(50), nullable=False)
    confidence = Column(Float, nullable=False)
    quality_score = Column(Float, nullable=True)
    quality_grade = Column(String(10), nullable=True)
    quality_grade_label = Column(String(50), nullable=True)
    model = Column(String(50), default="MobileNetV2-V2")
    model_accuracy = Column(Float, default=92.65)
    source = Column(String(50), default="Upload")  # Upload, Camera, Batch
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="predictions")

class BatchSession(Base):
    __tablename__ = "batch_sessions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    total_images = Column(Integer, default=0)
    healthy_count = Column(Integer, default=0)
    fungal_count = Column(Integer, default=0)
    grade_a_count = Column(Integer, default=0)
    grade_b_count = Column(Integer, default=0)
    grade_c_count = Column(Integer, default=0)
    avg_confidence = Column(Float, default=0.0)
    avg_quality_score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class QualityResult(Base):
    __tablename__ = "quality_results"
    id = Column(Integer, primary_key=True, index=True)
    prediction_id = Column(Integer, ForeignKey("predictions.id"), nullable=False)
    brightness = Column(Float, nullable=True)
    contrast = Column(Float, nullable=True)
    sharpness = Column(Float, nullable=True)
    blur = Column(Float, nullable=True)
    color_consistency = Column(Float, nullable=True)
    clarity = Column(Float, nullable=True)

engine = create_engine(f"sqlite:///{DB_PATH}", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    """Creates SQLite tables and migrates existing CSV records if database is new."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Check if predictions table has records
        count = db.query(PredictionRecord).count()
        if count == 0:
            csv_path = os.path.join(ROOT_DIR, "prediction_history.csv")
            if not os.path.exists(csv_path):
                csv_path = os.path.join(BACKEND_DIR, "prediction_history.csv")

            if os.path.exists(csv_path):
                print(f"Migrating CSV records from {csv_path} into SQLite database...")
                try:
                    df = pd.read_csv(csv_path, on_bad_lines='skip')
                    for _, row in df.iterrows():
                        fname = str(row.get("Filename", "sample.jpg"))
                        pred = str(row.get("Prediction", "HEALTHY"))
                        conf = float(row.get("Confidence", 90.0))
                        
                        # Quality score parsing
                        q_score = row.get("Quality_Score", "N/A")
                        q_score_val = float(q_score) if str(q_score).replace('.', '', 1).isdigit() else None
                        
                        q_grade = str(row.get("Quality_Grade", "N/A"))
                        q_grade_label = str(row.get("Quality_Grade_Label", "N/A"))

                        source_val = "Camera" if "camera" in fname.lower() else "Upload"

                        rec = PredictionRecord(
                            filename=fname,
                            prediction=pred,
                            confidence=conf,
                            quality_score=q_score_val,
                            quality_grade=q_grade if q_grade != "N/A" else None,
                            quality_grade_label=q_grade_label if q_grade_label != "N/A" else None,
                            model=str(row.get("Model", "MobileNetV2-V2")),
                            model_accuracy=float(row.get("Model_Accuracy", 92.65)),
                            source=source_val
                        )
                        db.add(rec)
                    db.commit()
                    print(f"Successfully migrated {len(df)} records into SQLite.")
                except Exception as e:
                    print(f"CSV migration warning: {e}")
                    db.rollback()
    finally:
        db.close()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
