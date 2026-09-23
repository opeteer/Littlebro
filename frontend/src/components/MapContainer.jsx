import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const MapContainer = ({ focusedLocation, activeLayers }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current) return; // initialize map only once

    mapRef.current = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: [0, 20],
      zoom: 2,
      antialias: true,
      renderWorldCopies: false // Prevent horizontal duplication
    });

    mapRef.current.on('load', () => {
      console.log("MapLibre GL loaded");
      
      // Setup sources
      mapRef.current.addSource('earthquakes', {
        type: 'geojson',
        data: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson',
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50
      });

      mapRef.current.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'earthquakes',
        filter: ['has', 'point_count'],
        layout: {
          'visibility': activeLayers?.earthquakes ? 'visible' : 'none'
        },
        paint: {
          'circle-color': ['step', ['get', 'point_count'], '#51bbd6', 100, '#f1f075', 750, '#f28cb1'],
          'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40],
          'circle-stroke-width': 1,
          'circle-stroke-color': '#fff'
        }
      });
      
      mapRef.current.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'earthquakes',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['Open Sans Regular'],
          'text-size': 12,
          'visibility': activeLayers?.earthquakes ? 'visible' : 'none'
        },
        paint: {
          'text-color': '#000000'
        }
      });

      mapRef.current.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'earthquakes',
        filter: ['!', ['has', 'point_count']],
        layout: {
          'visibility': activeLayers?.earthquakes ? 'visible' : 'none'
        },
        paint: {
          'circle-color': '#ff3333',
          'circle-radius': 6,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#fff'
        }
      });

      // Interactive Map Clicks & Popups
      mapRef.current.on('click', 'unclustered-point', (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const mag = e.features[0].properties.mag;
        const place = e.features[0].properties.place;

        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new maplibregl.Popup()
          .setLngLat(coordinates)
          .setHTML(`<strong>Magnitude:</strong> ${mag}<br/><strong>Location:</strong> ${place}`)
          .addTo(mapRef.current);
      });

      mapRef.current.on('mouseenter', 'unclustered-point', () => {
        mapRef.current.getCanvas().style.cursor = 'pointer';
      });
      mapRef.current.on('mouseleave', 'unclustered-point', () => {
        mapRef.current.getCanvas().style.cursor = '';
      });
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

  // Handle Layer toggling when activeLayers prop changes
  useEffect(() => {
    if (!mapRef.current || !mapRef.current.isStyleLoaded()) return;
    
    const visibility = activeLayers?.earthquakes ? 'visible' : 'none';
    if (mapRef.current.getLayer('clusters')) mapRef.current.setLayoutProperty('clusters', 'visibility', visibility);
    if (mapRef.current.getLayer('cluster-count')) mapRef.current.setLayoutProperty('cluster-count', 'visibility', visibility);
    if (mapRef.current.getLayer('unclustered-point')) mapRef.current.setLayoutProperty('unclustered-point', 'visibility', visibility);
  }, [activeLayers]);

  return <div ref={mapContainerRef} className="w-full h-full" />;
};

export default MapContainer;
