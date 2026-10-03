import tensorflow as tf
import matplotlib.pyplot as plt

from tensorflow.keras.applications.mobilenet_v2 import preprocess_input


# ==============================
# SETTINGS
# ==============================

IMG_SIZE = (224, 224)
BATCH_SIZE = 16
EPOCHS = 10

TRAIN_DIR = "dataset/train"
VAL_DIR = "dataset/validation"

OLD_MODEL = "coconut_fungal_model.keras"
NEW_MODEL = "coconut_fungal_model_v2.keras"


# ==============================
# LOAD DATASET
# ==============================

print("Loading datasets...")

train_dataset = tf.keras.utils.image_dataset_from_directory(
    TRAIN_DIR,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    label_mode="binary",
    shuffle=True,
    seed=42
)

validation_dataset = tf.keras.utils.image_dataset_from_directory(
    VAL_DIR,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    label_mode="binary",
    shuffle=False
)

print("\nClasses:", train_dataset.class_names)

AUTOTUNE = tf.data.AUTOTUNE

train_dataset = train_dataset.prefetch(AUTOTUNE)
validation_dataset = validation_dataset.prefetch(AUTOTUNE)


# ==============================
# LOAD EXISTING MODEL
# ==============================

print("\nLoading existing model...")

model = tf.keras.models.load_model(OLD_MODEL)

print("Existing model loaded successfully!")


# ==============================
# FIND MOBILENETV2
# ==============================

base_model = None

for layer in model.layers:
    if "mobilenetv2" in layer.name.lower():
        base_model = layer
        break

if base_model is None:
    raise ValueError(
        "MobileNetV2 base model could not be found."
    )

print("\nMobileNetV2 base model found:")
print(base_model.name)


if base_model is None:
    raise ValueError(
        "MobileNetV2 base model could not be found."
    )


print("\nMobileNetV2 base model found.")


# ==============================
# FINE-TUNING
# ==============================

print("\nPreparing fine-tuning...")

base_model.trainable = True


# Freeze most MobileNetV2 layers
# Only the final 30 layers will be trainable

for layer in base_model.layers[:-30]:
    layer.trainable = False


# Keep BatchNormalization layers frozen

for layer in base_model.layers:
    if isinstance(
        layer,
        tf.keras.layers.BatchNormalization
    ):
        layer.trainable = False


print("Fine-tuning enabled.")
print("Final 30 MobileNetV2 layers are trainable.")


# ==============================
# RECOMPILE MODEL
# ==============================

model.compile(
    optimizer=tf.keras.optimizers.Adam(
        learning_rate=1e-5
    ),
    loss="binary_crossentropy",
    metrics=["accuracy"]
)

print("\nModel recompiled.")


# ==============================
# TRAIN
# ==============================

print("\nStarting fine-tuning...")

history = model.fit(
    train_dataset,
    validation_data=validation_dataset,
    epochs=EPOCHS
)


# ==============================
# SAVE NEW MODEL
# ==============================

model.save(NEW_MODEL)

print("\n================================")
print("Fine-tuning completed!")
print("================================")

print("\nNew model saved as:")
print(NEW_MODEL)


# ==============================
# SAVE ACCURACY GRAPH
# ==============================

plt.figure(figsize=(8, 5))

plt.plot(
    history.history["accuracy"],
    label="Training Accuracy"
)

plt.plot(
    history.history["val_accuracy"],
    label="Validation Accuracy"
)

plt.title("Fine-Tuning Accuracy")
plt.xlabel("Epoch")
plt.ylabel("Accuracy")
plt.legend()

plt.savefig("accuracy_graph_v2.png")

plt.close()


# ==============================
# SAVE LOSS GRAPH
# ==============================

plt.figure(figsize=(8, 5))

plt.plot(
    history.history["loss"],
    label="Training Loss"
)

plt.plot(
    history.history["val_loss"],
    label="Validation Loss"
)

plt.title("Fine-Tuning Loss")
plt.xlabel("Epoch")
plt.ylabel("Loss")
plt.legend()

plt.savefig("loss_graph_v2.png")

plt.close()


print("\nGraphs saved:")
print("accuracy_graph_v2.png")
print("loss_graph_v2.png")