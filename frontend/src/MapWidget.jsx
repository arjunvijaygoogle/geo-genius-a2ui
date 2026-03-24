import { useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps';

const AutoBounds = ({ markers }) => {
  const map = useMap();
  useEffect(() => {
    if (!map || !markers || markers.length === 0) return;
    const bounds = new window.google.maps.LatLngBounds();
    markers.forEach(m => {
      if (m.lat && m.lng) bounds.extend({ lat: parseFloat(m.lat), lng: parseFloat(m.lng) });
    });
    map.fitBounds(bounds);
    map.panToBounds(bounds, 80); 
  }, [map, markers]);
  return null;
};

export default function MapWidget({ location, locations }) {
  const markers = locations || (location ? [location] : []);
  const defaultCenter = { lat: 19.0760, lng: 72.8777 }; // Mumbai default

  return (
    <div className="map-view" style={{ 
      height: '500px', 
      width: '100%', 
      background: '#f1f5f9'
    }}>
      <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
        <Map 
          defaultZoom={11} 
          defaultCenter={defaultCenter} 
          mapId="DASHBOARD_MAP" 
          gestureHandling="greedy"
          disableDefaultUI={true}
          styles={mapCustomStyles}
        >
          {markers.map((marker, index) => (
            <AdvancedMarker 
              key={index} 
              position={{ lat: parseFloat(marker.lat), lng: parseFloat(marker.lng) }}
            >
              <Pin 
                background={index === 0 ? "#F97316" : "#4F46E5"} 
                borderColor="#ffffff" 
                glyphColor="#ffffff" 
                scale={1.1}
              />
            </AdvancedMarker>
          ))}
          <AutoBounds markers={markers} />
        </Map>
      </APIProvider>
    </div>
  );
}

const mapCustomStyles = [
  { "featureType": "poi", "elementType": "labels", "stylers": [{ "visibility": "off" }] },
  { "featureType": "transit", "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] }
];