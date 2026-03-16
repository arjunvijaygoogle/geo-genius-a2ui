import React, { useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps';

// Helper component to automatically zoom and center the map to fit all markers
const AutoBounds = ({ markers }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !markers || markers.length === 0) return;

    const bounds = new window.google.maps.LatLngBounds();
    
    markers.forEach(marker => {
      if (marker.lat && marker.lng) {
        bounds.extend({ lat: parseFloat(marker.lat), lng: parseFloat(marker.lng) });
      }
    });

    map.fitBounds(bounds);
    map.panToBounds(bounds, 50); 
  }, [map, markers]);

  return null;
};

export default function MapWidget({ location, locations }) {
  const markers = locations || (location ? [location] : []);
  const defaultCenter = { lat: 18.5204, lng: 73.8567 };

  return (
    <div className="map-container" style={{ 
      height: '450px', 
      width: '100%', 
      borderRadius: '20px', 
      overflow: 'hidden', 
      marginTop: '1.5rem',
      boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)',
      background: '#f8fafc'
    }}>
      {/* Note: It's best practice to use import.meta.env.VITE_GOOGLE_MAPS_API_KEY in production! */}
      <APIProvider apiKey="">
        <Map 
          defaultZoom={12} 
          defaultCenter={defaultCenter} 
          mapId="A2UI_DEMO_MAP" 
          gestureHandling="greedy"
          disableDefaultUI={true}
        >
          {markers.map((marker, index) => {
            const position = { 
              lat: parseFloat(marker.lat), 
              lng: parseFloat(marker.lng) 
            };

            return (
              <AdvancedMarker key={index} position={position} title={marker.title || "Location"}>
                <Pin 
                  background="#4F46E5" /* Modern Indigo */
                  borderColor="#312E81" 
                  glyphColor="#ffffff" 
                  scale={1.2}
                />
              </AdvancedMarker>
            );
          })}
          <AutoBounds markers={markers} />
        </Map>
      </APIProvider>
    </div>
  );
}