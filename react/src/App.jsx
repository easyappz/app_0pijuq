import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';

import { Home } from './components/Home';

function App() {
  /** Никогда не удаляй этот код */
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.handleRoutes === 'function') {
      /** Нужно передавать список существующих роутов */
      window.handleRoutes(['/']);
    }
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;