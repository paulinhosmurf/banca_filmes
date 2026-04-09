// ============================================================================
// CSRF Protection — Double Submit Cookie Pattern
// ============================================================================
// Como funciona:
// 1. No login, o server seta um cookie `csrf-token` (legível pelo JS)
// 2. O frontend lê esse cookie e envia no header `X-CSRF-Token`
// 3. Este middleware compara: cookie == header?
//
// Por que funciona:
// - Um atacante pode forçar o browser a ENVIAR cookies, mas NÃO pode LER
//   cookies de outro domínio (Same-Origin Policy)
// - Sem ler o cookie, ele não consegue setar o header corretamente
//
// Rotas protegidas: POST, PUT, PATCH, DELETE (métodos que modificam dados)
// Rotas ignoradas: GET, HEAD, OPTIONS (safe methods)
// ============================================================================

import { Request, Response, NextFunction } from 'express';

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

export function csrfProtection(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Ignora safe methods — eles não modificam dados
  if (SAFE_METHODS.includes(req.method)) {
    next();
    return;
  }

  const cookieToken = req.cookies?.['csrf-token'];
  const headerToken = req.headers['x-csrf-token'];

  // Ambos devem existir E serem iguais
  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    res.status(403).json({
      error: 'Token CSRF inválido ou ausente',
      code: 'CSRF_INVALID',
    });
    return;
  }

  next();
}
