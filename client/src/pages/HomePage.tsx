// ============================================================================
// HomePage — Catálogo principal com hero banner + listagem
// ============================================================================

import { MovieList } from '../components/MovieList';
import './HomePage.css';

export function HomePage() {
  return (
    <main className="home-page">
      {/* Hero Banner */}
      <section className="hero animate-fade-in">
        <div className="hero__content">
          <h1 className="hero__title">
            Descubra filmes
            <span className="hero__title-accent"> incríveis</span>
          </h1>
          <p className="hero__subtitle">
            Explore nosso catálogo curado com os melhores títulos do cinema.
            Curta, comente e salve seus favoritos.
          </p>
          <div className="hero__stats">
            <div className="hero__stat glass-card">
              <span className="hero__stat-value">🎬</span>
              <span className="hero__stat-label">Catálogo Premium</span>
            </div>
            <div className="hero__stat glass-card">
              <span className="hero__stat-value">❤️</span>
              <span className="hero__stat-label">Curta & Comente</span>
            </div>
            <div className="hero__stat glass-card">
              <span className="hero__stat-value">⭐</span>
              <span className="hero__stat-label">Seus Favoritos</span>
            </div>
          </div>
        </div>

        {/* Gradiente decorativo */}
        <div className="hero__glow" aria-hidden="true" />
      </section>

      {/* Catálogo de Filmes */}
      <div className="container">
        <MovieList />
      </div>
    </main>
  );
}
