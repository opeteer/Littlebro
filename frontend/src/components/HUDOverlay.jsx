import React from 'react';

const HUDOverlay = () => {
  return (
    <div className="absolute top-0 left-0 w-full z-10 pointer-events-none p-4 flex justify-between items-start">
      <div className="bg-hud-bg/80 border border-hud-border p-4 rounded text-hud-accent shadow-[0_0_15px_rgba(0,255,204,0.1)] pointer-events-auto backdrop-blur-sm">
        <h1 className="text-xl font-bold tracking-widest uppercase">Littlebro // Global</h1>
        <p className="text-xs text-hud-accent/90 italic font-semibold mt-0.5">"Our kiddo's playing with OSINT"</p>
        <div className="mt-4 flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs">
            <span>WS LINK</span>
            <span className="text-green-400">ACTIVE</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span>PIPELINES</span>
            <span className="text-green-400">20/20</span>
          </div>
        </div>
      </div>
      
      {/* Alert Banner Example */}
      <div className="bg-red-900/80 border border-red-500 p-2 px-4 rounded text-white shadow-[0_0_15px_rgba(255,0,0,0.3)] pointer-events-auto backdrop-blur-sm animate-pulse flex flex-col items-end">
        <span className="text-xs font-bold tracking-wider">WARN: GNSS ANOMALY</span>
        <span className="text-[10px]">High Interference Detected (NACp &lt; 4)</span>
      </div>
    </div>
  );
};

export default HUDOverlay;
