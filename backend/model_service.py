import os
import io
import numpy as np
import tensorflow as tf
from PIL import Image

# Windows environment variables for performance and memory stability
os.environ['OPENBLAS_NUM_THREADS'] = '1'
os.environ['OMP_NUM_THREADS'] = '1'
os.environ['MKL_NUM_THREADS'] = '1'
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

MODEL_PATH_PRIMARY = "coconut_fungal_model_v2.keras"
MODEL_PATH_FALLBACK = "../coconut_fungal_model_v2.keras"
IMG_SIZE = (224, 224)

# Absolute paths for Railway deployment (CWD-independent)
_BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
_ROOT_DIR = os.path.dirname(_BACKEND_DIR)
MODEL_PATH_BACKEND_ABS = os.path.join(_BACKEND_DIR, "coconut_fungal_model_v2.keras")
MODEL_PATH_ROOT_ABS    = os.path.join(_ROOT_DIR,    "coconut_fungal_model_v2.keras")


_model = None

def load_singleton_model():
    """Loads coconut_fungal_model_v2.keras ONCE when the backend server starts."""
    global _model
    if _model is not None:
        return _model

    # Search all possible locations (absolute paths first for Railway)
    candidates = [
        MODEL_PATH_BACKEND_ABS,   # /app/backend/coconut_fungal_model_v2.keras
        MODEL_PATH_ROOT_ABS,      # /app/coconut_fungal_model_v2.keras
        MODEL_PATH_PRIMARY,       # relative: coconut_fungal_model_v2.keras (CWD)
        MODEL_PATH_FALLBACK,      # relative: ../coconut_fungal_model_v2.keras
    ]

    target_path = None
    for path in candidates:
        if os.path.exists(path):
            target_path = path
            break

    if target_path is None:
        raise FileNotFoundError(
            f"Model file not found in any of: {candidates}"
        )

    print(f"Loading Keras model from: {target_path}...")
    _model = tf.keras.models.load_model(target_path)
    print("Keras model loaded successfully!")
    return _model

def get_model():
    """Returns the cached singleton model instance."""
    global _model
    if _model is None:
        return load_singleton_model()
    return _model


def preprocess_image_bytes(image_bytes: bytes):
    """
    Reads image bytes and prepares:
    1. Original PIL image
    2. RGB Converted image
    3. Resized 224x224 PIL image
    4. Model preprocessed float32 batch array (1, 224, 224, 3)
    """
    orig_pil = Image.open(io.BytesIO(image_bytes))
    rgb_pil = orig_pil.convert("RGB")
    resized_pil = rgb_pil.resize(IMG_SIZE, Image.Resampling.BILINEAR)

    img_array = np.array(resized_pil, dtype=np.float32)
    img_batch = np.expand_dims(img_array, axis=0)

    return orig_pil, rgb_pil, resized_pil, img_batch
