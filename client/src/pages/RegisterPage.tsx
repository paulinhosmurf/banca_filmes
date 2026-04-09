// ============================================================================
// RegisterPage — Formulário de registro com validação
// ============================================================================

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ApiRequestError } from '../services/api';
import './AuthPage.css';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validação client-side (a validação real é no backend com Zod)
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (password.length < 8) {
      setError('A senha deve ter no mínimo 8 caracteres.');
      return;
    }

    setLoading(true);

    try {
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
      } else {
        setError('Erro ao criar conta. Tente novamente.');
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
          <h1 className="auth-card__title">Criar sua conta</h1>
          <p className="auth-card__subtitle">
            Junte-se à Banca dos Filmes
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && (
            <div className="auth-form__error animate-shake">
              ⚠️ {error}
            </div>
          )}

          <div className="auth-form__field">
            <label htmlFor="register-name" className="auth-form__label">
              Nome
            </label>
            <input
              id="register-name"
              type="text"
              className="auth-form__input"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              disabled={loading}
            />
          </div>

          <div className="auth-form__field">
            <label htmlFor="register-email" className="auth-form__label">
              E-mail
            </label>
            <input
              id="register-email"
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
            <label htmlFor="register-password" className="auth-form__label">
              Senha
            </label>
            <input
              id="register-password"
              type="password"
              className="auth-form__input"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              disabled={loading}
            />
          </div>

          <div className="auth-form__field">
            <label htmlFor="register-confirm" className="auth-form__label">
              Confirmar Senha
            </label>
            <input
              id="register-confirm"
              type="password"
              className="auth-form__input"
              placeholder="Repita a senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
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
              'Criar Conta'
            )}
          </button>
        </form>

        <p className="auth-card__footer">
          Já tem conta?{' '}
          <Link to="/login" className="auth-card__link">
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
