import os
import datetime
import pandas as pd

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(BACKEND_DIR)

CSV_PATH_ROOT = os.path.join(ROOT_DIR, "prediction_history.csv")
CSV_PATH_BACKEND = os.path.join(BACKEND_DIR, "prediction_history.csv")

MODEL_NAME = "MobileNetV2-V2"
MODEL_ACCURACY = 92.65

CSV_COLUMNS = [
    "Prediction_ID",
    "Date",
    "Time",
    "Filename",
    "Prediction",
    "Confidence",
    "Model",
    "Model_Accuracy",
    "Quality_Score",
    "Quality_Grade",
    "Quality_Grade_Label"
]

def get_active_csv_path():
    """Returns preferred path for prediction_history.csv using absolute paths."""
    if os.path.exists(CSV_PATH_ROOT):
        return CSV_PATH_ROOT
    return CSV_PATH_BACKEND

def init_csv():
    """Ensures prediction_history.csv exists with correct headers and syncs paths."""
    target_path = get_active_csv_path()
    if not os.path.exists(target_path):
        df = pd.DataFrame(columns=CSV_COLUMNS)
        df.to_csv(target_path, index=False)
        
    # Sync both root and backend files
    for p in [CSV_PATH_ROOT, CSV_PATH_BACKEND]:
        if not os.path.exists(p):
            try:
                if os.path.exists(target_path):
                    df_sync = pd.read_csv(target_path, on_bad_lines='skip')
                    df_sync.to_csv(p, index=False)
                else:
                    df = pd.DataFrame(columns=CSV_COLUMNS)
                    df.to_csv(p, index=False)
            except Exception:
                pass

def save_prediction_record(filename: str, prediction: str, confidence: float, quality_score=None, quality_grade=None, quality_grade_label=None):
    """Appends a new prediction record to prediction_history.csv with quality grade fields."""
    init_csv()
    target_path = get_active_csv_path()

    try:
        df_existing = pd.read_csv(target_path, on_bad_lines='skip')
        if not df_existing.empty and "Prediction_ID" in df_existing.columns:
            next_id = int(df_existing["Prediction_ID"].max()) + 1
        else:
            next_id = 1
    except Exception:
        next_id = 1

    now = datetime.datetime.now()
    date_str = now.strftime("%Y-%m-%d")
    time_str = now.strftime("%H:%M:%S")

    record_dict = {
        "Prediction_ID": next_id,
        "Date": date_str,
        "Time": time_str,
        "Filename": filename if filename else "uploaded_sample.jpg",
        "Prediction": prediction,
        "Confidence": round(float(confidence), 2),
        "Model": MODEL_NAME,
        "Model_Accuracy": MODEL_ACCURACY,
        "Quality_Score": round(float(quality_score), 1) if quality_score is not None else "N/A",
        "Quality_Grade": quality_grade if quality_grade is not None else "N/A",
        "Quality_Grade_Label": quality_grade_label if quality_grade_label is not None else "N/A"
    }

    new_row = pd.DataFrame([record_dict])
    
    # Save to both target_path and mirror path
    for p in [CSV_PATH_ROOT, CSV_PATH_BACKEND]:
        try:
            is_empty = not os.path.exists(p) or os.stat(p).st_size == 0
            new_row.to_csv(p, mode="a", header=is_empty, index=False)
        except Exception as e:
            print(f"Error saving to CSV path {p}: {e}")

    return record_dict

def get_history():
    """Returns list of prediction records as dicts."""
    init_csv()
    target_path = get_active_csv_path()
    try:
        df = pd.read_csv(target_path, on_bad_lines='skip')
        # Fill missing NaN values for missing columns cleanly
        for col in CSV_COLUMNS:
            if col not in df.columns:
                df[col] = "N/A"
        df = df.fillna("N/A")
        return df.to_dict(orient="records")
    except Exception as e:
        print(f"Failed to read CSV history: {e}")
        return []

def clear_history():
    """Clears history while keeping headers intact. NEVER deletes dataset/models."""
    df = pd.DataFrame(columns=CSV_COLUMNS)
    for p in [CSV_PATH_ROOT, CSV_PATH_BACKEND]:
        try:
            df.to_csv(p, index=False)
        except Exception:
            pass
    return True
