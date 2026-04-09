// ============================================================================
// Navbar — Barra de navegação com glassmorphism e animações
// ============================================================================

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

export function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <header className="navbar glass-card">
      <div className="container navbar__inner">
        {/* Logo */}
        <Link to="/" className="navbar__logo" aria-label="Página inicial">
          <span className="navbar__logo-icon">🎬</span>
          <span className="navbar__logo-text">
            Banca<span className="navbar__logo-accent"> dos Filmes</span>
          </span>
        </Link>

        {/* Nav Desktop */}
        <nav className="navbar__nav" aria-label="Navegação principal">
          <Link to="/" className="navbar__link">Catálogo</Link>
          {user && (
            <Link to="/favoritos" className="navbar__link">
              ⭐ Favoritos
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin" className="navbar__link navbar__link--admin">
              ⚙️ Admin
            </Link>
          )}
        </nav>

        {/* Auth Actions */}
        <div className="navbar__actions">
          {user ? (
            <div className="navbar__user">
              <button
                className="navbar__avatar"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-expanded={menuOpen}
                aria-label="Menu do usuário"
              >
                {user.name.charAt(0).toUpperCase()}
              </button>

              {/* Dropdown */}
              {menuOpen && (
                <div className="navbar__dropdown glass-card animate-scale-in">
                  <div className="navbar__dropdown-header">
                    <span className="navbar__dropdown-name">{user.name}</span>
                    <span className="navbar__dropdown-email">{user.email}</span>
                  </div>
                  <div className="navbar__dropdown-divider" />
                  <button
                    className="navbar__dropdown-item"
                    onClick={handleLogout}
                  >
                    🚪 Sair
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="navbar__auth-buttons">
              <Link to="/login" className="btn btn-ghost">
                Entrar
              </Link>
              <Link to="/registro" className="btn btn-primary">
                Criar Conta
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className={`navbar__hamburger ${menuOpen ? 'navbar__hamburger--active' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
