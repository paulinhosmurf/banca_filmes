// ============================================================================
// Movie Controller — CRUD de Filmes
// ============================================================================
// - Listagem e detalhes: público (qualquer um logado)
// - Criar/Atualizar/Deletar: apenas ADMIN (verificado na rota)
// - Dados já validados pelo Zod middleware
// - Prisma parametriza todas as queries (imune a SQL Injection)
// ============================================================================

import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { sanitizeText } from '../utils/sanitize';

// ─── Listar Filmes (com paginação e filtros) ────────────────────────────────

export async function listMovies(req: Request, res: Response): Promise<void> {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const genre = typeof req.query.genre === 'string' ? req.query.genre : undefined;
    const year = req.query.year ? Number(req.query.year) : undefined;
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const featured = req.query.featured === 'true' ? true : req.query.featured === 'false' ? false : undefined;

    const skip = (page - 1) * limit;

    // Monta filtros dinamicamente (Prisma parametriza tudo)
    const where: Record<string, unknown> = {};
    if (genre) where.genre = { has: genre };
    if (year) where.year = year;
    if (featured !== undefined) where.featured = featured;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { synopsis: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [movies, total] = await Promise.all([
      prisma.movie.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { likes: true, comments: true },
          },
        },
      }),
      prisma.movie.count({ where }),
    ]);

    res.json({
      movies,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Erro ao listar filmes:', error);
    res.status(500).json({ error: 'Erro interno', code: 'INTERNAL_ERROR' });
  }
}

// ─── Detalhes de um Filme ───────────────────────────────────────────────────

export async function getMovie(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;

    const movie = await prisma.movie.findUnique({
      where: { id },
      include: {
        _count: { select: { likes: true, comments: true, favorites: true } },
        comments: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
        },
      },
    });

    if (!movie) {
      res.status(404).json({ error: 'Filme não encontrado', code: 'NOT_FOUND' });
      return;
    }

    // Verifica se o usuário logado curtiu/favoritou este filme
    let userInteraction = null;
    if (req.user) {
      const [liked, favorited] = await Promise.all([
        prisma.like.findUnique({
          where: { userId_movieId: { userId: req.user.userId, movieId: id } },
        }),
        prisma.favorite.findUnique({
          where: { userId_movieId: { userId: req.user.userId, movieId: id } },
        }),
      ]);
      userInteraction = { liked: !!liked, favorited: !!favorited };
    }

    res.json({ movie, userInteraction });
  } catch (error) {
    console.error('Erro ao buscar filme:', error);
    res.status(500).json({ error: 'Erro interno', code: 'INTERNAL_ERROR' });
  }
}

// ─── Criar Filme (Admin) ────────────────────────────────────────────────────

export async function createMovie(req: Request, res: Response): Promise<void> {
  try {
    const data = req.body;

    // Sanitiza campos de texto (previne XSS armazenado)
    const movie = await prisma.movie.create({
      data: {
        ...data,
        title: sanitizeText(data.title),
        synopsis: sanitizeText(data.synopsis),
        director: data.director ? sanitizeText(data.director) : null,
        cast: data.cast?.map((actor: string) => sanitizeText(actor)) ?? [],
      },
    });

    res.status(201).json({ message: 'Filme criado com sucesso', movie });
  } catch (error) {
    console.error('Erro ao criar filme:', error);
    res.status(500).json({ error: 'Erro interno', code: 'INTERNAL_ERROR' });
  }
}

// ─── Atualizar Filme (Admin) ────────────────────────────────────────────────

export async function updateMovie(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const data = req.body;

    // Sanitiza campos de texto se estiverem presentes
    const sanitized: Record<string, unknown> = { ...data };
    if (data.title) sanitized.title = sanitizeText(data.title);
    if (data.synopsis) sanitized.synopsis = sanitizeText(data.synopsis);
    if (data.director) sanitized.director = sanitizeText(data.director);
    if (data.cast) sanitized.cast = data.cast.map((a: string) => sanitizeText(a));

    const movie = await prisma.movie.update({
      where: { id },
      data: sanitized,
    });

    res.json({ message: 'Filme atualizado', movie });
  } catch (error) {
    console.error('Erro ao atualizar filme:', error);
    res.status(500).json({ error: 'Erro interno', code: 'INTERNAL_ERROR' });
  }
}

// ─── Deletar Filme (Admin) ──────────────────────────────────────────────────

export async function deleteMovie(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;

    await prisma.movie.delete({ where: { id } });

    res.json({ message: 'Filme deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar filme:', error);
    res.status(500).json({ error: 'Erro interno', code: 'INTERNAL_ERROR' });
  }
}
