import math
from typing import List, Dict, Tuple

class GNSSAnomalyDetector:
    def __init__(self, grid_size_deg: float = 0.5):
        self.grid_size = grid_size_deg

    def _get_grid_cell(self, lat: float, lon: float) -> Tuple[int, int]:
        """Convert lat/lon to a discrete grid cell index based on grid_size."""
        lat_idx = int(math.floor(lat / self.grid_size))
        lon_idx = int(math.floor(lon / self.grid_size))
        return (lat_idx, lon_idx)

    def calculate_anomaly_density(self, flight_states: List[list]) -> Dict[Tuple[int, int], dict]:
        """
        Calculate GNSS signal degradation based on NACp value.
        flight_states: list of aircraft states.
        Index mapping based on OpenSky/ADS-B extended feeds:
        5: longitude, 6: latitude, 7: baro_altitude
        Assumption for this module: NACp is provided as an extended field at index 17 or simulated 
        if we extract it from raw ADS-B hex. For standard OpenSky, if not present, we look for index 17.
        """
        grid_stats = {}

        for state in flight_states:
            try:
                # Ensure we have enough data fields
                if len(state) < 18:
                    continue
                    
                lon = state[5]
                lat = state[6]
                alt = state[7]
                
                # Check for valid position and altitude
                if lon is None or lat is None or alt is None:
                    continue
                    
                # Only consider aircraft at cruising altitude (> 3000m)
                if alt <= 3000:
                    continue

                # Parse NACp (Navigation Accuracy Category for Position)
                # In custom feeds this is often appended at the end of the state vector
                nac_p = float(state[17]) 

                cell = self._get_grid_cell(lat, lon)
                if cell not in grid_stats:
                    grid_stats[cell] = {"total": 0, "anomalies": 0, "lat": lat, "lon": lon}

                grid_stats[cell]["total"] += 1
                
                # NACp <= 4 indicates severe degradation (EPU > 1 NM)
                if nac_p <= 4:
                    grid_stats[cell]["anomalies"] += 1

            except (ValueError, TypeError, IndexError):
                continue

        # Calculate density and filter
        heatmaps = {}
        for cell, stats in grid_stats.items():
            if stats["total"] > 0:
                density_ratio = (stats["anomalies"] / stats["total"]) * 100.0
                if density_ratio > 30.0:  # > 30% of aircraft in cell report anomaly
                    heatmaps[cell] = {
                        "lat": stats["lat"],
                        "lon": stats["lon"],
                        "total_flights": stats["total"],
                        "anomalies": stats["anomalies"],
                        "density_ratio": density_ratio,
                        "severity": "HIGH" if density_ratio > 60 else "MODERATE"
                    }

        return heatmaps
