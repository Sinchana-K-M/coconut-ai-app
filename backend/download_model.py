"""
download_model.py
=================
Railway startup script — downloads the Keras model from a public URL
if it doesn't already exist locally.

HOW TO USE:
1. Upload your .keras model file to Google Drive (share as "Anyone with link")
2. Get the file ID from the share URL:
   https://drive.google.com/file/d/FILE_ID_HERE/view
3. Set environment variable MODEL_DOWNLOAD_URL on Railway:
   https://drive.google.com/uc?export=download&id=FILE_ID_HERE
4. This script is called automatically from main.py on startup.
"""

import os
import sys
import urllib.request

MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "coconut_fungal_model_v2.keras")
MODEL_URL  = os.environ.get("MODEL_DOWNLOAD_URL", "")

def download_model_if_missing():
    """Downloads the Keras model from MODEL_DOWNLOAD_URL if not present."""
    if os.path.exists(MODEL_PATH):
        print(f"[download_model] Model already exists at {MODEL_PATH} — skipping download.")
        return True

    if not MODEL_URL:
        print("[download_model] WARNING: MODEL_DOWNLOAD_URL env variable not set.")
        print("[download_model] Model file must be present at:", MODEL_PATH)
        return False

    print(f"[download_model] Downloading model from:\n  {MODEL_URL}")
    print(f"[download_model] Saving to: {MODEL_PATH}")

    try:
        os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)

        def progress(block_num, block_size, total_size):
            downloaded = block_num * block_size
            if total_size > 0:
                pct = min(100, downloaded * 100 / total_size)
                print(f"\r  Progress: {pct:.1f}% ({downloaded // 1024 // 1024}MB / {total_size // 1024 // 1024}MB)", end="", flush=True)

        urllib.request.urlretrieve(MODEL_URL, MODEL_PATH, reporthook=progress)
        print(f"\n[download_model] ✅ Model downloaded successfully!")
        return True

    except Exception as e:
        print(f"\n[download_model] ❌ Download failed: {e}")
        return False


if __name__ == "__main__":
    success = download_model_if_missing()
    sys.exit(0 if success else 1)
