import React, { useEffect, useState } from 'react';

const MediaPerceptionWidget = () => {
  const [perception, setPerception] = useState({
    global_net_sentiment_score: -67.5,
    gdelt_global_tone: -7.3,
    public_reaction_index: "MASS OUTRAGE / CRITICAL ALARM"
  });
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const fetchPerception = async () => {
      try {
        const res = await fetch('http://localhost:8041/api/v1/telemetry/perception');
        if (res.ok) {
          const json = await res.json();
          setPerception(json);
        }
      } catch (e) {
        // Fallback default
      }
    };
    fetchPerception();
    const interval = setInterval(fetchPerception, 20000);
    return () => clearInterval(interval);
  }, []);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="absolute bottom-12 right-4 z-10 bg-hud-bg/90 border border-hud-border p-2 rounded text-hud-accent shadow-[0_0_10px_rgba(0,255,204,0.2)] backdrop-blur text-xs font-bold pointer-events-auto hover:bg-gray-800"
      >
        MEDIA SENTIMENT 📊
      </button>
    );
  }

  const nss = perception.global_net_sentiment_score || -67.5;
  // Calculate percentage fill from -100 to +100 -> mapped to 0% to 100%
  const nssPercent = Math.min(100, Math.max(0, ((nss + 100) / 200) * 100));

  return (
    <div className="absolute bottom-12 right-4 z-10 bg-hud-bg/90 border border-hud-border p-3 rounded w-72 shadow-[0_0_20px_rgba(0,0,0,0.9)] backdrop-blur-md pointer-events-auto text-gray-200 font-mono text-xs flex flex-col gap-2">
      <div className="flex justify-between items-center border-b border-gray-700 pb-1.5">
        <div className="flex items-center gap-1.5 text-hud-accent font-bold text-[11px] tracking-widest uppercase">
          <span>📊 Media & Public Perception</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white text-xs">[ - ]</button>
      </div>

      {/* Net Sentiment Score (NSS) Gauge Bar */}
      <div className="flex flex-col gap-1 mt-1">
        <div className="flex justify-between items-center text-[10px]">
          <span>Net Sentiment Score (NSS)</span>
          <strong className={nss < -30 ? "text-red-400" : nss > 30 ? "text-green-400" : "text-yellow-400"}>
            {nss}%
          </strong>
        </div>
        
        {/* Visual Bar Meter */}
        <div className="w-full bg-gray-800 h-2.5 rounded-full overflow-hidden relative border border-gray-700">
          <div 
            className="h-full bg-gradient-to-r from-red-600 via-yellow-500 to-green-500 transition-all duration-500"
            style={{ width: `${nssPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-[8px] text-gray-400">
          <span>Outrage (-100%)</span>
          <span>Neutral (0%)</span>
          <span>Support (+100%)</span>
        </div>
      </div>

      {/* Global Metrics Summary */}
      <div className="bg-black/60 border border-gray-800 p-2 rounded text-[10px] flex flex-col gap-1 mt-1">
        <div className="flex justify-between">
          <span className="text-gray-400">GDELT Tone Index:</span>
          <span className="text-red-400 font-bold">{perception.gdelt_global_tone}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Public Reaction:</span>
          <span className="text-orange-400 font-semibold">{perception.public_reaction_index}</span>
        </div>
      </div>
    </div>
  );
};

export default MediaPerceptionWidget;
