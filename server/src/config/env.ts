// ============================================================================
// Validação de Variáveis de Ambiente com Zod
// ============================================================================
// Se QUALQUER variável estiver ausente ou inválida, o servidor NÃO INICIA.
// Isso previne deploys quebrados e exposição acidental de dados.
// As variáveis ficam no Vercel/Railway — NUNCA no código.
// ============================================================================

import { z } from 'zod';

const envSchema = z.object({
  // ─── Servidor ───────────────────────────────────────────────────────────
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),

  // ─── Banco de Dados ────────────────────────────────────────────────────
  DATABASE_URL: z
    .string()
    .min(1, 'DATABASE_URL é obrigatória'),

  // ─── JWT ────────────────────────────────────────────────────────────────
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET deve ter no mínimo 32 caracteres para segurança'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // ─── CORS ───────────────────────────────────────────────────────────────
  // No Vercel, CLIENT_URL usa VERCEL_URL como fallback
  CLIENT_URL: z
    .string()
    .default(process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:5173'),

  // ─── CSRF ───────────────────────────────────────────────────────────────
  CSRF_SECRET: z
    .string()
    .min(32, 'CSRF_SECRET deve ter no mínimo 32 caracteres'),
});

// Valida e exporta — se falhar, o processo morre com erro descritivo
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    '❌ Variáveis de ambiente inválidas:\n',
    parsed.error.flatten().fieldErrors
  );
  process.exit(1);
}

export const env = parsed.data;
