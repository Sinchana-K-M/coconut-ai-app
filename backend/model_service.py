import os
import io
import numpy as np
from PIL import Image

# Performance and memory environment variables
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
_tf_available = False

def load_singleton_model():
    """Safely loads coconut_fungal_model_v2.keras ONCE without blocking server startup if missing."""
    global _model, _tf_available
    if _model is not None:
        return _model

    candidates = [
        MODEL_PATH_BACKEND_ABS,   # /app/backend/coconut_fungal_model_v2.keras
        MODEL_PATH_ROOT_ABS,      # /app/coconut_fungal_model_v2.keras
        MODEL_PATH_PRIMARY,       # relative: coconut_fungal_model_v2.keras (CWD)
        MODEL_PATH_FALLBACK,      # relative: ../coconut_fungal_model_v2.keras
    ]

    target_path = None
    for path in candidates:
        if os.path.exists(path) and os.path.getsize(path) > 1024 * 1024:
            target_path = path
            break

    if target_path is None:
        print(f"[model_service] Model file not found yet in candidates. Running fallback visual classifier.")
        return None

    try:
        import tensorflow as tf
        print(f"[model_service] Loading Keras model from: {target_path}...")
        _model = tf.keras.models.load_model(target_path)
        _tf_available = True
        print("[model_service] Keras MobileNetV2 model loaded successfully!")
        return _model
    except Exception as e:
        print(f"[model_service] Warning: Failed to load TensorFlow model ({e}). Using visual feature classifier fallback.")
        _model = None
        return None

def get_model():
    """Returns the cached singleton model instance or None."""
    global _model
    if _model is None:
        return load_singleton_model()
    return _model

def preprocess_image_bytes(image_bytes: bytes):
    """
    Reads image bytes and prepares PIL representations & array batch.
    """
    orig_pil = Image.open(io.BytesIO(image_bytes))
    rgb_pil = orig_pil.convert("RGB")
    resized_pil = rgb_pil.resize(IMG_SIZE, Image.Resampling.BILINEAR)

    img_array = np.array(resized_pil, dtype=np.float32)
    img_batch = np.expand_dims(img_array, axis=0)

    return orig_pil, rgb_pil, resized_pil, img_batch
