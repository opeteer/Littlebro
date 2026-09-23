// Contextual Video Stream Dispatcher for Littlebro

export const getVideoStreamContext = (eventData = {}) => {
  const text = `${eventData.type || ''} ${eventData.event_type || ''} ${eventData.name || ''} ${eventData.title || ''} ${eventData.msg || ''}`.toLowerCase();

  // 1. Thermal Anomalies / Fires / Satellite Explosions
  if (text.includes('thermal') || text.includes('fire') || text.includes('firms') || text.includes('kinetic') || text.includes('explosion')) {
    return {
      embedUrl: "https://www.youtube.com/embed/21X5lGlDOfg?autoplay=1&mute=0", // NASA TV / Live Earth Infra-Red Stream
      network: "NASA TV / VIIRS Thermal Satellite Network",
      category: "THERMAL SATELLITE FEED",
      badgeColor: "border-orange-500 text-orange-400 bg-orange-950/60"
    };
  }

  // 2. Aviation / Flight Vectors / Airspace Anomalies
  if (text.includes('aviation') || text.includes('aircraft') || text.includes('flight') || text.includes('sky')) {
    return {
      embedUrl: "https://www.youtube.com/embed/1EiC9bvVGnk?autoplay=1&mute=0", // Live ATC Airport Cam Stream
      network: "Global Airspace & ATC Telemetry Network",
      category: "AVIATION RADAR STREAM",
      badgeColor: "border-cyan-500 text-cyan-400 bg-cyan-950/60"
    };
  }

  // 3. Seismic / Earthquakes / Natural Hazards
  if (text.includes('seismic') || text.includes('tremor') || text.includes('earthquake') || text.includes('usgs')) {
    return {
      embedUrl: "https://www.youtube.com/embed/pyfM6i-2_14?autoplay=1&mute=0", // Disaster Watch / EuroNews Live
      network: "USGS & Global Seismic Early Warning Stream",
      category: "SEISMIC HAZARD BROADCAST",
      badgeColor: "border-yellow-500 text-yellow-400 bg-yellow-950/60"
    };
  }

  // 4. GNSS Interference / BGP Outages / Cyber & RF
  if (text.includes('gnss') || text.includes('bgp') || text.includes('jamming') || text.includes('outage') || text.includes('spoofing')) {
    return {
      embedUrl: "https://www.youtube.com/embed/dp8PhLsUcFE?autoplay=1&mute=0", // Tech & Cyber Ops Live Stream
      network: "Cyber Security & RF Interference Telemetry",
      category: "CYBER & RF RADAR STREAM",
      badgeColor: "border-purple-500 text-purple-400 bg-purple-950/60"
    };
  }

  // 5. War / Armed Conflict / Airstrikes
  return {
    embedUrl: "https://www.youtube.com/embed/gCNeDWCI0vo?autoplay=1&mute=0", // Al Jazeera English Live
    network: "Al Jazeera / Global Conflict OSINT Stream",
    category: "WAR ZONE LIVE STREAM",
    badgeColor: "border-red-500 text-red-400 bg-red-950/60"
  };
};
