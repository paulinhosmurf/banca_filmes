// ============================================================================
// MovieList — Grid com stagger animation via JS
// ============================================================================
// As animações são 100% controladas por JavaScript:
// 1. IntersectionObserver detecta quando cada card entra na viewport
// 2. setTimeout cria o efeito cascata (stagger)
// 3. CSS transitions executam a animação de forma fluida via GPU
//
// Isso evita janky animations e mantém 60fps.
// ============================================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MovieCard } from './MovieCard';
import { api } from '../services/api';
import './MovieList.css';

interface Movie {
  id: string;
  title: string;
  posterUrl: string;
  genre: string[];
  year: number;
  rating: number;
  _count: { likes: number; comments: number };
}

interface MoviesResponse {
  movies: Movie[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export function MovieList() {
  const navigate = useNavigate();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMovies() {
      try {
        setLoading(true);
        const data = await api.getMovies() as MoviesResponse;
        setMovies(data.movies);
      } catch (err) {
        setError('Não foi possível carregar os filmes');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchMovies();
  }, []);

  // ─── Estado de carregamento com skeleton cards ──────────────────────────

  if (loading) {
    return (
      <section className="movie-list">
        <h2 className="movie-list__title animate-fade-in">Catálogo</h2>
        <div className="movie-list__grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="movie-card-skeleton glass-card">
              <div className="skeleton" style={{ aspectRatio: '2/3' }} />
              <div style={{ padding: 'var(--space-md)' }}>
                <div
                  className="skeleton"
                  style={{ height: '1.2rem', width: '70%', marginBottom: '0.5rem' }}
                />
                <div
                  className="skeleton"
                  style={{ height: '0.8rem', width: '40%' }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // ─── Estado de erro ─────────────────────────────────────────────────────

  if (error) {
    return (
      <section className="movie-list">
        <div className="movie-list__error animate-scale-in">
          <span className="movie-list__error-icon">⚠️</span>
          <p>{error}</p>
          <button
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Tentar novamente
          </button>
        </div>
      </section>
    );
  }

  // ─── Lista de filmes com stagger animation ──────────────────────────────

  return (
    <section className="movie-list">
      <h2 className="movie-list__title animate-fade-in-up">
        🎬 Catálogo
        <span className="movie-list__count">{movies.length} filmes</span>
      </h2>

      <div className="movie-list__grid">
        {movies.map((movie, index) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            index={index}
            onClick={(id) => navigate(`/filme/${id}`)}
          />
        ))}
      </div>
    </section>
  );
}
