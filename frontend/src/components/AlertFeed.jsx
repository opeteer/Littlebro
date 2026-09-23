import React, { useState, useEffect } from 'react';

const AlertFeed = ({ onAlertClick, onOpenVideo, streamMessage }) => {
  const [alerts, setAlerts] = useState([
    { id: 'def-0', type: 'WAR_ZONE', event_type: 'Airstrike', severity: 'CRITICAL', msg: 'Donetsk Sector: Heavy Artillery & Drone Assault', lat: 48.01, lon: 37.80, time: 'LIVE' },
    { id: 'def-1', type: 'THERMAL_ANOMALY', event_type: 'Kinetic Impact', severity: 'HIGH', msg: 'NASA VIIRS: Thermal Flare Anomaly (420 MW)', lat: 31.40, lon: 34.40, time: '10:45 UTC' },
    { id: 'def-2', type: 'AVIATION_ALERT', event_type: 'Flight Deviation', severity: 'HIGH', msg: 'Airspace Alert: LH-401 Deviating Route Corridor', lat: 52.52, lon: 13.40, time: '10:42 UTC' },
    { id: 'def-3', type: 'GNSS_JAMMING', event_type: 'RF Interference', severity: 'CRITICAL', msg: 'Baltic Sea: Severe GPS Spoofing Loop (NACp < 3)', lat: 55.00, lon: 20.00, time: '10:38 UTC' },
    { id: 'def-4', type: 'SEISMIC_TREMOR', event_type: 'Earthquake', severity: 'MEDIUM', msg: 'USGS Monitor: M4.8 Seismic Tremor', lat: 35.68, lon: 139.76, time: '10:30 UTC' }
  ]);

  useEffect(() => {
    if (!streamMessage) return;
    if (streamMessage.type === 'TELEMETRY_UPDATE' && streamMessage.data?.features) {
      const feats = streamMessage.data.features;
      if (feats.length > 0) {
        // Pick a random feature from the payload to ensure diversity
        const randomFeat = feats[Math.floor(Math.random() * feats.length)];
        const { name, event_type, time, source } = randomFeat.properties;
        const [lon, lat] = randomFeat.geometry.coordinates;

        const newMsg = `${name || 'Incident'}: ${event_type || 'Telemetry Anomaly'}`;

        setAlerts(prev => {
          // Deduplicate if identical message already exists in top 2 items
          if (prev.some(a => a.msg === newMsg)) return prev;

          // Determine type category based on event text
          let typeCategory = 'WAR_ZONE';
          const lower = newMsg.toLowerCase();
          if (lower.includes('thermal') || lower.includes('firms') || lower.includes('fire')) typeCategory = 'THERMAL_ANOMALY';
          else if (lower.includes('aviation') || lower.includes('aircraft') || lower.includes('flight')) typeCategory = 'AVIATION_ALERT';
          else if (lower.includes('gnss') || lower.includes('jamming') || lower.includes('bgp')) typeCategory = 'GNSS_JAMMING';
          else if (lower.includes('seismic') || lower.includes('earthquake')) typeCategory = 'SEISMIC_TREMOR';

          const newAlert = {
            id: `stream-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            type: typeCategory,
            event_type: event_type || 'Anomaly',
            severity: 'CRITICAL',
            msg: newMsg,
            lat: lat,
            lon: lon,
            time: time || 'STREAM LIVE',
            source: source
          };

          return [newAlert, ...prev.slice(0, 4)];
        });
      }
    }
  }, [streamMessage]);

  return (
    <div className="absolute top-4 right-4 z-10 w-80 pointer-events-auto flex flex-col gap-2">
      {alerts.map(alert => {
        const bgClass = alert.severity === 'CRITICAL' ? 'bg-red-900/80 border-red-500 shadow-[0_0_15px_rgba(255,0,0,0.3)]' :
                        alert.severity === 'HIGH' ? 'bg-orange-900/80 border-orange-500 shadow-[0_0_15px_rgba(255,165,0,0.2)]' :
                        'bg-yellow-900/80 border-yellow-500 shadow-[0_0_10px_rgba(255,255,0,0.1)]';
        return (
          <div 
            key={alert.id}
            className={`border p-2 px-3 rounded text-white backdrop-blur-sm animate-pulse cursor-pointer hover:bg-gray-800 transition-colors flex flex-col ${bgClass}`}
          >
            <div 
              onClick={() => onAlertClick({ lat: alert.lat, lon: alert.lon, zoom: 10 })}
              className="flex justify-between items-center"
            >
              <span className="text-[10px] font-bold tracking-wider">{alert.type}</span>
              <span className="text-[9px] opacity-80">{alert.time}</span>
            </div>
            <span onClick={() => onAlertClick({ lat: alert.lat, lon: alert.lon, zoom: 10 })} className="text-xs mt-1 leading-snug">{alert.msg}</span>
            
            <div className="flex justify-between items-center mt-2 border-t border-white/10 pt-1">
              <span className="text-[9px] opacity-70">📍 [{alert.lat.toFixed(2)}, {alert.lon.toFixed(2)}]</span>
              {onOpenVideo && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenVideo({ 
                      type: alert.type,
                      event_type: alert.event_type,
                      title: alert.msg, 
                      msg: alert.msg,
                      location: `${alert.lat.toFixed(2)}, ${alert.lon.toFixed(2)}`, 
                      time: alert.time, 
                      source: alert.source || "Live Telemetry Network" 
                    });
                  }}
                  className="text-[9px] bg-red-600/90 hover:bg-red-500 text-white px-2 py-0.5 rounded font-bold transition-colors flex items-center gap-1 shadow-sm"
                >
                  🎥 Watch Stream
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AlertFeed;
