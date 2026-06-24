import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Policies from './pages/Policies';
import TrustCenter from './pages/TrustCenter';
import Login from './pages/Login';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <Router>
        <Routes>
          <Route path="*" element={<Login onLogin={handleLogin} />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar onLogout={handleLogout} />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/policies" element={<Policies />} />
            <Route path="/trust" element={<TrustCenter />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        
        {/* Global Privacy Footer */}
        <footer style={{ 
          textAlign: 'center', 
          padding: '1.5rem', 
          marginTop: 'auto',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          color: 'var(--text-secondary)',
          fontSize: '0.9rem'
        }}>
          Privacy Policy: IT IS NOT A REAL PRODUCT IT IS A CAPSTONE PROJECT
        </footer>
      </div>
    </Router>
  );
};

export default App;
