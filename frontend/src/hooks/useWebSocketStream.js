import { useEffect, useRef, useState, useCallback } from 'react';
import { addSystemLog } from '../utils/systemLogger';

export const useWebSocketStream = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const socketRef = useRef(null);
  const reconnectTimerRef = useRef(null);

  const getWsUrl = () => {
    const host = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : 'localhost';
    return `ws://${host}:8041/ws`;
  };

  const connect = useCallback(() => {
    const targetUrl = getWsUrl();
    addSystemLog('INFO', 'WEBSOCKET', `Attempting connection to ${targetUrl}...`);

    try {
      const ws = new WebSocket(targetUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        addSystemLog('INFO', 'WEBSOCKET', `⚡ Connected successfully to ${targetUrl}`);
        setIsConnected(true);
        if (reconnectTimerRef.current) {
          clearTimeout(reconnectTimerRef.current);
          reconnectTimerRef.current = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          setLastMessage(parsed);
          
          if (parsed.type === 'TELEMETRY_UPDATE') {
            addSystemLog('WS_STREAM', 'TELEMETRY', `Received ${parsed.module} stream payload (${parsed.data?.features?.length || 0} features)`);
          } else if (parsed.type === 'heartbeat') {
            addSystemLog('INFO', 'WEBSOCKET', `Heartbeat ping/pong OK`);
          }
        } catch (e) {
          addSystemLog('WARN', 'WEBSOCKET', `Raw payload: ${event.data}`);
        }
      };

      ws.onclose = () => {
        addSystemLog('WARN', 'WEBSOCKET', '⚠️ Connection lost. Retrying in 2s...');
        setIsConnected(false);
        socketRef.current = null;
        if (!reconnectTimerRef.current) {
          reconnectTimerRef.current = setTimeout(() => {
            reconnectTimerRef.current = null;
            connect();
          }, 2000);
        }
      };

      ws.onerror = (err) => {
        addSystemLog('CRITICAL', 'WEBSOCKET', '❌ Socket error encountered. Server unreachable or restarting.');
        ws.close();
      };
    } catch (err) {
      addSystemLog('CRITICAL', 'WEBSOCKET', `Connection error: ${err.message}`);
    }
  }, []);

  useEffect(() => {
    connect();

    const pingInterval = setInterval(() => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send("ping");
      }
    }, 15000);

    return () => {
      clearInterval(pingInterval);
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [connect]);

  return { isConnected, lastMessage };
};
