import numpy as np
from PIL import Image

class CoconutQualityGrader:
    """
    Computer Vision based Quality Scoring Module.
    Calculates reproducible quality scores (0-100) based on measurable image characteristics:
    - Brightness / Exposure (15%)
    - Contrast (15%)
    - Sharpness (20%)
    - Blur Level (20%)
    - Color Consistency (15%)
    - Visible Image Clarity (15%)
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
        
        # Configurable Grade Thresholds (calibrated for real-world coconut photos)
        self.thresholds = thresholds or {
            "A": 72.0,  # 72-100: Grade A - High Quality
            "B": 45.0   # 45-71:  Grade B - Medium Quality (0-44: Grade C - Low Quality)
        }

    def analyze(self, image):
        """
        Accepts a PIL Image or NumPy array and returns full quality assessment dict.
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

        factors = self.get_quality_factors(np_img)
        quality_score = self.calculate_quality_score(factors)
        grade, grade_label = self.get_grade(quality_score)
        explanation = self.get_explanation(grade)
        disclaimer = "Visual quality assessment based on image characteristics. Does not certify internal edible safety or replace expert testing."

        return {
            "quality_score": round(float(quality_score), 1),
            "grade": grade,
            "grade_label": grade_label,
            "explanation": explanation,
            "disclaimer": disclaimer,
            "factors": {k: round(float(v), 1) for k, v in factors.items()}
        }

    def get_quality_factors(self, np_img):
        """Calculates 0-100 scores for measurable visual characteristics."""
        # Convert RGB to grayscale intensity: 0.299 R + 0.587 G + 0.114 B
        gray = 0.299 * np_img[:, :, 0] + 0.587 * np_img[:, :, 1] + 0.114 * np_img[:, :, 2]

        # 1. Brightness / Exposure Factor (Ideal mean ~ 128)
        mean_brightness = float(np.mean(gray))
        brightness_diff = abs(mean_brightness - 128.0)
        brightness_score = max(0.0, 100.0 - (brightness_diff / 128.0) * 100.0)

        # 2. Contrast Factor (Standard deviation of grayscale intensity)
        std_contrast = float(np.std(gray))
        # Real coconut photos: std ~ 20-50 (lower than synthetic). Divisor lowered from 55 → 28.
        contrast_score = min(100.0, (std_contrast / 28.0) * 100.0)

        # 3. Sharpness & Blur Factors (Gradient variance)
        gx = np.diff(gray, axis=1)
        gy = np.diff(gray, axis=0)
        grad_var = float(np.var(gx) + np.var(gy))

        # Normalize sharpness — divisor lowered from 800 → 150 for real coconut photos.
        # Real well-focused photos typically have grad_var 100–400; synthetic was higher.
        sharpness_score = min(100.0, (grad_var / 150.0) * 100.0)
        # Blur factor: derived from sharpness; floor raised to 20 so non-blurry photos aren't penalised.
        blur_score = min(100.0, max(20.0, sharpness_score * 1.05))

        # 4. Color Consistency (Standard deviation across RGB color channels)
        channel_stds = [np.std(np_img[:, :, i]) for i in range(3)]
        avg_channel_std = float(np.mean(channel_stds))
        # Uniform natural colors have controlled channel variation
        color_consistency_score = max(0.0, min(100.0, 100.0 - abs(avg_channel_std - 45.0) * 0.8))

        # 5. Image Clarity (Signal to Noise ratio metric)
        # Real coconut photos have uniform surfaces → low noise → very high SNR.
        # Use log-scaled SNR with a generous floor so well-exposed photos score well.
        signal = float(np.mean(gray))
        noise = float(np.std(gray - np.mean(gray))) + 1e-5
        snr = signal / noise
        # Log-scale: SNR of 10 → ~100, SNR of 1 → ~0; floor at 35 for clear images
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
        """Computes weighted total quality score (0-100)."""
        total_score = sum(factors[k] * self.weights[k] for k in self.weights if k in factors)
        return min(100.0, max(0.0, total_score))

    def get_grade(self, score):
        """Maps numerical quality score to letter Grade and Grade Label."""
        if score >= self.thresholds["A"]:
            return "A", "High Quality"
        elif score >= self.thresholds["B"]:
            return "B", "Medium Quality"
        else:
            return "C", "Low Quality"

    def get_explanation(self, grade):
        """Returns quality assessment explanation based on assigned grade."""
        if grade == "A":
            return "Grade A: Image has good brightness, strong sharpness, clear surface visibility, and consistent color characteristics."
        elif grade == "B":
            return "Grade B: Image has moderate visual quality. Some lighting, sharpness, or contrast limitations are present."
        else:
            return "Grade C: Image quality is low due to factors such as poor lighting, blur, low contrast, or inconsistent visual characteristics."
