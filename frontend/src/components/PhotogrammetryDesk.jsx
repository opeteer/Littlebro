import React, { useState } from 'react';

const PhotogrammetryDesk = () => {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="absolute bottom-4 right-4 z-10 bg-hud-bg/80 border border-hud-border p-2 px-4 rounded text-hud-accent font-mono text-sm hover:bg-hud-border transition-colors backdrop-blur-sm pointer-events-auto"
      >
        [+] OPEN PHOTOGRAMMETRY DESK
      </button>
    );
  }

  return (
    <div className="absolute bottom-4 right-4 z-10 bg-hud-bg/90 border border-hud-border p-4 rounded text-gray-200 font-mono text-xs w-80 shadow-[0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-md pointer-events-auto">
      <div className="flex justify-between items-center mb-4 border-b border-hud-border pb-2">
        <h2 className="text-hud-accent font-bold tracking-wider">PHOTOGRAMMETRY CALC</h2>
        <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white">[X]</button>
      </div>
      
      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1">
          <span>LATITUDE</span>
          <input type="number" step="0.0001" className="bg-black border border-gray-700 p-1 rounded text-hud-accent outline-none focus:border-hud-accent" placeholder="e.g. 34.0522" />
        </label>
        
        <label className="flex flex-col gap-1">
          <span>LONGITUDE</span>
          <input type="number" step="0.0001" className="bg-black border border-gray-700 p-1 rounded text-hud-accent outline-none focus:border-hud-accent" placeholder="e.g. -118.2437" />
        </label>
        
        <label className="flex flex-col gap-1">
          <span>TIMESTAMP (UTC)</span>
          <input type="datetime-local" className="bg-black border border-gray-700 p-1 rounded text-hud-accent outline-none focus:border-hud-accent" />
        </label>

        <label className="flex flex-col gap-1">
          <span>OBJECT HEIGHT (m)</span>
          <input type="number" step="0.1" className="bg-black border border-gray-700 p-1 rounded text-hud-accent outline-none focus:border-hud-accent" placeholder="e.g. 2.0" />
        </label>

        <button className="bg-hud-border hover:bg-hud-accent hover:text-black transition-colors mt-2 p-2 font-bold tracking-widest text-center border border-transparent rounded">
          CALCULATE
        </button>
      </div>
    </div>
  );
};

export default PhotogrammetryDesk;
