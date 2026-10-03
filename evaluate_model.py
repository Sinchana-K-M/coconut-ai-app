import tensorflow as tf
import numpy as np
import matplotlib.pyplot as plt
from sklearn.metrics import classification_report, confusion_matrix, ConfusionMatrixDisplay

MODEL_PATH = "coconut_fungal_model.keras"
TEST_DIR = "dataset/test"
IMG_SIZE = (224, 224)
BATCH_SIZE = 16

print("Loading model...")

model = tf.keras.models.load_model(MODEL_PATH)

print("Model loaded successfully!")

test_dataset = tf.keras.utils.image_dataset_from_directory(
    TEST_DIR,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    label_mode="binary",
    shuffle=False
)

class_names = test_dataset.class_names

print("\nClasses:", class_names)

print("\nEvaluating test images...")

y_true = []
y_pred = []

for images, labels in test_dataset:

    predictions = model.predict(images, verbose=0)

    predictions = (predictions >= 0.5).astype(int).flatten()

    y_pred.extend(predictions)
    y_true.extend(labels.numpy().astype(int))

y_true = np.array(y_true)
y_pred = np.array(y_pred)

print("\n==============================")
print("CLASSIFICATION REPORT")
print("==============================")

print(
    classification_report(
        y_true,
        y_pred,
        target_names=class_names
    )
)

cm = confusion_matrix(y_true, y_pred)

print("\n==============================")
print("CONFUSION MATRIX")
print("==============================")

print(cm)

disp = ConfusionMatrixDisplay(
    confusion_matrix=cm,
    display_labels=class_names
)

disp.plot()

plt.title("Coconut Fungal Detection - Confusion Matrix")
plt.savefig("confusion_matrix.png")

plt.show()

print("\nConfusion matrix saved as:")
print("confusion_matrix.png")