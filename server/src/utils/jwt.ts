// ============================================================================
// JWT Utilities — Geração e Verificação de Tokens
// ============================================================================
// - Tokens são SEMPRE entregues via HttpOnly Cookie (nunca no body)
// - O payload contém apenas { userId, role } — mínimo necessário
// - Nenhum dado sensível (email, senha) entra no token
// ============================================================================

import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { env } from '../config/env';
import crypto from 'crypto';

interface TokenPayload {
  userId: string;
  role: 'USER' | 'ADMIN';
}

// ─── Gerar JWT ──────────────────────────────────────────────────────────────

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

// ─── Verificar JWT ──────────────────────────────────────────────────────────

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
}

// ─── Gerar CSRF Token ───────────────────────────────────────────────────────

export function generateCsrfToken(): string {
  return crypto
    .createHmac('sha256', env.CSRF_SECRET)
    .update(crypto.randomBytes(32))
    .digest('hex');
}

// ─── Setar Cookies de Auth ──────────────────────────────────────────────────
// Seta dois cookies:
// 1. `token` — HttpOnly (JS não acessa), contém o JWT
// 2. `csrf-token` — legível pelo JS, para o header X-CSRF-Token

export function setAuthCookies(res: Response, payload: TokenPayload): void {
  const token = generateToken(payload);
  const csrfToken = generateCsrfToken();

  const isProduction = env.NODE_ENV === 'production';

  // Cookie do JWT — HttpOnly = antirroubo via XSS
  res.cookie('token', token, {
    httpOnly: true,       // JavaScript NÃO PODE acessar
    secure: isProduction, // HTTPS only em produção
    sameSite: 'lax',      // Proteção contra CSRF básica
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
    path: '/',
  });

  // Cookie CSRF — legível pelo JS para enviar no header
  res.cookie('csrf-token', csrfToken, {
    httpOnly: false,      // JS PRECISA ler para enviar no header
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
}

// ─── Limpar Cookies de Auth ─────────────────────────────────────────────────

export function clearAuthCookies(res: Response): void {
  res.clearCookie('token', { path: '/' });
  res.clearCookie('csrf-token', { path: '/' });
}
