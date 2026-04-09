// ============================================================================
// Comment Controller — Demonstração de Sanitização XSS
// ============================================================================
// FLUXO DE PROTEÇÃO CONTRA XSS ARMAZENADO:
//
// 1. Zod valida: tamanho (1-1000 chars), tipo (string), trim
// 2. Controller sanitiza: DOMPurify remove scripts, event handlers, etc.
// 3. Prisma persiste: query parametrizada, impossível injetar SQL
// 4. Frontend exibe: conteúdo já limpo, sem dangerouslySetInnerHTML
//
// DEMONSTRAÇÃO:
// Input:  "<script>alert('xss')</script><b>Ótimo filme!</b>"
// Após Zod:  "<script>alert('xss')</script><b>Ótimo filme!</b>" (formato ok)
// Após DOMPurify: "<b>Ótimo filme!</b>" (script REMOVIDO)
// No banco: "<b>Ótimo filme!</b>" (limpo para sempre)
// ============================================================================

import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { sanitizeHtml } from '../utils/sanitize';

// ─── Criar Comentário ───────────────────────────────────────────────────────

export async function createComment(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { content } = req.body;
    const { movieId } = req.params;
    const userId = req.user!.userId;

    // Verifica se o filme existe
    const movie = await prisma.movie.findUnique({ where: { id: movieId } });
    if (!movie) {
      res.status(404).json({ error: 'Filme não encontrado', code: 'NOT_FOUND' });
      return;
    }

    // ⚠️  SANITIZAÇÃO — remove scripts, event handlers, protocolos perigosos
    const safeContent = sanitizeHtml(content);

    // Se depois de sanitizar o conteúdo ficou vazio, rejeita
    if (!safeContent.trim()) {
      res.status(400).json({
        error: 'Comentário contém apenas conteúdo proibido',
        code: 'INVALID_CONTENT',
      });
      return;
    }

    const comment = await prisma.comment.create({
      data: {
        content: safeContent, // Conteúdo LIMPO vai pro banco
        userId,
        movieId,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    res.status(201).json({ message: 'Comentário criado', comment });
  } catch (error) {
    console.error('Erro ao criar comentário:', error);
    res.status(500).json({ error: 'Erro interno', code: 'INTERNAL_ERROR' });
  }
}

// ─── Listar Comentários de um Filme ─────────────────────────────────────────

export async function listComments(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { movieId } = req.params;
    const { page, limit } = req.query as { page: number; limit: number };

    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { movieId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, avatar: true } },
        },
      }),
      prisma.comment.count({ where: { movieId } }),
    ]);

    res.json({
      comments,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Erro ao listar comentários:', error);
    res.status(500).json({ error: 'Erro interno', code: 'INTERNAL_ERROR' });
  }
}

// ─── Deletar Comentário (dono ou admin) ─────────────────────────────────────

export async function deleteComment(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    const comment = await prisma.comment.findUnique({ where: { id } });

    if (!comment) {
      res.status(404).json({ error: 'Comentário não encontrado', code: 'NOT_FOUND' });
      return;
    }

    // Apenas o autor do comentário OU um admin pode deletar
    if (comment.userId !== userId && userRole !== 'ADMIN') {
      res.status(403).json({ error: 'Sem permissão', code: 'FORBIDDEN' });
      return;
    }

    await prisma.comment.delete({ where: { id } });

    res.json({ message: 'Comentário deletado' });
  } catch (error) {
    console.error('Erro ao deletar comentário:', error);
    res.status(500).json({ error: 'Erro interno', code: 'INTERNAL_ERROR' });
  }
}
