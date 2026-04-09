// ============================================================================
// API Entry Point — Adapter para Vercel Serverless Functions
// ============================================================================
// O Vercel transforma este arquivo em uma serverless function.
// Ele importa o Express app do server/ e o expõe como handler.
// Todas as rotas /api/* são roteadas para cá pelo vercel.json.
// ============================================================================

import app from '../server/src/server';

export default app;
