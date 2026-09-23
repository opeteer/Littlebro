import React, { useState } from 'react';
import MapContainer from './components/MapContainer';
import HUDOverlay from './components/HUDOverlay';
import PhotogrammetryDesk from './components/PhotogrammetryDesk';
import LayerPanel from './components/LayerPanel';
import AlertFeed from './components/AlertFeed';
import LiveTicker from './components/LiveTicker';
import MapLegend from './components/MapLegend';

import NewsVideoModal from './components/NewsVideoModal';
import MediaPerceptionWidget from './components/MediaPerceptionWidget';
import { useWebSocketStream } from './hooks/useWebSocketStream';

import SystemLogModal from './components/SystemLogModal';

function App() {
  const [focusedLocation, setFocusedLocation] = useState(null);
  const [videoModalData, setVideoModalData] = useState(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const { isConnected, lastMessage } = useWebSocketStream();
  const [activeLayers, setActiveLayers] = useState({
    earthquakes: true,
    war: true,
    aviation: true,
    gnss: true,
    firms: true,
    bgp: true,
    news: true
  });

  const toggleLayer = (layerId) => {
    setActiveLayers(prev => ({ ...prev, [layerId]: !prev[layerId] }));
  };

  return (
    <div className="w-screen h-screen relative bg-hud-bg overflow-hidden flex flex-col">
      <HUDOverlay 
        isWsConnected={isConnected} 
        onOpenLogs={() => setIsLogModalOpen(true)}
      />
      
      {/* Side Panels */}
      <LayerPanel activeLayers={activeLayers} toggleLayer={toggleLayer} />
      <AlertFeed 
        onAlertClick={setFocusedLocation} 
        onOpenVideo={(data) => setVideoModalData(data)}
        streamMessage={lastMessage} 
      />
      
      {/* Bottom Tools, Legend & Perception Widget */}
      <PhotogrammetryDesk />
      <MapLegend />
      <MediaPerceptionWidget />

      {/* Main Map */}
      <div className="flex-1 relative z-0">
        <MapContainer 
          focusedLocation={focusedLocation} 
          activeLayers={activeLayers} 
          streamMessage={lastMessage}
          onOpenVideo={(data) => setVideoModalData(data)}
        />
      </div>

      {/* Bottom Ticker */}
      <LiveTicker streamMessage={lastMessage} />

      {/* News Video Pop-Up Window */}
      <NewsVideoModal 
        videoData={videoModalData} 
        onClose={() => setVideoModalData(null)} 
      />

      {/* System Activity Logs Pop-Up Window */}
      <SystemLogModal 
        isOpen={isLogModalOpen} 
        onClose={() => setIsLogModalOpen(false)} 
      />
    </div>
  );
}

export default App;
