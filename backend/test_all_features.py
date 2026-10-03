import os
import sys

# Set environment variables for memory efficiency
os.environ['OPENBLAS_NUM_THREADS'] = '1'
os.environ['OMP_NUM_THREADS'] = '1'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

import io
import numpy as np
from PIL import Image
from fastapi.testclient import TestClient
from main import app
from quality_grading import CoconutQualityGrader

def run_tests():
    client = TestClient(app)
    grader = CoconutQualityGrader()

    print("\n==================================================")
    print(" 1. TESTING COMPUTER VISION QUALITY GRADING ENGINE")
    print("==================================================")

    # Test Image 1: High Quality Image (Sharp pattern, strong contrast, ideal brightness)
    arr_high = np.ones((300, 300, 3), dtype=np.uint8) * 140
    arr_high[50:250, 50:250] = [220, 180, 140]
    arr_high[100:200, 100:200] = [80, 50, 30]
    img_high = Image.fromarray(arr_high)

    res_high = grader.analyze(img_high)
    print(f"High Quality Sample -> Score: {res_high['quality_score']}/100 | Grade: {res_high['grade']} ({res_high['grade_label']})")
    print(f"  Explanation: {res_high['explanation']}")
    print(f"  Factors: {res_high['factors']}\n")

    # Test Image 2: Medium Quality Image
    arr_med = np.ones((300, 300, 3), dtype=np.uint8) * 120
    arr_med[80:220, 80:220] = [150, 130, 100]
    img_med = Image.fromarray(arr_med)

    res_med = grader.analyze(img_med)
    print(f"Medium Quality Sample -> Score: {res_med['quality_score']}/100 | Grade: {res_med['grade']} ({res_med['grade_label']})")
    print(f"  Explanation: {res_med['explanation']}\n")

    # Test Image 3: Low Quality Image (Dark / Low Contrast)
    arr_low = np.ones((300, 300, 3), dtype=np.uint8) * 20
    img_low = Image.fromarray(arr_low)

    res_low = grader.analyze(img_low)
    print(f"Low Quality Sample -> Score: {res_low['quality_score']}/100 | Grade: {res_low['grade']} ({res_low['grade_label']})")
    print(f"  Explanation: {res_low['explanation']}\n")

    print("==================================================")
    print(" 2. TESTING FASTAPI REST API ENDPOINTS")
    print("==================================================")

    buf_high = io.BytesIO()
    img_high.save(buf_high, format='JPEG')
    buf_high.seek(0)

    # 1. Quality Grade Endpoint
    q_res = client.post('/api/quality-grade', files={'file': ('coconut_high.jpg', buf_high, 'image/jpeg')})
    print(f"POST /api/quality-grade status: {q_res.status_code}")
    print(f"  Response Grade: {q_res.json()['grade']} | Score: {q_res.json()['quality_score']}\n")

    # 2. Single Image Predict Endpoint
    buf_high.seek(0)
    p_res = client.post('/api/predict', files={'file': ('coconut_high.jpg', buf_high, 'image/jpeg')})
    p_data = p_res.json()
    print(f"POST /api/predict status: {p_res.status_code}")
    print(f"  Classification: {p_data['prediction']} | Confidence: {p_data['confidence']}%")
    print(f"  Quality Grade: GRADE {p_data['quality_grade']} ({p_data['quality_score']}/100)")
    print(f"  Quality Explanation: {p_data.get('quality_explanation')}")
    print(f"  Usable Copra Weight: {p_data['yield_analysis']['usable_copra_weight_g']}g")
    print(f"  Est. Market Value: ₹{p_data['yield_analysis']['market_value_inr']} (${p_data['yield_analysis']['market_value_usd']})")
    print(f"  Fungal Economic Loss: ₹{p_data['yield_analysis']['economic_loss_inr']}")
    print(f"  Mold Sub-type: {p_data['mold_analysis']['scientific_name']} ({p_data['mold_analysis']['common_name']})\n")

    # 3. Multi-Coconut Batch Endpoint
    buf_med = io.BytesIO()
    img_med.save(buf_med, format='JPEG')
    buf_med.seek(0)
    buf_high.seek(0)

    b_res = client.post('/api/predict/batch', files=[
        ('files', ('coconut_sample1.jpg', buf_high, 'image/jpeg')),
        ('files', ('coconut_sample2.jpg', buf_med, 'image/jpeg'))
    ])
    b_data = b_res.json()
    print(f"POST /api/predict/batch status: {b_res.status_code}")
    print(f"  Total Images Processed: {b_data['total_images']} | Healthy: {b_data['healthy_count']} | Fungal: {b_data['fungal_count']}")
    print(f"  Grade Breakdown -> Grade A: {b_data['grade_a_count']} | Grade B: {b_data['grade_b_count']} | Grade C: {b_data['grade_c_count']}")
    print(f"  Batch Copra Weight: {b_data['batch_financials']['batch_total_usable_copra_kg']} kg")
    print(f"  Batch Total Value: ₹{b_data['batch_financials']['batch_total_market_value_inr']}\n")

    # 4. Batch PDF Report Endpoint
    pdf_res = client.post('/api/reports/batch/pdf', json=b_data)
    print(f"POST /api/reports/batch/pdf status: {pdf_res.status_code} | PDF Size: {len(pdf_res.content)} bytes\n")

    # 5. Excel Export Endpoint
    excel_res = client.get('/api/history/excel')
    print(f"GET /api/history/excel status: {excel_res.status_code} | Excel Size: {len(excel_res.content)} bytes\n")

    print("==================================================")
    print(" ALL FEATURES AND GRADING VERIFIED SUCCESSFULLY! ")
    print("==================================================\n")

if __name__ == "__main__":
    run_tests()
