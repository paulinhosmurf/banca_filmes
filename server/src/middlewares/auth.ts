// ============================================================================
// Auth Middleware — JWT Verification + Role-Based Access Control
// ============================================================================
// Fluxo:
// 1. Extrai JWT do cookie HttpOnly (não do header Authorization)
// 2. Verifica assinatura e expiração
// 3. Injeta { userId, role } no req.user
// 4. requireRole() bloqueia acesso por papel (USER/ADMIN)
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

// ─── Tipagem customizada para o Request ─────────────────────────────────────

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: 'USER' | 'ADMIN';
      };
    }
  }
}

// ─── Middleware: Autenticação obrigatória ────────────────────────────────────

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    // 1. Extrai o token do cookie HttpOnly — NÃO do header
    const token = req.cookies?.token;

    if (!token) {
      res.status(401).json({
        error: 'Autenticação necessária',
        code: 'AUTH_REQUIRED',
      });
      return;
    }

    // 2. Verifica a assinatura e expiração
    const payload = verifyToken(token);

    // 3. Injeta no request para uso nos controllers
    req.user = {
      userId: payload.userId,
      role: payload.role,
    };

    next();
  } catch (error) {
    // Token expirado ou inválido — limpa o cookie corrompido
    res.clearCookie('token', { path: '/' });
    res.clearCookie('csrf-token', { path: '/' });
    res.status(401).json({
      error: 'Token inválido ou expirado',
      code: 'TOKEN_INVALID',
    });
  }
}

// ─── Middleware: Autenticação opcional (para rotas públicas) ─────────────────
// Permite requests não-autenticados, mas injeta user se houver token válido

export function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  try {
    const token = req.cookies?.token;
    if (token) {
      const payload = verifyToken(token);
      req.user = { userId: payload.userId, role: payload.role };
    }
  } catch {
    // Token inválido em rota opcional — ignora silenciosamente
  }
  next();
}

// ─── Middleware Factory: Restrição por Role ──────────────────────────────────
// Uso: router.get('/admin/movies', requireAuth, requireRole('ADMIN'), ...)

export function requireRole(...allowedRoles: Array<'USER' | 'ADMIN'>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Autenticação necessária',
        code: 'AUTH_REQUIRED',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: 'Permissão insuficiente',
        code: 'FORBIDDEN',
      });
      return;
    }

    next();
  };
}
