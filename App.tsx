import React, { useState } from 'react';
import { StoreProvider } from './storeContext';
import Navbar from './components/Navbar';
import StorePage from './components/StorePage';
import EmrDashboard from './components/EmrDashboard';
import ChatWidget from './components/ChatWidget';

const AppContent: React.FC = () => {
  const [view, setView] = useState<'store' | 'emr'>('store');

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar currentView={view} setView={setView} />
      
      <main>
        {view === 'store' ? (
          <StorePage onNavigateToEmr={() => setView('emr')} />
        ) : (
          <EmrDashboard />
        )}
      </main>

      <ChatWidget />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
};

export default App;
