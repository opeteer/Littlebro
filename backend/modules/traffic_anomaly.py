import numpy as np
from typing import List, Dict

class TrafficAnomalyDetector:
    def __init__(self, z_score_threshold: float = 2.5):
        self.z_threshold = z_score_threshold

    def analyze_foot_traffic(self, live_data: List[dict]) -> List[dict]:
        """
        Analyze foot traffic surges based on historical baseline (The Pizza Indicator).
        live_data format: [{'place_id': str, 'current_popularity': int, 'baseline_history': List[int], 'hour': int}]
        """
        anomalies = []

        for data in live_data:
            hour = data.get("hour", 12)
            
            # Focus on off-peak hours (e.g., 22:00 to 04:00)
            if 4 < hour < 22:
                continue

            current_traffic = data.get("current_popularity", 0)
            baseline = data.get("baseline_history", [])

            if len(baseline) < 5:
                continue # Insufficient baseline data

            mean_baseline = np.mean(baseline)
            std_baseline = np.std(baseline)

            if std_baseline == 0:
                std_baseline = 1.0 # Prevent division by zero

            # Calculate Z-score
            z_score = (current_traffic - mean_baseline) / std_baseline

            if z_score >= self.z_threshold:
                anomalies.append({
                    "place_id": data.get("place_id"),
                    "hour": hour,
                    "current_popularity": current_traffic,
                    "mean_baseline": mean_baseline,
                    "z_score": z_score,
                    "alert": "OFF_PEAK_SURGE"
                })

        return anomalies
