import React from 'react';

const LiveTicker = () => {
  const newsItems = [
    "CONFLICT: GDELT reports intense artillery shelling in Eastern Front",
    "OPEN-SKY: VIP Flight HXZ-99 detected deviating from flight path at 10:45Z",
    "CONFLICT: Urban combat escalated in Khartoum sector 4",
    "SEISMIC: USGS confirms depth 0.2km tremor in industrial zone",
    "BGP: Traffic drop 45% observed in Eastern Europe routing nodes",
    "THERMAL: NASA FIRMS reports 15 new hotspots exceeding 500MW FRP",
    "SOCIAL: 'Pizza Indicator' Z-Score +3.2 at Central Admin Building"
  ];

  return (
    <div className="w-full bg-black/90 border-t border-hud-border h-8 flex items-center overflow-hidden z-20 pointer-events-auto shrink-0 relative">
      <div className="absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-black to-transparent z-10 flex items-center px-2">
        <span className="text-red-500 font-bold text-xs tracking-widest uppercase animate-pulse">LIVE FEED</span>
      </div>
      <div className="animate-marquee whitespace-nowrap text-hud-accent text-xs font-mono pl-24">
        {newsItems.map((item, idx) => (
          <span key={idx} className="mx-8">
            <span className="text-gray-500 mr-2">///</span>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};

export default LiveTicker;
