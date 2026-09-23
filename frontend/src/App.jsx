import React, { useState } from 'react';
import MapContainer from './components/MapContainer';
import HUDOverlay from './components/HUDOverlay';
import PhotogrammetryDesk from './components/PhotogrammetryDesk';
import LayerPanel from './components/LayerPanel';
import AlertFeed from './components/AlertFeed';
import LiveTicker from './components/LiveTicker';
import MapLegend from './components/MapLegend';

function App() {
  const [focusedLocation, setFocusedLocation] = useState(null);
  const [activeLayers, setActiveLayers] = useState({
    earthquakes: true,
    aviation: false,
    firms: false,
    gnss: false
  });

  const toggleLayer = (layerId) => {
    setActiveLayers(prev => ({ ...prev, [layerId]: !prev[layerId] }));
  };

  return (
    <div className="w-screen h-screen relative bg-hud-bg overflow-hidden flex flex-col">
      <HUDOverlay />
      
      {/* Side Panels */}
      <LayerPanel activeLayers={activeLayers} toggleLayer={toggleLayer} />
      <AlertFeed onAlertClick={setFocusedLocation} />
      
      {/* Bottom Tools & Legend */}
      <PhotogrammetryDesk />
      <MapLegend />

      {/* Main Map */}
      <div className="flex-1 relative z-0">
        <MapContainer focusedLocation={focusedLocation} activeLayers={activeLayers} />
      </div>

      {/* Bottom Ticker */}
      <LiveTicker />
    </div>
  );
}

export default App;
