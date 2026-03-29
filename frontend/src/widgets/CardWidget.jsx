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

export default CardWidget;