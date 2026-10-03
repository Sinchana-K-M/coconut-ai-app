import io
from collections import deque
import prediction_service
import csv_service
import yield_calculator
from database import SessionLocal, BatchSession, PredictionRecord

class BatchProcessingQueue:
    """
    DSA FIFO Queue for processing multi-coconut batch analysis in order.
    """
    def __init__(self):
        self.items = deque()

    def enqueue(self, item):
        self.items.append(item)

    def dequeue(self):
        if not self.is_empty():
            return self.items.popleft()
        return None

    def is_empty(self):
        return len(self.items) == 0

    def size(self):
        return len(self.items)

def process_batch_images(files_data: list, user_id: int = None, opacity: float = 0.45, threshold: float = 0.40, colormap: str = "jet"):
    """
    Processes a batch of uploaded coconut images through the FIFO Queue.
    Includes aggregated Financial Yield & Economic Loss Tracking.
    """
    queue = BatchProcessingQueue()
    for filename, image_bytes in files_data:
        queue.enqueue((filename, image_bytes))

    results = []
    healthy_cnt = 0
    fungal_cnt = 0
    grade_a_cnt = 0
    grade_b_cnt = 0
    grade_c_cnt = 0

    conf_sum = 0.0
    quality_sum = 0.0
    valid_quality_count = 0

    total_images = queue.size()

    calc = yield_calculator.FinancialYieldCalculator()

    while not queue.is_empty():
        filename, image_bytes = queue.dequeue()
        try:
            res = prediction_service.run_prediction_pipeline(
                image_bytes=image_bytes,
                filename=filename,
                opacity=opacity,
                threshold=threshold,
                colormap=colormap
            )
            # Add source tag
            res["source"] = "Batch"
            
            # Count metrics
            pred = res.get("prediction", "HEALTHY")
            if pred == "HEALTHY":
                healthy_cnt += 1
            else:
                fungal_cnt += 1

            conf = float(res.get("confidence", 0.0))
            conf_sum += conf

            q_grade = res.get("quality_grade")
            if q_grade == "A":
                grade_a_cnt += 1
            elif q_grade == "B":
                grade_b_cnt += 1
            elif q_grade == "C":
                grade_c_cnt += 1

            q_score = res.get("quality_score")
            if q_score is not None and str(q_score) != "N/A":
                quality_sum += float(q_score)
                valid_quality_count += 1

            results.append(res)

        except Exception as e:
            print(f"Error processing batch item {filename}: {e}")

    avg_conf = round(conf_sum / total_images, 2) if total_images > 0 else 0.0
    avg_quality = round(quality_sum / valid_quality_count, 1) if valid_quality_count > 0 else 0.0

    batch_financials = calc.calculate_batch(results)

    batch_summary = {
        "total_images": total_images,
        "healthy_count": healthy_cnt,
        "fungal_count": fungal_cnt,
        "grade_a_count": grade_a_cnt,
        "grade_b_count": grade_b_cnt,
        "grade_c_count": grade_c_cnt,
        "avg_confidence": avg_conf,
        "avg_quality_score": avg_quality,
        "batch_financials": batch_financials,
        "results": results
    }

    # Record batch session in SQLite
    db = SessionLocal()
    try:
        bs = BatchSession(
            user_id=user_id,
            total_images=total_images,
            healthy_count=healthy_cnt,
            fungal_count=fungal_cnt,
            grade_a_count=grade_a_cnt,
            grade_b_count=grade_b_cnt,
            grade_c_count=grade_c_cnt,
            avg_confidence=avg_conf,
            avg_quality_score=avg_quality
        )
        db.add(bs)
        db.commit()
        batch_summary["batch_id"] = bs.id
    except Exception as e:
        print(f"Failed to record batch session in DB: {e}")
        batch_summary["batch_id"] = 1
    finally:
        db.close()

    return batch_summary
