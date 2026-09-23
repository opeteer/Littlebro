from typing import Dict, List

class SeismicHazardFilter:
    def __init__(self, max_shallow_depth_km: float = 1.0):
        self.max_depth = max_shallow_depth_km

    def filter_shallow_tremors(self, geojson_data: dict) -> List[dict]:
        """
        Filter USGS Earthquake Hazards data for extremely shallow tremors.
        geojson_data: dict loaded from USGS GeoJSON API.
        """
        shallow_anomalies = []
        
        features = geojson_data.get("features", [])
        for feature in features:
            geometry = feature.get("geometry", {})
            properties = feature.get("properties", {})
            
            coords = geometry.get("coordinates", [])
            if len(coords) < 3:
                continue
                
            lon = coords[0]
            lat = coords[1]
            depth_km = coords[2]
            
            mag = properties.get("mag")
            if mag is None:
                continue

            # Check if it's extremely shallow (<= 1.0 km) and has sufficient magnitude
            if depth_km <= self.max_depth and mag > 1.5:
                shallow_anomalies.append({
                    "id": feature.get("id"),
                    "lat": lat,
                    "lon": lon,
                    "depth_km": depth_km,
                    "magnitude": mag,
                    "place": properties.get("place"),
                    "time": properties.get("time"),
                    "type": properties.get("type"), # 'earthquake', 'quarry blast', 'explosion', etc.
                    "alert_level": "SUSPICIOUS_SHALLOW_TREMOR"
                })

        return shallow_anomalies
