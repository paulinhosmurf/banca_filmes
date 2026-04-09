// ============================================================================
// MovieDetailPage — Detalhes do filme com interações
// ============================================================================

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { LikeButton } from '../components/LikeButton';
import { FavoriteButton } from '../components/FavoriteButton';
import { CommentSection } from '../components/CommentSection';
import './MovieDetailPage.css';

interface MovieDetail {
  id: string;
  title: string;
  synopsis: string;
  posterUrl: string;
  streamUrl: string;
  trailerUrl: string | null;
  genre: string[];
  year: number;
  rating: number;
  _count: { likes: number; comments: number };
  isLiked: boolean;
  isFavorited: boolean;
}

export function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMovie() {
      if (!id) return;
      try {
        setLoading(true);
        const data = await api.getMovie(id) as { movie: MovieDetail };
        setMovie(data.movie);
      } catch {
        setError('Filme não encontrado');
      } finally {
        setLoading(false);
      }
    }

    fetchMovie();
  }, [id]);

  // ─── Loading ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <main className="movie-detail container">
        <div className="movie-detail__skeleton">
          <div className="skeleton" style={{ aspectRatio: '2/3', maxWidth: '300px' }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="skeleton" style={{ height: '2.5rem', width: '60%' }} />
            <div className="skeleton" style={{ height: '1rem', width: '30%' }} />
            <div className="skeleton" style={{ height: '6rem', width: '100%' }} />
          </div>
        </div>
      </main>
    );
  }

  // ─── Error ───────────────────────────────────────────────────────────
  if (error || !movie) {
    return (
      <main className="movie-detail container">
        <div className="movie-detail__error animate-scale-in">
          <span style={{ fontSize: '3rem' }}>🎬</span>
          <h2>{error || 'Filme não encontrado'}</h2>
          <Link to="/" className="btn btn-primary">
            Voltar ao Catálogo
          </Link>
        </div>
      </main>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────
  return (
    <main className="movie-detail">
      {/* Backdrop gradient */}
      <div
        className="movie-detail__backdrop"
        style={{ backgroundImage: `url(${movie.posterUrl})` }}
        aria-hidden="true"
      />

      <div className="container movie-detail__content animate-fade-in-up">
        {/* Layout principal */}
        <div className="movie-detail__layout">
          {/* Poster */}
          <div className="movie-detail__poster-wrapper">
            <img
              src={movie.posterUrl}
              alt={`Poster de ${movie.title}`}
              className="movie-detail__poster"
            />
          </div>

          {/* Info */}
          <div className="movie-detail__info">
            <Link to="/" className="movie-detail__back">
              ← Voltar
            </Link>

            <h1 className="movie-detail__title">{movie.title}</h1>

            <div className="movie-detail__meta">
              <span className="movie-detail__year">{movie.year}</span>
              <span className="movie-detail__separator">•</span>
              <span className="movie-detail__rating">⭐ {movie.rating.toFixed(1)}</span>
              <span className="movie-detail__separator">•</span>
              {movie.genre.map((g) => (
                <span key={g} className="movie-detail__genre-tag">
                  {g}
                </span>
              ))}
            </div>

            <p className="movie-detail__synopsis">{movie.synopsis}</p>

            {/* Ações */}
            <div className="movie-detail__actions">
              {movie.streamUrl && (
                <a
                  href={movie.streamUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary movie-detail__play"
                >
                  ▶ Assistir
                </a>
              )}

              {movie.trailerUrl && (
                <a
                  href={movie.trailerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost"
                >
                  🎞️ Trailer
                </a>
              )}

              {user && (
                <>
                  <LikeButton
                    movieId={movie.id}
                    initialLiked={movie.isLiked}
                    initialCount={movie._count.likes}
                  />
                  <FavoriteButton
                    movieId={movie.id}
                    initialFavorited={movie.isFavorited}
                  />
                </>
              )}
            </div>

            {/* Stats */}
            <div className="movie-detail__stats">
              <span>❤️ {movie._count.likes} curtidas</span>
              <span>💬 {movie._count.comments} comentários</span>
            </div>
          </div>
        </div>

        {/* Comentários */}
        <CommentSection movieId={movie.id} />
      </div>
    </main>
  );
}
