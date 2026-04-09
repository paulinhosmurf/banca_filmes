// ============================================================================
// Movie Routes
// ============================================================================

import { Router } from 'express';
import {
  listMovies,
  getMovie,
  createMovie,
  updateMovie,
  deleteMovie,
} from '../controllers/movie.controller';
import { requireAuth, optionalAuth, requireRole } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  createMovieSchema,
  updateMovieSchema,
  movieIdSchema,
  listMoviesSchema,
} from '../schemas/movie.schema';

const router = Router();

// Rotas públicas (com auth opcional para saber interação do user)
router.get('/', validate(listMoviesSchema), listMovies);
router.get('/:id', optionalAuth, validate(movieIdSchema), getMovie);

// Rotas admin (auth + role ADMIN obrigatórios)
router.post(
  '/',
  requireAuth,
  requireRole('ADMIN'),
  validate(createMovieSchema),
  createMovie
);
router.put(
  '/:id',
  requireAuth,
  requireRole('ADMIN'),
  validate(updateMovieSchema),
  updateMovie
);
router.delete(
  '/:id',
  requireAuth,
  requireRole('ADMIN'),
  validate(movieIdSchema),
  deleteMovie
);

export default router;
