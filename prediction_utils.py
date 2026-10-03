import os
import datetime
import pandas as pd
import numpy as np
import tensorflow as tf
from PIL import Image

# Set environment variables for Windows memory management & stability
os.environ['OPENBLAS_NUM_THREADS'] = '1'
os.environ['OMP_NUM_THREADS'] = '1'
os.environ['MKL_NUM_THREADS'] = '1'
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

MODEL_PATH = "coconut_fungal_model_v2.keras"
HISTORY_CSV_PATH = "prediction_history.csv"
MODEL_NAME = "MobileNetV2-V2"
MODEL_ACCURACY = 92.65
IMG_SIZE = (224, 224)

CSV_COLUMNS = [
    "Prediction_ID",
    "Date",
    "Time",
    "Filename",
    "Prediction",
    "Confidence",
    "Model",
    "Model_Accuracy"
]

def load_trained_model():
    """Loads coconut_fungal_model_v2.keras safely."""
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model file '{MODEL_PATH}' was not found.")
    model = tf.keras.models.load_model(MODEL_PATH)
    return model

def preprocess_image_pipeline(input_image):
    """
    Processes an input image through 4 distinct stages:
    Stage 1: Original Image
    Stage 2: RGB Converted Image
    Stage 3: Resized Image (224 x 224)
    Stage 4: Model Preprocessed Float Array Batch
    """
    if isinstance(input_image, np.ndarray):
        orig_pil = Image.fromarray(input_image)
    elif isinstance(input_image, Image.Image):
        orig_pil = input_image
    else:
        orig_pil = Image.open(input_image)

    # Stage 1: Original Image
    stage1_orig = orig_pil.copy()

    # Stage 2: RGB Converted Image
    stage2_rgb = orig_pil.convert("RGB")

    # Stage 3: Resized Image (224 x 224)
    stage3_resized = stage2_rgb.resize(IMG_SIZE, Image.Resampling.BILINEAR)

    # Stage 4: Model Preprocessed Representation (float32 batch array)
    img_array = np.array(stage3_resized, dtype=np.float32)
    stage4_batch = np.expand_dims(img_array, axis=0)

    return stage1_orig, stage2_rgb, stage3_resized, stage4_batch

def predict_coconut_quality(model, img_batch):
    """
    Runs model prediction on the preprocessed batch.
    Rule: prediction >= 0.5 -> HEALTHY, < 0.5 -> FUNGAL
    """
    raw_prediction = model.predict(img_batch, verbose=0)[0][0]

    if raw_prediction >= 0.5:
        prediction_label = "HEALTHY"
        confidence = float(raw_prediction * 100.0)
    else:
        prediction_label = "FUNGAL"
        confidence = float((1.0 - raw_prediction) * 100.0)

    return prediction_label, confidence, float(raw_prediction)

def init_history_csv():
    """Ensures prediction_history.csv exists with correct headers."""
    if not os.path.exists(HISTORY_CSV_PATH):
        df = pd.DataFrame(columns=CSV_COLUMNS)
        df.to_csv(HISTORY_CSV_PATH, index=False)

def save_prediction_record(filename, prediction, confidence):
    """Appends a new prediction record to prediction_history.csv."""
    init_history_csv()
    
    try:
        df_existing = pd.read_csv(HISTORY_CSV_PATH)
        if not df_existing.empty and "Prediction_ID" in df_existing.columns:
            next_id = int(df_existing["Prediction_ID"].max()) + 1
        else:
            next_id = 1
    except Exception:
        next_id = 1

    now = datetime.datetime.now()
    date_str = now.strftime("%Y-%m-%d")
    time_str = now.strftime("%H:%M:%S")

    new_row = pd.DataFrame([{
        "Prediction_ID": next_id,
        "Date": date_str,
        "Time": time_str,
        "Filename": filename if filename else "uploaded_sample.jpg",
        "Prediction": prediction,
        "Confidence": round(confidence, 2),
        "Model": MODEL_NAME,
        "Model_Accuracy": MODEL_ACCURACY
    }])

    new_row.to_csv(HISTORY_CSV_PATH, mode="a", header=not os.path.exists(HISTORY_CSV_PATH) or os.stat(HISTORY_CSV_PATH).st_size == 0, index=False)
    return new_row

def load_prediction_history():
    """Reads prediction_history.csv and returns a Pandas DataFrame."""
    init_history_csv()
    try:
        df = pd.read_csv(HISTORY_CSV_PATH)
        return df
    except Exception:
        return pd.DataFrame(columns=CSV_COLUMNS)

def clear_prediction_history():
    """Clears history while keeping headers intact. NEVER deletes dataset/models."""
    df = pd.DataFrame(columns=CSV_COLUMNS)
    df.to_csv(HISTORY_CSV_PATH, index=False)
    return True
