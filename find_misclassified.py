import os
import sys

# Prevent OpenBLAS / Windows virtual memory thread allocation issues
os.environ['OPENBLAS_NUM_THREADS'] = '1'
os.environ['OMP_NUM_THREADS'] = '1'
os.environ['MKL_NUM_THREADS'] = '1'
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

import numpy as np
import tensorflow as tf

# ==============================================================================
# SETTINGS & PATHS
# ==============================================================================
MODEL_PATH = "coconut_fungal_model.keras"
TEST_DIR = "dataset/test"
OUTPUT_FILE = "misclassified_results.txt"
IMG_SIZE = (224, 224)
SUPPORTED_EXTENSIONS = ('.jpg', '.jpeg', '.png', '.webp', '.bmp')

# Class definitions (0 = fungal, 1 = healthy)
CLASS_NAMES = {0: "fungal", 1: "healthy"}

def main():
    # 1. Load trained model
    print("Loading trained model from:", MODEL_PATH)
    if not os.path.exists(MODEL_PATH):
        print(f"Error: Model file '{MODEL_PATH}' not found!")
        sys.exit(1)
        
    model = tf.keras.models.load_model(MODEL_PATH)
    print("Model loaded successfully!\n")

    fungal_as_healthy = []
    healthy_as_fungal = []
    total_images_processed = 0

    # 2. Process each test category
    categories = [
        ("fungal", 0),
        ("healthy", 1)
    ]

    for category_name, actual_label in categories:
        category_dir = os.path.join(TEST_DIR, category_name)
        if not os.path.exists(category_dir):
            print(f"Warning: Directory '{category_dir}' does not exist.")
            continue

        filenames = sorted(os.listdir(category_dir))
        for fname in filenames:
            if not fname.lower().endswith(SUPPORTED_EXTENSIONS):
                continue
            
            total_images_processed += 1
            img_path = os.path.join(category_dir, fname)

            # Load and preprocess image
            img = tf.keras.utils.load_img(img_path, target_size=IMG_SIZE)
            img_array = tf.keras.utils.img_to_array(img)
            img_batch = np.expand_dims(img_array, axis=0)

            # Predict
            prediction_score = model.predict(img_batch, verbose=0)[0][0]

            # Determine predicted class & confidence
            if prediction_score >= 0.5:
                pred_label = 1
                pred_class_str = "healthy"
                confidence = prediction_score * 100.0
            else:
                pred_label = 0
                pred_class_str = "fungal"
                confidence = (1.0 - prediction_score) * 100.0

            # Check for misclassification
            if actual_label != pred_label:
                item_info = {
                    "filename": fname,
                    "filepath": img_path,
                    "actual_class": CLASS_NAMES[actual_label],
                    "predicted_class": pred_class_str,
                    "confidence": confidence,
                    "raw_score": prediction_score
                }
                if actual_label == 0 and pred_label == 1:
                    fungal_as_healthy.append(item_info)
                elif actual_label == 1 and pred_label == 0:
                    healthy_as_fungal.append(item_info)

    total_misclassified = len(fungal_as_healthy) + len(healthy_as_fungal)

    # Prepare output report lines
    report_lines = []
    report_lines.append("==================================================")
    report_lines.append("        MISCLASSIFIED TEST IMAGES REPORT          ")
    report_lines.append("==================================================")
    report_lines.append(f"Total Test Images Processed : {total_images_processed}")
    report_lines.append(f"Total Misclassified Images   : {total_misclassified}")
    report_lines.append("==================================================\n")

    report_lines.append("1. FUNGAL IMAGES PREDICTED AS HEALTHY:")
    report_lines.append("-" * 50)
    if fungal_as_healthy:
        for idx, item in enumerate(fungal_as_healthy, 1):
            line = f"  {idx}. Filename       : {item['filepath']}\n" \
                   f"     Actual Class   : {item['actual_class']}\n" \
                   f"     Predicted Class: {item['predicted_class']}\n" \
                   f"     Confidence     : {item['confidence']:.2f}%\n"
            report_lines.append(line)
    else:
        report_lines.append("  None!\n")

    report_lines.append("2. HEALTHY IMAGES PREDICTED AS FUNGAL:")
    report_lines.append("-" * 50)
    if healthy_as_fungal:
        for idx, item in enumerate(healthy_as_fungal, 1):
            line = f"  {idx}. Filename       : {item['filepath']}\n" \
                   f"     Actual Class   : {item['actual_class']}\n" \
                   f"     Predicted Class: {item['predicted_class']}\n" \
                   f"     Confidence     : {item['confidence']:.2f}%\n"
            report_lines.append(line)
    else:
        report_lines.append("  None!\n")

    report_lines.append("==================================================")
    report_lines.append(f"SUMMARY: {total_misclassified} misclassified image(s) found.")
    report_lines.append("==================================================")

    full_output = "\n".join(report_lines)

    # Print to console
    print(full_output)

    # Save to misclassified_results.txt
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write(full_output + "\n")

    print(f"\nResults saved successfully to: {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
