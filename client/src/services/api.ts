// ============================================================================
// API Service — Camada de comunicação com o backend
// ============================================================================
// - Lê o CSRF token do cookie e envia no header X-CSRF-Token
// - credentials: 'include' garante envio de cookies cross-origin
// - O frontend NUNCA armazena JWT — o browser gerencia via HttpOnly cookie
// ============================================================================

import Cookies from 'js-cookie';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: Record<string, unknown>;
}

interface ApiError {
  error: string;
  code: string;
  details?: Array<{ field: string; message: string }>;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getCsrfToken(): string | undefined {
    return Cookies.get('csrf-token');
  }

  async request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { method = 'GET', body } = options;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Envia CSRF token em mutations (POST/PUT/PATCH/DELETE)
    if (method !== 'GET') {
      const csrfToken = this.getCsrfToken();
      if (csrfToken) {
        headers['X-CSRF-Token'] = csrfToken;
      }
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers,
      credentials: 'include', // OBRIGATÓRIO para cookies cross-origin
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      const error = data as ApiError;
      throw new ApiRequestError(
        error.error || 'Erro desconhecido',
        error.code || 'UNKNOWN',
        response.status,
        error.details
      );
    }

    return data as T;
  }

  // ─── Auth ────────────────────────────────────────────────────────────────

  async register(name: string, email: string, password: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: { name, email, password },
    });
  }

  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  async me() {
    return this.request('/auth/me');
  }

  async getMe() {
    return this.me();
  }

  // ─── Movies ──────────────────────────────────────────────────────────────

  async getMovies(params?: Record<string, string | number>) {
    const query = params
      ? '?' + new URLSearchParams(
          Object.entries(params).map(([k, v]) => [k, String(v)])
        ).toString()
      : '';
    return this.request(`/movies${query}`);
  }

  async getMovie(id: string) {
    return this.request(`/movies/${id}`);
  }

  // ─── Likes ───────────────────────────────────────────────────────────────

  async toggleLike(movieId: string) {
    return this.request(`/likes/${movieId}`, { method: 'POST' });
  }

  // ─── Favorites ───────────────────────────────────────────────────────────

  async toggleFavorite(movieId: string) {
    return this.request(`/favorites/${movieId}`, { method: 'POST' });
  }

  async getFavorites() {
    return this.request('/favorites');
  }

  // ─── Comments ────────────────────────────────────────────────────────────

  async getComments(movieId: string, page = 1) {
    return this.request(`/comments/${movieId}?page=${page}`);
  }

  async createComment(movieId: string, content: string) {
    return this.request(`/comments/${movieId}`, {
      method: 'POST',
      body: { content },
    });
  }

  async deleteComment(movieId: string, commentId: string) {
    return this.request(`/comments/${movieId}/${commentId}`, { method: 'DELETE' });
  }
}

// ─── Custom Error Class ─────────────────────────────────────────────────────

export class ApiRequestError extends Error {
  public code: string;
  public status: number;
  public details?: Array<{ field: string; message: string }>;

  constructor(
    message: string,
    code: string,
    status: number,
    details?: Array<{ field: string; message: string }>
  ) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export const api = new ApiService(API_BASE);
