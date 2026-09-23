import pytest
from modules.traffic_anomaly import TrafficAnomalyDetector

def test_traffic_anomaly_detector():
    detector = TrafficAnomalyDetector(z_score_threshold=2.5)
    
    live_data = [
        # Normal off-peak
        {
            "place_id": "store_1",
            "hour": 23,
            "current_popularity": 10,
            "baseline_history": [8, 9, 10, 11, 12, 10, 9]
        },
        # Anomalous off-peak (Surge)
        {
            "place_id": "store_2",
            "hour": 2, # 2 AM
            "current_popularity": 80,
            "baseline_history": [5, 6, 4, 5, 7, 5, 6]
        },
        # Anomalous peak (Should be ignored due to hour)
        {
            "place_id": "store_3",
            "hour": 14, # 2 PM
            "current_popularity": 100,
            "baseline_history": [20, 25, 22, 21, 23, 24]
        }
    ]
    
    anomalies = detector.analyze_foot_traffic(live_data)
    
    assert len(anomalies) == 1
    assert anomalies[0]["place_id"] == "store_2"
    assert anomalies[0]["z_score"] > 2.5
