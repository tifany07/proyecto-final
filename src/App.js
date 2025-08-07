import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Peliculas from './components/Peliculas';

const App = () => {
  const [currentView, setCurrentView] = useState('login');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificar si hay un usuario logueado al cargar la aplicación
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setCurrentView('peliculas');
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setCurrentView('peliculas');
  };

  const handleRegister = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setCurrentView('peliculas');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('login');
    localStorage.removeItem('user');
  };

  const switchToRegister = () => {
    setCurrentView('register');
  };

  const switchToLogin = () => {
    setCurrentView('login');
  };

  // Mostrar loading inicial
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #4c1d95 0%, #1e3a8a 50%, #000000 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid rgba(147, 51, 234, 0.3)',
            borderLeftColor: '#9333ea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p>Cargando TIFA...</p>
        </div>
      </div>
    );
  }

  // Renderizar componente según el estado actual
  switch (currentView) {
    case 'register':
      return (
        <Register 
          onRegister={handleRegister}
          onSwitchToLogin={switchToLogin}
        />
      );
    case 'peliculas':
      return user ? (
        <Peliculas 
          user={user}
          onLogout={handleLogout}
        />
      ) : (
        <Login 
          onLogin={handleLogin}
          onSwitchToRegister={switchToRegister}
        />
      );
    default:
      return (
        <Login 
          onLogin={handleLogin}
          onSwitchToRegister={switchToRegister}
        />
      );
  }
};

export default App;