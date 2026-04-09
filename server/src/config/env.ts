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
    .url('DATABASE_URL deve ser uma URL válida do PostgreSQL'),

  // ─── JWT ────────────────────────────────────────────────────────────────
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET deve ter no mínimo 32 caracteres para segurança'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // ─── CORS ───────────────────────────────────────────────────────────────
  CLIENT_URL: z
    .string()
    .url('CLIENT_URL deve ser a URL do frontend (ex: https://bancadosfilmes.vercel.app)'),

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
