import React from 'react';
import ReactDOM from 'react-dom/client';

// Simple debug component
const DebugApp = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Debug App - React is Working!</h1>
      <p>If you see this, React is loading correctly.</p>
      <button onClick={() => alert('Button works!')}>Test Button</button>
    </div>
  );
};

const root = document.getElementById('root');
if (root) {
  ReactDOM.createRoot(root).render(<DebugApp />);
} else {
  console.error('Root element not found');
}
