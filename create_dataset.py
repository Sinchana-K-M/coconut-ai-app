import os
import shutil
import random

SOURCE_DIR = "images"
DATASET_DIR = "dataset"

classes = ["healthy", "fungal"]

train_ratio = 0.70
val_ratio = 0.15

random.seed(42)

# Create dataset folders
for split in ["train", "validation", "test"]:
    for class_name in classes:
        os.makedirs(
            os.path.join(DATASET_DIR, split, class_name),
            exist_ok=True
        )

# Split images
for class_name in classes:

    source_folder = os.path.join(SOURCE_DIR, class_name)

    images = [
        file for file in os.listdir(source_folder)
        if file.lower().endswith((".jpg", ".jpeg", ".png", ".webp"))
    ]

    random.shuffle(images)

    total = len(images)

    train_end = int(total * train_ratio)
    val_end = train_end + int(total * val_ratio)

    train_images = images[:train_end]
    val_images = images[train_end:val_end]
    test_images = images[val_end:]

    splits = {
        "train": train_images,
        "validation": val_images,
        "test": test_images
    }

    for split, split_images in splits.items():

        destination = os.path.join(
            DATASET_DIR,
            split,
            class_name
        )

        for image in split_images:

            source_path = os.path.join(
                source_folder,
                image
            )

            destination_path = os.path.join(
                destination,
                image
            )

            shutil.copy2(source_path, destination_path)

    print(f"\n{class_name}")
    print("Total:", total)
    print("Train:", len(train_images))
    print("Validation:", len(val_images))
    print("Test:", len(test_images))

print("\nDataset created successfully!")