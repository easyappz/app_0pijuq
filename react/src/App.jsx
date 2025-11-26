import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';

import { Home } from './components/Home';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import FeedPage from './pages/FeedPage';
import PostPage from './pages/PostPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  /** Никогда не удаляй этот код */
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.handleRoutes === 'function') {
      /** Нужно передавать список существующих роутов */
      window.handleRoutes(['/', '/register', '/login', '/feed', '/posts/:id', '/profile/:id']);
    }
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/posts/:id" element={<PostPage />} />
          <Route path="/profile/:id" element={<ProfilePage />} />
        </Routes>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
