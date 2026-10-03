import os
import sys
import pandas as pd
import numpy as np
import streamlit as st
from PIL import Image

# Import custom project modules
import prediction_utils as pu
import gradcam as gc
import dashboard as db

# ==============================================================================
# STREAMLIT PAGE CONFIGURATION
# ==============================================================================
st.set_page_config(
    page_title="AI-Powered Coconut Quality Assessment",
    page_icon="🥥",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for Professional Agricultural & AI Theme
st.markdown("""
<style>
    /* Global Styles */
    .main {
        background-color: #f8fafc;
    }
    .stApp {
        font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    }
    
    /* Header Card */
    .header-card {
        background: linear-gradient(135deg, #064e3b 0%, #047857 100%);
        color: white;
        padding: 24px;
        border-radius: 16px;
        margin-bottom: 24px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        text-align: center;
    }
    .header-card h1 {
        color: #ffffff !important;
        font-size: 32px;
        font-weight: 800;
        margin-bottom: 6px;
    }
    .header-card p {
        color: #a7f3d0;
        font-size: 16px;
        margin: 0;
        font-weight: 500;
    }

    /* KPI Metric Cards */
    .kpi-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 16px;
        text-align: center;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .kpi-val {
        font-size: 26px;
        font-weight: 800;
        color: #0f172a;
    }
    .kpi-lbl {
        font-size: 12px;
        color: #64748b;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
    .kpi-accuracy {
        background: #f0fdf4;
        border: 1px solid #bbf7d0;
    }
    .kpi-accuracy .kpi-val {
        color: #15803d;
    }

    /* Status Badges */
    .badge-healthy {
        background-color: #dcfce7;
        color: #166534;
        padding: 4px 12px;
        border-radius: 20px;
        font-weight: 700;
        font-size: 13px;
        border: 1px solid #86efac;
    }
    .badge-fungal {
        background-color: #fee2e2;
        color: #991b1b;
        padding: 4px 12px;
        border-radius: 20px;
        font-weight: 700;
        font-size: 13px;
        border: 1px solid #fca5a5;
    }
</style>
""", unsafe_allow_html=True)


# ==============================================================================
# CACHED MODEL LOAD
# ==============================================================================
@st.cache_resource
def get_model():
    """Loads and caches model once to prevent reloading overhead."""
    return pu.load_trained_model()

try:
    model = get_model()
except Exception as e:
    st.error(f"⚠️ Failed to load model `coconut_fungal_model_v2.keras`: {str(e)}")
    model = None


# Initialize session state for current image analysis
if "current_orig_pil" not in st.session_state:
    st.session_state.current_orig_pil = None
if "current_batch" not in st.session_state:
    st.session_state.current_batch = None
if "current_pred" not in st.session_state:
    st.session_state.current_pred = None
if "current_conf" not in st.session_state:
    st.session_state.current_conf = None
if "current_raw_score" not in st.session_state:
    st.session_state.current_raw_score = None
if "current_filename" not in st.session_state:
    st.session_state.current_filename = None
if "stage_images" not in st.session_state:
    st.session_state.stage_images = None


# ==============================================================================
# SIDEBAR NAVIGATION
# ==============================================================================
st.sidebar.image("https://img.icons8.com/color/96/coconut.png", width=70)
st.sidebar.title("🥥 Navigation")
page = st.sidebar.radio(
    "Select System Section:",
    [
        "🏠 Main Dashboard",
        "🔍 Analyze Coconut",
        "🖼 Image Processing View",
        "🔥 Grad-CAM Explainable AI",
        "📊 Analytics Dashboard",
        "📁 Prediction History",
        "🤖 Model Information",
        "ℹ️ Workflow & About"
    ]
)

st.sidebar.markdown("---")
st.sidebar.info("💡 **Model**: MobileNetV2-V2\n🎯 **Test Accuracy**: 92.65%\n📁 **Test Dataset**: 68 Images")


# ==============================================================================
# TOP HEADER CARD & DASHBOARD SUMMARY METRICS
# ==============================================================================
st.markdown("""
<div class="header-card">
    <h1>🥥 AI-Powered Coconut Quality Assessment</h1>
    <p>Computer Vision • Fungal Detection • Explainable AI (Grad-CAM)</p>
</div>
""", unsafe_allow_html=True)

# Read prediction history for KPI metrics
df_history = pu.load_prediction_history()
summary_stats = db.compute_analytics_summary(df_history)

# Display Top KPI Summary Cards (Section 1 & Section 17 Requirement)
col_kpi1, col_kpi2, col_kpi3, col_kpi4, col_kpi5 = st.columns(5)
with col_kpi1:
    st.markdown(f'<div class="kpi-card"><div class="kpi-lbl">Total Scans</div><div class="kpi-val">{summary_stats["total"]}</div></div>', unsafe_allow_html=True)
with col_kpi2:
    st.markdown(f'<div class="kpi-card"><div class="kpi-lbl">Healthy Samples</div><div class="kpi-val" style="color:#059669;">{summary_stats["healthy"]}</div></div>', unsafe_allow_html=True)
with col_kpi3:
    st.markdown(f'<div class="kpi-card"><div class="kpi-lbl">Fungal Samples</div><div class="kpi-val" style="color:#dc2626;">{summary_stats["fungal"]}</div></div>', unsafe_allow_html=True)
with col_kpi4:
    st.markdown(f'<div class="kpi-card"><div class="kpi-lbl">Avg Confidence</div><div class="kpi-val" style="color:#2563eb;">{summary_stats["avg_conf"]:.1f}%</div></div>', unsafe_allow_html=True)
with col_kpi5:
    st.markdown('<div class="kpi-card kpi-accuracy"><div class="kpi-lbl">Model Accuracy</div><div class="kpi-val">92.65%</div></div>', unsafe_allow_html=True)

st.markdown("<br>", unsafe_allow_html=True)


# ==============================================================================
# PAGE 1: MAIN DASHBOARD
# ==============================================================================
if page == "🏠 Main Dashboard":
    st.subheader("📌 Overview & Recent Activity")
    
    col_dash1, col_dash2 = st.columns([6, 5])
    with col_dash1:
        st.markdown("#### 🕒 Recent Predictions")
        if not df_history.empty:
            df_recent = df_history.tail(10).iloc[::-1]
            st.dataframe(
                df_recent[["Date", "Time", "Filename", "Prediction", "Confidence", "Model"]],
                use_container_width=True,
                height=320
            )
        else:
            st.info("No prediction history available yet. Go to **Analyze Coconut** to process an image.")

    with col_dash2:
        st.markdown("#### 📊 Quick Ratio")
        pie_fig = db.create_healthy_vs_fungal_pie(df_history)
        if pie_fig:
            st.plotly_chart(pie_fig, use_container_width=True)
        else:
            st.info("Pie chart will render once predictions are recorded.")

    st.markdown("---")
    st.subheader("⭐ Quick Start Instructions")
    st.markdown("""
    1. Navigate to **🔍 Analyze Coconut** in the sidebar.
    2. Upload a coconut or copra image (**JPG, JPEG, PNG**).
    3. View live model classification, confidence progress bar, and preprocessing pipeline.
    4. Explore **🔥 Grad-CAM Explainable AI** for visual feature activation heatmaps.
    5. Download current or full prediction history as **CSV**.
    """)


# ==============================================================================
# PAGE 2: ANALYZE COCONUT
# ==============================================================================
elif page == "🔍 Analyze Coconut":
    st.subheader("🔍 Image Upload & Quality Assessment")

    uploaded_file = st.file_uploader("Upload Coconut or Copra Image", type=["jpg", "jpeg", "png"])

    if uploaded_file is not None:
        try:
            filename = uploaded_file.name
            pil_img = Image.open(uploaded_file)
            
            # Preprocess image across 4 stages
            stage1, stage2, stage3, stage4_batch = pu.preprocess_image_pipeline(pil_img)
            
            # Store in session state
            st.session_state.current_orig_pil = stage1
            st.session_state.current_batch = stage4_batch
            st.session_state.current_filename = filename
            st.session_state.stage_images = (stage1, stage2, stage3, stage4_batch)

            # Predict
            if model is not None:
                prediction_label, confidence, raw_score = pu.predict_coconut_quality(model, stage4_batch)
                st.session_state.current_pred = prediction_label
                st.session_state.current_conf = confidence
                st.session_state.current_raw_score = raw_score

                # Save record to prediction_history.csv
                pu.save_prediction_record(filename, prediction_label, confidence)

                # Layout: Original Image vs Result Card
                col_img, col_res = st.columns([5, 6])
                with col_img:
                    st.image(stage1, caption=f"Uploaded: {filename}", use_container_width=True)

                with col_res:
                    if prediction_label == "HEALTHY":
                        st.markdown(f"""
                        <div style="background-color: #ecfdf5; border: 2px solid #10b981; border-radius: 12px; padding: 24px;">
                            <span class="badge-healthy">✅ PASS - HEALTHY</span>
                            <div style="font-size: 13px; color: #4b5563; margin-top: 12px; font-weight: 700; text-transform: uppercase;">Prediction</div>
                            <div style="font-size: 38px; font-weight: 800; color: #059669;">HEALTHY</div>
                            <div style="font-size: 14px; font-weight: 700; color: #374151; margin-top: 12px;">Confidence Score: {confidence:.2f}%</div>
                        </div>
                        """, unsafe_allow_html=True)
                    else:
                        st.markdown(f"""
                        <div style="background-color: #fef2f2; border: 2px solid #ef4444; border-radius: 12px; padding: 24px;">
                            <span class="badge-fungal">⚠️ WARNING - FUNGAL CONTAMINATION</span>
                            <div style="font-size: 13px; color: #4b5563; margin-top: 12px; font-weight: 700; text-transform: uppercase;">Prediction</div>
                            <div style="font-size: 38px; font-weight: 800; color: #dc2626;">FUNGAL</div>
                            <div style="font-size: 14px; font-weight: 700; color: #374151; margin-top: 12px;">Confidence Score: {confidence:.2f}%</div>
                        </div>
                        """, unsafe_allow_html=True)

                    # Confidence Progress Bar
                    st.progress(min(max(confidence / 100.0, 0.0), 1.0))

                    # Short Explanation & Disclaimer
                    if prediction_label == "HEALTHY":
                        st.success("The system did not detect significant visual indicators of fungal contamination.")
                    else:
                        st.error("The system detected visual patterns associated with fungal contamination.")

                    st.warning("⚠️ Disclaimer: This application provides AI-based image classification for demonstration and decision-support purposes. Results should not replace expert inspection or laboratory testing.")

                    # Download Current Result CSV Button (Section 10 Requirement)
                    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    current_csv_data = f"Filename,Prediction,Confidence,Model,Model_Accuracy,Date_Time\n{filename},{prediction_label},{confidence:.2f},MobileNetV2-V2,92.65,{now_str}"
                    st.download_button(
                        label="📄 Download Current Result CSV",
                        data=current_csv_data,
                        file_name=f"result_{filename}.csv",
                        mime="text/csv"
                    )

        except Exception as e:
            st.error(f"Error processing image file: {str(e)}")


# ==============================================================================
# PAGE 3: IMAGE PROCESSING (4 STAGES VIEW)
# ==============================================================================
elif page == "🖼 Image Processing View":
    st.subheader("🖼 Image Processing Pipeline (4 Stages)")
    st.markdown("Inspect how the raw input image is transformed step-by-step before being fed into MobileNetV2.")

    if st.session_state.stage_images is not None:
        stage1, stage2, stage3, stage4_batch = st.session_state.stage_images
        col_s1, col_s2, col_s3, col_s4 = st.columns(4)

        with col_s1:
            st.markdown("##### Stage 1: Original Image")
            st.image(stage1, use_container_width=True)
            st.caption("Raw uploaded file")

        with col_s2:
            st.markdown("##### Stage 2: RGB Converted")
            st.image(stage2, use_container_width=True)
            st.caption("Ensured 3 color channels")

        with col_s3:
            st.markdown("##### Stage 3: Resized (224 × 224)")
            st.image(stage3, use_container_width=True)
            st.caption("Bilinear interpolation 224x224")

        with col_s4:
            st.markdown("##### Stage 4: Model Preprocessed")
            st.image(stage3, use_container_width=True)
            st.info("MobileNetV2 Preprocessing Applied [-1, 1]")
    else:
        st.info("No active image session. Please upload an image under **Analyze Coconut** first.")


# ==============================================================================
# PAGE 4: GRAD-CAM EXPLAINABLE AI (4 VIEWS IN 2x2 LAYOUT WITH CONTROLS)
# ==============================================================================
elif page == "🔥 Grad-CAM Explainable AI":
    st.subheader("🔥 Explainable AI — Grad-CAM Visual Activation Analysis")
    st.markdown("Grad-CAM highlights the exact regions of the image that influenced the convolutional neural network's classification decision.")

    if st.session_state.current_orig_pil is not None and model is not None:
        # Interactive Controls (Section 6 Requirement)
        st.markdown("#### ⚙️ Grad-CAM Interactive Controls")
        col_ctrl1, col_ctrl2, col_ctrl3 = st.columns(3)

        with col_ctrl1:
            opacity = st.slider("Heatmap Opacity (Alpha)", min_value=0.1, max_value=1.0, value=0.45, step=0.05)
        with col_ctrl2:
            threshold = st.slider("Activation Threshold", min_value=0.0, max_value=1.0, value=0.40, step=0.05)
        with col_ctrl3:
            colormap_name = st.selectbox("Heatmap Colormap", options=["jet", "turbo", "hot", "inferno"], index=0)

        # Compute raw Grad-CAM heatmap
        try:
            raw_heatmap = gc.compute_raw_gradcam_heatmap(
                model,
                st.session_state.current_batch,
                st.session_state.current_raw_score
            )

            # Generate 4 Views
            v1_orig, v2_heat, v3_over, v4_high = gc.generate_four_gradcam_views(
                st.session_state.current_orig_pil,
                raw_heatmap,
                opacity=opacity,
                threshold=threshold,
                colormap_name=colormap_name
            )

            # Display 2 x 2 Layout (Section 5 Requirement)
            st.markdown("---")
            row1_col1, row1_col2 = st.columns(2)
            row2_col1, row2_col2 = st.columns(2)

            with row1_col1:
                st.markdown("##### 1. Original Image")
                st.image(v1_orig, use_container_width=True)

            with row1_col2:
                st.markdown("##### 2. Grad-CAM Heatmap")
                st.image(v2_heat, use_container_width=True)

            with row2_col1:
                st.markdown("##### 3. Grad-CAM Overlay")
                st.image(v3_over, use_container_width=True)

            with row2_col2:
                st.markdown("##### 4. Important Regions")
                st.image(v4_high, use_container_width=True)

            st.caption("Grad-CAM visualizes image regions that influenced the model prediction. It does not independently confirm fungal contamination.")

        except Exception as e:
            st.error(f"Grad-CAM generation error: {str(e)}")
    else:
        st.info("No active image session. Please upload an image under **Analyze Coconut** first.")


# ==============================================================================
# PAGE 5: ANALYTICS DASHBOARD
# ==============================================================================
elif page == "📊 Analytics Dashboard":
    st.subheader("📊 Session & Historical Prediction Analytics")

    if not df_history.empty:
        col_m1, col_m2, col_m3, col_m4, col_m5 = st.columns(5)
        col_m1.metric("Total Predictions", summary_stats["total"])
        col_m2.metric("Healthy Ratio", f'{summary_stats["healthy_pct"]}%')
        col_m3.metric("Fungal Ratio", f'{summary_stats["fungal_pct"]}%')
        col_m4.metric("Max Confidence", f'{summary_stats["max_conf"]}%')
        col_m5.metric("Min Confidence", f'{summary_stats["min_conf"]}%')

        st.markdown("---")

        # 4 Plotly Charts (Section 11 Requirement)
        ch_col1, ch_col2 = st.columns(2)
        with ch_col1:
            st.plotly_chart(db.create_healthy_vs_fungal_pie(df_history), use_container_width=True)
        with ch_col2:
            st.plotly_chart(db.create_confidence_histogram(df_history), use_container_width=True)

        ch_col3, ch_col4 = st.columns(2)
        with ch_col3:
            st.plotly_chart(db.create_prediction_timeline(df_history), use_container_width=True)
        with ch_col4:
            st.plotly_chart(db.create_trend_chart(df_history), use_container_width=True)
    else:
        st.info("No prediction history available. Upload an image under **Analyze Coconut** to begin recording analytics.")


# ==============================================================================
# PAGE 6: PREDICTION HISTORY & CSV DOWNLOADS
# ==============================================================================
elif page == "📁 Prediction History":
    st.subheader("📁 Prediction History & CSV Exports")

    if not df_history.empty:
        st.markdown("#### 🕒 Latest 10 Records")
        st.dataframe(df_history.tail(10).iloc[::-1], use_container_width=True)

        st.markdown("---")
        st.markdown("#### 📥 Export Data")
        col_dn1, col_dn2 = st.columns(2)

        with col_dn1:
            # Download Full History CSV Button (Section 9 Requirement)
            csv_bytes = df_history.to_csv(index=False).encode('utf-8')
            st.download_button(
                label="⬇ Download Prediction History CSV",
                data=csv_bytes,
                file_name="prediction_history.csv",
                mime="text/csv",
                key="download_full_csv"
            )

        with col_dn2:
            # Clear History with Confirmation (Section 9 Requirement)
            confirm_clear = st.checkbox("Confirm clearing history?")
            if st.button("🗑 Clear History", type="secondary"):
                if confirm_clear:
                    pu.clear_prediction_history()
                    st.success("Prediction history cleared successfully!")
                    st.rerun()
                else:
                    st.warning("Please check the confirmation box above first.")
    else:
        st.info("No prediction history available. Upload an image to start generating records.")


# ==============================================================================
# PAGE 7: MODEL INFORMATION & PERFORMANCE
# ==============================================================================
elif page == "🤖 Model Information":
    st.subheader("🤖 Model Architecture & Evaluation Metrics")

    col_info1, col_info2 = st.columns(2)
    with col_info1:
        st.markdown("""
        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:20px;">
            <h4 style="color:#064e3b; margin-top:0;">📋 Model Performance Summary</h4>
            <table style="width:100%; font-size:14px; color:#334155;">
                <tr><td><strong>Model Architecture:</strong></td><td>MobileNetV2</td></tr>
                <tr><td><strong>Technique:</strong></td><td>Transfer Learning + Fine-Tuning</td></tr>
                <tr><td><strong>Test Accuracy:</strong></td><td><strong>92.65%</strong></td></tr>
                <tr><td><strong>Test Dataset Size:</strong></td><td>68 images</td></tr>
                <tr><td><strong>Correct Classifications:</strong></td><td>63 images</td></tr>
                <tr><td><strong>Incorrect Classifications:</strong></td><td>5 images</td></tr>
            </table>
        </div>
        """, unsafe_allow_html=True)

    with col_info2:
        st.markdown("""
        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:20px;">
            <h4 style="color:#064e3b; margin-top:0;">🎯 Class Performance Breakdown</h4>
            <table style="width:100%; font-size:14px; text-align:center; border-collapse:collapse;">
                <tr style="background:#f1f5f9;"><th>Class</th><th>Precision</th><th>Recall</th><th>F1 Score</th></tr>
                <tr><td><strong>Fungal (0)</strong></td><td>0.97</td><td>0.89</td><td>0.93</td></tr>
                <tr><td><strong>Healthy (1)</strong></td><td>0.88</td><td>0.97</td><td>0.92</td></tr>
            </table>
        </div>
        """, unsafe_allow_html=True)

    st.markdown("---")
    st.markdown("#### 📷 Model Evaluation Graphs")
    col_g1, col_g2, col_g3 = st.columns(3)

    with col_g1:
        if os.path.exists("accuracy_graph_v2.png"):
            st.image("accuracy_graph_v2.png", caption="Accuracy Graph V2", use_container_width=True)
    with col_g2:
        if os.path.exists("loss_graph_v2.png"):
            st.image("loss_graph_v2.png", caption="Loss Graph V2", use_container_width=True)
    with col_g3:
        if os.path.exists("confusion_matrix_v2.png"):
            st.image("confusion_matrix_v2.png", caption="Confusion Matrix V2", use_container_width=True)


# ==============================================================================
# PAGE 8: SYSTEM WORKFLOW & ABOUT PROJECT
# ==============================================================================
elif page == "ℹ️ Workflow & About":
    st.subheader("ℹ️ System Workflow & Project Overview")

    st.markdown("#### 🔄 Visual System Workflow")
    st.markdown("""
    📷 **Image Upload**  
    ↓  
    🖼 **RGB Conversion**  
    ↓  
    📐 **Resize 224 × 224**  
    ↓  
    ⚙ **MobileNetV2 Preprocessing**  
    ↓  
    🤖 **MobileNetV2 Model Inference**  
    ↓  
    🔍 **Binary Classification (HEALTHY / FUNGAL)**  
    ↓  
    📊 **Confidence Calculation**  
    ↓  
    🔥 **Grad-CAM 4-View Visual Explanation**  
    ↓  
    💾 **CSV History Recording**  
    ↓  
    📈 **Live Dashboard Analytics**
    """)

    st.markdown("---")
    st.markdown("#### 📖 Project Title")
    st.markdown("**AI-Powered Coconut Quality Assessment and Fungal Contamination Detection System Using Computer Vision**")
    st.markdown("""
    This project deploys a fine-tuned MobileNetV2 transfer-learning convolutional neural network to automate the quality inspection of coconuts and copra, detecting fungal contamination with high accuracy and explainability.
    """)
