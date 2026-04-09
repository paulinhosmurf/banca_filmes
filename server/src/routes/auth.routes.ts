// ============================================================================
// Auth Routes
// ============================================================================

import { Router } from 'express';
import { register, login, logout, me } from '../controllers/auth.controller';
import { requireAuth } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { authLimiter } from '../middlewares/rateLimiter';
import { registerSchema, loginSchema } from '../schemas/auth.schema';

const router = Router();

// Rate limiting AGRESSIVO em rotas de auth (10 req / 15min)
router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/logout', requireAuth, logout);
router.get('/me', requireAuth, me);

export default router;
