import React, { useState } from 'react';
import MapContainer from './components/MapContainer';
import HUDOverlay from './components/HUDOverlay';
import PhotogrammetryDesk from './components/PhotogrammetryDesk';
import LayerPanel from './components/LayerPanel';
import AlertFeed from './components/AlertFeed';
import LiveTicker from './components/LiveTicker';
import MapLegend from './components/MapLegend';

import { useWebSocketStream } from './hooks/useWebSocketStream';

function App() {
  const [focusedLocation, setFocusedLocation] = useState(null);
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
      <HUDOverlay isWsConnected={isConnected} />
      
      {/* Side Panels */}
      <LayerPanel activeLayers={activeLayers} toggleLayer={toggleLayer} />
      <AlertFeed onAlertClick={setFocusedLocation} streamMessage={lastMessage} />
      
      {/* Bottom Tools & Legend */}
      <PhotogrammetryDesk />
      <MapLegend />

      {/* Main Map */}
      <div className="flex-1 relative z-0">
        <MapContainer 
          focusedLocation={focusedLocation} 
          activeLayers={activeLayers} 
          streamMessage={lastMessage}
        />
      </div>

      {/* Bottom Ticker */}
      <LiveTicker streamMessage={lastMessage} />
    </div>
  );
}

export default App;
