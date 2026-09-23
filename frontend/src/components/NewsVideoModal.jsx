import React from 'react';

const NewsVideoModal = ({ videoData, onClose }) => {
  if (!videoData) return null;

  // Default to Al Jazeera English Live Stream if no specific embed ID is passed
  const videoEmbedUrl = videoData.embedUrl || "https://www.youtube.com/embed/gCNeDWCI0vo?autoplay=1&mute=0";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 pointer-events-auto">
      <div className="bg-hud-bg border border-hud-border rounded-lg max-w-3xl w-full shadow-[0_0_30px_rgba(0,255,204,0.2)] overflow-hidden flex flex-col font-mono">
        {/* Header Bar */}
        <div className="bg-black/90 border-b border-hud-border px-4 py-2 flex justify-between items-center text-hud-accent">
          <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
            <span>LIVE NEWS VIDEO FEED // OSINT STREAM</span>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white text-sm font-bold px-2 py-0.5 rounded border border-gray-700 hover:border-white transition-colors"
          >
            [ X ] CLOSE
          </button>
        </div>

        {/* Video Player Frame */}
        <div className="relative w-full aspect-video bg-black">
          <iframe 
            className="w-full h-full border-0"
            src={videoEmbedUrl} 
            title={videoData.title || "Live Conflict Video Stream"} 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
          />
        </div>

        {/* Metadata & Intelligence Summary Footer */}
        <div className="p-4 bg-black/80 flex flex-col gap-2 text-xs border-t border-gray-800">
          <div className="flex justify-between items-center">
            <h3 className="text-white font-bold text-sm tracking-wide">
              {videoData.title || "Global Conflict Live Stream Broadcast"}
            </h3>
            <span className="text-[10px] bg-green-900/60 text-green-400 border border-green-500/50 px-2 py-0.5 rounded font-semibold">
              ✓ VERIFIED OSINT SOURCE
            </span>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-[11px] text-gray-300 mt-1">
            <div>📍 <strong>Location:</strong> {videoData.location || "Gaza / Eastern Front"}</div>
            <div>📡 <strong>Network:</strong> {videoData.source || "Al Jazeera / DW News"}</div>
            <div>🕒 <strong>Timestamp:</strong> {videoData.time || "LIVE 24/7"}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsVideoModal;
