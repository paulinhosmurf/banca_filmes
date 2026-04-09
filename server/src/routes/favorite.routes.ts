// ============================================================================
// Favorite Routes
// ============================================================================

import { Router } from 'express';
import { toggleFavorite, listFavorites } from '../controllers/favorite.controller';
import { requireAuth } from '../middlewares/auth';
import { interactionLimiter } from '../middlewares/rateLimiter';

const router = Router();

// Toggle favorito
router.post('/:movieId', requireAuth, interactionLimiter, toggleFavorite);

// Listar favoritos do usuário logado
router.get('/', requireAuth, listFavorites);

export default router;
