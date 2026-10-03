import pandas as pd
import plotly.express as px
import plotly.graph_objects as go

def compute_analytics_summary(df_history):
    """
    Computes key summary statistics from prediction_history.csv DataFrame.
    """
    if df_history is None or df_history.empty:
        return {
            "total": 0,
            "healthy": 0,
            "fungal": 0,
            "healthy_pct": 0.0,
            "fungal_pct": 0.0,
            "avg_conf": 0.0,
            "max_conf": 0.0,
            "min_conf": 0.0
        }

    total = len(df_history)
    healthy = len(df_history[df_history["Prediction"] == "HEALTHY"])
    fungal = len(df_history[df_history["Prediction"] == "FUNGAL"])

    healthy_pct = (healthy / total * 100.0) if total > 0 else 0.0
    fungal_pct = (fungal / total * 100.0) if total > 0 else 0.0

    confidences = df_history["Confidence"].astype(float)
    avg_conf = float(confidences.mean()) if total > 0 else 0.0
    max_conf = float(confidences.max()) if total > 0 else 0.0
    min_conf = float(confidences.min()) if total > 0 else 0.0

    return {
        "total": total,
        "healthy": healthy,
        "fungal": fungal,
        "healthy_pct": round(healthy_pct, 1),
        "fungal_pct": round(fungal_pct, 1),
        "avg_conf": round(avg_conf, 2),
        "max_conf": round(max_conf, 2),
        "min_conf": round(min_conf, 2)
    }

def create_healthy_vs_fungal_pie(df_history):
    """Chart 1: Healthy vs Fungal Donut Chart."""
    if df_history is None or df_history.empty:
        return None

    counts = df_history["Prediction"].value_counts().reset_index()
    counts.columns = ["Prediction", "Count"]

    color_map = {"HEALTHY": "#059669", "FUNGAL": "#dc2626"}

    fig = px.pie(
        counts,
        names="Prediction",
        values="Count",
        hole=0.4,
        color="Prediction",
        color_discrete_map=color_map,
        title="Healthy vs Fungal Class Ratio"
    )
    fig.update_traces(textinfo="percent+label", hoverinfo="label+value+percent")
    fig.update_layout(margin=dict(t=40, b=20, l=20, r=20), height=320)
    return fig

def create_confidence_histogram(df_history):
    """Chart 2: Confidence Distribution Histogram."""
    if df_history is None or df_history.empty:
        return None

    fig = px.histogram(
        df_history,
        x="Confidence",
        color="Prediction",
        color_discrete_map={"HEALTHY": "#059669", "FUNGAL": "#dc2626"},
        nbins=15,
        title="Confidence Score Distribution (%)",
        labels={"Confidence": "Confidence Score (%)", "count": "Frequency"}
    )
    fig.update_layout(bargap=0.1, margin=dict(t=40, b=20, l=20, r=20), height=320)
    return fig

def create_prediction_timeline(df_history):
    """Chart 3: Prediction Activity Timeline."""
    if df_history is None or df_history.empty:
        return None

    df_plot = df_history.copy()
    df_plot["DateTime"] = pd.to_datetime(df_plot["Date"] + " " + df_plot["Time"], errors="coerce")
    df_plot = df_plot.sort_values("DateTime")

    fig = px.scatter(
        df_plot,
        x="DateTime",
        y="Confidence",
        color="Prediction",
        color_discrete_map={"HEALTHY": "#059669", "FUNGAL": "#dc2626"},
        size="Confidence",
        hover_data=["Filename", "Prediction_ID"],
        title="Prediction History Timeline & Confidence Scores"
    )
    fig.update_traces(marker=dict(line=dict(width=1, color='DarkSlateGrey')))
    fig.update_layout(margin=dict(t=40, b=20, l=20, r=20), height=320)
    return fig

def create_trend_chart(df_history):
    """Chart 4: Healthy/Fungal cumulative trend over time."""
    if df_history is None or df_history.empty:
        return None

    df_plot = df_history.copy()
    df_plot["DateTime"] = pd.to_datetime(df_plot["Date"] + " " + df_plot["Time"], errors="coerce")
    df_plot = df_plot.sort_values("DateTime")

    df_plot["Healthy_Cum"] = (df_plot["Prediction"] == "HEALTHY").cumsum()
    df_plot["Fungal_Cum"] = (df_plot["Prediction"] == "FUNGAL").cumsum()

    fig = go.Figure()
    fig.add_trace(go.Scatter(x=df_plot["DateTime"], y=df_plot["Healthy_Cum"], mode="lines+markers", name="Healthy Cumulative", line=dict(color="#059669", width=2)))
    fig.add_trace(go.Scatter(x=df_plot["DateTime"], y=df_plot["Fungal_Cum"], mode="lines+markers", name="Fungal Cumulative", line=dict(color="#dc2626", width=2)))

    fig.update_layout(
        title="Cumulative Detection Trend Over Time",
        xaxis_title="Timeline",
        yaxis_title="Cumulative Count",
        margin=dict(t=40, b=20, l=20, r=20),
        height=320
    )
    return fig
