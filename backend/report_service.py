import io
import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def generate_prediction_pdf(data: dict) -> bytes:
    """Generates a professional PDF report for a single coconut prediction scan."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    story = []

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#064e3b'),
        alignment=0,
        spaceAfter=4
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor('#059669'),
        spaceAfter=12
    )
    heading_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#0f172a'),
        spaceBefore=10,
        spaceAfter=4
    )
    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#334155')
    )
    disclaimer_style = ParagraphStyle(
        'DisclaimerText',
        parent=styles['Normal'],
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#64748b'),
        fontName='Helvetica-Oblique'
    )

    # Title Banner
    story.append(Paragraph("🥥 AI Coconut Quality & Fungal Assessment Report", title_style))
    story.append(Paragraph("Computer Vision • Financial Yield Calculator • Micro-Mold Classifier", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#059669'), spaceAfter=12))

    pred_id = data.get("prediction_id", data.get("Prediction_ID", "N/A"))
    date_str = data.get("date", data.get("Date", datetime.datetime.now().strftime("%Y-%m-%d")))
    time_str = data.get("time", data.get("Time", datetime.datetime.now().strftime("%H:%M:%S")))
    filename = data.get("filename", data.get("Filename", "sample.jpg"))
    prediction = data.get("prediction", data.get("Prediction", "HEALTHY"))
    confidence = data.get("confidence", data.get("Confidence", 0.0))
    q_score = data.get("quality_score", data.get("Quality_Score", "N/A"))
    q_grade = data.get("quality_grade", data.get("Quality_Grade", "N/A"))
    q_grade_label = data.get("quality_grade_label", data.get("Quality_Grade_Label", "N/A"))

    # Assessment Summary Box
    summary_data = [
        [Paragraph("<b>Report ID:</b>", body_style), Paragraph(f"#{pred_id}", body_style),
         Paragraph("<b>Date & Time:</b>", body_style), Paragraph(f"{date_str} {time_str}", body_style)],
        [Paragraph("<b>Filename:</b>", body_style), Paragraph(str(filename), body_style),
         Paragraph("<b>Source:</b>", body_style), Paragraph(str(data.get("source", "Upload")), body_style)],
        [Paragraph("<b>Fungal Classification:</b>", body_style),
         Paragraph(f"<font color='{'#059669' if prediction == 'HEALTHY' else '#dc2626'}'><b>{prediction}</b></font>", body_style),
         Paragraph("<b>Model Confidence:</b>", body_style), Paragraph(f"{confidence}%", body_style)],
        [Paragraph("<b>Visual Quality Score:</b>", body_style), Paragraph(f"{q_score} / 100", body_style),
         Paragraph("<b>Quality Grade:</b>", body_style), Paragraph(f"GRADE {q_grade} ({q_grade_label})", body_style)]
    ]

    t_summary = Table(summary_data, colWidths=[130, 140, 120, 150])
    t_summary.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
        ('BORDER', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('PADDING', (0, 0), (-1, -1), 5),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(t_summary)
    story.append(Spacer(1, 10))

    # Financial & Yield Calculator Section
    yield_res = data.get("yield_analysis")
    if yield_res:
        story.append(Paragraph("Financial & Copra Yield Potential", heading_style))
        yield_data = [
            [Paragraph("<b>Usable Copra Kernel:</b>", body_style), Paragraph(f"{yield_res.get('usable_copra_weight_g')} g", body_style),
             Paragraph("<b>Oil Extraction Potential:</b>", body_style), Paragraph(f"{yield_res.get('oil_extraction_pct')}% ({yield_res.get('estimated_oil_ml')} mL)", body_style)],
            [Paragraph("<b>Estimated Market Value:</b>", body_style), Paragraph(f"₹{yield_res.get('market_value_inr')} (${yield_res.get('market_value_usd')})", body_style),
             Paragraph("<b>Fungal Economic Loss:</b>", body_style), Paragraph(f"<font color='#dc2626'><b>₹{yield_res.get('economic_loss_inr')} (${yield_res.get('economic_loss_usd')})</b></font>", body_style)]
        ]
        t_yield = Table(yield_data, colWidths=[130, 140, 140, 130])
        t_yield.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#ecfdf5')),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#a7f3d0')),
            ('PADDING', (0, 0), (-1, -1), 5),
        ]))
        story.append(t_yield)
        story.append(Spacer(1, 10))

    # Mold Subtype Micro-Classification Section
    mold_res = data.get("mold_analysis")
    if mold_res and prediction == "FUNGAL":
        story.append(Paragraph("Micro-Mold Sub-Type & Storage Protocols", heading_style))
        mold_data = [
            [Paragraph("<b>Scientific Name:</b>", body_style), Paragraph(f"<i>{mold_res.get('scientific_name')}</i>", body_style)],
            [Paragraph("<b>Common Name:</b>", body_style), Paragraph(str(mold_res.get('common_name')), body_style)],
            [Paragraph("<b>Risk Level:</b>", body_style), Paragraph(f"<font color='#dc2626'><b>{mold_res.get('risk_level')}</b></font>", body_style)],
            [Paragraph("<b>Visual Indicators:</b>", body_style), Paragraph(str(mold_res.get('visual_indicators')), body_style)]
        ]
        t_mold = Table(mold_data, colWidths=[140, 400])
        t_mold.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#fef2f2')),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#fca5a5')),
            ('PADDING', (0, 0), (-1, -1), 5),
        ]))
        story.append(t_mold)

        story.append(Spacer(1, 6))
        story.append(Paragraph("<b>Targeted Treatment & Storage Protocol:</b>", body_style))
        treatments = mold_res.get("recommended_treatments", [])
        for t_step in treatments:
            story.append(Paragraph(f"• {t_step}", body_style))
        story.append(Spacer(1, 10))

    # Mandatory Disclaimer
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#cbd5e1'), spaceAfter=8))
    disclaimer_text = (
        "<b>DISCLAIMER:</b> This system provides computer-vision-based screening, financial estimation, and mold classification. "
        "Results should not be treated as definitive agricultural, medical, or food-safety certification."
    )
    story.append(Paragraph(disclaimer_text, disclaimer_style))

    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes

def generate_batch_pdf(batch_summary: dict) -> bytes:
    """Generates a professional PDF report for a multi-coconut batch session."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    story = []

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#064e3b'),
        spaceAfter=4
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor('#059669'),
        spaceAfter=12
    )
    heading_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#0f172a'),
        spaceBefore=10,
        spaceAfter=4
    )
    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#334155')
    )
    disclaimer_style = ParagraphStyle(
        'DisclaimerText',
        parent=styles['Normal'],
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#64748b'),
        fontName='Helvetica-Oblique'
    )

    # Title Header
    story.append(Paragraph("🥥 Multi-Coconut Batch Analysis Summary Report", title_style))
    story.append(Paragraph("Computer Vision • MobileNetV2 Batch Pipeline • Financial Yield Tracking", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#059669'), spaceAfter=12))

    b_id = batch_summary.get("batch_id", "N/A")
    total = batch_summary.get("total_images", 0)
    healthy = batch_summary.get("healthy_count", 0)
    fungal = batch_summary.get("fungal_count", 0)
    g_a = batch_summary.get("grade_a_count", 0)
    g_b = batch_summary.get("grade_b_count", 0)
    g_c = batch_summary.get("grade_c_count", 0)
    avg_conf = batch_summary.get("avg_confidence", 0.0)
    avg_q = batch_summary.get("avg_quality_score", 0.0)

    b_fin = batch_summary.get("batch_financials", {})

    # Batch Summary KPIs Box
    kpi_data = [
        [Paragraph("<b>Batch ID:</b>", body_style), Paragraph(f"#{b_id}", body_style),
         Paragraph("<b>Total Scanned:</b>", body_style), Paragraph(str(total), body_style)],
        [Paragraph("<b>Healthy Samples:</b>", body_style), Paragraph(f"<font color='#059669'><b>{healthy}</b></font>", body_style),
         Paragraph("<b>Fungal Samples:</b>", body_style), Paragraph(f"<font color='#dc2626'><b>{fungal}</b></font>", body_style)],
        [Paragraph("<b>Usable Copra:</b>", body_style), Paragraph(f"{b_fin.get('batch_total_usable_copra_kg', 0)} kg", body_style),
         Paragraph("<b>Oil Extraction:</b>", body_style), Paragraph(f"{b_fin.get('batch_total_oil_liters', 0)} L", body_style)],
        [Paragraph("<b>Batch Market Value:</b>", body_style), Paragraph(f"₹{b_fin.get('batch_total_market_value_inr', 0)}", body_style),
         Paragraph("<b>Total Fungal Loss:</b>", body_style), Paragraph(f"<font color='#dc2626'><b>₹{b_fin.get('batch_total_economic_loss_inr', 0)}</b></font>", body_style)],
        [Paragraph("<b>Avg Confidence:</b>", body_style), Paragraph(f"{avg_conf}%", body_style),
         Paragraph("<b>Avg Quality Score:</b>", body_style), Paragraph(f"{avg_q} / 100", body_style)]
    ]
    t_kpi = Table(kpi_data, colWidths=[130, 140, 130, 140])
    t_kpi.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
        ('BORDER', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('PADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(t_kpi)
    story.append(Spacer(1, 10))

    # Results Table
    results = batch_summary.get("results", [])
    if results:
        story.append(Paragraph("Complete Batch Items Breakdown", heading_style))
        table_rows = [[
            Paragraph("<b>#</b>", body_style),
            Paragraph("<b>Filename</b>", body_style),
            Paragraph("<b>Prediction</b>", body_style),
            Paragraph("<b>Confidence</b>", body_style),
            Paragraph("<b>Quality</b>", body_style),
            Paragraph("<b>Est. Value</b>", body_style)
        ]]

        for idx, item in enumerate(results, start=1):
            fname = str(item.get("filename", "sample.jpg"))
            pred = str(item.get("prediction", "HEALTHY"))
            conf = f"{float(item.get('confidence', 0.0)):.1f}%"
            qs = str(item.get("quality_score", "N/A"))
            y_info = item.get("yield_analysis", {})
            val = f"₹{y_info.get('market_value_inr', 0)}" if y_info else "N/A"

            table_rows.append([
                Paragraph(str(idx), body_style),
                Paragraph(fname, body_style),
                Paragraph(f"<font color='{'#059669' if pred == 'HEALTHY' else '#dc2626'}'><b>{pred}</b></font>", body_style),
                Paragraph(conf, body_style),
                Paragraph(qs, body_style),
                Paragraph(val, body_style)
            ])

        t_results = Table(table_rows, colWidths=[30, 180, 90, 80, 80, 80])
        t_results.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#064e3b')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
            ('PADDING', (0, 0), (-1, -1), 4),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafc')]),
        ]))
        story.append(t_results)
        story.append(Spacer(1, 10))

    # Disclaimer
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#cbd5e1'), spaceAfter=8))
    disclaimer_text = (
        "<b>DISCLAIMER:</b> This system provides computer-vision-based screening and financial estimation. "
        "Results should not be treated as definitive agricultural or commercial financial guarantee."
    )
    story.append(Paragraph(disclaimer_text, disclaimer_style))

    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
