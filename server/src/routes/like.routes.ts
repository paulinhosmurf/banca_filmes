// ============================================================================
// Like Routes
// ============================================================================

import { Router } from 'express';
import { toggleLike, checkLike } from '../controllers/like.controller';
import { requireAuth } from '../middlewares/auth';
import { interactionLimiter } from '../middlewares/rateLimiter';

const router = Router();

// Toggle like (autenticado)
router.post('/:movieId', requireAuth, interactionLimiter, toggleLike);

// Verificar status do like
router.get('/:movieId', requireAuth, checkLike);

export default router;
