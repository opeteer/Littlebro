import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// --- TELEMETRY DATASETS ---

// 1. War & Conflict Dataset
const FALLBACK_CONFLICT_GEOJSON = {
  type: "FeatureCollection",
  features: [
    { type: "Feature", geometry: { type: "Point", coordinates: [37.80, 48.01] }, properties: { name: "Donetsk Sector", event_type: "Artillery & Drone Strike", intensity: 0.95, fatalities: 24, time: "10 mins ago" } },
    { type: "Feature", geometry: { type: "Point", coordinates: [37.95, 48.15] }, properties: { name: "Avdiivka North", event_type: "Armored Assault", intensity: 0.90, fatalities: 18, time: "25 mins ago" } },
    { type: "Feature", geometry: { type: "Point", coordinates: [36.23, 49.99] }, properties: { name: "Kharkiv Border", event_type: "Missile Strike", intensity: 0.85, fatalities: 12, time: "40 mins ago" } },
    { type: "Feature", geometry: { type: "Point", coordinates: [34.40, 31.40] }, properties: { name: "Gaza Central Zone", event_type: "Air Strike", intensity: 0.98, fatalities: 35, time: "5 mins ago" } },
    { type: "Feature", geometry: { type: "Point", coordinates: [34.45, 31.50] }, properties: { name: "Gaza North Area", event_type: "Heavy Shelling", intensity: 0.92, fatalities: 15, time: "15 mins ago" } },
    { type: "Feature", geometry: { type: "Point", coordinates: [35.50, 33.89] }, properties: { name: "Beirut Suburbs", event_type: "Targeted Air Strike", intensity: 0.88, fatalities: 9, time: "1 hour ago" } },
    { type: "Feature", geometry: { type: "Point", coordinates: [32.55, 15.50] }, properties: { name: "Khartoum Center", event_type: "Urban Gunbattle", intensity: 0.85, fatalities: 20, time: "2 hours ago" } },
    { type: "Feature", geometry: { type: "Point", coordinates: [25.34, 13.62] }, properties: { name: "El Fasher Siege", event_type: "Artillery Bombardment", intensity: 0.89, fatalities: 31, time: "45 mins ago" } },
    { type: "Feature", geometry: { type: "Point", coordinates: [97.20, 19.24] }, properties: { name: "Kayah State", event_type: "Ambush & Skirmish", intensity: 0.75, fatalities: 8, time: "3 hours ago" } },
    { type: "Feature", geometry: { type: "Point", coordinates: [29.22, -1.65] }, properties: { name: "Goma Outskirts", event_type: "Rebel Clash", intensity: 0.70, fatalities: 6, time: "1 hour ago" } }
  ]
};

// 2. Aviation Dataset (Flights & Trajectories)
const AVIATION_GEOJSON = {
  type: "FeatureCollection",
  features: [
    { type: "Feature", geometry: { type: "Point", coordinates: [13.40, 52.52] }, properties: { callsign: "LH-401", aircraft: "A350-900", alt: "36,000 ft", spd: "480 kts", route: "FRA -> JFK" } },
    { type: "Feature", geometry: { type: "Point", coordinates: [2.35, 48.85] }, properties: { callsign: "AF-022", aircraft: "B777-300ER", alt: "38,000 ft", spd: "510 kts", route: "CDG -> NRT" } },
    { type: "Feature", geometry: { type: "Point", coordinates: [-0.12, 51.50] }, properties: { callsign: "BA-117", aircraft: "B787-9", alt: "34,000 ft", spd: "465 kts", route: "LHR -> JFK" } },
    { type: "Feature", geometry: { type: "Point", coordinates: [55.27, 25.20] }, properties: { callsign: "EK-201", aircraft: "A380-800", alt: "40,000 ft", spd: "525 kts", route: "DXB -> LAX" } },
    { type: "Feature", geometry: { type: "Point", coordinates: [106.84, -6.20] }, properties: { callsign: "GA-88", aircraft: "B777-300", alt: "35,000 ft", spd: "490 kts", route: "CGK -> AMS" } },
    { type: "Feature", geometry: { type: "Point", coordinates: [139.69, 35.68] }, properties: { callsign: "JL-006", aircraft: "A350-1000", alt: "37,000 ft", spd: "505 kts", route: "HND -> JFK" } },
    { type: "Feature", geometry: { type: "Point", coordinates: [37.61, 55.75] }, properties: { callsign: "SU-212", aircraft: "A330-300", alt: "33,000 ft", spd: "470 kts", route: "SVO -> DEL" } },
    { type: "Feature", geometry: { type: "Point", coordinates: [77.20, 28.61] }, properties: { callsign: "AI-101", aircraft: "B787-8", alt: "39,000 ft", spd: "495 kts", route: "DEL -> LHR" } }
  ]
};

// Flight Trajectory Lines
const AVIATION_ROUTES_GEOJSON = {
  type: "FeatureCollection",
  features: [
    { type: "Feature", geometry: { type: "LineString", coordinates: [[8.57, 50.03], [13.40, 52.52], [37.61, 55.75]] }, properties: { name: "Euro-Asia Corridor" } },
    { type: "Feature", geometry: { type: "LineString", coordinates: [[-0.12, 51.50], [-30.0, 45.0], [-73.93, 40.73]] }, properties: { name: "North Atlantic Track Alpha" } },
    { type: "Feature", geometry: { type: "LineString", coordinates: [[55.27, 25.20], [77.20, 28.61], [106.84, -6.20]] }, properties: { name: "MiddleEast-Asia Corridor" } }
  ]
};

// 3. GNSS Interference Jamming Polygons
const GNSS_GEOJSON = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [[[18.0, 54.0], [22.0, 54.0], [22.0, 57.0], [18.0, 57.0], [18.0, 54.0]]]
      },
      properties: { name: "Baltic Jamming Zone", severity: "HIGH (NACp < 3)", type: "GPS/GLONASS Spoofing", status: "CRITICAL" }
    },
    {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [[[33.0, 33.0], [37.0, 33.0], [37.0, 36.0], [33.0, 36.0], [33.0, 33.0]]]
      },
      properties: { name: "Eastern Med Interference Zone", severity: "SEVERE (NACp < 2)", type: "Broadband RF Jamming", status: "CRITICAL" }
    },
    {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [[[34.0, 44.0], [40.0, 44.0], [40.0, 47.0], [34.0, 47.0], [34.0, 44.0]]]
      },
      properties: { name: "Black Sea Navigation Anomaly", severity: "MEDIUM (NACp < 4)", type: "Spoofing Loop", status: "WARNING" }
    }
  ]
};

// 4. FIRMS Thermal Hotspots
const FIRMS_GEOJSON = {
  type: "FeatureCollection",
  features: [
    { type: "Feature", geometry: { type: "Point", coordinates: [149.12, -35.28] }, properties: { frp: 450, temp: "385 K", sat: "VIIRS" } },
    { type: "Feature", geometry: { type: "Point", coordinates: [-119.41, 36.77] }, properties: { frp: 620, temp: "410 K", sat: "MODIS" } },
    { type: "Feature", geometry: { type: "Point", coordinates: [-55.49, -8.78] }, properties: { frp: 890, temp: "440 K", sat: "VIIRS" } },
    { type: "Feature", geometry: { type: "Point", coordinates: [24.0, -4.0] }, properties: { frp: 310, temp: "360 K", sat: "MODIS" } }
  ]
};

// 5. BGP Outage Hubs
const BGP_GEOJSON = {
  type: "FeatureCollection",
  features: [
    { type: "Feature", geometry: { type: "Point", coordinates: [8.68, 50.11] }, properties: { hub: "DE-CIX Frankfurt", drop: "14%", asn: "AS3320", status: "DEGRADED" } },
    { type: "Feature", geometry: { type: "Point", coordinates: [30.52, 50.45] }, properties: { hub: "Kyiv Exchange", drop: "48%", asn: "AS15645", status: "CRITICAL OUTAGE" } },
    { type: "Feature", geometry: { type: "Point", coordinates: [35.50, 33.89] }, properties: { hub: "Beirut Submarine Gateway", drop: "35%", asn: "AS42961", status: "MAJOR DROP" } }
  ]
};

// 6. Geocoded OSINT News Beacons
const NEWS_GEOJSON = {
  type: "FeatureCollection",
  features: [
    { type: "Feature", geometry: { type: "Point", coordinates: [12.49, 41.90] }, properties: { headline: "EU Summit Enacts Emergency Energy Pipeline Protocol", source: "REUTERS", time: "12m ago" } },
    { type: "Feature", geometry: { type: "Point", coordinates: [121.47, 31.23] }, properties: { headline: "Naval Patrol Exercises Confirmed in East China Sea", source: "AFP", time: "28m ago" } },
    { type: "Feature", geometry: { type: "Point", coordinates: [-77.03, 38.90] }, properties: { headline: "NORAD Scrambles Patrol over Atlantic Coast Corridor", source: "AP NEWS", time: "45m ago" } }
  ]
};

const MapContainer = ({ focusedLocation, activeLayers }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [crosshair, setCrosshair] = useState({ lat: '0.0000', lon: '0.0000' });
  const hoverPopupRef = useRef(null);

  useEffect(() => {
    if (mapRef.current) return;

    hoverPopupRef.current = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      className: 'map-hover-popup'
    });

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: [25, 30],
      zoom: 3,
      pitch: 35,
      antialias: true,
      renderWorldCopies: false
    });
    mapRef.current = map;

    map.on('load', async () => {
      console.log("MapLibre GL loaded successfully");

      // --- DATA SOURCES ---

      // 1. Conflict Source
      let conflictData = FALLBACK_CONFLICT_GEOJSON;
      try {
        const res = await fetch('http://localhost:8041/api/v1/telemetry/conflict');
        if (res.ok) {
          const json = await res.json();
          if (json && json.features && json.features.length > 0) conflictData = json;
        }
      } catch (e) {}
      map.addSource('conflict-events', { type: 'geojson', data: conflictData });

      // 2. Aviation Sources
      map.addSource('aviation-events', { type: 'geojson', data: AVIATION_GEOJSON });
      map.addSource('aviation-routes', { type: 'geojson', data: AVIATION_ROUTES_GEOJSON });

      // 3. GNSS Jamming Source
      map.addSource('gnss-zones', { type: 'geojson', data: GNSS_GEOJSON });

      // 4. FIRMS Thermal Source
      map.addSource('firms-events', { type: 'geojson', data: FIRMS_GEOJSON });

      // 5. BGP Outages Source
      map.addSource('bgp-events', { type: 'geojson', data: BGP_GEOJSON });

      // 6. News Feed Source
      map.addSource('news-events', { type: 'geojson', data: NEWS_GEOJSON });

      // 7. USGS Earthquakes Source
      map.addSource('earthquakes', {
        type: 'geojson',
        data: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson',
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50
      });

      // --- LAYERS ---

      // GNSS Jamming Fill & Line Layers
      map.addLayer({
        id: 'gnss-fill',
        type: 'fill',
        source: 'gnss-zones',
        layout: { 'visibility': activeLayers?.gnss !== false ? 'visible' : 'none' },
        paint: {
          'fill-color': '#ffaa00',
          'fill-opacity': 0.25
        }
      });
      map.addLayer({
        id: 'gnss-border',
        type: 'line',
        source: 'gnss-zones',
        layout: { 'visibility': activeLayers?.gnss !== false ? 'visible' : 'none' },
        paint: {
          'line-color': '#ff3333',
          'line-width': 2,
          'line-dasharray': [2, 2]
        }
      });

      // Aviation Trajectory Line Layer
      map.addLayer({
        id: 'aviation-lines',
        type: 'line',
        source: 'aviation-routes',
        layout: { 'visibility': activeLayers?.aviation !== false ? 'visible' : 'none' },
        paint: {
          'line-color': '#00ffcc',
          'line-width': 1.5,
          'line-dasharray': [4, 4],
          'line-opacity': 0.7
        }
      });

      // Aviation Aircraft Symbol/Circle Layer
      map.addLayer({
        id: 'aviation-circles',
        type: 'circle',
        source: 'aviation-events',
        layout: { 'visibility': activeLayers?.aviation !== false ? 'visible' : 'none' },
        paint: {
          'circle-color': '#00ffcc',
          'circle-radius': 6,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#005544'
        }
      });
      map.addLayer({
        id: 'aviation-labels',
        type: 'symbol',
        source: 'aviation-events',
        layout: {
          'visibility': activeLayers?.aviation !== false ? 'visible' : 'none',
          'text-field': '{callsign}',
          'text-font': ['Open Sans Regular'],
          'text-size': 10,
          'text-offset': [0, 1.2]
        },
        paint: { 'text-color': '#00ffcc' }
      });

      // War Conflict Heatmap & Circles
      map.addLayer({
        id: 'conflict-heatmap',
        type: 'heatmap',
        source: 'conflict-events',
        layout: { 'visibility': activeLayers?.war !== false ? 'visible' : 'none' },
        paint: {
          'heatmap-weight': ['coalesce', ['get', 'intensity'], 0.8],
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1.5, 9, 4],
          'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0, 'rgba(0,0,0,0)',
            0.15, 'rgba(255, 100, 0, 0.4)',
            0.4, 'rgba(255, 30, 0, 0.75)',
            0.7, 'rgba(255, 200, 0, 0.95)',
            1.0, '#ffffff'
          ],
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 25, 9, 60],
          'heatmap-opacity': 0.85
        }
      });
      map.addLayer({
        id: 'conflict-circles',
        type: 'circle',
        source: 'conflict-events',
        layout: { 'visibility': activeLayers?.war !== false ? 'visible' : 'none' },
        paint: {
          'circle-color': '#ff2222',
          'circle-radius': 7,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff'
        }
      });

      // FIRMS Thermal Circles
      map.addLayer({
        id: 'firms-circles',
        type: 'circle',
        source: 'firms-events',
        layout: { 'visibility': activeLayers?.firms !== false ? 'visible' : 'none' },
        paint: {
          'circle-color': '#ff6600',
          'circle-radius': 8,
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#ffff00'
        }
      });

      // BGP Outage Hub Circles
      map.addLayer({
        id: 'bgp-circles',
        type: 'circle',
        source: 'bgp-events',
        layout: { 'visibility': activeLayers?.bgp !== false ? 'visible' : 'none' },
        paint: {
          'circle-color': '#a855f7',
          'circle-radius': 9,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff'
        }
      });

      // News Feed Circles
      map.addLayer({
        id: 'news-circles',
        type: 'circle',
        source: 'news-events',
        layout: { 'visibility': activeLayers?.news !== false ? 'visible' : 'none' },
        paint: {
          'circle-color': '#3b82f6',
          'circle-radius': 6,
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#ffffff'
        }
      });

      // Earthquake Layers
      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'earthquakes',
        filter: ['has', 'point_count'],
        layout: { 'visibility': activeLayers?.earthquakes !== false ? 'visible' : 'none' },
        paint: {
          'circle-color': ['step', ['get', 'point_count'], '#51bbd6', 50, '#f1f075', 200, '#f28cb1'],
          'circle-radius': ['step', ['get', 'point_count'], 18, 50, 25, 200, 35],
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#ffffff'
        }
      });
      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'earthquakes',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['Open Sans Regular'],
          'text-size': 12,
          'visibility': activeLayers?.earthquakes !== false ? 'visible' : 'none'
        },
        paint: { 'text-color': '#000000' }
      });
      map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'earthquakes',
        filter: ['!', ['has', 'point_count']],
        layout: { 'visibility': activeLayers?.earthquakes !== false ? 'visible' : 'none' },
        paint: {
          'circle-color': '#00ffcc',
          'circle-radius': 5,
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#ffffff'
        }
      });

      // --- INTERACTIVITY HOVER HANDLERS ---

      map.on('mousemove', (e) => {
        setCrosshair({ lat: e.lngLat.lat.toFixed(4), lon: e.lngLat.lng.toFixed(4) });
      });

      const setupHover = (layerId, getHtml) => {
        map.on('mouseenter', layerId, (e) => {
          map.getCanvas().style.cursor = 'pointer';
          if (!e.features || !e.features.length) return;
          const feat = e.features[0];
          const coords = feat.geometry.type === 'Point' 
            ? feat.geometry.coordinates.slice() 
            : [e.lngLat.lng, e.lngLat.lat];

          while (Math.abs(e.lngLat.lng - coords[0]) > 180) {
            coords[0] += e.lngLat.lng > coords[0] ? 360 : -360;
          }

          hoverPopupRef.current
            .setLngLat(coords)
            .setHTML(`<div style="font-family: monospace; font-size: 11px; padding: 4px;">${getHtml(feat.properties)}</div>`)
            .addTo(map);
        });

        map.on('mouseleave', layerId, () => {
          map.getCanvas().style.cursor = '';
          hoverPopupRef.current.remove();
        });
      };

      // Hover Tooltips for All Telemetry Modules
      setupHover('aviation-circles', (p) => `
        <div style="color:#00ffcc; font-weight:bold;">✈️ AIRCRAFT: ${p.callsign}</div>
        <div>Model: ${p.aircraft} | Alt: ${p.alt}</div>
        <div>Speed: ${p.spd} | Route: ${p.route}</div>
      `);

      setupHover('gnss-fill', (p) => `
        <div style="color:#ffaa00; font-weight:bold;">⚠️ GNSS JAMMING: ${p.name}</div>
        <div>Severity: ${p.severity}</div>
        <div>Type: ${p.type}</div>
      `);

      setupHover('conflict-circles', (p) => `
        <div style="color:#ff4444; font-weight:bold;">⚔️ WAR ZONE: ${p.name}</div>
        <div>Event: ${p.event_type} | Fatalities: ${p.fatalities ?? 0}</div>
        <div>Intensity: ${((p.intensity || 0.8) * 100).toFixed(0)}%</div>
      `);

      setupHover('firms-circles', (p) => `
        <div style="color:#ff6600; font-weight:bold;">🔥 THERMAL ANOMALY</div>
        <div>FRP: ${p.frp} MW | Temp: ${p.temp}</div>
        <div>Sensor: ${p.sat}</div>
      `);

      setupHover('bgp-circles', (p) => `
        <div style="color:#a855f7; font-weight:bold;">📡 BGP OUTAGE: ${p.hub}</div>
        <div>Drop: ${p.drop} | ASN: ${p.asn}</div>
        <div>Status: ${p.status}</div>
      `);

      setupHover('news-circles', (p) => `
        <div style="color:#3b82f6; font-weight:bold;">🌐 OSINT NEWS FEED</div>
        <div>${p.headline}</div>
        <div style="color:#9ca3af; font-size:9px;">Source: ${p.source} (${p.time})</div>
      `);

      setupHover('unclustered-point', (p) => `
        <div style="color:#00ffcc; font-weight:bold;">🌋 EARTHQUAKE</div>
        <div>Mag: ${p.mag} | Loc: ${p.place}</div>
      `);
    });
  }, []);

  // Camera FlyTo Handler
  useEffect(() => {
    if (mapRef.current && focusedLocation) {
      mapRef.current.flyTo({
        center: [focusedLocation.lon, focusedLocation.lat],
        zoom: focusedLocation.zoom || 8,
        speed: 1.2,
        curve: 1.42,
        essential: true
      });
    }
  }, [focusedLocation]);

  // Dynamic Layer Visibility Toggling
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    
    const updateVisibility = () => {
      if (!map.isStyleLoaded()) return;

      const setVis = (layerIds, isVisible) => {
        const visStr = isVisible ? 'visible' : 'none';
        layerIds.forEach(id => {
          if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', visStr);
        });
      };

      setVis(['conflict-heatmap', 'conflict-circles'], activeLayers?.war !== false);
      setVis(['aviation-circles', 'aviation-labels', 'aviation-lines'], activeLayers?.aviation !== false);
      setVis(['gnss-fill', 'gnss-border'], activeLayers?.gnss !== false);
      setVis(['firms-circles'], activeLayers?.firms !== false);
      setVis(['bgp-circles'], activeLayers?.bgp !== false);
      setVis(['news-circles'], activeLayers?.news !== false);
      setVis(['clusters', 'cluster-count', 'unclustered-point'], activeLayers?.earthquakes !== false);
    };

    if (map.isStyleLoaded()) {
      updateVisibility();
    } else {
      map.once('styledata', updateVisibility);
    }
  }, [activeLayers]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* HUD Dynamic Crosshair / Lat-Lon Telemetry Display */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/85 border border-hud-border px-4 py-1 rounded text-hud-accent font-mono text-[11px] pointer-events-none z-10 flex items-center gap-4 shadow-[0_0_10px_rgba(0,255,204,0.15)]">
        <span>LAT: <strong className="text-white">{crosshair.lat}</strong></span>
        <span>LON: <strong className="text-white">{crosshair.lon}</strong></span>
        <span className="text-red-500 font-bold animate-pulse flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span> RADAR LIVE
        </span>
      </div>
    </div>
  );
};

export default MapContainer;
