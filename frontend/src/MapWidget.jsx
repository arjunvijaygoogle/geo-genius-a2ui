import React, { useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps';

// Helper component to automatically zoom and center the map to fit all markers
const AutoBounds = ({ markers }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !markers || markers.length === 0) return;

    // Create a new bounds object
    const bounds = new window.google.maps.LatLngBounds();
    
    // Extend the bounds to include every marker's coordinates
    markers.forEach(marker => {
      if (marker.lat && marker.lng) {
        bounds.extend({ lat: parseFloat(marker.lat), lng: parseFloat(marker.lng) });
      }
    });

    // Tell the map to fit exactly to these bounds
    map.fitBounds(bounds);
    
    // Optional: Add a little padding so markers aren't right on the edge
    map.panToBounds(bounds, 50); 
  }, [map, markers]);

  return null;
};

export default function MapWidget({ location, locations }) {
  // Normalize the data: if the agent sends 'locations' (array), use it. 
  // If it sends the old 'location' (single object), wrap it in an array.
  const markers = locations || (location ? [location] : []);

  // Default to Pune center if absolutely no data is provided
  const defaultCenter = { lat: 18.5204, lng: 73.8567 };

  return (
    <div style={{ height: '400px', width: '100%', borderRadius: '8px', overflow: 'hidden', marginTop: '1rem' }}>
      <APIProvider apiKey="AIzaSyDS-Uhb30IBHw9YdG_SqK_RvD6X3grBSoQ">
        <Map 
          defaultZoom={12} 
          defaultCenter={defaultCenter} 
          mapId="A2UI_DEMO_MAP" 
          gestureHandling="greedy"
          disableDefaultUI={true}
        >
          {/* Loop through the array and render an AdvancedMarker for each one */}
          {markers.map((marker, index) => {
            const position = { 
              lat: parseFloat(marker.lat), 
              lng: parseFloat(marker.lng) 
            };

            return (
              <AdvancedMarker key={index} position={position} title={marker.title || "Location"}>
                <Pin background="#4285F4" borderColor="#1e40af" glyphColor="#ffffff" />
              </AdvancedMarker>
            );
          })}

          {/* Mount our AutoBounds helper to adjust the camera */}
          <AutoBounds markers={markers} />
        </Map>
      </APIProvider>
    </div>
  );
}