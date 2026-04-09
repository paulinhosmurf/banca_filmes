// ============================================================================
// Rate Limiting — Proteção contra Força Bruta e Abuso
// ============================================================================
// Duas camadas:
// 1. globalLimiter  — 100 req/15min por IP (toda a API)
// 2. authLimiter    — 10 req/15min por IP (login/registro)
//
// O authLimiter é MUITO mais restritivo porque ataques de força bruta
// miram especificamente rotas de autenticação.
//
// Em produção (Railway/Render), o IP vem do header X-Forwarded-For
// (setado pelo reverse proxy). Confiamos apenas no primeiro proxy.
// ============================================================================

import rateLimit from 'express-rate-limit';

// ─── Rate Limiter Global ────────────────────────────────────────────────────
// 100 requests por janela de 15 minutos por IP

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: 'Muitas requisições. Tente novamente em 15 minutos.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
});

// ─── Rate Limiter para Autenticação ─────────────────────────────────────────
// APENAS 10 tentativas por janela de 15 minutos por IP
// Bloqueia ataques de força bruta em login e registro

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: 'Muitas tentativas de autenticação. Tente novamente em 15 minutos.',
    code: 'AUTH_RATE_LIMIT',
  },
});

// ─── Rate Limiter para Interações (Likes, Favoritos, Comentários) ───────────
// 30 interações por janela de 1 minuto por IP

export const interactionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: 'Muitas interações. Aguarde um momento.',
    code: 'INTERACTION_RATE_LIMIT',
  },
});
