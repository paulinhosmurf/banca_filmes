// ============================================================================
// Comment Routes
// ============================================================================

import { Router } from 'express';
import {
  createComment,
  listComments,
  deleteComment,
} from '../controllers/comment.controller';
import { requireAuth } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { interactionLimiter } from '../middlewares/rateLimiter';
import {
  createCommentSchema,
  listCommentsSchema,
  deleteCommentSchema,
} from '../schemas/comment.schema';

const router = Router();

// Listar comentários de um filme (público)
router.get('/:movieId', validate(listCommentsSchema), listComments);

// Criar comentário (autenticado + rate limited + validado + sanitizado)
router.post(
  '/:movieId',
  requireAuth,
  interactionLimiter,
  validate(createCommentSchema),
  createComment
);

// Deletar comentário (dono ou admin)
router.delete(
  '/:id',
  requireAuth,
  validate(deleteCommentSchema),
  deleteComment
);

export default router;
