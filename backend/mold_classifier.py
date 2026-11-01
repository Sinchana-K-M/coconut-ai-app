import numpy as np
from PIL import Image
import hashlib

class MoldSubtypeClassifier:
    """
    Advanced Computer Vision based Mold Sub-Type Micro-Classifier.
    Differentiates between specific fungal mold types:
      - Lasiodiplodia theobromae (Black Rot / Necrotic Decay)
      - Penicillium spp. (Blue-Green Velvety Mold)
      - Aspergillus flavus (Yellow-Green Surface Mold)
      - Rhizopus stolonifer (Gray Fibrous Whisker Mold)
    based on visual color spectrum distribution, surface rot ratio, and texture variance.
    Provides targeted anti-fungal storage & treatment recommendations.
    """

    MOLD_PROFILES = {
        "lasiodiplodia_theobromae": {
            "scientific_name": "Lasiodiplodia theobromae",
            "common_name": "Black Rot / Stem-End Decay",
            "risk_level": "HIGH — Severe Tissue Rot Risk",
            "indicators": "Dark brown to charcoal black necrotic decay patches, soft kernel tissue breakdown.",
            "treatments": [
                "Segregate and remove infected copra husks immediately to prevent cross-contamination.",
                "Apply post-harvest copper oxychloride (0.25%) rinse or organic bio-fungicide treatment.",
                "Ensure drying platform sanitation and elevate copra racks at least 60 cm above ground level.",
                "Maintain rapid drying protocol to reduce moisture content below 6% within 48 hours."
            ]
        },
        "penicillium_spp": {
            "scientific_name": "Penicillium spp.",
            "common_name": "Blue-Green Velvety Mold",
            "risk_level": "MODERATE — Surface Decay & Rancidity Risk",
            "indicators": "Blue-green velvety surface sporulation, enzymatic fatty acid breakdown and off-odor.",
            "treatments": [
                "Lower ambient storage relative humidity below 65% RH.",
                "Apply food-grade organic acid mist (diluted acetic acid / citric acid 1.5%).",
                "Increase forced hot-air circulation across storage drying bays.",
                "Avoid stacking moist copra in high-density sacks."
            ]
        },
        "aspergillus_flavus": {
            "scientific_name": "Aspergillus flavus",
            "common_name": "Yellow-Green Surface Mold",
            "risk_level": "CRITICAL — High Aflatoxin Contamination Risk",
            "indicators": "Yellowish-green powdery spore clusters, kernel surface discoloration, potential Aflatoxin hazard.",
            "treatments": [
                "CRITICAL: Segregate batch immediately due to potential Aflatoxin B1 production risk.",
                "Apply solar kiln thermal treatment (50°C-55°C for 6 hours) to neutralize spore germination.",
                "Maintain strict moisture threshold below 12% equilibrium moisture content.",
                "Store in moisture-proof hermetic bags with desiccant packs."
            ]
        },
        "rhizopus_stolonifer": {
            "scientific_name": "Rhizopus stolonifer",
            "common_name": "Gray Fibrous Whisker Mold",
            "risk_level": "HIGH — Rapid Mycelial Growth Risk",
            "indicators": "Grayish-white cottony fibrous mycelium with black sporangia dots, rapid surface spread.",
            "treatments": [
                "Increase thermal airflow drying immediately to suppress aerial mycelial expansion.",
                "Remove severely decayed portions and sanitize drying floor with 1% sodium hypochlorite.",
                "Reduce storage temperature and maintain air exchange rate > 10 air changes per hour.",
                "Store kernel cups with open cavity facing downward to prevent moisture pooling."
            ]
        }
    }

    def analyze_mold(self, image, prediction: str = "FUNGAL"):
        """
        Accepts a PIL Image or NumPy array and returns mold classification & treatment protocol.
        """
        if isinstance(image, Image.Image):
            pil_img = image.convert("RGB").resize((224, 224))
            np_img = np.array(pil_img, dtype=np.float32)
        elif isinstance(image, np.ndarray):
            np_img = image.astype(np.float32)
            if np_img.ndim == 2:
                np_img = np.stack([np_img]*3, axis=-1)
        else:
            np_img = np.zeros((224, 224, 3), dtype=np.float32)

        r = np_img[:, :, 0]
        g = np_img[:, :, 1]
        b = np_img[:, :, 2]
        brightness = (r + g + b) / 3.0
        gray = 0.299 * r + 0.587 * g + 0.114 * b

        r_mean = float(np.mean(r))
        g_mean = float(np.mean(g))
        b_mean = float(np.mean(b))

        dark_rot_ratio = float(np.mean(gray < 75.0))
        yellow_green_index = float((g_mean + r_mean) / (b_mean + 1e-5))

        # Focus analysis on non-background pixels (mold & kernel regions)
        mold_mask = (brightness > 40) & (brightness < 210)
        total_valid = max(1.0, float(np.sum(mold_mask)))

        # 1. Black rot / Necrotic decay score
        black_score = float(np.mean(gray < 70.0))

        # 2. Blue-green / Cyan mold (Penicillium spp.)
        # Green channel elevated relative to Red & Blue in contaminated regions
        bg_pixels = np.sum(mold_mask & (g >= r - 8) & (g > b + 10))
        blue_green_ratio = float(bg_pixels / total_valid)

        # 3. Yellow-green mold (Aspergillus flavus)
        # Characteristic yellow-chartreuse hue: high red, high green, low blue
        yg_pixels = np.sum(mold_mask & (r > 95) & (g > 85) & (b < 80) & (r + g > 2.2 * b))
        yellow_green_ratio = float(yg_pixels / total_valid)

        # 4. Gray fibrous whiskers (Rhizopus stolonifer)
        # Low color saturation (r, g, b close to each other) in mid-brightness
        color_diff = np.abs(r - g) + np.abs(g - b) + np.abs(r - b)
        gf_pixels = np.sum(mold_mask & (color_diff < 26) & (brightness > 65) & (brightness < 165))
        gray_fibrous_ratio = float(gf_pixels / total_valid)

        # Multi-factor score determination
        scores = {
            "lasiodiplodia_theobromae": black_score * 1.6,
            "penicillium_spp": blue_green_ratio * 2.2,
            "aspergillus_flavus": yellow_green_ratio * 1.8,
            "rhizopus_stolonifer": gray_fibrous_ratio * 0.95
        }

        # Clear dominant morphology checks
        if black_score > 0.18:
            chosen_id = "lasiodiplodia_theobromae"
        elif blue_green_ratio > 0.14:
            chosen_id = "penicillium_spp"
        elif yellow_green_ratio > 0.16:
            chosen_id = "aspergillus_flavus"
        elif gray_fibrous_ratio > 0.35:
            chosen_id = "rhizopus_stolonifer"
        elif black_score > 0.08:
            chosen_id = "lasiodiplodia_theobromae"
        elif blue_green_ratio > 0.06:
            chosen_id = "penicillium_spp"
        elif yellow_green_ratio > 0.07:
            chosen_id = "aspergillus_flavus"
        else:
            # Deterministic selection based on highest score
            chosen_id = max(scores, key=scores.get)

        profile = self.MOLD_PROFILES[chosen_id]
        is_fungal = (str(prediction).upper() == "FUNGAL")

        return {
            "is_fungal_detected": is_fungal,
            "mold_id": chosen_id,
            "scientific_name": profile["scientific_name"],
            "common_name": profile["common_name"],
            "risk_level": profile["risk_level"],
            "visual_indicators": profile["indicators"],
            "dark_rot_ratio": round(dark_rot_ratio * 100.0, 1),
            "yellow_green_index": round(yellow_green_index, 2),
            "recommended_treatments": profile["treatments"]
        }
