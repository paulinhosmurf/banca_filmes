// ============================================================================
// MovieCard — Card com animação de entrada (fade-in-up staggered)
// ============================================================================
// A animação é controlada via JS (IntersectionObserver + delay dinâmico)
// para garantir que os cards apareçam sequencialmente conforme entram
// na viewport — sem consumir recursos fora da tela.
// ============================================================================

import { useRef, useEffect, useState } from 'react';
import './MovieCard.css';

interface Movie {
  id: string;
  title: string;
  posterUrl: string;
  genre: string[];
  year: number;
  rating: number;
  _count: {
    likes: number;
    comments: number;
  };
}

interface MovieCardProps {
  movie: Movie;
  index: number; // Posição na lista (para stagger delay)
  onClick?: (id: string) => void;
}

export function MovieCard({ movie, index, onClick }: MovieCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // ─── IntersectionObserver: anima apenas quando o card entra na viewport ──
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          // Delay crescente para cada card (stagger effect)
          const delay = Math.min(index * 80, 600); // Max 600ms delay
          setTimeout(() => setIsVisible(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [index]);

  return (
    <div
      ref={cardRef}
      className={`movie-card glass-card ${isVisible ? 'movie-card--visible' : ''}`}
      onClick={() => onClick?.(movie.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.(movie.id)}
      aria-label={`Ver detalhes de ${movie.title}`}
    >
      {/* Poster com efeito de parallax no hover */}
      <div className="movie-card__poster-wrapper">
        <img
          src={movie.posterUrl}
          alt={`Poster de ${movie.title}`}
          className="movie-card__poster"
          loading="lazy"
        />
        <div className="movie-card__overlay">
          <span className="movie-card__rating">⭐ {movie.rating.toFixed(1)}</span>
        </div>
      </div>

      {/* Info */}
      <div className="movie-card__info">
        <h3 className="movie-card__title">{movie.title}</h3>
        <div className="movie-card__meta">
          <span className="movie-card__year">{movie.year}</span>
          <span className="movie-card__separator">•</span>
          <span className="movie-card__genre">{movie.genre[0]}</span>
        </div>
        <div className="movie-card__stats">
          <span className="movie-card__stat">❤️ {movie._count.likes}</span>
          <span className="movie-card__stat">💬 {movie._count.comments}</span>
        </div>
      </div>
    </div>
  );
}
