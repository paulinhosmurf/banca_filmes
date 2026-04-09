// ============================================================================
// FavoriteButton — Toggle favorito com Optimistic UI
// ============================================================================

import { useState, useCallback, useRef } from 'react';
import { api, ApiRequestError } from '../services/api';
import './FavoriteButton.css';

interface FavoriteButtonProps {
  movieId: string;
  initialFavorited: boolean;
}

interface ToggleFavoriteResponse {
  favorited: boolean;
}

export function FavoriteButton({ movieId, initialFavorited }: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasError, setHasError] = useState(false);
  const pendingRef = useRef(false);

  const handleToggle = useCallback(async () => {
    if (pendingRef.current) return;
    pendingRef.current = true;

    const previousState = favorited;

    // Optimistic update
    setFavorited(!favorited);
    setIsAnimating(true);
    setHasError(false);

    setTimeout(() => setIsAnimating(false), 500);

    try {
      const response = await api.toggleFavorite(movieId) as ToggleFavoriteResponse;
      setFavorited(response.favorited);
    } catch (error) {
      // Rollback
      setFavorited(previousState);
      setHasError(true);

      if (error instanceof ApiRequestError) {
        console.error(error.message);
      }

      setTimeout(() => setHasError(false), 2000);
    } finally {
      pendingRef.current = false;
    }
  }, [favorited, movieId]);

  return (
    <button
      className={[
        'favorite-button',
        favorited ? 'favorite-button--active' : '',
        isAnimating ? 'favorite-button--animating' : '',
        hasError ? 'favorite-button--error animate-shake' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={handleToggle}
      aria-label={favorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      aria-pressed={favorited}
    >
      <svg
        className="favorite-button__icon"
        viewBox="0 0 24 24"
        width="22"
        height="22"
        fill={favorited ? 'var(--color-accent)' : 'none'}
        stroke={favorited ? 'var(--color-accent)' : 'var(--color-text-secondary)'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
      <span className="favorite-button__label">
        {favorited ? 'Salvo' : 'Salvar'}
      </span>
    </button>
  );
}
