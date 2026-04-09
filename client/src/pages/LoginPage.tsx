// ============================================================================
// LoginPage — Formulário de login com validação client-side
// ============================================================================

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ApiRequestError } from '../services/api';
import './AuthPage.css';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
      } else {
        setError('Erro ao tentar entrar. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-card glass-card animate-scale-in">
        <div className="auth-card__header">
          <span className="auth-card__icon">🎬</span>
          <h1 className="auth-card__title">Bem-vindo de volta</h1>
          <p className="auth-card__subtitle">
            Entre na sua conta para continuar
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && (
            <div className="auth-form__error animate-shake">
              ⚠️ {error}
            </div>
          )}

          <div className="auth-form__field">
            <label htmlFor="login-email" className="auth-form__label">
              E-mail
            </label>
            <input
              id="login-email"
              type="email"
              className="auth-form__input"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div className="auth-form__field">
            <label htmlFor="login-password" className="auth-form__label">
              Senha
            </label>
            <input
              id="login-password"
              type="password"
              className="auth-form__input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-form__submit"
            disabled={loading}
          >
            {loading ? (
              <span className="auth-form__spinner" />
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        <p className="auth-card__footer">
          Não tem conta?{' '}
          <Link to="/registro" className="auth-card__link">
            Criar conta
          </Link>
        </p>
      </div>
    </main>
  );
}
