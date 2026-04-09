// ============================================================================
// Zod Schemas — Comentários
// ============================================================================

import { z } from 'zod';

// ─── Criar Comentário ───────────────────────────────────────────────────────
// NOTA: O Zod valida formato e tamanho. A SANITIZAÇÃO (DOMPurify) acontece
// no controller DEPOIS da validação, antes de persistir no banco.
// São duas camadas distintas de proteção.

export const createCommentSchema = {
  body: z.object({
    content: z
      .string()
      .min(1, 'Comentário não pode ser vazio')
      .max(1000, 'Comentário deve ter no máximo 1000 caracteres')
      .trim(),
  }),
  params: z.object({
    movieId: z.string().cuid('ID do filme inválido'),
  }),
};

// ─── Atualizar Comentário ───────────────────────────────────────────────────

export const updateCommentSchema = {
  body: z.object({
    content: z
      .string()
      .min(1, 'Comentário não pode ser vazio')
      .max(1000, 'Comentário deve ter no máximo 1000 caracteres')
      .trim(),
  }),
  params: z.object({
    id: z.string().cuid('ID do comentário inválido'),
  }),
};

// ─── Deletar Comentário ─────────────────────────────────────────────────────

export const deleteCommentSchema = {
  params: z.object({
    id: z.string().cuid('ID do comentário inválido'),
  }),
};

// ─── Listar Comentários de um Filme ─────────────────────────────────────────

export const listCommentsSchema = {
  params: z.object({
    movieId: z.string().cuid('ID do filme inválido'),
  }),
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
  }),
};
