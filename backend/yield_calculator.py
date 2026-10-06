class FinancialYieldCalculator:
    """
    Computes Usable Copra Weight, Oil Extraction Potential (%), Market Value,
    and Fungal Economic Loss Tracking for individual coconuts and batches.
    """
    def __init__(self, base_price_per_kg_inr=120.0, inr_to_usd_rate=0.012):
        self.base_price_per_kg_inr = base_price_per_kg_inr
        self.inr_to_usd_rate = inr_to_usd_rate

    def calculate_single(self, prediction: str, quality_score: float, grade: str, average_coconut_weight_g: float = 150.0):
        """
        Calculates financial yield and economic loss for a single coconut scan.
        """
        is_healthy = (str(prediction).upper() == "HEALTHY")
        q_score = float(quality_score) if (quality_score is not None and str(quality_score) != "N/A") else 75.0

        # Continuous dynamic formula based on exact quality_score (0.0 to 100.0)
        # Guarantees unique values for every single sample
        if is_healthy:
            copra_usable_pct = round(0.70 + (q_score / 100.0) * 0.26, 3)
            oil_pct = round(48.0 + (q_score / 100.0) * 16.5, 1)
        else:
            copra_usable_pct = round(0.08 + (q_score / 100.0) * 0.34, 3)
            oil_pct = round(8.0 + (q_score / 100.0) * 22.0, 1)

        usable_copra_g = round(average_coconut_weight_g * copra_usable_pct, 1)
        estimated_oil_ml = round((usable_copra_g * (oil_pct / 100.0)) * 1.09, 1) # ~0.92 g/mL density

        # Max potential market value for healthy Grade A
        max_potential_inr = (average_coconut_weight_g / 1000.0) * self.base_price_per_kg_inr * 0.95
        actual_value_inr = round((usable_copra_g / 1000.0) * self.base_price_per_kg_inr * (oil_pct / 64.5), 2)
        
        # Loss calculation due to contamination / low quality
        economic_loss_inr = round(max(0.0, max_potential_inr - actual_value_inr), 2)
        actual_value_usd = round(actual_value_inr * self.inr_to_usd_rate, 2)
        economic_loss_usd = round(economic_loss_inr * self.inr_to_usd_rate, 2)

        return {
            "usable_copra_weight_g": usable_copra_g,
            "oil_extraction_pct": round(oil_pct, 1),
            "estimated_oil_ml": estimated_oil_ml,
            "market_value_inr": actual_value_inr,
            "market_value_usd": actual_value_usd,
            "economic_loss_inr": economic_loss_inr,
            "economic_loss_usd": economic_loss_usd,
            "yield_grade_summary": f"Estimated {oil_pct}% oil extraction potential with {usable_copra_g}g usable copra kernel."
        }

    def calculate_batch(self, batch_items: list, average_coconut_weight_g: float = 150.0):
        """
        Calculates aggregated financial yield and economic loss for a batch session.
        """
        total_usable_copra_g = 0.0
        total_oil_ml = 0.0
        total_value_inr = 0.0
        total_loss_inr = 0.0

        item_yields = []
        for item in batch_items:
            pred = item.get("prediction", "HEALTHY")
            qs = item.get("quality_score", 75.0)
            gr = item.get("quality_grade", "B")
            
            single_res = self.calculate_single(pred, qs, gr, average_coconut_weight_g)
            total_usable_copra_g += single_res["usable_copra_weight_g"]
            total_oil_ml += single_res["estimated_oil_ml"]
            total_value_inr += single_res["market_value_inr"]
            total_loss_inr += single_res["economic_loss_inr"]
            item_yields.append(single_res)

        total_value_usd = round(total_value_inr * self.inr_to_usd_rate, 2)
        total_loss_usd = round(total_loss_inr * self.inr_to_usd_rate, 2)

        return {
            "batch_total_usable_copra_kg": round(total_usable_copra_g / 1000.0, 2),
            "batch_total_oil_liters": round(total_oil_ml / 1000.0, 2),
            "batch_total_market_value_inr": round(total_value_inr, 2),
            "batch_total_market_value_usd": total_value_usd,
            "batch_total_economic_loss_inr": round(total_loss_inr, 2),
            "batch_total_economic_loss_usd": total_loss_usd,
            "item_yields": item_yields
        }
