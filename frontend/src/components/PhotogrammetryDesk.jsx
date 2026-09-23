import React, { useState, useEffect } from 'react';
import { calculateSolarPhotogrammetry } from '../utils/photogrammetryCalc';

const PhotogrammetryDesk = ({ 
  isPickingOnMap, 
  onTogglePickOnMap, 
  pickedCoords, 
  onCalculateShadow,
  onOpenStateChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [lat, setLat] = useState('34.0522');
  const [lon, setLon] = useState('-118.2437');
  const [timestamp, setTimestamp] = useState(new Date().toISOString().slice(0, 16));
  const [height, setHeight] = useState('3.2');
  const [result, setResult] = useState(null);

  const toggleOpen = (state) => {
    setIsOpen(state);
    if (onOpenStateChange) onOpenStateChange(state);
  };

  // Sync when user picks a point directly on the map
  useEffect(() => {
    if (pickedCoords) {
      setLat(pickedCoords.lat.toFixed(4));
      setLon(pickedCoords.lon.toFixed(4));
    }
  }, [pickedCoords]);

  const handleCalculate = () => {
    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);
    const heightNum = parseFloat(height);
    const dateObj = new Date(timestamp);

    if (isNaN(latNum) || isNaN(lonNum) || isNaN(heightNum) || isNaN(dateObj.getTime())) {
      alert("Please enter valid numeric parameters and timestamp.");
      return;
    }

    const calc = calculateSolarPhotogrammetry(latNum, lonNum, dateObj, heightNum);
    setResult(calc);

    if (onCalculateShadow) {
      onCalculateShadow({
        startLat: latNum,
        startLon: lonNum,
        endLat: calc.endLat,
        endLon: calc.endLon,
        shadowLength: calc.shadowLength,
        bearing: calc.shadowBearing,
        elevation: calc.solarElevation,
        azimuth: calc.solarAzimuth
      });
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => toggleOpen(true)}
        className="absolute bottom-4 right-4 z-20 bg-hud-bg/90 border border-hud-border p-2 px-4 rounded text-hud-accent font-mono text-sm hover:bg-hud-border transition-colors backdrop-blur-sm pointer-events-auto flex items-center gap-2 shadow-[0_0_15px_rgba(0,255,204,0.15)]"
      >
        <span>📐 PHOTOGRAMMETRY DESK</span>
      </button>
    );
  }

  return (
    <div className="absolute bottom-4 right-4 z-20 bg-hud-bg/95 border border-hud-border p-4 rounded text-gray-200 font-mono text-xs w-84 shadow-[0_0_25px_rgba(0,0,0,0.9)] backdrop-blur-md pointer-events-auto flex flex-col max-h-[85vh] overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-3 border-b border-hud-border pb-2">
        <h2 className="text-hud-accent font-bold tracking-wider flex items-center gap-1.5 text-sm uppercase">
          <span>📐 Photogrammetry Calc</span>
        </h2>
        <button onClick={() => toggleOpen(false)} className="text-gray-500 hover:text-white text-xs font-bold">[ X ]</button>
      </div>
      
      {/* Input Form */}
      <div className="flex flex-col gap-2.5">
        {/* Map Picker Toggle */}
        <button
          onClick={onTogglePickOnMap}
          className={`w-full py-1.5 px-3 rounded font-bold text-xs border transition-colors flex items-center justify-center gap-2 ${
            isPickingOnMap 
              ? 'bg-amber-900/80 text-amber-300 border-amber-500 animate-pulse shadow-[0_0_10px_rgba(255,191,0,0.3)]' 
              : 'bg-black/60 text-hud-accent border-hud-border hover:bg-gray-800'
          }`}
        >
          <span>{isPickingOnMap ? '🎯 CLICK MAP NOW TO SET COORDS' : '📍 PICK POINT ON MAP'}</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <label className="flex flex-col gap-1">
            <span className="text-gray-400 text-[10px]">LATITUDE</span>
            <input 
              type="number" 
              step="0.0001" 
              value={lat} 
              onChange={e => setLat(e.target.value)}
              className="bg-black border border-gray-700 p-1.5 rounded text-hud-accent outline-none focus:border-hud-accent text-xs" 
              placeholder="34.0522" 
            />
          </label>
          
          <label className="flex flex-col gap-1">
            <span className="text-gray-400 text-[10px]">LONGITUDE</span>
            <input 
              type="number" 
              step="0.0001" 
              value={lon} 
              onChange={e => setLon(e.target.value)}
              className="bg-black border border-gray-700 p-1.5 rounded text-hud-accent outline-none focus:border-hud-accent text-xs" 
              placeholder="-118.2437" 
            />
          </label>
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-gray-400 text-[10px]">TIMESTAMP (UTC)</span>
          <input 
            type="datetime-local" 
            value={timestamp} 
            onChange={e => setTimestamp(e.target.value)}
            className="bg-black border border-gray-700 p-1.5 rounded text-hud-accent outline-none focus:border-hud-accent text-xs" 
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-gray-400 text-[10px]">OBJECT HEIGHT (METERS)</span>
          <input 
            type="number" 
            step="0.1" 
            value={height} 
            onChange={e => setHeight(e.target.value)}
            className="bg-black border border-gray-700 p-1.5 rounded text-hud-accent outline-none focus:border-hud-accent text-xs" 
            placeholder="3.2" 
          />
        </label>

        <button 
          onClick={handleCalculate}
          className="bg-hud-accent hover:bg-green-400 text-black font-bold tracking-widest text-center py-2 rounded text-xs transition-colors shadow-[0_0_10px_rgba(0,255,204,0.3)] mt-1"
        >
          ⚡ CALCULATE SHADOW VECTOR
        </button>
      </div>

      {/* Photogrammetry Output Result Card */}
      {result && (
        <div className="mt-3 bg-black/90 border border-amber-500/50 p-3 rounded flex flex-col gap-1.5 text-xs shadow-[0_0_15px_rgba(255,191,0,0.15)]">
          <div className="flex justify-between items-center border-b border-amber-500/30 pb-1 text-amber-400 font-bold">
            <span>SUN & SHADOW ANALYTICS</span>
            <span className="text-[9px] bg-amber-950 text-amber-300 border border-amber-600/40 px-1.5 rounded">
              {result.isSunAboveHorizon ? '☀️ DAYTIME' : '🌙 NIGHTTIME'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] mt-1">
            <div>
              <span className="text-gray-400">Shadow Length:</span>
              <div className="text-white font-bold text-sm">{result.shadowLength} m</div>
            </div>
            <div>
              <span className="text-gray-400">Shadow Bearing:</span>
              <div className="text-amber-400 font-bold text-sm">{result.shadowBearing}°</div>
            </div>
            <div>
              <span className="text-gray-400">Solar Altitude:</span>
              <div className="text-cyan-400 font-bold">{result.solarElevation}°</div>
            </div>
            <div>
              <span className="text-gray-400">Solar Azimuth:</span>
              <div className="text-cyan-400 font-bold">{result.solarAzimuth}°</div>
            </div>
          </div>
          
          <div className="text-[9px] text-gray-500 mt-1 italic border-t border-gray-800 pt-1">
            *Shadow vector ray projected on map canvas.
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotogrammetryDesk;
