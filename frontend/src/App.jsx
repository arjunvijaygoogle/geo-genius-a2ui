import React, { useState } from 'react';
import axios from 'axios';
import { MapPin, Navigation, Loader2 } from 'lucide-react';
import MapWidget from './MapWidget';

// ==========================================
// 1. A2UI Component Registry
// Map the agent's JSON strings to your React UI
// ==========================================

const CardWidget = ({ children }) => (
  <div style={{ 
    background: 'white', 
    padding: '24px', 
    borderRadius: '12px', 
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    marginBottom: '1rem',
    border: '1px solid #e5e7eb'
  }}>
    {children}
  </div>
);

const TextWidget = ({ text }) => (
  <p style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#374151', lineHeight: '1.5' }}>
    {text}
  </p>
);

const componentRegistry = {
  Card: CardWidget,
  Text: TextWidget,
  Map: MapWidget
};

// Recursive function to parse the A2UI JSON tree
const RenderNode = ({ node }) => {
  if (!node || !node.component) return null;
  
  const Component = componentRegistry[node.component];
  if (!Component) {
    return <div style={{ color: 'red' }}>Unsupported component: {node.component}</div>;
  }

  return (
    <Component {...node}>
      {node.children && node.children.map((child, index) => (
        <RenderNode key={child.id || index} node={child} />
      ))}
    </Component>
  );
};

// ==========================================
// 2. Main Application
// ==========================================

export default function App() {
  const [query, setQuery] = useState('');
  const [a2uiMessages, setA2uiMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setA2uiMessages([]);

    try {
      const response = await axios.post('https://a2ui-backend-455538062800.us-central1.run.app/chat', {
        prompt: query
      });
      
      // The backend returns the A2UI array
      setA2uiMessages(response.data.a2ui);
    } catch (err) {
      setError("Failed to fetch route. Is the Python backend running?");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
        <MapPin size={32} color="#4285F4" />
        <h1 style={{ margin: 0, color: '#111827' }}>A2UI Travel Agent</h1>
      </header>

      {/* Input Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '2rem' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g., Show me the Eiffel Tower on a map"
          style={{ flex: 1, padding: '14px', fontSize: '16px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }}
        />
        <button 
          type="submit" 
          disabled={isLoading}
          style={{ 
            padding: '12px 24px', 
            backgroundColor: '#4285F4', 
            color: 'white', 
            borderRadius: '8px', 
            border: 'none', 
            cursor: isLoading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {isLoading ? <Loader2 className="spinner" size={24} style={{ animation: 'spin 1s linear infinite' }} /> : <Navigation size={24} />}
        </button>
      </form>

      {error && <div style={{ color: '#dc2626', marginBottom: '1rem', fontWeight: '500' }}>{error}</div>}

      {/* A2UI Render Surface */}
      <div style={{ background: '#f9fafb', borderRadius: '12px', minHeight: '400px', padding: '1.5rem', border: '1px solid #e5e7eb' }}>
        {a2uiMessages.length > 0 ? (
          <div>
            {a2uiMessages.map((msg, idx) => {
              // Only process "surfaceUpdate" messages from the agent
              if (msg.type === 'surfaceUpdate' && msg.components) {
                return msg.components.map((node, i) => (
                  <RenderNode key={`${idx}-${i}`} node={node} />
                ));
              }
              return null;
            })}
          </div>
        ) : (
          <div style={{ color: '#6b7280', textAlign: 'center', marginTop: '150px', fontSize: '1.1rem' }}>
            {isLoading ? "Consulting Google Maps and generating UI..." : "Ask a location question to see the A2UI response."}
          </div>
        )}
      </div>
      
      {/* Basic CSS for the spinner */}
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}