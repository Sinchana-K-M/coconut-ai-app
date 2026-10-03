import tensorflow as tf
import matplotlib.pyplot as plt

from tensorflow.keras import layers, models
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input


# ==============================
# SETTINGS
# ==============================

IMG_SIZE = (224, 224)
BATCH_SIZE = 16
EPOCHS = 15

TRAIN_DIR = "dataset/train"
VAL_DIR = "dataset/validation"
TEST_DIR = "dataset/test"


# ==============================
# LOAD DATASET
# ==============================

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

test_dataset = tf.keras.utils.image_dataset_from_directory(
    TEST_DIR,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    label_mode="binary",
    shuffle=False
)


print("\nClasses:", train_dataset.class_names)


# ==============================
# PERFORMANCE OPTIMIZATION
# ==============================

AUTOTUNE = tf.data.AUTOTUNE

train_dataset = train_dataset.prefetch(AUTOTUNE)
validation_dataset = validation_dataset.prefetch(AUTOTUNE)
test_dataset = test_dataset.prefetch(AUTOTUNE)


# ==============================
# DATA AUGMENTATION
# ==============================

data_augmentation = tf.keras.Sequential([
    layers.RandomFlip("horizontal"),
    layers.RandomRotation(0.1),
    layers.RandomZoom(0.1)
])


# ==============================
# MOBILENETV2
# ==============================

base_model = MobileNetV2(
    input_shape=(224, 224, 3),
    include_top=False,
    weights="imagenet"
)

# Freeze pretrained layers
base_model.trainable = False


# ==============================
# BUILD MODEL
# ==============================

inputs = layers.Input(shape=(224, 224, 3))

x = data_augmentation(inputs)

x = preprocess_input(x)

x = base_model(x, training=False)

x = layers.GlobalAveragePooling2D()(x)

x = layers.Dropout(0.3)(x)

outputs = layers.Dense(1, activation="sigmoid")(x)

model = models.Model(inputs, outputs)


# ==============================
# COMPILE
# ==============================

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.0001),
    loss="binary_crossentropy",
    metrics=["accuracy"]
)


# ==============================
# MODEL SUMMARY
# ==============================

model.summary()


# ==============================
# TRAIN
# ==============================

history = model.fit(
    train_dataset,
    validation_data=validation_dataset,
    epochs=EPOCHS
)


# ==============================
# TEST MODEL
# ==============================

test_loss, test_accuracy = model.evaluate(test_dataset)

print("\n==============================")
print("Test Loss:", test_loss)
print("Test Accuracy:", test_accuracy)
print("==============================")


# ==============================
# SAVE MODEL
# ==============================

model.save("coconut_fungal_model.keras")

print("\nModel saved as coconut_fungal_model.keras")


# ==============================
# ACCURACY GRAPH
# ==============================

plt.figure(figsize=(8, 5))

plt.plot(history.history["accuracy"], label="Training Accuracy")
plt.plot(history.history["val_accuracy"], label="Validation Accuracy")

plt.title("Training and Validation Accuracy")
plt.xlabel("Epoch")
plt.ylabel("Accuracy")
plt.legend()

plt.savefig("accuracy_graph.png")

plt.show()


# ==============================
# LOSS GRAPH
# ==============================

plt.figure(figsize=(8, 5))

plt.plot(history.history["loss"], label="Training Loss")
plt.plot(history.history["val_loss"], label="Validation Loss")

plt.title("Training and Validation Loss")
plt.xlabel("Epoch")
plt.ylabel("Loss")
plt.legend()

plt.savefig("loss_graph.png")

plt.show()