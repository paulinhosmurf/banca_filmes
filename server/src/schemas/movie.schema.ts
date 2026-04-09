// ============================================================================
// Zod Schemas — Filmes
// ============================================================================

import { z } from 'zod';

// ─── Criar Filme (Admin) ────────────────────────────────────────────────────

export const createMovieSchema = {
  body: z.object({
    title: z
      .string()
      .min(1, 'Título é obrigatório')
      .max(255, 'Título muito longo')
      .trim(),
    synopsis: z
      .string()
      .min(10, 'Sinopse deve ter no mínimo 10 caracteres')
      .max(2000, 'Sinopse deve ter no máximo 2000 caracteres')
      .trim(),
    posterUrl: z
      .string()
      .url('URL do poster inválida'),
    videoUrl: z
      .string()
      .url('URL do vídeo inválida'),
    trailerUrl: z
      .string()
      .url('URL do trailer inválida')
      .optional()
      .or(z.literal('')),
    genre: z
      .array(z.string().min(1).max(50))
      .min(1, 'Informe pelo menos um gênero')
      .max(10, 'Máximo de 10 gêneros'),
    year: z
      .number()
      .int()
      .min(1888, 'Ano inválido — cinema começa em 1888')
      .max(new Date().getFullYear() + 2, 'Ano não pode ser tão no futuro'),
    duration: z
      .number()
      .int()
      .positive('Duração deve ser positiva')
      .optional(),
    director: z
      .string()
      .max(255)
      .trim()
      .optional(),
    cast: z
      .array(z.string().max(100))
      .max(50, 'Máximo de 50 atores')
      .optional()
      .default([]),
    featured: z
      .boolean()
      .optional()
      .default(false),
  }),
};

// ─── Atualizar Filme (Admin) ────────────────────────────────────────────────

export const updateMovieSchema = {
  body: createMovieSchema.body.partial(), // Todos os campos tornam-se opcionais
  params: z.object({
    id: z.string().cuid('ID do filme inválido'),
  }),
};

// ─── Parâmetro de ID ────────────────────────────────────────────────────────

export const movieIdSchema = {
  params: z.object({
    id: z.string().cuid('ID do filme inválido'),
  }),
};

// ─── Query de listagem ──────────────────────────────────────────────────────

export const listMoviesSchema = {
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
    genre: z.string().optional(),
    year: z.coerce.number().int().optional(),
    search: z.string().max(100).optional(),
    featured: z.coerce.boolean().optional(),
  }),
};
