import model_service
import gradcam
import csv_service
import quality_grading
import yield_calculator
import mold_classifier
import PIL.Image

def run_prediction_pipeline(image_bytes: bytes, filename: str, opacity=0.45, threshold=0.4, colormap="jet"):
    """
    Complete prediction pipeline:
    1. Preprocesses image
    2. Runs singleton Keras MobileNetV2 model
    3. Calculates class & confidence
    4. Evaluates visual image quality grade & explanation
    5. Computes financial yield estimation & economic loss tracking
    6. Performs fungal mold sub-type micro-classification & treatment recommendations
    7. Saves record to prediction_history.csv / SQLite DB
    8. Computes Grad-CAM 4 views
    9. Returns structured response dict
    """
    model = model_service.get_model()

    # Preprocess image
    orig_pil, rgb_pil, resized_pil, img_batch = model_service.preprocess_image_bytes(image_bytes)

    # Predict
    raw_prediction = model.predict(img_batch, verbose=0)[0][0]
    raw_score = float(raw_prediction)

    if raw_score >= 0.5:
        prediction = "HEALTHY"
        confidence = raw_score * 100.0
        explanation = "The system did not detect significant visual indicators of fungal contamination."
    else:
        prediction = "FUNGAL"
        confidence = (1.0 - raw_score) * 100.0
        explanation = "The system detected visual patterns associated with fungal contamination."

    confidence = float(confidence)

    # Run image quality grading
    grader = quality_grading.CoconutQualityGrader()
    quality_res = grader.analyze(orig_pil)

    # Run financial yield & economic loss calculation
    calc = yield_calculator.FinancialYieldCalculator()
    yield_res = calc.calculate_single(
        prediction=prediction,
        quality_score=quality_res["quality_score"],
        grade=quality_res["grade"]
    )

    # Run fungal mold sub-type classification
    mold_cls = mold_classifier.MoldSubtypeClassifier()
    mold_res = mold_cls.analyze_mold(orig_pil, prediction=prediction)

    # Save record to CSV with quality grade info
    csv_record = csv_service.save_prediction_record(
        filename=filename,
        prediction=prediction,
        confidence=confidence,
        quality_score=quality_res["quality_score"],
        quality_grade=quality_res["grade"],
        quality_grade_label=quality_res["grade_label"]
    )

    # Generate Grad-CAM heatmaps
    raw_heatmap = gradcam.compute_raw_gradcam_heatmap(model, img_batch, raw_score)
    gradcam_views = gradcam.generate_four_gradcam_views_b64(orig_pil, raw_heatmap, opacity, threshold, colormap)

    # Stage representations (Base64 for ProcessingPipeline component)
    stage1_b64 = gradcam.pil_to_base64(orig_pil)
    stage2_b64 = gradcam.pil_to_base64(rgb_pil)
    stage3_b64 = gradcam.pil_to_base64(resized_pil)

    return {
        "prediction": prediction,
        "confidence": round(confidence, 2),
        "raw_score": raw_score,
        "explanation": explanation,
        "filename": filename,
        "model": "MobileNetV2-V2",
        "model_accuracy": 92.65,
        "prediction_id": csv_record["Prediction_ID"],
        "date": csv_record["Date"],
        "time": csv_record["Time"],
        "quality_score": quality_res["quality_score"],
        "quality_grade": quality_res["grade"],
        "quality_grade_label": quality_res["grade_label"],
        "quality_factors": quality_res["factors"],
        "quality_explanation": quality_res.get("explanation"),
        "quality_disclaimer": quality_res.get("disclaimer"),
        "yield_analysis": yield_res,
        "mold_analysis": mold_res,
        "gradcam_views": gradcam_views,
        "pipeline_stages": {
            "stage1_original": stage1_b64,
            "stage2_rgb": stage2_b64,
            "stage3_resized": stage3_b64,
            "stage4_info": "MobileNetV2 Preprocessing Applied [-1, 1]"
        }
    }
