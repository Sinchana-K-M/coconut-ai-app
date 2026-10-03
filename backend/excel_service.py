import io
import pandas as pd

def export_history_excel(records: list) -> bytes:
    """Exports prediction history records list to Excel (.xlsx) format."""
    if not records:
        df = pd.DataFrame(columns=[
            "Prediction_ID", "Date", "Time", "Filename", "Source",
            "Prediction", "Confidence", "Quality_Score", "Quality_Grade",
            "Model", "Model_Accuracy"
        ])
    else:
        df = pd.DataFrame(records)

    buffer = io.BytesIO()
    with pd.ExcelWriter(buffer, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name="Prediction_History")

    excel_bytes = buffer.getvalue()
    buffer.close()
    return excel_bytes

def export_batch_excel(batch_summary: dict) -> bytes:
    """Exports batch analysis results to multi-tab Excel (.xlsx) file."""
    results = batch_summary.get("results", [])
    df_results = pd.DataFrame(results)

    summary_rows = [{
        "Batch_ID": batch_summary.get("batch_id", "N/A"),
        "Total_Images": batch_summary.get("total_images", 0),
        "Healthy_Count": batch_summary.get("healthy_count", 0),
        "Fungal_Count": batch_summary.get("fungal_count", 0),
        "Grade_A_Count": batch_summary.get("grade_a_count", 0),
        "Grade_B_Count": batch_summary.get("grade_b_count", 0),
        "Grade_C_Count": batch_summary.get("grade_c_count", 0),
        "Average_Confidence_%": batch_summary.get("avg_confidence", 0.0),
        "Average_Quality_Score": batch_summary.get("avg_quality_score", 0.0),
        "Model": "MobileNetV2-V2"
    }]
    df_summary = pd.DataFrame(summary_rows)

    buffer = io.BytesIO()
    with pd.ExcelWriter(buffer, engine='openpyxl') as writer:
        df_summary.to_excel(writer, index=False, sheet_name="Batch_Summary")
        if not df_results.empty:
            df_results.to_excel(writer, index=False, sheet_name="Itemized_Results")

    excel_bytes = buffer.getvalue()
    buffer.close()
    return excel_bytes
