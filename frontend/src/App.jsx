import React, { useState } from 'react';
import axios from 'axios';
import { MapPin, Search, Loader2, Sparkles, Bot, Compass } from 'lucide-react';
import MapWidget from './MapWidget';

// ==========================================
// 1. Premium A2UI Component Registry
// ==========================================

const CardWidget = ({ children }) => (
  <div className="animate-slide-up" style={{ 
    background: 'white', 
    padding: '32px', 
    borderRadius: '24px', 
    boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.02)',
    marginBottom: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
      <div style={{ background: '#EEF2FF', padding: '10px', borderRadius: '14px', color: '#4F46E5' }}>
        <Bot size={24} />
      </div>
      <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#111827' }}>Agent Response</h3>
    </div>
    <div style={{ paddingLeft: '8px' }}>
      {children}
    </div>
  </div>
);

const TextWidget = ({ text }) => (
  <p style={{ margin: '0 0 12px 0', fontSize: '17px', color: '#4B5563', lineHeight: '1.6' }}>
    {text}
  </p>
);

const componentRegistry = {
  Card: CardWidget,
  Text: TextWidget,
  Map: MapWidget
};

const RenderNode = ({ node }) => {
  if (!node || !node.component) return null;
  
  const Component = componentRegistry[node.component];
  if (!Component) {
    return <div style={{ color: '#EF4444', padding: '10px', background: '#FEE2E2', borderRadius: '8px' }}>Unsupported: {node.component}</div>;
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
      // NOTE: Replace localhost with your Cloud Run URL if deployed
      const response = await axios.post('http://localhost:8000/chat', { prompt: query });
      setA2uiMessages(response.data.a2ui);
    } catch (err) {
      setError("Failed to fetch route. Is the Python backend running?");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-wrapper">
      <div className="main-container">
        
        {/* Header */}
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '3rem', paddingTop: '2rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #3B82F6 100%)', padding: '12px', borderRadius: '16px', color: 'white', boxShadow: '0 8px 16px rgba(59, 130, 246, 0.3)' }}>
            <Compass size={32} />
          </div>
            <h1 style={{ 
    margin: 0, 
    fontSize: '2.5rem', 
    fontWeight: '800', 
    background: 'linear-gradient(to right, #111827, #4B5563)', 
    WebkitBackgroundClip: 'text', 
    WebkitTextFillColor: 'transparent',
    lineHeight: '1.3',          /* Gives vertical breathing room */
    padding: '0 5px 5px 0'      /* Prevents clipping on the right and bottom edges */
  }}>
    Geo Genius
  </h1>
        </header>

        {/* Floating Search Bar */}
        <form onSubmit={handleSubmit} className="search-form">
          <div className="input-wrapper">
            <Search size={22} color="#9CA3AF" style={{ marginLeft: '16px' }} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Where would you like to explore today? (e.g., Coffee shops in Pune)"
              className="main-input"
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading || !query.trim()} className="submit-btn">
              {isLoading ? <Loader2 className="spinner" size={22} /> : <Sparkles size={22} />}
            </button>
          </div>
        </form>

        {error && <div className="error-banner animate-slide-up">{error}</div>}

        {/* Dynamic A2UI Surface */}
        <div style={{ marginTop: '3rem' }}>
          {a2uiMessages.length > 0 ? (
            <div className="results-container">
              {a2uiMessages.map((msg, idx) => {
                if (msg.type === 'surfaceUpdate' && msg.components) {
                  return msg.components.map((node, i) => (
                    <RenderNode key={`${idx}-${i}`} node={node} />
                  ));
                }
                return null;
              })}
            </div>
          ) : (
            /* Awesome Empty State */
            <div className="empty-state animate-fade-in">
              <MapPin size={48} color="#D1D5DB" style={{ marginBottom: '1rem' }} />
              <h2 style={{ margin: '0 0 8px 0', color: '#374151', fontSize: '1.25rem' }}>Waiting for your next adventure</h2>
              <p style={{ margin: 0, color: '#6B7280' }}>
                {isLoading ? "Consulting global coordinates..." : "Type a destination above to see the AI dynamically render the map."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Global Advanced CSS injected here */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&display=swap');

        :root {
          font-family: 'Inter', system-ui, sans-serif;
        }

        body {
          margin: 0;
          background-color: #F3F4F6;
        }

        .app-wrapper {
          min-height: 100vh;
          background: radial-gradient(circle at top, #EEF2FF 0%, #F3F4F6 100%);
          padding: 2rem;
        }

        .main-container {
          max-width: 900px;
          margin: 0 auto;
        }

        /* Form & Input Styling */
        .search-form {
          position: sticky;
          top: 2rem;
          z-index: 10;
        }

        .input-wrapper {
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(12px);
          border-radius: 9999px;
          padding: 8px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01), 0 0 0 1px rgba(0,0,0,0.05);
          transition: all 0.3s ease;
        }

        .input-wrapper:focus-within {
          box-shadow: 0 20px 25px -5px rgba(79, 70, 229, 0.1), 0 0 0 3px rgba(79, 70, 229, 0.2);
          background: white;
        }

        .main-input {
          flex: 1;
          padding: 16px 16px;
          font-size: 1.1rem;
          border: none;
          background: transparent;
          outline: none;
          color: #1F2937;
        }
        
        .main-input::placeholder {
          color: #9CA3AF;
        }

        .submit-btn {
          background: linear-gradient(135deg, #4F46E5 0%, #3B82F6 100%);
          color: white;
          border: none;
          border-radius: 9999px;
          padding: 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .submit-btn:not(:disabled):hover {
          transform: scale(1.05);
          box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3);
        }

        .submit-btn:disabled {
          background: #D1D5DB;
          cursor: not-allowed;
        }

        /* Empty State */
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 300px;
          background: rgba(255, 255, 255, 0.5);
          border: 2px dashed #D1D5DB;
          border-radius: 24px;
          text-align: center;
        }

        /* Error Banner */
        .error-banner {
          background: #FEF2F2;
          color: #DC2626;
          padding: 1rem;
          border-radius: 12px;
          margin-top: 1rem;
          text-align: center;
          border: 1px solid #FCA5A5;
        }

        /* Animations */
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .spinner { animation: spin 1s linear infinite; }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in { animation: fadeIn 0.8s ease-out forwards; }
      `}</style>
    </div>
  );
}