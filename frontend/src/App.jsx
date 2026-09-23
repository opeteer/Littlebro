import React from 'react';
import MapContainer from './components/MapContainer';
import HUDOverlay from './components/HUDOverlay';
import PhotogrammetryDesk from './components/PhotogrammetryDesk';

function App() {
  return (
    <div className="w-screen h-screen relative bg-hud-bg overflow-hidden flex flex-col">
      <HUDOverlay />
      <PhotogrammetryDesk />
      <div className="flex-1 relative z-0">
        <MapContainer />
      </div>
    </div>
  );
}

export default App;
