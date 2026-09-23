import pytest
from modules.gnss_anomaly import GNSSAnomalyDetector

def test_gnss_anomaly_detection():
    detector = GNSSAnomalyDetector(grid_size_deg=0.5)
    
    # flight_states structure:
    # 5: lon, 6: lat, 7: alt, 17: NACp
    # Create mock states (pad the array to 18 elements)
    def create_state(lon, lat, alt, nacp):
        state = [None] * 18
        state[5] = lon
        state[6] = lat
        state[7] = alt
        state[17] = nacp
        return state

    states = [
        # Normal flights
        create_state(10.1, 20.1, 10000, 10),
        create_state(10.2, 20.2, 10000, 9),
        create_state(10.1, 20.1, 10000, 8),
        # Anomalous flights in same cell (10.x, 20.x corresponds to cell idx)
        create_state(10.3, 20.3, 10000, 3),
        create_state(10.4, 20.4, 10000, 2),
        create_state(10.1, 20.2, 10000, 1),
    ]

    heatmaps = detector.calculate_anomaly_density(states)
    
    # Cell calculation: lat/0.5, lon/0.5
    # lat 20.x / 0.5 = 40. lon 10.x / 0.5 = 20.
    cell = (40, 20)
    
    assert cell in heatmaps
    assert heatmaps[cell]["total_flights"] == 6
    assert heatmaps[cell]["anomalies"] == 3
    assert heatmaps[cell]["density_ratio"] == 50.0
    assert heatmaps[cell]["severity"] == "MODERATE"
