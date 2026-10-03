import tensorflow as tf
import os

DATASET_DIR = "dataset"

bad_images = []

for root, dirs, files in os.walk(DATASET_DIR):

    for file in files:

        if file.lower().endswith(
            (".jpg", ".jpeg", ".png", ".webp", ".bmp", ".gif")
        ):

            path = os.path.join(root, file)

            try:
                image = tf.io.read_file(path)

                image = tf.image.decode_image(
                    image,
                    channels=3,
                    expand_animations=False
                )

            except Exception as e:
                bad_images.append((path, str(e)))

print("\n==============================")
print("BAD DATASET IMAGES:", len(bad_images))
print("==============================")

for path, error in bad_images:
    print("\nFile:", path)
    print("Error:", error)

if len(bad_images) == 0:
    print("\nAll dataset images can be read by TensorFlow!")