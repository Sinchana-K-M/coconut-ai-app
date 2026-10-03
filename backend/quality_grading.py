import numpy as np
from PIL import Image

class CoconutQualityGrader:
    """
    Coconut Quality Grading Module.

    IMPORTANT — Two separate concepts:
    ─────────────────────────────────
    1. IMAGE QUALITY SCORE (0-100): How clear/sharp/bright the photo is.
       Grade A/B/C based purely on image characteristics.

    2. COCONUT QUALITY GRADE: Final grade that accounts for ML prediction.
       - FUNGAL coconuts are ALWAYS Grade C (contaminated = low quality).
       - HEALTHY coconuts get A/B/C based on image quality score.

    Weights:
    - Brightness / Exposure  : 15%
    - Contrast               : 15%
    - Sharpness              : 20%
    - Blur Level             : 20%
    - Color Consistency      : 15%
    - Visible Image Clarity  : 15%
    """

    def __init__(self, weights=None, thresholds=None):
        self.weights = weights or {
            "brightness": 0.15,
            "contrast": 0.15,
            "sharpness": 0.20,
            "blur": 0.20,
            "color_consistency": 0.15,
            "clarity": 0.15
        }

        # Thresholds calibrated for real-world coconut photos
        self.thresholds = thresholds or {
            "A": 72.0,   # 72-100 → Grade A (High Quality)
            "B": 45.0    # 45-71  → Grade B (Medium Quality), <45 → Grade C
        }

    def analyze(self, image, prediction: str = None):
        """
        Accepts a PIL Image or NumPy array and returns full quality assessment dict.

        Args:
            image      : PIL Image or NumPy array of the coconut photo.
            prediction : ML prediction result — 'HEALTHY' or 'FUNGAL'.
                         If 'FUNGAL', coconut quality grade is forced to C
                         regardless of image quality score.
        """
        if isinstance(image, Image.Image):
            pil_img = image.convert("RGB")
            np_img = np.array(pil_img, dtype=np.float32)
        elif isinstance(image, np.ndarray):
            np_img = image.astype(np.float32)
            if np_img.ndim == 2:
                np_img = np.stack([np_img]*3, axis=-1)
            pil_img = Image.fromarray(np_img.astype(np.uint8))
        else:
            raise ValueError("Unsupported image type. Provide a PIL Image or NumPy array.")

        # Step 1: Compute raw image quality score (0-100)
        factors = self.get_quality_factors(np_img)
        image_quality_score = self.calculate_quality_score(factors)
        image_grade, image_grade_label = self.get_image_grade(image_quality_score)

        # Step 2: Apply ML prediction override
        # FUNGAL coconuts are ALWAYS Grade C — contamination = low coconut quality
        is_fungal = (prediction is not None and str(prediction).upper() == "FUNGAL")

        if is_fungal:
            final_grade = "C"
            final_grade_label = "Low Quality"
            explanation = (
                "Grade C: Fungal contamination detected by the AI model. "
                "Regardless of image clarity, a coconut with fungal contamination "
                "is classified as Low Quality and is not suitable for consumption or processing."
            )
        else:
            final_grade = image_grade
            final_grade_label = image_grade_label
            explanation = self.get_explanation(image_grade)

        disclaimer = (
            "Visual quality assessment based on image characteristics and AI prediction. "
            "Does not certify internal edible safety or replace expert agricultural testing."
        )

        return {
            "quality_score": round(float(image_quality_score), 1),
            "grade": final_grade,
            "grade_label": final_grade_label,
            "image_grade": image_grade,           # raw image-only grade (for display)
            "image_quality_score": round(float(image_quality_score), 1),
            "fungal_override": is_fungal,          # True if grade was forced to C due to fungal
            "explanation": explanation,
            "disclaimer": disclaimer,
            "factors": {k: round(float(v), 1) for k, v in factors.items()}
        }

    def get_quality_factors(self, np_img):
        """Calculates 0-100 scores for measurable visual characteristics."""
        # Grayscale: 0.299 R + 0.587 G + 0.114 B
        gray = 0.299 * np_img[:, :, 0] + 0.587 * np_img[:, :, 1] + 0.114 * np_img[:, :, 2]

        # 1. Brightness / Exposure (ideal mean ~ 128)
        mean_brightness = float(np.mean(gray))
        brightness_diff = abs(mean_brightness - 128.0)
        brightness_score = max(0.0, 100.0 - (brightness_diff / 128.0) * 100.0)

        # 2. Contrast (std deviation of grayscale; real photos std ~ 20-50)
        std_contrast = float(np.std(gray))
        contrast_score = min(100.0, (std_contrast / 28.0) * 100.0)

        # 3. Sharpness & Blur (gradient variance; real photos grad_var ~ 100-400)
        gx = np.diff(gray, axis=1)
        gy = np.diff(gray, axis=0)
        grad_var = float(np.var(gx) + np.var(gy))
        sharpness_score = min(100.0, (grad_var / 150.0) * 100.0)
        blur_score = min(100.0, max(20.0, sharpness_score * 1.05))

        # 4. Color Consistency (avg std across RGB channels)
        channel_stds = [np.std(np_img[:, :, i]) for i in range(3)]
        avg_channel_std = float(np.mean(channel_stds))
        color_consistency_score = max(0.0, min(100.0, 100.0 - abs(avg_channel_std - 45.0) * 0.8))

        # 5. Clarity — log-scaled SNR with floor 35 for clear images
        signal = float(np.mean(gray))
        noise = float(np.std(gray - np.mean(gray))) + 1e-5
        snr = signal / noise
        clarity_score = min(100.0, max(35.0, (np.log1p(snr) / np.log1p(10.0)) * 100.0))

        return {
            "brightness": brightness_score,
            "contrast": contrast_score,
            "sharpness": sharpness_score,
            "blur": blur_score,
            "color_consistency": color_consistency_score,
            "clarity": clarity_score
        }

    def calculate_quality_score(self, factors):
        """Computes weighted total image quality score (0-100)."""
        total = sum(factors[k] * self.weights[k] for k in self.weights if k in factors)
        return min(100.0, max(0.0, total))

    def get_image_grade(self, score):
        """Maps image quality score to A/B/C grade (image-only, no ML override)."""
        if score >= self.thresholds["A"]:
            return "A", "High Quality"
        elif score >= self.thresholds["B"]:
            return "B", "Medium Quality"
        else:
            return "C", "Low Quality"

    def get_explanation(self, grade):
        """Returns explanation text for image-quality-based grade."""
        if grade == "A":
            return (
                "Grade A: Image has good brightness, strong sharpness, "
                "clear surface visibility, and consistent color characteristics."
            )
        elif grade == "B":
            return (
                "Grade B: Image has moderate visual quality. "
                "Some lighting, sharpness, or contrast limitations are present."
            )
        else:
            return (
                "Grade C: Image quality is low due to poor lighting, blur, "
                "low contrast, or inconsistent visual characteristics."
            )
