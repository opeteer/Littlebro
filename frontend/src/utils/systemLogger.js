// System Logger Utility for Littlebro Telemetry Platform

const listeners = new Set();
let logs = [
  { id: 'init-1', time: new Date().toLocaleTimeString(), level: 'INFO', module: 'SYSTEM', msg: 'Littlebro OSINT Command Center initialized.' },
  { id: 'init-2', time: new Date().toLocaleTimeString(), level: 'INFO', module: 'PIPELINE', msg: '20 Telemetry Ingestion Pipelines online.' },
  { id: 'init-3', time: new Date().toLocaleTimeString(), level: 'WARN', module: 'WEBSOCKET', msg: 'Establishing dupleks stream connection to ws://localhost:8041/ws...' }
];

export const addSystemLog = (level, module, msg) => {
  const newEntry = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    time: new Date().toLocaleTimeString(),
    level, // 'INFO' | 'WARN' | 'CRITICAL' | 'WS_STREAM'
    module,
    msg
  };
  
  logs = [newEntry, ...logs.slice(0, 199)]; // Keep latest 200 logs
  listeners.forEach(fn => fn(logs));
};

export const getSystemLogs = () => logs;

export const clearSystemLogs = () => {
  logs = [];
  listeners.forEach(fn => fn(logs));
};

export const subscribeSystemLogs = (callback) => {
  listeners.add(callback);
  return () => listeners.delete(callback);
};
