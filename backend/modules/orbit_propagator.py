import math
from skyfield.api import Topos, load, EarthSatellite
from skyfield.sgp4lib import EarthSatellite
from typing import List, Dict

class OrbitPropagator:
    def __init__(self):
        # Load ephemeris data
        self.ts = load.timescale()
    
    def propagate_satellite(self, tle_line1: str, tle_line2: str, name: str, target_lat: float, target_lon: float) -> dict:
        """
        Propagate satellite orbit using SGP4 and calculate sub-satellite point 
        and elevation mask pass predictions for a target observer.
        """
        satellite = EarthSatellite(tle_line1, tle_line2, name, self.ts)
        t = self.ts.now()

        # 1. Sub-satellite point calculation (ECI to ECEF to Geodetic)
        geocentric = satellite.at(t)
        subpoint = geocentric.subpoint()
        
        current_lat = subpoint.latitude.degrees
        current_lon = subpoint.longitude.degrees
        current_alt = subpoint.elevation.km

        # 2. Observer relative elevation and azimuth
        observer = Topos(latitude_degrees=target_lat, longitude_degrees=target_lon)
        difference = satellite - observer
        topocentric = difference.at(t)
        
        alt, az, distance = topocentric.altaz()
        
        # Elevation Mask (E >= 10 degrees indicates a visible pass or strong RF line-of-sight)
        is_visible = alt.degrees >= 10.0

        return {
            "name": name,
            "current_position": {
                "lat": current_lat,
                "lon": current_lon,
                "altitude_km": current_alt
            },
            "observer_relation": {
                "azimuth_deg": az.degrees,
                "elevation_deg": alt.degrees,
                "distance_km": distance.km,
                "is_visible_or_rf_los": is_visible
            }
        }
