import React from 'react';

const MapLegend = () => {
  return (
    <div className="absolute bottom-12 left-4 z-10 bg-hud-bg/90 border border-hud-border p-3 rounded shadow-[0_0_15px_rgba(0,0,0,0.8)] backdrop-blur-md pointer-events-auto text-gray-300 font-mono text-xs w-48">
      <h3 className="text-hud-accent font-bold text-[10px] tracking-widest uppercase mb-2 border-b border-gray-700 pb-1">Cluster Density</h3>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#f28cb1] border border-white"></span>
          <span className="text-[10px]">High (&gt;750)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#f1f075] border border-white"></span>
          <span className="text-[10px]">Medium (100-750)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#51bbd6] border border-white"></span>
          <span className="text-[10px]">Low (&lt;100)</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="w-2 h-2 rounded-full bg-[#ff3333] border border-white ml-0.5"></span>
          <span className="text-[10px]">Raw Data Point</span>
        </div>
      </div>
    </div>
  );
};

export default MapLegend;
