import pytest
from modules.seismic_filter import SeismicHazardFilter

def test_shallow_tremor_filter():
    filter = SeismicHazardFilter(max_shallow_depth_km=1.0)
    
    geojson_data = {
        "features": [
            {
                "id": "1",
                "geometry": {"coordinates": [100.0, 0.0, 0.5]}, # Shallow, mag 2.0
                "properties": {"mag": 2.0, "type": "explosion"}
            },
            {
                "id": "2",
                "geometry": {"coordinates": [100.0, 0.0, 5.0]}, # Deep, mag 5.0
                "properties": {"mag": 5.0, "type": "earthquake"}
            },
            {
                "id": "3",
                "geometry": {"coordinates": [100.0, 0.0, 0.2]}, # Shallow, mag 1.0 (too weak)
                "properties": {"mag": 1.0, "type": "quarry blast"}
            }
        ]
    }
    
    anomalies = filter.filter_shallow_tremors(geojson_data)
    
    assert len(anomalies) == 1
    assert anomalies[0]["id"] == "1"
    assert anomalies[0]["depth_km"] == 0.5
    assert anomalies[0]["type"] == "explosion"
