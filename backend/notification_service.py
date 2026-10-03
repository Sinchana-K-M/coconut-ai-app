# Configurable global fungal alert threshold (Section Feature 11 Requirement)
FUNGAL_ALERT_THRESHOLD = 0.80  # 80% confidence threshold

def check_fungal_alert(prediction: str, confidence: float) -> dict:
    """
    Evaluates whether a prediction triggers a fungal contamination alert.
    Uses non-alarmist, responsible notification phrasing.
    """
    conf_fraction = float(confidence) / 100.0 if float(confidence) > 1.0 else float(confidence)
    
    is_fungal = (str(prediction).upper() == "FUNGAL")
    meets_threshold = (conf_fraction >= FUNGAL_ALERT_THRESHOLD)

    if is_fungal and meets_threshold:
        return {
            "triggered": True,
            "level": "WARNING",
            "message": "Possible fungal contamination detected. Consider further inspection.",
            "threshold": FUNGAL_ALERT_THRESHOLD * 100.0,
            "confidence": round(float(confidence), 2)
        }
    
    return {
        "triggered": False,
        "level": "INFO",
        "message": "No high-confidence fungal contamination alert triggered.",
        "threshold": FUNGAL_ALERT_THRESHOLD * 100.0,
        "confidence": round(float(confidence), 2)
    }

def get_fungal_alerts_summary(records: list) -> dict:
    """Computes total count of fungal alerts meeting configured threshold across history."""
    alert_count = 0
    recent_alerts = []

    for rec in records:
        pred = str(rec.get("Prediction", rec.get("prediction", "")))
        conf = float(rec.get("Confidence", rec.get("confidence", 0.0)))
        alert_info = check_fungal_alert(pred, conf)
        if alert_info["triggered"]:
            alert_count += 1
            recent_alerts.append({
                "id": rec.get("Prediction_ID", rec.get("id")),
                "filename": rec.get("Filename", rec.get("filename")),
                "confidence": conf,
                "date": rec.get("Date", rec.get("date")),
                "message": alert_info["message"]
            })

    return {
        "alert_count": alert_count,
        "threshold_pct": FUNGAL_ALERT_THRESHOLD * 100.0,
        "recent_alerts": recent_alerts[-5:]  # top 5 newest alerts
    }
