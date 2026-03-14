import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

export default function MapWidget({ location }) {
  // Fallback to San Francisco if the agent forgets to provide coordinates
  const defaultCenter = { lat: 37.7749, lng: -122.4194 };
  
  // Extract lat/lng from the agent's A2UI props
  const center = location && location.lat && location.lng 
    ? { lat: parseFloat(location.lat), lng: parseFloat(location.lng) }
    : defaultCenter;
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  console.log(apiKey);
  return (
    <div style={{ height: '350px', width: '100%', borderRadius: '8px', overflow: 'hidden', marginTop: '1rem' }}>
      {/* Replace 'YOUR_API_KEY' with a real Google Maps JS API key from Google Cloud Console */}
      <APIProvider apiKey={apiKey}>
        <Map 
          defaultZoom={14} 
          defaultCenter={center} 
          mapId="A2UI_DEMO_MAP" // Required to use AdvancedMarker
          gestureHandling="greedy"
          disableDefaultUI={true}
        >
          <AdvancedMarker position={center}>
            <Pin background="#4285F4" borderColor="#1e40af" glyphColor="#ffffff" />
          </AdvancedMarker>
        </Map>
      </APIProvider>
    </div>
  );
}