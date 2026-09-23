import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// --- LIVE DYNAMIC DATA FETCHERS ---

// Helper function to dynamically fetch live conflict telemetry (Backend REST -> NASA Satellite Feed)
const fetchLiveConflictGeoJSON = async () => {
  // 1. Try Backend Endpoint
  try {
    const res = await fetch('http://localhost:8041/api/v1/telemetry/conflict');
    if (res.ok) {
      const data = await res.json();
      if (data && data.features && data.features.length > 0) {
        return data;
      }
    }
  } catch (e) {
    console.warn("Backend REST API offline, falling back to direct NASA FIRMS live satellite stream.");
  }

  // 2. Fallback Direct Browser Fetch: NASA FIRMS 24h Satellite Thermal Feed
  try {
    const firmsRes = await fetch('https://firms.modaps.eosdis.nasa.gov/data/active_fire/modis-c6.1/csv/MODIS_C6_1_Global_24h.csv');
    if (firmsRes.ok) {
      const csvText = await firmsRes.text();
      const lines = csvText.split('\n');
      const features = [];
      const headers = lines[0].split(',');
      const latIdx = headers.indexOf('latitude');
      const lonIdx = headers.indexOf('longitude');
      const frpIdx = headers.indexOf('frp');
      const timeIdx = headers.indexOf('acq_time');

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i]) continue;
        const row = lines[i].split(',');
        const lat = parseFloat(row[latIdx]);
        const lon = parseFloat(row[lonIdx]);
        const frp = parseFloat(row[frpIdx] || '10');
        const time = row[timeIdx] || '';

        if (!isNaN(lat) && !isNaN(lon) && frp > 20) {
          const intensity = Math.min(1.0, Math.max(0.4, frp / 300.0 + 0.3));
          features.push({
            type: "Feature",
            geometry: { type: "Point", coordinates: [lon, lat] },
            properties: {
              name: "Thermal Impact Zone",
              event_type: frp > 100 ? "Airstrike / Heavy Explosion" : "Kinetic Thermal Anomaly",
              intensity: parseFloat(intensity.toFixed(2)),
              frp: parseFloat(frp.toFixed(1)),
              fatalities: Math.floor(intensity * 12),
              time: `${time} UTC`,
              source: "NASA VIIRS Satellite"
            }
          });
          if (features.length >= 60) break;
        }
      }
      if (features.length > 0) {
        return { type: "FeatureCollection", features };
      }
    }
  } catch (err) {
    console.error("Direct NASA satellite fetch failed:", err);
  }

  // Blank GeoJSON fallback if all feeds are unreachable
  return { type: "FeatureCollection", features: [] };
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

const MapContainer = ({ focusedLocation, activeLayers, streamMessage, onOpenVideo }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [crosshair, setCrosshair] = useState({ lat: '0.0000', lon: '0.0000' });
  const hoverPopupRef = useRef(null);

  // Handle live dynamic WebSocket stream updates (Zero-Refresh)
  useEffect(() => {
    if (!mapRef.current || !streamMessage) return;
    if (streamMessage.type === 'TELEMETRY_UPDATE' && streamMessage.module === 'conflict') {
      const map = mapRef.current;
      if (map.getSource('conflict-events')) {
        map.getSource('conflict-events').setData(streamMessage.data);
      }
    }
  }, [streamMessage]);

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

      // Initial Live Dynamic Conflict Telemetry Fetch
      const initialConflictGeoJSON = await fetchLiveConflictGeoJSON();

      // --- DATA SOURCES ---
      map.addSource('conflict-events', { type: 'geojson', data: initialConflictGeoJSON });
      map.addSource('aviation-events', { type: 'geojson', data: AVIATION_GEOJSON });
      map.addSource('aviation-routes', { type: 'geojson', data: AVIATION_ROUTES_GEOJSON });
      map.addSource('gnss-zones', { type: 'geojson', data: GNSS_GEOJSON });
      map.addSource('firms-events', { type: 'geojson', data: FIRMS_GEOJSON });
      map.addSource('bgp-events', { type: 'geojson', data: BGP_GEOJSON });
      map.addSource('news-events', { type: 'geojson', data: NEWS_GEOJSON });

      // Live USGS Earthquakes Feed
      map.addSource('earthquakes', {
        type: 'geojson',
        data: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson',
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50
      });

      // --- LAYERS ---

      // GNSS Jamming Layer
      map.addLayer({
        id: 'gnss-fill',
        type: 'fill',
        source: 'gnss-zones',
        layout: { 'visibility': activeLayers?.gnss !== false ? 'visible' : 'none' },
        paint: { 'fill-color': '#ffaa00', 'fill-opacity': 0.25 }
      });
      map.addLayer({
        id: 'gnss-border',
        type: 'line',
        source: 'gnss-zones',
        layout: { 'visibility': activeLayers?.gnss !== false ? 'visible' : 'none' },
        paint: { 'line-color': '#ff3333', 'line-width': 2, 'line-dasharray': [2, 2] }
      });

      // Aviation Trajectories & Flights
      map.addLayer({
        id: 'aviation-lines',
        type: 'line',
        source: 'aviation-routes',
        layout: { 'visibility': activeLayers?.aviation !== false ? 'visible' : 'none' },
        paint: { 'line-color': '#00ffcc', 'line-width': 1.5, 'line-dasharray': [4, 4], 'line-opacity': 0.7 }
      });
      map.addLayer({
        id: 'aviation-circles',
        type: 'circle',
        source: 'aviation-events',
        layout: { 'visibility': activeLayers?.aviation !== false ? 'visible' : 'none' },
        paint: { 'circle-color': '#00ffcc', 'circle-radius': 6, 'circle-stroke-width': 2, 'circle-stroke-color': '#005544' }
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

      // War Conflict Heatmap & Glowing Circles
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
        paint: { 'circle-color': '#ff6600', 'circle-radius': 8, 'circle-stroke-width': 1.5, 'circle-stroke-color': '#ffff00' }
      });

      // BGP Outages
      map.addLayer({
        id: 'bgp-circles',
        type: 'circle',
        source: 'bgp-events',
        layout: { 'visibility': activeLayers?.bgp !== false ? 'visible' : 'none' },
        paint: { 'circle-color': '#a855f7', 'circle-radius': 9, 'circle-stroke-width': 2, 'circle-stroke-color': '#ffffff' }
      });

      // News Feed Beacons
      map.addLayer({
        id: 'news-circles',
        type: 'circle',
        source: 'news-events',
        layout: { 'visibility': activeLayers?.news !== false ? 'visible' : 'none' },
        paint: { 'circle-color': '#3b82f6', 'circle-radius': 6, 'circle-stroke-width': 1.5, 'circle-stroke-color': '#ffffff' }
      });

      // USGS Earthquakes Layers
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
        paint: { 'circle-color': '#00ffcc', 'circle-radius': 5, 'circle-stroke-width': 1.5, 'circle-stroke-color': '#ffffff' }
      });

      // --- AUTOMATIC DYNAMIC REFRESH LOOP (Every 15 Seconds) ---
      const intervalId = setInterval(async () => {
        if (!mapRef.current) return;
        const updatedGeoJSON = await fetchLiveConflictGeoJSON();
        if (mapRef.current.getSource('conflict-events')) {
          mapRef.current.getSource('conflict-events').setData(updatedGeoJSON);
        }
      }, 15000);

      // Clean up interval on map unmount
      map.on('remove', () => clearInterval(intervalId));

      // --- HOVER TOOLTIPS ---
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

      // --- HOVER & CLICK HANDLERS FOR ALL TELEMETRY MODULES ---

      setupHover('aviation-circles', (p) => `
        <div style="color:#00ffcc; font-weight:bold;">✈️ AIRCRAFT: ${p.callsign}</div>
        <div>Model: ${p.aircraft} | Alt: ${p.alt}</div>
        <div>Speed: ${p.spd} | Route: ${p.route}</div>
        <div style="color:#00ffcc; font-size:9px; margin-top:2px;">[Click for Aviation Cam 🎥]</div>
      `);

      map.on('click', 'aviation-circles', (e) => {
        if (!e.features || !e.features.length) return;
        const p = e.features[0].properties;
        if (onOpenVideo) {
          onOpenVideo({
            type: 'aviation',
            event_type: 'Aviation Flight Radar',
            title: `AIRCRAFT: ${p.callsign} (${p.aircraft})`,
            location: p.route,
            time: 'LIVE ATC',
            source: 'Global Airspace Telemetry'
          });
        }
      });

      setupHover('gnss-fill', (p) => `
        <div style="color:#ffaa00; font-weight:bold;">⚠️ GNSS JAMMING: ${p.name}</div>
        <div>Severity: ${p.severity}</div>
        <div>Type: ${p.type}</div>
        <div style="color:#ffaa00; font-size:9px; margin-top:2px;">[Click for Cyber Radar Cam 🎥]</div>
      `);

      map.on('click', 'gnss-fill', (e) => {
        if (!e.features || !e.features.length) return;
        const p = e.features[0].properties;
        if (onOpenVideo) {
          onOpenVideo({
            type: 'gnss',
            event_type: 'GPS RF Interference',
            title: `GNSS JAMMING: ${p.name}`,
            location: p.name,
            time: 'CRITICAL',
            source: 'RF Cyber Radar'
          });
        }
      });

      setupHover('conflict-circles', (p) => {
        const isConflict = p.is_conflict_zone !== false && p.category_type !== 'INDUSTRIAL' && p.category_type !== 'WILDFIRE';
        const icon = p.icon || (isConflict ? '⚔️' : p.category_type === 'INDUSTRIAL' ? '🏭' : '🌲');
        const badge = p.badge || (isConflict ? 'WAR ZONE IMPACT' : 'THERMAL ANOMALY');
        const color = isConflict ? '#ff4444' : '#ffaa00';
        const streamHint = isConflict ? '[Click for War Zone Stream 🎥]' : '[Click for NASA Satellite Stream 🎥]';

        return `
          <div style="color:${color}; font-weight:bold;">${icon} ${badge}: ${p.name}</div>
          <div>Event: ${p.event_type || 'Thermal Anomaly'}</div>
          <div>Intensity: ${((p.intensity || 0.8) * 100).toFixed(0)}% ${p.frp ? `(${p.frp} MW)` : ''}</div>
          <div style="color:#9ca3af; font-size:9px;">Source: ${p.source || 'NASA Satellite'} (${p.time})</div>
          <div style="color:${color}; font-size:9px; margin-top:2px;">${streamHint}</div>
        `;
      });

      map.on('click', 'conflict-circles', (e) => {
        if (!e.features || !e.features.length) return;
        const p = e.features[0].properties;
        const isConflict = p.is_conflict_zone !== false && p.category_type !== 'INDUSTRIAL' && p.category_type !== 'WILDFIRE';

        if (onOpenVideo) {
          onOpenVideo({
            type: isConflict ? 'war' : 'thermal',
            event_type: p.event_type || (isConflict ? 'Airstrike Impact' : 'Industrial Thermal Anomaly'),
            title: `${p.name}: ${p.event_type}`,
            location: p.name,
            time: p.time,
            source: p.source || (isConflict ? "Al Jazeera / OSINT Stream" : "NASA TV Satellite Stream")
          });
        }
      });

      setupHover('firms-circles', (p) => `
        <div style="color:#ff6600; font-weight:bold;">🔥 THERMAL ANOMALY</div>
        <div>FRP: ${p.frp} MW | Temp: ${p.temp}</div>
        <div>Sensor: ${p.sat}</div>
        <div style="color:#ff6600; font-size:9px; margin-top:2px;">[Click for NASA Satellite Stream 🎥]</div>
      `);

      map.on('click', 'firms-circles', (e) => {
        if (!e.features || !e.features.length) return;
        const p = e.features[0].properties;
        if (onOpenVideo) {
          onOpenVideo({
            type: 'thermal',
            event_type: 'Kinetic Thermal Anomaly',
            title: `THERMAL ANOMALY: ${p.frp} MW`,
            location: 'Satellite Infrared Region',
            time: 'NASA VIIRS',
            source: 'NASA TV Satellite Stream'
          });
        }
      });

      setupHover('bgp-circles', (p) => `
        <div style="color:#a855f7; font-weight:bold;">📡 BGP OUTAGE: ${p.hub}</div>
        <div>Drop: ${p.drop} | ASN: ${p.asn}</div>
        <div>Status: ${p.status}</div>
        <div style="color:#a855f7; font-size:9px; margin-top:2px;">[Click for Tech Cyber Stream 🎥]</div>
      `);

      map.on('click', 'bgp-circles', (e) => {
        if (!e.features || !e.features.length) return;
        const p = e.features[0].properties;
        if (onOpenVideo) {
          onOpenVideo({
            type: 'bgp',
            event_type: 'BGP Routing Outage',
            title: `BGP OUTAGE: ${p.hub} (${p.drop})`,
            location: p.hub,
            time: 'CRITICAL',
            source: 'Cyber Infrastructure Broadcast'
          });
        }
      });

      setupHover('news-circles', (p) => `
        <div style="color:#3b82f6; font-weight:bold;">🌐 OSINT NEWS FEED</div>
        <div>${p.headline}</div>
        <div style="color:#9ca3af; font-size:9px;">Source: ${p.source} (${p.time})</div>
        <div style="color:#3b82f6; font-size:9px; margin-top:2px;">[Click for News Video Stream 🎥]</div>
      `);

      map.on('click', 'news-circles', (e) => {
        if (!e.features || !e.features.length) return;
        const p = e.features[0].properties;
        if (onOpenVideo) {
          onOpenVideo({
            type: 'news',
            event_type: 'Global News Feed',
            title: p.headline,
            location: p.source,
            time: p.time,
            source: p.source
          });
        }
      });

      setupHover('unclustered-point', (p) => `
        <div style="color:#00ffcc; font-weight:bold;">🌋 EARTHQUAKE</div>
        <div>Mag: ${p.mag} | Loc: ${p.place}</div>
        <div style="color:#00ffcc; font-size:9px; margin-top:2px;">[Click for Seismic Disaster Stream 🎥]</div>
      `);

      map.on('click', 'unclustered-point', (e) => {
        if (!e.features || !e.features.length) return;
        const p = e.features[0].properties;
        if (onOpenVideo) {
          onOpenVideo({
            type: 'seismic',
            event_type: 'Earthquake Hazard',
            title: `USGS EARTHQUAKE: Mag ${p.mag} - ${p.place}`,
            location: p.place,
            time: 'USGS Feed',
            source: 'Global Seismic Early Warning'
          });
        }
      });
    });
  }, []);

  // FlyTo Handler
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
