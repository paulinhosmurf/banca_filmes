// ============================================================================
// Like Controller — Toggle com proteção contra race conditions
// ============================================================================
// A UNIQUE constraint @@unique([userId, movieId]) no Prisma schema garante
// que MESMO com dois requests simultâneos, apenas UM like é criado.
// O segundo request recebe um erro de constraint violation (P2002),
// que tratamos graciosamente como "já curtido".
// ============================================================================

import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { Prisma } from '@prisma/client';

// ─── Toggle Like ────────────────────────────────────────────────────────────
// Se já curtiu → remove like (unlike)
// Se não curtiu → adiciona like

export async function toggleLike(req: Request, res: Response): Promise<void> {
  try {
    const { movieId } = req.params;
    const userId = req.user!.userId;

    // Verifica se o filme existe
    const movie = await prisma.movie.findUnique({ where: { id: movieId } });
    if (!movie) {
      res.status(404).json({ error: 'Filme não encontrado', code: 'NOT_FOUND' });
      return;
    }

    // Verifica se já curtiu
    const existingLike = await prisma.like.findUnique({
      where: { userId_movieId: { userId, movieId } },
    });

    if (existingLike) {
      // Já curtiu → remove (unlike)
      await prisma.like.delete({
        where: { id: existingLike.id },
      });

      const count = await prisma.like.count({ where: { movieId } });

      res.json({ liked: false, likesCount: count });
      return;
    }

    // Não curtiu → tenta criar
    try {
      await prisma.like.create({
        data: { userId, movieId },
      });
    } catch (error) {
      // Race condition: outro request criou o like entre o findUnique e o create
      // Prisma error P2002 = Unique constraint violation
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        // Like já existe — trata como sucesso (idempotente)
        const count = await prisma.like.count({ where: { movieId } });
        res.json({ liked: true, likesCount: count });
        return;
      }
      throw error; // Outros erros são re-lançados
    }

    const count = await prisma.like.count({ where: { movieId } });

    res.json({ liked: true, likesCount: count });
  } catch (error) {
    console.error('Erro no toggle like:', error);
    res.status(500).json({ error: 'Erro interno', code: 'INTERNAL_ERROR' });
  }
}

// ─── Verificar se o usuário curtiu um filme ─────────────────────────────────

export async function checkLike(req: Request, res: Response): Promise<void> {
  try {
    const { movieId } = req.params;
    const userId = req.user!.userId;

    const like = await prisma.like.findUnique({
      where: { userId_movieId: { userId, movieId } },
    });

    const count = await prisma.like.count({ where: { movieId } });

    res.json({ liked: !!like, likesCount: count });
  } catch (error) {
    console.error('Erro ao verificar like:', error);
    res.status(500).json({ error: 'Erro interno', code: 'INTERNAL_ERROR' });
  }
}
