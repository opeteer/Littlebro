import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const pulsingDot = (map) => {
  const size = 150;
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
      const duration = 1500;
      const t = (performance.now() % duration) / duration;
      const radius = (size / 2) * 0.3;
      const outerRadius = (size / 2) * 0.7 * t + radius;
      const context = this.context;

      context.clearRect(0, 0, this.width, this.height);
      context.beginPath();
      context.arc(this.width / 2, this.height / 2, outerRadius, 0, Math.PI * 2);
      context.fillStyle = `rgba(255, 255, 255, ${1 - t})`;
      context.fill();

      context.beginPath();
      context.arc(this.width / 2, this.height / 2, radius, 0, Math.PI * 2);
      context.fillStyle = 'rgba(255, 100, 100, 1)';
      context.strokeStyle = 'white';
      context.lineWidth = 2 + 4 * (1 - t);
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
  const [crosshair, setCrosshair] = useState({ lat: 0, lon: 0 });
  const hoverPopupRef = useRef(new maplibregl.Popup({ closeButton: false, closeOnClick: false }));

  useEffect(() => {
    if (mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: [0, 20],
      zoom: 2,
      pitch: 45, // 3D Pitch
      antialias: true,
      renderWorldCopies: false
    });
    mapRef.current = map;

    map.on('load', () => {
      console.log("MapLibre GL loaded");
      
      map.addImage('pulsing-dot', pulsingDot(map), { pixelRatio: 2 });

      // USGS Earthquakes Source
      map.addSource('earthquakes', {
        type: 'geojson',
        data: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson',
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50
      });

      // War & Conflict Source (Backend Endpoint)
      map.addSource('conflict-events', {
        type: 'geojson',
        data: 'http://localhost:8041/api/v1/telemetry/conflict'
      });

      // Heatmap Layer for Conflicts
      map.addLayer({
        id: 'conflict-heatmap',
        type: 'heatmap',
        source: 'conflict-events',
        layout: { 'visibility': activeLayers?.war ? 'visible' : 'none' },
        paint: {
          'heatmap-weight': ['get', 'intensity'],
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 9, 3],
          'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0, 'rgba(0,0,0,0)',
            0.2, 'rgba(255, 140, 0, 0.4)',
            0.5, 'rgba(255, 30, 0, 0.7)',
            0.8, 'rgba(255, 215, 0, 0.9)',
            1, '#ffffff'
          ],
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 15, 9, 40],
          'heatmap-opacity': 0.8
        }
      });

      // Pulsing Dot Layer for Conflicts
      map.addLayer({
        id: 'conflict-points',
        type: 'symbol',
        source: 'conflict-events',
        layout: {
          'visibility': activeLayers?.war ? 'visible' : 'none',
          'icon-image': 'pulsing-dot',
          'icon-allow-overlap': true
        }
      });

      // Earthquake Layers (Existing)
      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'earthquakes',
        filter: ['has', 'point_count'],
        layout: { 'visibility': activeLayers?.earthquakes ? 'visible' : 'none' },
        paint: {
          'circle-color': ['step', ['get', 'point_count'], '#51bbd6', 100, '#f1f075', 750, '#f28cb1'],
          'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40],
          'circle-stroke-width': 1,
          'circle-stroke-color': '#fff'
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
          'visibility': activeLayers?.earthquakes ? 'visible' : 'none'
        }
      });

      map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'earthquakes',
        filter: ['!', ['has', 'point_count']],
        layout: { 'visibility': activeLayers?.earthquakes ? 'visible' : 'none' },
        paint: {
          'circle-color': '#ff3333',
          'circle-radius': 6,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#fff'
        }
      });

      // Interactive Events
      map.on('mousemove', (e) => {
        setCrosshair({ lat: e.lngLat.lat.toFixed(4), lon: e.lngLat.lng.toFixed(4) });
      });

      // Hover Tooltip for Conflict Points
      map.on('mouseenter', 'conflict-points', (e) => {
        map.getCanvas().style.cursor = 'crosshair';
        const coordinates = e.features[0].geometry.coordinates.slice();
        const { name, event_type, fatalities } = e.features[0].properties;

        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        hoverPopupRef.current
          .setLngLat(coordinates)
          .setHTML(`<div class="text-xs"><strong>${name}</strong><br/>Type: ${event_type}<br/>Fatalities: ${fatalities}</div>`)
          .addTo(map);
      });

      map.on('mouseleave', 'conflict-points', () => {
        map.getCanvas().style.cursor = '';
        hoverPopupRef.current.remove();
      });

      // Click for Earthquakes
      map.on('click', 'unclustered-point', (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const { mag, place } = e.features[0].properties;
        new maplibregl.Popup()
          .setLngLat(coordinates)
          .setHTML(`<strong>Magnitude:</strong> ${mag}<br/><strong>Location:</strong> ${place}`)
          .addTo(map);
      });
    });
  }, []);

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

  useEffect(() => {
    if (!mapRef.current || !mapRef.current.isStyleLoaded()) return;
    const map = mapRef.current;
    
    const eqVis = activeLayers?.earthquakes ? 'visible' : 'none';
    if (map.getLayer('clusters')) map.setLayoutProperty('clusters', 'visibility', eqVis);
    if (map.getLayer('cluster-count')) map.setLayoutProperty('cluster-count', 'visibility', eqVis);
    if (map.getLayer('unclustered-point')) map.setLayoutProperty('unclustered-point', 'visibility', eqVis);

    const warVis = activeLayers?.war ? 'visible' : 'none';
    if (map.getLayer('conflict-heatmap')) map.setLayoutProperty('conflict-heatmap', 'visibility', warVis);
    if (map.getLayer('conflict-points')) map.setLayoutProperty('conflict-points', 'visibility', warVis);
  }, [activeLayers]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainerRef} className="w-full h-full" />
      {/* Dynamic Crosshair UI */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/80 border border-green-500/50 px-4 py-1 rounded text-green-400 font-mono text-[10px] pointer-events-none z-10 flex gap-4">
        <span>LAT: {crosshair.lat}</span>
        <span>LON: {crosshair.lon}</span>
        <span className="text-red-500 animate-pulse">TRK: ACTIVE</span>
      </div>
    </div>
  );
};

export default MapContainer;
