import datetime
import pandas as pd
import csv_service

def get_analytics_summary(time_range: str = "all"):
    """Computes summary KPI stats, time-series trends, and chart data for the React dashboard."""
    records = csv_service.get_history()
    if not records:
        return {
            "total_predictions": 0,
            "healthy_count": 0,
            "fungal_count": 0,
            "healthy_pct": 0.0,
            "fungal_pct": 0.0,
            "avg_confidence": 0.0,
            "max_confidence": 0.0,
            "min_confidence": 0.0,
            "grade_a_count": 0,
            "grade_b_count": 0,
            "grade_c_count": 0,
            "avg_quality_score": 0.0,
            "model_accuracy": 92.65,
            "recent_predictions": [],
            "distribution": [
                {"name": "HEALTHY", "value": 0},
                {"name": "FUNGAL", "value": 0}
            ],
            "timeline": [],
            "trends": {
                "predictions_trend": [],
                "grade_trend": [],
                "confidence_trend": [],
                "quality_score_trend": []
            }
        }

    df = pd.DataFrame(records)

    # Convert Date column to datetime for filtering
    if "Date" in df.columns:
        df["Date_Obj"] = pd.to_datetime(df["Date"], errors='coerce')
    else:
        df["Date_Obj"] = pd.to_datetime(datetime.date.today())

    now = pd.to_datetime(datetime.date.today())

    # Time range filtering
    if time_range == "today":
        df = df[df["Date_Obj"].dt.date == now.date()]
    elif time_range == "7days":
        cutoff = now - pd.Timedelta(days=7)
        df = df[df["Date_Obj"] >= cutoff]
    elif time_range == "30days":
        cutoff = now - pd.Timedelta(days=30)
        df = df[df["Date_Obj"] >= cutoff]

    total = len(df)
    healthy = len(df[df["Prediction"] == "HEALTHY"]) if total > 0 else 0
    fungal = len(df[df["Prediction"] == "FUNGAL"]) if total > 0 else 0

    healthy_pct = round((healthy / total * 100.0), 1) if total > 0 else 0.0
    fungal_pct = round((fungal / total * 100.0), 1) if total > 0 else 0.0

    confidences = df["Confidence"].astype(float) if total > 0 else pd.Series([])
    avg_conf = round(float(confidences.mean()), 2) if total > 0 else 0.0
    max_conf = round(float(confidences.max()), 2) if total > 0 else 0.0
    min_conf = round(float(confidences.min()), 2) if total > 0 else 0.0

    # Grade counts
    g_a = len(df[df["Quality_Grade"] == "A"]) if total > 0 and "Quality_Grade" in df.columns else 0
    g_b = len(df[df["Quality_Grade"] == "B"]) if total > 0 and "Quality_Grade" in df.columns else 0
    g_c = len(df[df["Quality_Grade"] == "C"]) if total > 0 and "Quality_Grade" in df.columns else 0

    # Quality scores mean
    q_scores = pd.to_numeric(df["Quality_Score"], errors='coerce').dropna() if total > 0 and "Quality_Score" in df.columns else pd.Series([])
    avg_quality = round(float(q_scores.mean()), 1) if not q_scores.empty else 0.0

    # Recent 10 sorted newest first
    recent = df.tail(10).iloc[::-1].to_dict(orient="records") if total > 0 else []

    # Timeline data
    timeline_data = []
    for idx, row in df.iterrows():
        timeline_data.append({
            "id": row.get("Prediction_ID", idx + 1),
            "timestamp": f"{row.get('Date', '')} {row.get('Time', '')}",
            "filename": row.get("Filename", "sample.jpg"),
            "prediction": row.get("Prediction", "N/A"),
            "confidence": float(row.get("Confidence", 0.0))
        })

    # Time-series trend aggregations by Date
    pred_trend = []
    grade_trend = []
    conf_trend = []
    q_score_trend = []

    if total > 0 and "Date" in df.columns:
        grouped = df.groupby("Date")
        for date_str, group in grouped:
            h_c = len(group[group["Prediction"] == "HEALTHY"])
            f_c = len(group[group["Prediction"] == "FUNGAL"])
            pred_trend.append({"date": date_str, "healthy": h_c, "fungal": f_c, "total": len(group)})

            ga = len(group[group["Quality_Grade"] == "A"])
            gb = len(group[group["Quality_Grade"] == "B"])
            gc = len(group[group["Quality_Grade"] == "C"])
            grade_trend.append({"date": date_str, "grade_a": ga, "grade_b": gb, "grade_c": gc})

            c_mean = round(float(pd.to_numeric(group["Confidence"], errors='coerce').mean()), 2)
            conf_trend.append({"date": date_str, "avg_confidence": c_mean})

            qs_group = pd.to_numeric(group["Quality_Score"], errors='coerce').dropna()
            qs_mean = round(float(qs_group.mean()), 1) if not qs_group.empty else 0.0
            q_score_trend.append({"date": date_str, "avg_quality_score": qs_mean})

    return {
        "total_predictions": total,
        "healthy_count": healthy,
        "fungal_count": fungal,
        "healthy_pct": healthy_pct,
        "fungal_pct": fungal_pct,
        "avg_confidence": avg_conf,
        "max_confidence": max_conf,
        "min_confidence": min_conf,
        "grade_a_count": g_a,
        "grade_b_count": g_b,
        "grade_c_count": g_c,
        "avg_quality_score": avg_quality,
        "model_accuracy": 92.65,
        "recent_predictions": recent,
        "distribution": [
            {"name": "HEALTHY", "value": healthy},
            {"name": "FUNGAL", "value": fungal}
        ],
        "timeline": timeline_data,
        "trends": {
            "predictions_trend": pred_trend,
            "grade_trend": grade_trend,
            "confidence_trend": conf_trend,
            "quality_score_trend": q_score_trend
        }
    }
