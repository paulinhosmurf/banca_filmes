// ============================================================================
// LikeButton — Optimistic UI com Rollback em caso de erro
// ============================================================================
// PADRÃO OPTIMISTIC UI:
//
// 1. Usuário clica → UI atualiza IMEDIATAMENTE (sem esperar o backend)
// 2. Em paralelo, request é enviado ao backend
// 3. Se o backend FALHA:
//    a. UI faz ROLLBACK para o estado anterior
//    b. Botão treme (shake animation) para feedback visual
//    c. Toast de erro aparece
//
// Isso cria a percepção de que o app é instantâneo, mesmo com latência.
// Se a API falhar, o usuário vê o estado correto após o rollback.
// ============================================================================

import { useState, useCallback, useRef } from 'react';
import { api, ApiRequestError } from '../services/api';
import './LikeButton.css';

interface LikeButtonProps {
  movieId: string;
  initialLiked: boolean;
  initialCount: number;
}

interface ToggleLikeResponse {
  liked: boolean;
  likesCount: number;
}

export function LikeButton({
  movieId,
  initialLiked,
  initialCount,
}: LikeButtonProps) {
  // ─── Estado ──────────────────────────────────────────────────────────────
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Ref para evitar múltiplos cliques simultâneos (debounce)
  const pendingRef = useRef(false);

  // ─── Handler Optimistic ──────────────────────────────────────────────────
  const handleToggle = useCallback(async () => {
    // Bloqueia se já tem um request pendente
    if (pendingRef.current) return;
    pendingRef.current = true;

    // 1. Salva estado anterior (para rollback)
    const previousLiked = liked;
    const previousCount = count;

    // 2. Atualiza UI IMEDIATAMENTE (Optimistic)
    setLiked(!liked);
    setCount(liked ? count - 1 : count + 1);
    setIsAnimating(true);
    setHasError(false);

    // Reset da animação após completar
    setTimeout(() => setIsAnimating(false), 600);

    try {
      // 3. Envia request ao backend
      const response = await api.toggleLike(movieId) as ToggleLikeResponse;

      // 4. Sincroniza com o estado real do backend
      // (pode divergir se houve race condition)
      setLiked(response.liked);
      setCount(response.likesCount);
    } catch (error) {
      // 5. ROLLBACK — restaura o estado anterior
      setLiked(previousLiked);
      setCount(previousCount);

      // 6. Feedback visual de erro
      setHasError(true);

      if (error instanceof ApiRequestError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Erro de conexão');
      }

      // Limpa erro após 3 segundos
      setTimeout(() => {
        setHasError(false);
        setErrorMessage('');
      }, 3000);
    } finally {
      pendingRef.current = false;
    }
  }, [liked, count, movieId]);

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="like-button-wrapper">
      <button
        className={[
          'like-button',
          liked ? 'like-button--active' : '',
          isAnimating ? 'like-button--animating' : '',
          hasError ? 'like-button--error animate-shake' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={handleToggle}
        aria-label={liked ? 'Descurtir' : 'Curtir'}
        aria-pressed={liked}
      >
        {/* Coração SVG com animação */}
        <svg
          className="like-button__icon"
          viewBox="0 0 24 24"
          width="24"
          height="24"
          fill={liked ? 'var(--color-like-active)' : 'none'}
          stroke={liked ? 'var(--color-like-active)' : 'var(--color-text-secondary)'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>

        {/* Partículas na animação do like */}
        {isAnimating && liked && (
          <div className="like-button__particles">
            {Array.from({ length: 6 }).map((_, i) => (
              <span
                key={i}
                className="like-button__particle"
                style={{
                  '--angle': `${i * 60}deg`,
                  '--delay': `${i * 30}ms`,
                } as React.CSSProperties}
              />
            ))}
          </div>
        )}
      </button>

      {/* Contador */}
      <span
        className={`like-button__count ${
          isAnimating ? 'like-button__count--bump' : ''
        }`}
      >
        {count}
      </span>

      {/* Toast de erro (aparece no rollback) */}
      {hasError && (
        <div className="like-button__error-toast animate-scale-in">
          {errorMessage}
        </div>
      )}
    </div>
  );
}
