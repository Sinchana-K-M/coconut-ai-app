import tensorflow as tf
import numpy as np
from PIL import Image
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input

# ==============================
# Settings
# ==============================

MODEL_PATH = "coconut_fungal_model.keras"
IMG_SIZE = (224, 224)

# ==============================
# Load trained model
# ==============================

print("Loading model...")

model = tf.keras.models.load_model(MODEL_PATH)

print("Model loaded successfully!")

# ==============================
# Get image path
# ==============================

image_path = input("\nEnter the image path: ").strip().strip('"')

try:
    # Open image
    image = Image.open(image_path).convert("RGB")

    # Resize image
    image = image.resize(IMG_SIZE)

    # Convert image to NumPy array
    image_array = np.array(image, dtype=np.float32)

    # Add batch dimension
    image_array = np.expand_dims(image_array, axis=0)

    # MobileNetV2 preprocessing
    image_array = preprocess_input(image_array)

    # ==============================
    # Prediction
    # ==============================

    prediction = model.predict(image_array, verbose=0)[0][0]

    # ==============================
    # Class decision
    # ==============================

    # Our dataset classes were:
    # 0 = fungal
    # 1 = healthy

    if prediction >= 0.5:
        result = "HEALTHY"
        confidence = prediction * 100
    else:
        result = "FUNGAL"
        confidence = (1 - prediction) * 100

    # ==============================
    # Display result
    # ==============================

    print("\n==============================")
    print("      COCONUT ANALYSIS")
    print("==============================")
    print("Prediction :", result)
    print("Confidence :", f"{confidence:.2f}%")
    print("==============================")

except FileNotFoundError:
    print("\nError: Image file not found.")
    print("Please check the image path.")

except Exception as e:
    print("\nError:", e)