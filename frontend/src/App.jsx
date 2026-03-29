import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Sparkles, Send, Loader2, Plus, Globe2 } from 'lucide-react';
import { Surface, useA2uiProcessor } from '@a2ui-bridge/react';
import { APIProvider } from '@vis.gl/react-google-maps';
import { MantineProvider } from '@mantine/core';
import { componentRegistry } from './components/components';

import './App.css'; 
import '@mantine/core/styles.css';

export default function App() {
  const [query, setQuery] = useState('');
  const [chatHistory, setChatHistory] = useState([]); 
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const processor = useA2uiProcessor();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isLoading]);

  const handleAction = (action) => {
    console.log('Action performed:', action.actionName, action.context);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    const userPrompt = query.trim();
    setQuery('');
    
    // 1. Setup metadata for history
    const uniqueSurfaceId = `surface-${Date.now()}`;
    setChatHistory(prev => [...prev, { role: 'user', content: userPrompt }]);
    setIsLoading(true);

    try {
      // 2. Call your local backend
      const response = await axios.post('http://localhost:8000/chat', { 
        prompt: userPrompt 
      });

      // 3. Extract the a2ui array from response
      const rawA2uiData = response.data.a2ui;

      // 4. PERSISTENCE TRICK:
      // Your backend returns "@default". To prevent overwriting old messages,
      // we map over the response and replace "@default" with our uniqueSurfaceId.
      const sanitizedData = rawA2uiData.map(msg => {
        // Rewrite surfaceId for persistence
        if (msg.beginRendering) {
          msg.beginRendering.surfaceId = uniqueSurfaceId;
        }
        
        if (msg.surfaceUpdate) {
          msg.surfaceUpdate.surfaceId = uniqueSurfaceId;
          
          // Strictly enforce protocol for Text components
          msg.surfaceUpdate.components = msg.surfaceUpdate.components.map(comp => {
            if (comp.component && comp.component.Text) {
              const currentText = comp.component.Text.text;
              
              // Force string into {"literalString": "..."} object
              if (typeof currentText === 'string') {
                comp.component.Text.text = { literalString: currentText };
              } 
              else if (!currentText) {
                comp.component.Text.text = { literalString: "" };
              }
            }
            return comp;
          });
        }
        return msg;
      });

      console.log(sanitizedData)

      // 5. Add to chat history and process
      setChatHistory(prev => [...prev, { role: 'ai', surfaceId: uniqueSurfaceId }]);
      processor.processMessages(sanitizedData);

    } catch (err) {
      console.error("Backend Error:", err);
      setChatHistory(prev => [...prev, { role: 'ai', error: "Failed to connect to backend." }]);
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
    <MantineProvider>
      <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
        <div className="app-layout">
          <aside className="sidebar">
            <button className="new-chat-btn" onClick={resetChat}>
              <Plus size={20} />
              New exploration
            </button>
          </aside>

          <main className="main-content">
            <header className="chat-header">
              <Globe2 size={28} color="#10b981" />
              <span>A2Geo</span>
            </header>

            <div className="chat-container">
              <div className="chat-content">
                {chatHistory.length === 0 ? (
                  <div className="hello-screen animate-fade-in">
                    <h1 className="hello-title">Hello, Explorer</h1>
                    <h2 className="hello-subtitle">Where shall we map out today?</h2>
                  </div>
                ) : (
                  chatHistory.map((msg, index) => (
                    <div key={index} className={`message-row ${msg.role} animate-fade-in`}>
                      {msg.role === 'user' ? (
                        <div className="user-bubble">{msg.content}</div>
                      ) : msg.error ? (
                        <div className="user-bubble error">{msg.error}</div>
                      ) : (
                        <>
                          <div className="ai-avatar">
                            <Sparkles size={20} />
                          </div>
                          <div className="ai-content">
                            <Surface
                                processor={processor}
                                surfaceId={msg.surfaceId}
                                components={componentRegistry}
                                onAction={handleAction}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
                
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

            <div className="input-container">
              <form className="input-box" onSubmit={handleSubmit}>
                <textarea
                  className="chat-input"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter a prompt here..."
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
      </APIProvider>
    </MantineProvider>
  );
}