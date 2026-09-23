import React from 'react';

const HUDOverlay = ({ isWsConnected, onOpenLogs }) => {
  return (
    <div className="absolute top-4 left-4 z-30 pointer-events-auto">
      <div className="bg-hud-bg/90 border border-hud-border p-3.5 rounded text-hud-accent shadow-[0_0_15px_rgba(0,255,204,0.15)] backdrop-blur-md flex flex-col gap-2 w-64">
        <h1 className="text-lg font-bold tracking-widest uppercase leading-none">Littlebro // Global</h1>
        <p className="text-[11px] text-hud-accent/90 italic font-semibold">- "Our kiddo's playing with OSINT"</p>
        
        <div className="mt-2 flex flex-col gap-2">
          <div 
            onClick={onOpenLogs}
            className="flex justify-between items-center text-xs cursor-pointer hover:bg-gray-800/60 p-1 rounded transition-colors"
          >
            <span>WS LINK</span>
            <span className={isWsConnected ? "text-green-400 font-bold animate-pulse" : "text-red-500 font-bold"}>
              {isWsConnected ? "STREAM LIVE" : "DISCONNECTED"}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs p-1">
            <span>PIPELINES</span>
            <span className="text-green-400">20/20</span>
          </div>
        </div>

        {/* System Activity Logs Trigger Button */}
        {onOpenLogs && (
          <button
            onClick={onOpenLogs}
            className="mt-1 w-full bg-black/60 hover:bg-gray-800 border border-hud-border text-hud-accent font-mono text-[10px] font-bold py-1 px-2 rounded transition-colors flex items-center justify-center gap-1 shadow-[0_0_10px_rgba(0,255,204,0.1)]"
          >
            📋 SYSTEM LOGS
          </button>
        )}
      </div>
    </div>
  );
};

export default HUDOverlay;
