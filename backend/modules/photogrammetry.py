import math
import datetime
from suncalc import get_position

class PhotogrammetryCalculator:
    def __init__(self):
        pass

    def calculate_sun_metrics(self, lat: float, lon: float, timestamp: datetime.datetime, object_height: float) -> dict:
        """
        Calculate Sun Zenith, Azimuth, and expected shadow metrics.
        """
        # suncalc get_position returns altitude and azimuth
        # Note: suncalc's azimuth is measured from south to west.
        # We might need to adjust based on standard convention (North = 0).
        sun_pos = get_position(timestamp, lat, lon)
        
        altitude_rad = sun_pos['altitude']
        azimuth_rad = sun_pos['azimuth']

        altitude_deg = math.degrees(altitude_rad)
        
        # Standardize azimuth to North=0, East=90
        # suncalc: 0 is South, + is West. So North is 180.
        azimuth_deg = (math.degrees(azimuth_rad) + 180.0) % 360.0

        zenith_deg = 90.0 - altitude_deg

        if altitude_deg > 0:
            shadow_ratio = 1.0 / math.tan(altitude_rad)
            expected_shadow_length = object_height * shadow_ratio
            shadow_azimuth_deg = (azimuth_deg + 180.0) % 360.0
        else:
            shadow_ratio = None
            expected_shadow_length = None
            shadow_azimuth_deg = None # Sun is below horizon

        return {
            "solar_altitude_deg": altitude_deg,
            "solar_zenith_deg": zenith_deg,
            "solar_azimuth_deg": azimuth_deg,
            "shadow_ratio": shadow_ratio,
            "expected_shadow_length": expected_shadow_length,
            "shadow_azimuth_deg": shadow_azimuth_deg,
            "is_daylight": altitude_deg > 0
        }
