// ============================================================================
// 🎬 Banca dos Filmes — Server Entry Point
// ============================================================================
// Ordem dos middlewares é CRÍTICA para segurança:
//
// 1. Helmet      → Headers de segurança HTTP
// 2. CORS        → Restringe origens permitidas
// 3. Rate Limit  → Bloqueia abuso antes de qualquer processamento
// 4. Body Parser → Parseia JSON com limite de tamanho
// 5. Cookie      → Parseia cookies (para JWT e CSRF)
// 6. CSRF        → Valida token CSRF em mutations
// 7. Routes      → Rotas da aplicação (com Zod + Auth internos)
//
// Cada camada é uma barreira. Um atacante precisa passar por TODAS.
// ============================================================================

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { globalLimiter } from './middlewares/rateLimiter';
import { csrfProtection } from './middlewares/csrf';

// Routes
import authRoutes from './routes/auth.routes';
import movieRoutes from './routes/movie.routes';
import commentRoutes from './routes/comment.routes';
import likeRoutes from './routes/like.routes';
import favoriteRoutes from './routes/favorite.routes';

const app = express();

// ─── 1. Headers de Segurança HTTP ───────────────────────────────────────────
// Helmet configura automaticamente:
// - Content-Security-Policy → previne execução de scripts inline
// - X-Content-Type-Options: nosniff → previne MIME sniffing
// - X-Frame-Options: DENY → previne clickjacking
// - Strict-Transport-Security → força HTTPS
// - X-XSS-Protection → proteção extra do browser

app.use(helmet());

// ─── 2. CORS — Apenas o frontend autorizado pode fazer requests ─────────────
// credentials: true é OBRIGATÓRIO para cookies cross-origin

app.use(
  cors({
    origin: env.CLIENT_URL,  // Ex: https://bancadosfilmes.vercel.app
    credentials: true,       // Permite envio de cookies
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'X-CSRF-Token'],
  })
);

// ─── 3. Rate Limiting Global (100 req / 15 min por IP) ──────────────────────

app.use(globalLimiter);

// ─── 4. Body Parser — Limite de 1MB previne payload bombs ───────────────────

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

// ─── 5. Cookie Parser ──────────────────────────────────────────────────────

app.use(cookieParser());

// ─── 6. Proteção CSRF — Valida em POST/PUT/PATCH/DELETE ─────────────────────
// NOTA: Aplicado DEPOIS do cookie parser (precisa ler os cookies)
// e apenas em rotas de mutação (GET é safe method)

app.use(csrfProtection);

// ─── 7. Trust proxy (para pegar o IP real atrás do Railway/Render) ──────────

app.set('trust proxy', 1);

// ─── 8. Rotas ───────────────────────────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/favorites', favoriteRoutes);

// ─── Health Check ───────────────────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// ─── 404 Handler ────────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({ error: 'Rota não encontrada', code: 'NOT_FOUND' });
});

// ─── Error Handler Global ───────────────────────────────────────────────────
// Captura erros não tratados. NUNCA expõe stack traces em produção.

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error('🔥 Erro não tratado:', err);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR',
      // Stack trace APENAS em desenvolvimento
      ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }
);

// ─── Iniciar Servidor ───────────────────────────────────────────────────────

app.listen(env.PORT, () => {
  console.log(`\n🎬 Banca dos Filmes API rodando na porta ${env.PORT}`);
  console.log(`📍 Ambiente: ${env.NODE_ENV}`);
  console.log(`🔗 Client URL: ${env.CLIENT_URL}`);
  console.log(`🛡️  Helmet: ativado`);
  console.log(`🚦 Rate Limiting: ativado`);
  console.log(`🔐 CSRF Protection: ativado`);
  console.log(`🍪 JWT em HttpOnly Cookie: ativado\n`);
});

export default app;
