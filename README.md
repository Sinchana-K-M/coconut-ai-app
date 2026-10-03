# 🥥 AI-Powered Coconut Quality Assessment & Fungal Contamination Detection System

> **Full-Stack Application: React + Vite (Frontend) • FastAPI (Backend) • MobileNetV2 (AI) • Grad-CAM (Explainable AI)**

---

## 📌 Project Overview
A complete full-stack web system for automated quality assessment of coconuts and copra, featuring binary classification for fungal contamination detection, Explainable AI (Grad-CAM), live Recharts analytics, and persistent CSV prediction logging.

- **Frontend**: React 18, Vite 5, Recharts, Lucide Icons (`http://localhost:5173`)
- **Backend**: Python FastAPI, Uvicorn, Pandas, Pillow (`http://localhost:8000`)
- **Active Model**: `coconut_fungal_model_v2.keras`
- **Test Accuracy**: **92.65%** (68 held-out test set images)
- **Class Mapping**:
  - `0` = **fungal** (`prediction < 0.5` → `FUNGAL`)
  - `1` = **healthy** (`prediction >= 0.5` → `HEALTHY`)

---

## 📂 Project Architecture

```
D:\Coconut_Project1
├── backend/
│   ├── main.py                # FastAPI application & CORS server
│   ├── model_service.py       # Singleton Keras model loader & preprocessor
│   ├── prediction_service.py  # Model inference & prediction workflow
│   ├── gradcam.py             # TensorFlow GradientTape 4-view Grad-CAM engine
│   ├── csv_service.py         # Pandas prediction_history.csv manager
│   ├── dashboard_service.py   # Analytics & KPI metric calculation
│   ├── requirements.txt       # Backend dependencies
│   ├── prediction_history.csv # Persistent prediction database
│   └── uploads/               # Uploaded image directory
│
├── frontend/
│   ├── package.json           # Frontend dependencies & scripts
│   ├── vite.config.js         # Vite configuration & backend proxy
│   ├── index.html             # Main HTML template
│   └── src/
│       ├── main.jsx           # React DOM root entry point
│       ├── App.jsx            # Main App layout & tab routing
│       ├── api.js             # Axios API client for FastAPI
│       ├── components/        # UI components (Sidebar, StatCard, GradCAM, Analytics, etc.)
│       └── styles/            # CSS styling
│
├── coconut_fungal_model_v2.keras
├── dataset/
├── images/
├── train_model.py
├── train_model_v2.py
├── evaluate_model.py
├── evaluate_model_v2.py
└── README.md
```

---

## 💻 How to Run the Full-Stack Application

### 1. Launch FastAPI Backend (`http://localhost:8000`)
Open PowerShell terminal #1:
```powershell
cmd /c "set OPENBLAS_NUM_THREADS=1&& set OMP_NUM_THREADS=1&& set TF_ENABLE_ONEDNN_OPTS=0&& .\.venv\Scripts\python.exe -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload"
```

### 2. Launch React + Vite Frontend (`http://localhost:5173`)
Open PowerShell terminal #2:
```powershell
cd frontend
npm run dev
```

Open your browser to: **`http://localhost:5173`**
