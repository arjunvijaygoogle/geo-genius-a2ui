import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Sparkles, Send, Loader2, Plus, Compass, Globe2 } from 'lucide-react';
import MapWidget from './MapWidget';
import './App.css'; // Make sure App.css is imported

// ==========================================
// 1. Premium A2UI Component Registry
// ==========================================

const CardWidget = ({ children }) => (
  <div style={{ 
    background: 'white', 
    padding: '24px', 
    borderRadius: '16px', 
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    border: '1px solid #e5e7eb',
    marginBottom: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    width: '100%'
  }}>
    {children}
  </div>
);

const TextWidget = ({ text }) => (
  <p style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#374151', lineHeight: '1.6' }}>
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
  const [chatHistory, setChatHistory] = useState([]); // Array of { role: 'user' | 'ai', content: string | a2ui_payload }
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when chat updates
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    const userPrompt = query.trim();
    setQuery('');
    
    // Add user message to history
    setChatHistory(prev => [...prev, { role: 'user', content: userPrompt }]);
    setIsLoading(true);
    console.log('URL',import.meta.env.VITE_AGENT_BACKEND_CHAT_API_URL);
    try {
      // NOTE: Replace localhost with your Cloud Run URL if deployed
      const response = await axios.post(import.meta.env.VITE_AGENT_BACKEND_CHAT_API_URL, { prompt: userPrompt });
      
      // Add AI response to history
      setChatHistory(prev => [...prev, { 
        role: 'ai', 
        content: response.data.a2ui 
      }]);
    } catch (err) {
      console.error(err);
      setChatHistory(prev => [...prev, { 
        role: 'ai', 
        error: "Failed to fetch route. Is the Python backend running?" 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const resetChat = () => {
    setChatHistory([]);
    setQuery('');
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <button className="new-chat-btn" onClick={resetChat}>
          <Plus size={20} />
          New exploration
        </button>
        {/* You can map recent explorations here in the future */}
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        
        {/* Top Header */}
        <header className="chat-header">
          <Globe2 size={28} color="#10b981" />
          <span>A2Geo</span>
        </header>

        {/* Chat History Scrollable Area */}
        <div className="chat-container">
          <div className="chat-content">
            
            {chatHistory.length === 0 ? (
              /* Greeting Screen */
              <div className="hello-screen animate-fade-in">
                <h1 className="hello-title">Hello, Explorer</h1>
                <h2 className="hello-subtitle">Where shall we map out today?</h2>
              </div>
            ) : (
              /* Chat Messages */
              chatHistory.map((msg, index) => (
                <div key={index} className={`message-row ${msg.role} animate-fade-in`}>
                  {msg.role === 'user' ? (
                    <div className="user-bubble">
                      {msg.content}
                    </div>
                  ) : (
                    <>
                      <div className="ai-avatar">
                        <Sparkles size={20} />
                      </div>
                      <div className="ai-content">
                        {msg.error ? (
                          <div style={{ color: '#dc2626' }}>{msg.error}</div>
                        ) : (
                          // Render A2UI Components
                          msg.content && msg.content.map((surface, idx) => {
                            if (surface.type === 'surfaceUpdate' && surface.components) {
                              return surface.components.map((node, i) => (
                                <RenderNode key={`${idx}-${i}`} node={node} />
                              ));
                            }
                            return null;
                          })
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
            
            {/* Loading State Indicator */}
            {isLoading && (
               <div className="message-row ai animate-fade-in">
                 <div className="ai-avatar" style={{ animation: 'pulse 2s infinite' }}>
                   <Sparkles size={20} />
                 </div>
                 <div className="ai-content" style={{ paddingTop: '8px' }}>
                   <Loader2 className="spinner" size={24} color="#10b981" />
                 </div>
               </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="input-container">
          <form className="input-box" onSubmit={handleSubmit}>
            <textarea
              className="chat-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter a prompt here (e.g., Show me famous monuments in Paris)"
              rows={1}
              disabled={isLoading}
            />
            <button 
              type="submit" 
              className="send-btn"
              disabled={!query.trim() || isLoading}
            >
              <Send size={20} />
            </button>
          </form>
        </div>

      </main>
    </div>
  );
}
