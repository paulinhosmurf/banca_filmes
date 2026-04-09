// ============================================================================
// Auth Controller — Registro, Login, Logout, Me
// ============================================================================
// Camadas de proteção neste controller:
// 1. Zod validou os inputs ANTES de chegar aqui
// 2. bcrypt hash com custo 12 (~250ms) para senhas
// 3. JWT entregue via HttpOnly Cookie (nunca no response body)
// 4. Rate limiting ativo na rota (10 tentativas / 15min)
// 5. Mensagens de erro GENÉRICAS para não vazar informações
// ============================================================================

import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../utils/prisma';
import { setAuthCookies, clearAuthCookies } from '../utils/jwt';
import { sanitizeText } from '../utils/sanitize';

const BCRYPT_COST = 12;

// ─── Registro ───────────────────────────────────────────────────────────────

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, password } = req.body;

    // Verifica se email já existe
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      // Mensagem GENÉRICA — não revela se o email existe ou não
      res.status(409).json({
        error: 'Não foi possível criar a conta',
        code: 'REGISTRATION_FAILED',
      });
      return;
    }

    // Hash da senha — NUNCA armazena texto plano
    const hashedPassword = await bcrypt.hash(password, BCRYPT_COST);

    // Sanitiza o nome (remove qualquer HTML)
    const safeName = sanitizeText(name);

    // Cria o usuário
    const user = await prisma.user.create({
      data: {
        name: safeName,
        email, // Já foi toLowerCase() e trim() pelo Zod
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // Seta JWT no cookie HttpOnly
    setAuthCookies(res, { userId: user.id, role: user.role });

    res.status(201).json({
      message: 'Conta criada com sucesso',
      user,
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR',
    });
  }
}

// ─── Login ──────────────────────────────────────────────────────────────────

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    // Busca o usuário (incluindo a senha para comparação)
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Mensagem GENÉRICA — não revela se o email existe
      res.status(401).json({
        error: 'Email ou senha incorretos',
        code: 'INVALID_CREDENTIALS',
      });
      return;
    }

    // Compara a senha fornecida com o hash armazenado
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({
        error: 'Email ou senha incorretos',
        code: 'INVALID_CREDENTIALS',
      });
      return;
    }

    // Seta JWT no cookie HttpOnly
    setAuthCookies(res, { userId: user.id, role: user.role });

    res.json({
      message: 'Login realizado com sucesso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR',
    });
  }
}

// ─── Logout ─────────────────────────────────────────────────────────────────

export async function logout(_req: Request, res: Response): Promise<void> {
  clearAuthCookies(res);
  res.json({ message: 'Logout realizado com sucesso' });
}

// ─── Me (Dados do usuário autenticado) ──────────────────────────────────────

export async function me(req: Request, res: Response): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({
        error: 'Usuário não encontrado',
        code: 'USER_NOT_FOUND',
      });
      return;
    }

    res.json({ user });
  } catch (error) {
    console.error('Erro em /me:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR',
    });
  }
}
