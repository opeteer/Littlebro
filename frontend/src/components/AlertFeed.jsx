import React, { useState } from 'react';

const AlertFeed = ({ onAlertClick }) => {
  const [alerts] = useState([
    { id: 0, type: 'WAR_ZONE', severity: 'CRITICAL', msg: 'Heavy Airstrike Reported', lat: 31.40, lon: 34.40, time: 'LIVE' },
    { id: 1, type: 'GNSS_ANOMALY', severity: 'HIGH', msg: 'High Interference (NACp < 4)', lat: 34.05, lon: -118.24, time: '10:42:05 UTC' },
    { id: 2, type: 'SEISMIC_TREMOR', severity: 'HIGH', msg: 'Shallow Tremor (Depth 0.5km)', lat: 35.68, lon: 139.76, time: '10:40:12 UTC' },
    { id: 3, type: 'BGP_OUTAGE', severity: 'MEDIUM', msg: 'Routing Anomaly Detected', lat: 51.5, lon: -0.12, time: '10:35:00 UTC' }
  ]);

  return (
    <div className="absolute top-4 right-4 z-10 w-72 pointer-events-auto flex flex-col gap-2">
      {alerts.map(alert => {
        const bgClass = alert.severity === 'CRITICAL' ? 'bg-red-900/80 border-red-500 shadow-[0_0_15px_rgba(255,0,0,0.3)]' :
                        alert.severity === 'HIGH' ? 'bg-orange-900/80 border-orange-500 shadow-[0_0_15px_rgba(255,165,0,0.2)]' :
                        'bg-yellow-900/80 border-yellow-500 shadow-[0_0_10px_rgba(255,255,0,0.1)]';
        return (
          <div 
            key={alert.id}
            onClick={() => onAlertClick({ lat: alert.lat, lon: alert.lon, zoom: 10 })}
            className={`border p-2 px-3 rounded text-white backdrop-blur-sm animate-pulse cursor-pointer hover:bg-gray-800 transition-colors flex flex-col ${bgClass}`}
          >
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold tracking-wider">{alert.type}</span>
              <span className="text-[9px] opacity-80">{alert.time}</span>
            </div>
            <span className="text-xs mt-1">{alert.msg}</span>
            <span className="text-[9px] mt-1 opacity-70">📍 [{alert.lat.toFixed(2)}, {alert.lon.toFixed(2)}]</span>
          </div>
        );
      })}
    </div>
  );
};

export default AlertFeed;
