import json
import random
from datetime import datetime, timedelta

async def fetch_conflict_data():
    """
    Fetches conflict data. In a production environment, this would call 
    ACLED or GDELT APIs. For reliability and immediate telemetry, we 
    simulate real-time conflict event streams around known global hotspots.
    """
    # Base hotspots for conflict zones
    hotspots = [
        {"name": "Donetsk Front", "lat": 48.01, "lon": 37.80, "base_intensity": 0.9, "type": "Airstrike"},
        {"name": "Kharkiv Front", "lat": 49.99, "lon": 36.23, "base_intensity": 0.85, "type": "Artillery Shelling"},
        {"name": "Gaza Strip", "lat": 31.40, "lon": 34.40, "base_intensity": 0.95, "type": "Airstrike"},
        {"name": "South Lebanon", "lat": 33.30, "lon": 35.40, "base_intensity": 0.7, "type": "Remote Violence"},
        {"name": "Khartoum, Sudan", "lat": 15.50, "lon": 32.55, "base_intensity": 0.8, "type": "Urban Battle"},
        {"name": "El Fasher, Sudan", "lat": 13.62, "lon": 25.34, "base_intensity": 0.75, "type": "Battle"},
        {"name": "Kayah State, Myanmar", "lat": 19.24, "lon": 97.20, "base_intensity": 0.65, "type": "Armed Clash"},
        {"name": "North Kivu, DRC", "lat": -1.0, "lon": 29.2, "base_intensity": 0.6, "type": "Armed Clash"}
    ]
    
    features = []
    for spot in hotspots:
        # Generate 3-7 localized events around each hotspot to form a cluster
        num_events = random.randint(3, 7)
        for _ in range(num_events):
            # Jitter coordinates slightly to spread them out
            lat_jitter = spot["lat"] + random.uniform(-0.6, 0.6)
            lon_jitter = spot["lon"] + random.uniform(-0.6, 0.6)
            
            # Randomize intensity
            intensity = spot["base_intensity"] * random.uniform(0.5, 1.2)
            if intensity > 1.0:
                intensity = 1.0
                
            fatalities = int(intensity * random.randint(1, 50))
            timestamp = (datetime.utcnow() - timedelta(minutes=random.randint(1, 1440))).isoformat() + "Z"
            
            feature = {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [lon_jitter, lat_jitter]
                },
                "properties": {
                    "name": spot["name"],
                    "event_type": spot["type"],
                    "intensity": round(intensity, 2),
                    "fatalities": fatalities,
                    "time": timestamp
                }
            }
            features.append(feature)
            
    return {
        "type": "FeatureCollection",
        "features": features
    }
