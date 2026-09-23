import React, { useEffect, useState, useRef } from 'react';
import { getSystemLogs, subscribeSystemLogs, clearSystemLogs } from '../utils/systemLogger';

const SystemLogModal = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [autoScroll, setAutoScroll] = useState(true);
  const logContainerRef = useRef(null);

  useEffect(() => {
    setLogs(getSystemLogs());
    const unsubscribe = subscribeSystemLogs((updatedLogs) => {
      setLogs([...updatedLogs]);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = 0;
    }
  }, [logs, autoScroll]);

  if (!isOpen) return null;

  const filteredLogs = logs.filter(log => {
    if (filter === 'ALL') return true;
    return log.level === filter;
  });

  const exportLogs = () => {
    const text = logs.map(l => `[${l.time}] [${l.level}] [${l.module}] ${l.msg}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `littlebro-system-logs-${Date.now()}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 pointer-events-auto">
      <div className="bg-hud-bg border border-hud-border rounded-lg max-w-4xl w-full h-[80vh] shadow-[0_0_30px_rgba(0,255,204,0.2)] overflow-hidden flex flex-col font-mono">
        
        {/* Header Bar */}
        <div className="bg-black/90 border-b border-hud-border px-4 py-2.5 flex justify-between items-center text-hud-accent">
          <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
            <span>SYSTEM ACTIVITY LOG // OSINT PIPELINE MONITOR</span>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white text-xs font-bold px-2 py-0.5 rounded border border-gray-700 hover:border-white transition-colors"
          >
            [ X ] CLOSE
          </button>
        </div>

        {/* Toolbar & Filter Bar */}
        <div className="bg-black/60 border-b border-gray-800 px-4 py-2 flex justify-between items-center text-xs flex-wrap gap-2">
          {/* Level Filter Buttons */}
          <div className="flex items-center gap-1">
            <span className="text-gray-400 text-[10px] mr-1">FILTER:</span>
            {['ALL', 'INFO', 'WARN', 'CRITICAL', 'WS_STREAM'].map(lvl => (
              <button
                key={lvl}
                onClick={() => setFilter(lvl)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                  filter === lvl 
                    ? 'bg-hud-accent text-black border-hud-accent' 
                    : 'bg-gray-800 text-gray-300 border-gray-700 hover:border-gray-500'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                autoScroll ? 'bg-green-900/50 text-green-400 border-green-500/50' : 'bg-gray-800 text-gray-400 border-gray-700'
              }`}
            >
              AUTO-SCROLL: {autoScroll ? 'ON' : 'OFF'}
            </button>
            <button
              onClick={clearSystemLogs}
              className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-800 text-gray-300 border border-gray-700 hover:bg-red-900/50 hover:text-red-400 hover:border-red-500/50 transition-colors"
            >
              CLEAR LOGS
            </button>
            <button
              onClick={exportLogs}
              className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-800 text-hud-accent border border-hud-border hover:bg-gray-700 transition-colors"
            >
              EXPORT 💾
            </button>
          </div>
        </div>

        {/* Terminal Log Console Window */}
        <div 
          ref={logContainerRef}
          className="flex-1 bg-black/95 p-4 overflow-y-auto space-y-1.5 text-xs text-gray-300 font-mono"
        >
          {filteredLogs.length === 0 ? (
            <div className="text-gray-500 italic text-center py-8">No log entries matching filter.</div>
          ) : (
            filteredLogs.map(log => {
              const levelColor = 
                log.level === 'CRITICAL' ? 'bg-red-900/80 text-red-300 border-red-500' :
                log.level === 'WARN' ? 'bg-yellow-900/80 text-yellow-300 border-yellow-500' :
                log.level === 'WS_STREAM' ? 'bg-blue-900/80 text-blue-300 border-blue-500' :
                'bg-gray-800 text-green-400 border-gray-700';

              return (
                <div key={log.id} className="flex items-start gap-2 border-b border-gray-900 pb-1 font-mono hover:bg-gray-900/50 px-1 rounded">
                  <span className="text-gray-500 text-[10px] shrink-0 font-mono">[{log.time}]</span>
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border shrink-0 ${levelColor}`}>
                    {log.level}
                  </span>
                  <span className="text-hud-accent text-[10px] font-bold shrink-0">[{log.module}]</span>
                  <span className="text-gray-200 text-xs break-all">{log.msg}</span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Bar */}
        <div className="bg-black/90 border-t border-gray-800 px-4 py-1.5 flex justify-between items-center text-[10px] text-gray-400">
          <span>Total Log Entries: {logs.length}</span>
          <span>Status: Monitoring System Events</span>
        </div>
      </div>
    </div>
  );
};

export default SystemLogModal;
