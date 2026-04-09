// ============================================================================
// Favorite Controller — Mesma lógica de proteção do Like
// ============================================================================

import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { Prisma } from '@prisma/client';

// ─── Toggle Favorito ────────────────────────────────────────────────────────

export async function toggleFavorite(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const movieId = req.params.movieId as string;
    const userId = req.user!.userId;

    const movie = await prisma.movie.findUnique({ where: { id: movieId } });
    if (!movie) {
      res.status(404).json({ error: 'Filme não encontrado', code: 'NOT_FOUND' });
      return;
    }

    const existing = await prisma.favorite.findUnique({
      where: { userId_movieId: { userId, movieId } },
    });

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      res.json({ favorited: false });
      return;
    }

    try {
      await prisma.favorite.create({ data: { userId, movieId } });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        res.json({ favorited: true });
        return;
      }
      throw error;
    }

    res.json({ favorited: true });
  } catch (error) {
    console.error('Erro no toggle favorito:', error);
    res.status(500).json({ error: 'Erro interno', code: 'INTERNAL_ERROR' });
  }
}

// ─── Listar Favoritos do Usuário ────────────────────────────────────────────

export async function listFavorites(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const userId = req.user!.userId;

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        movie: {
          include: {
            _count: { select: { likes: true } },
          },
        },
      },
    });

    res.json({ favorites: favorites.map((f) => f.movie) });
  } catch (error) {
    console.error('Erro ao listar favoritos:', error);
    res.status(500).json({ error: 'Erro interno', code: 'INTERNAL_ERROR' });
  }
}
