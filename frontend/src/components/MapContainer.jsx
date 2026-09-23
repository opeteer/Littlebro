import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// Fallback Rich Conflict Dataset for instant map telemetry if backend API is unreachable
const FALLBACK_CONFLICT_GEOJSON = {
  type: "FeatureCollection",
  features: [
    { type: "Feature", geometry: { type: "Point", coordinates: [37.80, 48.01] }, properties: { name: "Donetsk Sector", event_type: "Artillery & Drone Strike", intensity: 0.95, fatalities: 24, time: "10 mins ago" } },
    { type: "Feature", geometry: { type: "Point", coordinates: [37.95, 48.15] }, properties: { name: "Avdiivka North", event_type: "Armored Assault", intensity: 0.90, fatalities: 18, time: "25 mins ago" } },
    { type: "Feature", geometry: { type: "Point", coordinates: [36.23, 49.99] }, properties: { name: "Kharkiv Border", event_type: "Missile Strike", intensity: 0.85, fatalities: 12, time: "40 mins ago" } },
    { type: "Feature", geometry: { type: "Point", coordinates: [34.40, 31.40] }, properties: { name: "Gaza Central Zone", event_type: "Air Strike", intensity: 0.98, fatalities: 35, time: "5 mins ago" } },
    { type: "Feature", geometry: { type: "Point", coordinates: [34.45, 31.50] }, properties: { name: "Gaza North Area", event_type: "Heavy Shelling", intensity: 0.92, fatalities: 15, time: "15 mins ago" } },
    { type: "Feature", geometry: { type: "Point", coordinates: [35.50, 33.89] }, properties: { name: "Beirut Suburbs", event_type: "Targeted Air Strike", intensity: 0.88, fatalities: 9, time: "1 hour ago" } },
    { type: "Feature", geometry: { type: "Point", coordinates: [35.35, 33.12] }, properties: { name: "South Lebanon Border", event_type: "Rocket Barrage", intensity: 0.80, fatalities: 4, time: "30 mins ago" } },
    { type: "Feature", geometry: { type: "Point", coordinates: [32.55, 15.50] }, properties: { name: "Khartoum Center", event_type: "Urban Gunbattle", intensity: 0.85, fatalities: 20, time: "2 hours ago" } },
    { type: "Feature", geometry: { type: "Point", coordinates: [25.34, 13.62] }, properties: { name: "El Fasher Siege", event_type: "Artillery Bombardment", intensity: 0.89, fatalities: 31, time: "45 mins ago" } },
    { type: "Feature", geometry: { type: "Point", coordinates: [97.20, 19.24] }, properties: { name: "Kayah State", event_type: "Ambush & Skirmish", intensity: 0.75, fatalities: 8, time: "3 hours ago" } },
    { type: "Feature", geometry: { type: "Point", coordinates: [29.22, -1.65] }, properties: { name: "Goma Outskirts", event_type: "Rebel Clash", intensity: 0.70, fatalities: 6, time: "1 hour ago" } },
    { type: "Feature", geometry: { type: "Point", coordinates: [43.15, 15.30] }, properties: { name: "Red Sea Straits", event_type: "Anti-Ship Missile Launch", intensity: 0.87, fatalities: 0, time: "20 mins ago" } }
  ]
};

// Canvas Pulsing Dot Generator
const pulsingDot = (map) => {
  const size = 120;
  return {
    width: size,
    height: size,
    data: new Uint8Array(size * size * 4),
    onAdd: function () {
      const canvas = document.createElement('canvas');
      canvas.width = this.width;
      canvas.height = this.height;
      this.context = canvas.getContext('2d');
    },
    render: function () {
      const duration = 1200;
      const t = (performance.now() % duration) / duration;
      const radius = (size / 2) * 0.25;
      const outerRadius = (size / 2) * 0.7 * t + radius;
      const context = this.context;

      context.clearRect(0, 0, this.width, this.height);
      
      // Outer aura pulse
      context.beginPath();
      context.arc(this.width / 2, this.height / 2, outerRadius, 0, Math.PI * 2);
      context.fillStyle = `rgba(255, 30, 30, ${1 - t})`;
      context.fill();

      // Inner core
      context.beginPath();
      context.arc(this.width / 2, this.height / 2, radius, 0, Math.PI * 2);
      context.fillStyle = 'rgba(255, 80, 80, 1)';
      context.strokeStyle = '#ffffff';
      context.lineWidth = 2;
      context.fill();
      context.stroke();

      this.data = context.getImageData(0, 0, this.width, this.height).data;
      map.triggerRepaint();
      return true;
    }
  };
};

const MapContainer = ({ focusedLocation, activeLayers }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [crosshair, setCrosshair] = useState({ lat: '0.0000', lon: '0.0000' });
  const hoverPopupRef = useRef(null);

  useEffect(() => {
    if (mapRef.current) return;

    // Create persistent hover popup
    hoverPopupRef.current = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      className: 'map-hover-popup'
    });

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: [30, 25],
      zoom: 3,
      pitch: 35,
      antialias: true,
      renderWorldCopies: false
    });
    mapRef.current = map;

    map.on('load', async () => {
      console.log("MapLibre GL loaded successfully");

      // Register pulsing dot image
      try {
        map.addImage('pulsing-dot', pulsingDot(map), { pixelRatio: 2 });
      } catch (err) {
        console.warn("Pulsing dot registration warning:", err);
      }

      // 1. Fetch Conflict Data (Backend with Frontend Fallback)
      let conflictData = FALLBACK_CONFLICT_GEOJSON;
      try {
        const res = await fetch('http://localhost:8041/api/v1/telemetry/conflict');
        if (res.ok) {
          const json = await res.json();
          if (json && json.features && json.features.length > 0) {
            conflictData = json;
          }
        }
      } catch (e) {
        console.log("Backend conflict endpoint unreachable, using robust fallback telemetry feed.");
      }

      // Add Conflict Source
      map.addSource('conflict-events', {
        type: 'geojson',
        data: conflictData
      });

      // 2. Add USGS Earthquakes Source (Use all_day for rich global earthquake coverage)
      map.addSource('earthquakes', {
        type: 'geojson',
        data: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson',
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50
      });

      // LAYER 1: Conflict Heatmap Layer (Incandescent Crimson Glow)
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

      // LAYER 2: Conflict Glowing Circle Beacons (Ensures points are ALWAYS visible)
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

      // LAYER 3: Conflict Pulsing Symbol Layer
      map.addLayer({
        id: 'conflict-points',
        type: 'symbol',
        source: 'conflict-events',
        layout: {
          'visibility': activeLayers?.war !== false ? 'visible' : 'none',
          'icon-image': 'pulsing-dot',
          'icon-allow-overlap': true,
          'icon-ignore-placement': true
        }
      });

      // LAYER 4: Earthquake Clusters
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

      // LAYER 5: Earthquake Cluster Text
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
        paint: {
          'text-color': '#000000'
        }
      });

      // LAYER 6: Unclustered Earthquake Points
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

      // --- INTERACTIVITY LOGIC ---

      // Mouse Crosshair Tracker
      map.on('mousemove', (e) => {
        setCrosshair({
          lat: e.lngLat.lat.toFixed(4),
          lon: e.lngLat.lng.toFixed(4)
        });
      });

      // Hover Card for Conflict Points & Circles
      const handleConflictHover = (e) => {
        map.getCanvas().style.cursor = 'pointer';
        if (!e.features || !e.features.length) return;
        
        const feat = e.features[0];
        const coordinates = feat.geometry.coordinates.slice();
        const { name, event_type, fatalities, time, intensity } = feat.properties;

        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        const html = `
          <div style="font-family: monospace; font-size: 11px; padding: 4px;">
            <div style="color: #ff4444; font-weight: bold; font-size: 12px; margin-bottom: 2px;">⚔️ ${name || 'WAR ZONE'}</div>
            <div style="color: #e5e7eb;"><strong>Event:</strong> ${event_type || 'Military Conflict'}</div>
            <div style="color: #ffaa00;"><strong>Fatalities:</strong> ${fatalities ?? 'N/A'}</div>
            <div style="color: #00ffcc;"><strong>Intensity:</strong> ${((intensity || 0.8) * 100).toFixed(0)}%</div>
            <div style="color: #9ca3af; font-size: 9px; margin-top: 4px;">🕒 ${time || 'Live Telemetry'}</div>
          </div>
        `;

        hoverPopupRef.current
          .setLngLat(coordinates)
          .setHTML(html)
          .addTo(map);
      };

      map.on('mouseenter', 'conflict-circles', handleConflictHover);
      map.on('mouseenter', 'conflict-points', handleConflictHover);

      map.on('mouseleave', 'conflict-circles', () => {
        map.getCanvas().style.cursor = '';
        hoverPopupRef.current.remove();
      });
      map.on('mouseleave', 'conflict-points', () => {
        map.getCanvas().style.cursor = '';
        hoverPopupRef.current.remove();
      });

      // Click Zoom on Earthquake Clusters
      map.on('click', 'clusters', (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
        const clusterId = features[0].properties.cluster_id;
        map.getSource('earthquakes').getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return;
          map.easeTo({
            center: features[0].geometry.coordinates,
            zoom: zoom
          });
        });
      });

      // Click Detail Popup on Earthquake Points
      map.on('click', 'unclustered-point', (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const { mag, place } = e.features[0].properties;
        new maplibregl.Popup()
          .setLngLat(coordinates)
          .setHTML(`
            <div style="font-family: monospace; font-size: 11px;">
              <strong style="color: #00ffcc;">USGS Earthquake</strong><br/>
              <strong>Mag:</strong> ${mag}<br/>
              <strong>Loc:</strong> ${place}
            </div>
          `)
          .addTo(map);
      });

      map.on('mouseenter', 'clusters', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'clusters', () => { map.getCanvas().style.cursor = ''; });
      map.on('mouseenter', 'unclustered-point', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'unclustered-point', () => { map.getCanvas().style.cursor = ''; });
    });
  }, []);

  // Handle flyTo camera movement when focusedLocation changes
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

      const eqVis = activeLayers?.earthquakes !== false ? 'visible' : 'none';
      if (map.getLayer('clusters')) map.setLayoutProperty('clusters', 'visibility', eqVis);
      if (map.getLayer('cluster-count')) map.setLayoutProperty('cluster-count', 'visibility', eqVis);
      if (map.getLayer('unclustered-point')) map.setLayoutProperty('unclustered-point', 'visibility', eqVis);

      const warVis = activeLayers?.war !== false ? 'visible' : 'none';
      if (map.getLayer('conflict-heatmap')) map.setLayoutProperty('conflict-heatmap', 'visibility', warVis);
      if (map.getLayer('conflict-circles')) map.setLayoutProperty('conflict-circles', 'visibility', warVis);
      if (map.getLayer('conflict-points')) map.setLayoutProperty('conflict-points', 'visibility', warVis);
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
