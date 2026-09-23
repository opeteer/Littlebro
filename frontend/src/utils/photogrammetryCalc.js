// NOAA Solar Photogrammetry Calculation Utility for Littlebro OSINT

export const calculateSolarPhotogrammetry = (lat, lon, date, height) => {
  const rad = Math.PI / 180;
  const deg = 180 / Math.PI;

  const latRad = lat * rad;

  // Day of year calculation
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start + (start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  const hours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;

  // Fractional year (radians)
  const gamma = (2 * Math.PI / 365) * (dayOfYear - 1 + (hours - 12) / 24);

  // Solar Declination (radians)
  const decl = 0.006918 - 0.399912 * Math.cos(gamma) + 0.070257 * Math.sin(gamma)
             - 0.006758 * Math.cos(2 * gamma) + 0.000907 * Math.sin(2 * gamma);

  // Equation of Time (minutes)
  const eqtime = 229.18 * (0.000075 + 0.001868 * Math.cos(gamma) - 0.032077 * Math.sin(gamma)
                - 0.014615 * Math.cos(2 * gamma) - 0.040849 * Math.sin(2 * gamma));

  // Time offset in minutes
  const timeOffset = eqtime + 4 * lon;
  const tst = hours * 60 + timeOffset; // True Solar Time in minutes
  const ha = (tst / 4) - 180; // Solar Hour Angle in degrees
  const haRad = ha * rad;

  // Solar Zenith Angle
  const cosZenith = Math.sin(latRad) * Math.sin(decl) + Math.cos(latRad) * Math.cos(decl) * Math.cos(haRad);
  const zenithRad = Math.acos(Math.max(-1, Math.min(1, cosZenith)));
  const zenithDeg = zenithRad * deg;
  const elevationDeg = 90 - zenithDeg;

  // Solar Azimuth Angle
  let cosAzimuth = (Math.sin(decl) * Math.cos(latRad) - Math.cos(decl) * Math.sin(latRad) * Math.cos(haRad)) / Math.sin(zenithRad);
  cosAzimuth = Math.max(-1, Math.min(1, cosAzimuth));
  let azimuthDeg = Math.acos(cosAzimuth) * deg;
  if (ha > 0) {
    azimuthDeg = 360 - azimuthDeg;
  }

  // Shadow direction is opposite the sun (Sun Azimuth + 180 deg)
  const shadowBearingDeg = (azimuthDeg + 180) % 360;

  // Shadow length calculation
  let shadowLengthMeters = 0;
  const isSunAboveHorizon = elevationDeg > 0;

  if (isSunAboveHorizon) {
    const elevationRad = elevationDeg * rad;
    shadowLengthMeters = height / Math.tan(elevationRad);
  }

  // Calculate endpoint of shadow line on map (Great Circle Destination)
  const R = 6371000; // Earth radius in meters
  // Scale visual length for small objects so line is visible on map (at least 200m or actual)
  const visualLength = Math.max(shadowLengthMeters, 150);
  const brng = shadowBearingDeg * rad;
  const lat1 = latRad;
  const lon1 = lon * rad;

  const lat2 = Math.asin(Math.sin(lat1) * Math.cos(visualLength / R) + Math.cos(lat1) * Math.sin(visualLength / R) * Math.cos(brng));
  const lon2 = lon1 + Math.atan2(Math.sin(brng) * Math.sin(visualLength / R) * Math.cos(lat1), Math.cos(visualLength / R) - Math.sin(lat1) * Math.sin(lat2));

  return {
    solarElevation: parseFloat(elevationDeg.toFixed(2)),
    solarAzimuth: parseFloat(azimuthDeg.toFixed(2)),
    shadowBearing: parseFloat(shadowBearingDeg.toFixed(2)),
    shadowLength: parseFloat(shadowLengthMeters.toFixed(2)),
    isSunAboveHorizon,
    endLat: parseFloat((lat2 * deg).toFixed(6)),
    endLon: parseFloat((lon2 * deg).toFixed(6))
  };
};
