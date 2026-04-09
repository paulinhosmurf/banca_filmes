// ============================================================================
// Type Augmentation — Adiciona `user` ao Request do Express
// ============================================================================
// Isso permite usar req.user em qualquer controller sem erros de tipo.
// O middleware de auth (authenticate) é quem popula esse campo.
// ============================================================================

declare namespace Express {
  interface Request {
    user?: {
      userId: string;
      role: 'USER' | 'ADMIN';
    };
  }
}
