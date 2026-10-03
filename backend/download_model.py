"""
download_model.py
=================
Downloads the Keras model from Google Drive on Railway startup.
Handles Google Drive's virus-scan confirmation for larger files.
"""

import os
import sys
import urllib.request
import urllib.parse

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BACKEND_DIR, "coconut_fungal_model_v2.keras")
FILE_ID = os.environ.get("GDRIVE_FILE_ID", "1fkSYU6KZJ8d4uyieczRBlwUfwZTVhsD1")

def get_confirm_token(response):
    """Extract Google Drive download confirmation token from cookies."""
    for key, value in response.info().items():
        if key.lower() == 'set-cookie':
            for part in value.split(';'):
                part = part.strip()
                if part.startswith('download_warning'):
                    return part.split('=')[1]
    return None

def download_model_if_missing():
    """Downloads the Keras model from Google Drive if not already present."""
    if os.path.exists(MODEL_PATH):
        size_mb = os.path.getsize(MODEL_PATH) / (1024 * 1024)
        print(f"[download_model] Model already exists ({size_mb:.1f} MB) — skipping download.")
        return True

    print(f"[download_model] Model not found. Downloading from Google Drive...")
    print(f"[download_model] File ID: {FILE_ID}")
    print(f"[download_model] Saving to: {MODEL_PATH}")

    try:
        os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)

        # Step 1: Initial request to Google Drive
        url = f"https://drive.google.com/uc?export=download&id={FILE_ID}"
        opener = urllib.request.build_opener()
        opener.addheaders = [('User-Agent', 'Mozilla/5.0')]
        urllib.request.install_opener(opener)

        response = urllib.request.urlopen(url)
        token = get_confirm_token(response)

        # Step 2: If virus scan warning, add confirm token
        if token:
            print(f"[download_model] Got confirm token, resuming download...")
            url = f"https://drive.google.com/uc?export=download&id={FILE_ID}&confirm={token}"
            response = urllib.request.urlopen(url)

        # Step 3: Save to disk
        chunk_size = 1024 * 1024  # 1MB chunks
        downloaded = 0
        with open(MODEL_PATH, 'wb') as f:
            while True:
                chunk = response.read(chunk_size)
                if not chunk:
                    break
                f.write(chunk)
                downloaded += len(chunk)
                print(f"\r[download_model] Downloaded: {downloaded / (1024*1024):.1f} MB", end="", flush=True)

        print(f"\n[download_model] Download complete!")
        size_mb = os.path.getsize(MODEL_PATH) / (1024 * 1024)
        print(f"[download_model] Model saved: {size_mb:.1f} MB at {MODEL_PATH}")

        if size_mb < 1.0:
            print("[download_model] WARNING: File too small — may be an error page, not the model.")
            os.remove(MODEL_PATH)
            return False

        return True

    except Exception as e:
        print(f"\n[download_model] ERROR: Download failed: {e}")
        if os.path.exists(MODEL_PATH):
            os.remove(MODEL_PATH)
        return False


if __name__ == "__main__":
    success = download_model_if_missing()
    sys.exit(0 if success else 1)
