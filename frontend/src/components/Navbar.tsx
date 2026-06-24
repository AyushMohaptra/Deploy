import React from 'react';
import { NavLink } from 'react-router-dom';
import { ShieldCheck, LogOut } from 'lucide-react';

const Navbar: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <div className="navbar-brand">
          <ShieldCheck size={28} color="var(--accent-primary)" />
          DeployGuard
        </div>
        <div className="navbar-nav">
          <NavLink to="/" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Dashboard
          </NavLink>
          <NavLink to="/policies" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Policies
          </NavLink>
          <NavLink to="/trust" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Trust Center
          </NavLink>
          <button className="btn btn-secondary" onClick={onLogout} style={{ padding: '0.5rem 1rem' }}>
            <LogOut size={16} style={{ marginRight: '0.5rem' }} /> Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
