import React, { useState } from 'react';

const LayerPanel = ({ activeLayers, toggleLayer }) => {
  const [isOpen, setIsOpen] = useState(true);

  const modules = [
    {
      category: 'Transportasi & Navigasi',
      items: [
        { id: 'aviation', name: 'Aviation Tracker', count: 420 },
        { id: 'gnss', name: 'GNSS Interference', count: 12 },
      ]
    },
    {
      category: 'Lingkungan & Bencana',
      items: [
        { id: 'earthquakes', name: 'Seismic Tremor', count: 85 },
        { id: 'firms', name: 'Thermal Anomalies', count: 1024 },
      ]
    },
    {
      category: 'Konektivitas & Informasi Publik',
      items: [
        { id: 'bgp', name: 'BGP Outages', count: 3 },
        { id: 'news', name: 'News Feed Geocoded', count: 56 },
      ]
    }
  ];

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="absolute top-20 left-4 z-10 bg-hud-bg/90 border border-hud-border p-2 rounded text-hud-accent shadow-[0_0_10px_rgba(0,255,204,0.2)] backdrop-blur text-xs font-bold pointer-events-auto hover:bg-gray-800"
      >
        LAYERS ⏵
      </button>
    );
  }

  return (
    <div className="absolute top-20 left-4 z-10 bg-hud-bg/90 border border-hud-border p-4 rounded w-64 shadow-[0_0_15px_rgba(0,0,0,0.8)] backdrop-blur-md pointer-events-auto flex flex-col max-h-[70vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
        <h2 className="text-hud-accent font-bold text-sm tracking-widest uppercase">Layer Control</h2>
        <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white text-xs">[ - ]</button>
      </div>

      {modules.map((group, idx) => (
        <div key={idx} className="mb-4">
          <h3 className="text-gray-400 text-[10px] font-bold mb-2 uppercase tracking-wider">{group.category}</h3>
          <div className="flex flex-col gap-2">
            {group.items.map((item) => {
              const isActive = activeLayers[item.id] || false;
              return (
                <div key={item.id} className="flex justify-between items-center text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-gray-300 hover:text-white">
                    <input 
                      type="checkbox" 
                      className="accent-hud-accent w-3 h-3"
                      checked={isActive}
                      onChange={() => toggleLayer(item.id)}
                    />
                    {item.name}
                  </label>
                  <span className={`text-[10px] px-1 rounded ${isActive ? 'bg-green-900/50 text-green-400' : 'bg-gray-800 text-gray-500'}`}>
                    {item.count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default LayerPanel;
