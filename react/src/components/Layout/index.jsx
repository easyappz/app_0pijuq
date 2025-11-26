import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Layout.css';

const Layout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="layout" data-easytag="id3-src/components/Layout/index.jsx">
      <header className="layout-header">
        <div className="layout-header-container">
          <Link to="/" className="layout-logo">
            <span className="layout-logo-text">Блог</span>
          </Link>

          <button 
            className={`layout-burger ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <nav className={`layout-nav ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
            {isAuthenticated ? (
              <>
                <Link to="/" className="layout-nav-link" onClick={closeMobileMenu}>
                  Лента
                </Link>
                <Link to="/profile" className="layout-nav-link" onClick={closeMobileMenu}>
                  Профиль
                </Link>
                <button className="layout-logout-btn" onClick={() => { handleLogout(); closeMobileMenu(); }}>
                  Выйти
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="layout-nav-link" onClick={closeMobileMenu}>
                  Войти
                </Link>
                <Link to="/register" className="layout-nav-link" onClick={closeMobileMenu}>
                  Регистрация
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="layout-main">
        <div className="layout-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
