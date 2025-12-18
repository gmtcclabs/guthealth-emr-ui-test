import React from 'react';
import ReactDOM from 'react-dom/client';

// Import components with error handling
let App;
try {
  App = require('../App').default;
} catch (error) {
  console.error('Failed to load App component:', error);
  App = () => (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>App Loading Error</h1>
      <p>Error: {error.message}</p>
    </div>
  );
}

const root = document.getElementById('root');
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error('Root element not found');
}
