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
    
    const uniqueSurfaceId = `surface-${Date.now()}`;
    setChatHistory(prev => [...prev, { role: 'user', content: userPrompt }]);
    setIsLoading(true);

    try {
      const response = await axios.post(import.meta.env.VITE_AGENT_BACKEND_CHAT_API_URL, { 
        prompt: userPrompt 
      });

      const rawA2uiData = response.data.a2ui;

      const sanitizedData = rawA2uiData.map(msg => {
        if (msg.beginRendering) {
          return { ...msg, beginRendering: { ...msg.beginRendering, surfaceId: uniqueSurfaceId } };
        }
        
        if (msg.surfaceUpdate) {
          const updatedComponents = msg.surfaceUpdate.components.map(comp => {
            if (comp.component && comp.component.Text) {
              const currentText = comp.component.Text.text;
              if (typeof currentText === 'string') {
                return {
                  ...comp,
                  component: {
                    ...comp.component,
                    Text: { ...comp.component.Text, text: { literalString: currentText } }
                  }
                };
              }
            }
            return comp;
          });
          return { ...msg, surfaceUpdate: { ...msg.surfaceUpdate, surfaceId: uniqueSurfaceId, components: updatedComponents } };
        }
        return msg;
      });

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

            {/* --- Input Area --- */}
            <div className="input-container" style={{
              display: 'flex',
              flexDirection: 'column', // This forces items to stack vertically
              alignItems: 'center',    // Centers the disclaimer horizontally
              width: '100%',
              padding: '10px 0 20px 0'
            }}>
              
              {/* The Prompt Bar (Form) */}
              <form className="input-box" onSubmit={handleSubmit} style={{ width: '100%' }}>
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
              
              {/* --- Gemini-like Disclaimer Below the Prompt Bar --- */}
              <div className="disclaimer-text" style={{ 
                fontSize: '12px', 
                color: '#707070', 
                textAlign: 'center', 
                marginTop: '10px',  // Spacing between bar and text
                width: '100%',
                maxWidth: '560px',  // Match the width of your input box
                lineHeight: '1.4'
              }}>
                Your Google chats aren't used to improve our models. Gemini is AI and can make mistakes. 
                <span style={{ 
                  textDecoration: 'underline', 
                  cursor: 'pointer', 
                  marginLeft: '4px',
                  color: '#555' 
                }}>
                  Your privacy and Gemini
                </span>
              </div>
            </div>
          </main>
        </div>
      </APIProvider>
    </MantineProvider>
  );
}