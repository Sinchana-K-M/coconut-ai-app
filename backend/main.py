import os
import sys

# Ensure backend directory is in sys.path regardless of execution CWD
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from contextlib import asynccontextmanager
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Response, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from PIL import Image
import io

import model_service
import prediction_service
import csv_service
import dashboard_service
import gradcam
import quality_grading
import database
import auth_service
import batch_service
import report_service
import excel_service
import notification_service
import model_comparison

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Loads singleton Keras model ONLY ONCE on server startup and initializes SQLite DB."""
    print("Initializing FastAPI server lifespan & SQLite database...")
    try:
        # Download model from Google Drive if running on Railway (model not in git)
        import download_model
        download_model.download_model_if_missing()
        database.init_db()
        model_service.load_singleton_model()
    except Exception as e:
        print(f"Warning during startup model/DB loading: {e}")
    yield
    print("Shutting down FastAPI server...")

app = FastAPI(
    title="Coconut Quality Assessment API",
    description="AI-Powered Coconut Quality & Fungal Detection API using MobileNetV2, Grad-CAM, SQLite & Analytics",
    version="2.0.0",
    lifespan=lifespan
)

# Enable CORS — reads from ALLOWED_ORIGINS env var in production (comma-separated)
# e.g. ALLOWED_ORIGINS=https://coconut-ai.vercel.app,https://your-custom-domain.com
_raw_origins = os.environ.get("ALLOWED_ORIGINS", "")
origins = [o.strip() for o in _raw_origins.split(",") if o.strip()] or [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads folder if missing
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Mount graph image assets if present
GRAPH_DIR = ".." if os.path.exists("../confusion_matrix_v2.png") else "."
if os.path.exists(os.path.join(GRAPH_DIR, "confusion_matrix_v2.png")):
    app.mount("/static/graphs", StaticFiles(directory=GRAPH_DIR), name="graphs")


# --- AUTHENTICATION SCHEMAS & ENDPOINTS ---
class UserRegisterRequest(BaseModel):
    name: str
    email: str
    password: str

class UserLoginRequest(BaseModel):
    email: str
    password: str

@app.post("/api/auth/register")
async def register(req: UserRegisterRequest):
    try:
        res = auth_service.register_user(req.name, req.email, req.password)
        return res
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@app.post("/api/auth/login")
async def login(req: UserLoginRequest):
    try:
        res = auth_service.login_user(req.email, req.password)
        return res
    except ValueError as ve:
        raise HTTPException(status_code=401, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")


@app.get("/api/health")
async def health_check():
    """Health check endpoint returning model version and fixed test accuracy."""
    return {
        "status": "healthy",
        "model": "MobileNetV2-V2",
        "accuracy": 92.65
    }


@app.post("/api/predict")
async def predict_image(
    file: UploadFile = File(...),
    opacity: float = Form(0.45),
    threshold: float = Form(0.40),
    colormap: str = Form("jet")
):
    """
    Upload an image, run MobileNetV2 prediction, save record to CSV/DB, compute Grad-CAM 4 views.
    """
    if not file.filename.lower().endswith((".jpg", ".jpeg", ".png", ".webp", ".bmp")):
        raise HTTPException(status_code=400, detail="Invalid image format. Please upload JPG, JPEG, or PNG.")

    try:
        image_bytes = await file.read()
        
        # Save file to uploads folder
        upload_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(upload_path, "wb") as f:
            f.write(image_bytes)

        result = prediction_service.run_prediction_pipeline(
            image_bytes=image_bytes,
            filename=file.filename,
            opacity=opacity,
            threshold=threshold,
            colormap=colormap
        )
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process image: {str(e)}")


@app.post("/api/predict/batch")
async def predict_batch(
    files: List[UploadFile] = File(...),
    opacity: float = Form(0.45),
    threshold: float = Form(0.40),
    colormap: str = Form("jet")
):
    """
    Multi-coconut batch analysis processing multiple uploaded images through FIFO queue.
    """
    if not files:
        raise HTTPException(status_code=400, detail="No files provided for batch analysis.")

    try:
        files_data = []
        for file in files:
            content = await file.read()
            files_data.append((file.filename, content))

        batch_summary = batch_service.process_batch_images(
            files_data=files_data,
            opacity=opacity,
            threshold=threshold,
            colormap=colormap
        )
        return batch_summary
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch processing failed: {str(e)}")


@app.post("/api/quality-grade")
async def get_quality_grade(file: UploadFile = File(...)):
    """
    Independent Computer-Vision based Coconut Image Quality Grading Endpoint.
    Analyzes visual image features and returns 0-100 quality score, Grade (A/B/C), and factor metrics.
    """
    if not file.filename.lower().endswith((".jpg", ".jpeg", ".png", ".webp", ".bmp")):
        raise HTTPException(status_code=400, detail="Invalid image format. Please upload JPG, JPEG, or PNG.")

    try:
        image_bytes = await file.read()
        pil_img = Image.open(io.BytesIO(image_bytes))
        
        grader = quality_grading.CoconutQualityGrader()
        quality_res = grader.analyze(pil_img)
        return quality_res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Quality grading error: {str(e)}")


@app.post("/api/gradcam")
async def update_gradcam(
    file: UploadFile = File(...),
    raw_score: float = Form(0.5),
    opacity: float = Form(0.45),
    threshold: float = Form(0.40),
    colormap: str = Form("jet")
):
    """Re-evaluates Grad-CAM visualizations interactively with updated controls."""
    try:
        image_bytes = await file.read()
        orig_pil = Image.open(io.BytesIO(image_bytes))
        _, _, _, img_batch = model_service.preprocess_image_bytes(image_bytes)
        
        model = model_service.get_model()
        raw_heatmap = gradcam.compute_raw_gradcam_heatmap(model, img_batch, raw_score)
        views = gradcam.generate_four_gradcam_views_b64(orig_pil, raw_heatmap, opacity, threshold, colormap)
        return {"gradcam_views": views}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Grad-CAM update error: {str(e)}")


@app.get("/api/history")
async def get_prediction_history():
    """Returns all recorded prediction entries from prediction_history.csv / SQLite DB."""
    records = csv_service.get_history()
    return {"history": records}


@app.get("/api/history/download")
async def download_history_csv():
    """Downloads prediction_history.csv file directly."""
    csv_path = csv_service.get_active_csv_path()
    if not os.path.exists(csv_path):
        csv_service.init_csv()
    return FileResponse(
        path=csv_path,
        filename="prediction_history.csv",
        media_type="text/csv"
    )


@app.get("/api/history/excel")
async def download_history_excel():
    """Downloads prediction history in Excel (.xlsx) format."""
    records = csv_service.get_history()
    excel_bytes = excel_service.export_history_excel(records)
    return Response(
        content=excel_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=prediction_history.xlsx"}
    )


@app.post("/api/history/batch/excel")
async def download_batch_excel(batch_summary: dict):
    """Downloads batch analysis results in Excel (.xlsx) format."""
    excel_bytes = excel_service.export_batch_excel(batch_summary)
    return Response(
        content=excel_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=batch_analysis_results.xlsx"}
    )


@app.delete("/api/history/clear")
async def clear_history():
    """Clears history CSV records keeping headers intact."""
    csv_service.clear_history()
    return {"message": "Prediction history cleared successfully."}


@app.get("/api/reports/prediction/pdf")
async def download_prediction_pdf(
    id: Optional[int] = Query(None),
    filename: Optional[str] = Query("sample.jpg"),
    prediction: Optional[str] = Query("HEALTHY"),
    confidence: Optional[float] = Query(95.0),
    quality_score: Optional[float] = Query(85.0),
    quality_grade: Optional[str] = Query("A"),
    quality_grade_label: Optional[str] = Query("High Quality")
):
    """Generates and downloads a single prediction scan PDF report."""
    record_data = {
        "prediction_id": id or 1,
        "filename": filename,
        "prediction": prediction,
        "confidence": confidence,
        "quality_score": quality_score,
        "quality_grade": quality_grade,
        "quality_grade_label": quality_grade_label
    }
    pdf_bytes = report_service.generate_prediction_pdf(record_data)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=prediction_report_{id or 1}.pdf"}
    )


@app.post("/api/reports/batch/pdf")
async def download_batch_pdf(batch_summary: dict):
    """Generates and downloads a multi-coconut batch analysis PDF report."""
    pdf_bytes = report_service.generate_batch_pdf(batch_summary)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=batch_analysis_report.pdf"}
    )


@app.get("/api/analytics")
async def get_analytics(time_range: str = Query("all")):
    """Returns summary analytics, KPI metrics, and time-series trends."""
    data = dashboard_service.get_analytics_summary(time_range=time_range)
    return data


@app.get("/api/notifications/alerts")
async def get_fungal_alerts():
    """Returns fungal alerts summary and alert counts."""
    records = csv_service.get_history()
    alerts_data = notification_service.get_fungal_alerts_summary(records)
    return alerts_data


@app.get("/api/model-comparison")
async def get_model_comparison():
    """Returns objective metrics comparing MobileNetV2 vs Random Forest vs SVM."""
    return model_comparison.get_model_comparison_metrics()


@app.get("/api/model-info")
async def get_model_info():
    """Returns fixed model information, evaluation metrics, and graph availability."""
    return {
        "model_name": "MobileNetV2-V2",
        "architecture": "MobileNetV2 (Transfer Learning + Fine-Tuning)",
        "test_accuracy": 92.65,
        "test_images": 68,
        "correct_predictions": 63,
        "incorrect_predictions": 5,
        "confusion_matrix": [
            [33, 4],
            [1, 30]
        ],
        "metrics": {
            "fungal": {"precision": 0.97, "recall": 0.89, "f1": 0.93},
            "healthy": {"precision": 0.88, "recall": 0.97, "f1": 0.92}
        },
        "graphs": {
            "accuracy_graph": "/static/graphs/accuracy_graph_v2.png",
            "loss_graph": "/static/graphs/loss_graph_v2.png",
            "confusion_matrix_graph": "/static/graphs/confusion_matrix_v2.png"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
