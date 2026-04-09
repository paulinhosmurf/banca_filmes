// ============================================================================
// Zod Schemas — Autenticação
// ============================================================================

import { z } from 'zod';

// ─── Registro ───────────────────────────────────────────────────────────────

export const registerSchema = {
  body: z.object({
    name: z
      .string()
      .min(2, 'Nome deve ter no mínimo 2 caracteres')
      .max(100, 'Nome deve ter no máximo 100 caracteres')
      .trim(),
    email: z
      .string()
      .email('Email inválido')
      .max(255, 'Email muito longo')
      .toLowerCase()
      .trim(),
    password: z
      .string()
      .min(8, 'Senha deve ter no mínimo 8 caracteres')
      .max(128, 'Senha deve ter no máximo 128 caracteres')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Senha deve conter pelo menos: 1 minúscula, 1 maiúscula e 1 número'
      ),
  }),
};

// ─── Login ──────────────────────────────────────────────────────────────────

export const loginSchema = {
  body: z.object({
    email: z
      .string()
      .email('Email inválido')
      .toLowerCase()
      .trim(),
    password: z
      .string()
      .min(1, 'Senha é obrigatória'),
  }),
};
