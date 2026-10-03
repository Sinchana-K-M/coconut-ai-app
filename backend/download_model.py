"""
download_model.py
=================
Downloads the Keras model from Google Drive on Railway startup.
Uses multiple strategies to handle Google Drive's download quirks.
"""

import os
import sys
import urllib.request
import urllib.parse
import urllib.error
import http.cookiejar

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR    = os.path.dirname(BACKEND_DIR)

# Save model to backend directory (model_service.py checks here first)
MODEL_SAVE_PATH = os.path.join(BACKEND_DIR, "coconut_fungal_model_v2.keras")

# Google Drive file ID from environment or hardcoded
FILE_ID = os.environ.get("GDRIVE_FILE_ID", "1fkSYU6KZJ8d4uyieczRBlwUfwZTVhsD1")

MIN_VALID_SIZE_BYTES = 1 * 1024 * 1024  # 1 MB minimum — avoids saving HTML error pages


def _build_opener_with_cookies():
    cj = http.cookiejar.CookieJar()
    opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))
    opener.addheaders = [
        ('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
        ('Accept', '*/*'),
    ]
    return opener, cj


def _get_confirm_token(response):
    """Check response headers / body for Google's virus-scan warning token."""
    for header_key, header_val in response.headers.items():
        if header_key.lower() == 'set-cookie' and 'download_warning' in header_val:
            for part in header_val.split(';'):
                part = part.strip()
                if part.startswith('download_warning'):
                    return part.split('=', 1)[1]
    return None


def _save_response_to_file(response, dest_path):
    """Stream response to disk in 1MB chunks and return total bytes written."""
    chunk_size = 1024 * 1024  # 1 MB
    total = 0
    with open(dest_path, 'wb') as f:
        while True:
            chunk = response.read(chunk_size)
            if not chunk:
                break
            f.write(chunk)
            total += len(chunk)
            mb = total / (1024 * 1024)
            print(f"\r[download_model] {mb:.1f} MB downloaded...", end="", flush=True)
    print()
    return total


def download_from_gdrive(file_id, dest_path):
    """Download a Google Drive file, handling the virus-scan confirmation page."""
    opener, _ = _build_opener_with_cookies()
    urllib.request.install_opener(opener)

    # First request — may trigger virus-scan warning
    url1 = f"https://drive.google.com/uc?export=download&id={file_id}"
    print(f"[download_model] Connecting to Google Drive (file_id={file_id})...")
    try:
        resp1 = opener.open(url1, timeout=60)
    except urllib.error.URLError as e:
        print(f"[download_model] Connection error: {e}")
        return False

    token = _get_confirm_token(resp1)

    if token:
        # Second request with confirmation token
        print(f"[download_model] Virus-scan confirmation required, retrying with token...")
        url2 = f"https://drive.google.com/uc?export=download&id={file_id}&confirm={token}&uuid=1"
        try:
            resp2 = opener.open(url2, timeout=300)
        except urllib.error.URLError as e:
            print(f"[download_model] Download error: {e}")
            return False
        total = _save_response_to_file(resp2, dest_path)
    else:
        # No confirmation needed — direct download
        total = _save_response_to_file(resp1, dest_path)

    if total < MIN_VALID_SIZE_BYTES:
        print(f"[download_model] ERROR: Downloaded only {total} bytes — likely an HTML error page, not the model.")
        os.remove(dest_path)
        return False

    print(f"[download_model] Download complete — {total / (1024*1024):.1f} MB saved to {dest_path}")
    return True


def download_model_if_missing():
    """
    Main entry point. Downloads the Keras model from Google Drive
    if it does not already exist at MODEL_SAVE_PATH.
    """
    if os.path.exists(MODEL_SAVE_PATH):
        size_mb = os.path.getsize(MODEL_SAVE_PATH) / (1024 * 1024)
        if size_mb >= 1.0:
            print(f"[download_model] Model already exists ({size_mb:.1f} MB) — skipping download.")
            return True
        else:
            print(f"[download_model] Existing file too small ({size_mb:.1f} MB) — re-downloading...")
            os.remove(MODEL_SAVE_PATH)

    print(f"[download_model] Model not found at {MODEL_SAVE_PATH}")
    print(f"[download_model] Downloading from Google Drive...")

    os.makedirs(os.path.dirname(MODEL_SAVE_PATH), exist_ok=True)

    success = download_from_gdrive(FILE_ID, MODEL_SAVE_PATH)

    if success:
        mb = os.path.getsize(MODEL_SAVE_PATH) / (1024 * 1024)
        print(f"[download_model] Model ready: {mb:.1f} MB at {MODEL_SAVE_PATH}")
    else:
        print("[download_model] FAILED: Model could not be downloaded.")
        print("[download_model] The prediction endpoint will not work without the model.")

    return success


if __name__ == "__main__":
    ok = download_model_if_missing()
    sys.exit(0 if ok else 1)
