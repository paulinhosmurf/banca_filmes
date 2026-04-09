// ============================================================================
// CommentSection — Lista e formulário de comentários
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { api, ApiRequestError } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './CommentSection.css';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
}

interface CommentsResponse {
  comments: Comment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface CommentSectionProps {
  movieId: string;
}

export function CommentSection({ movieId }: CommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // ─── Carregar comentários ────────────────────────────────────────────
  const fetchComments = useCallback(async () => {
    try {
      const data = await api.getComments(movieId) as CommentsResponse;
      setComments(data.comments);
    } catch {
      console.error('Erro ao carregar comentários');
    } finally {
      setLoading(false);
    }
  }, [movieId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // ─── Enviar comentário ───────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    setError('');

    try {
      const data = await api.createComment(movieId, newComment) as { comment: Comment };

      // Adiciona no topo (mais recente primeiro)
      setComments((prev) => [data.comment, ...prev]);
      setNewComment('');
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
      } else {
        setError('Erro ao enviar comentário');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Deletar comentário (somente o autor) ────────────────────────────
  const handleDelete = async (commentId: string) => {
    try {
      await api.deleteComment(movieId, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch {
      setError('Erro ao deletar comentário');
    }
  };

  // ─── Formatar data ───────────────────────────────────────────────────
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <section className="comment-section">
      <h3 className="comment-section__title">
        💬 Comentários
        <span className="comment-section__count">{comments.length}</span>
      </h3>

      {/* Formulário — só para logados */}
      {user ? (
        <form className="comment-form" onSubmit={handleSubmit}>
          {error && (
            <div className="comment-form__error animate-shake">
              ⚠️ {error}
            </div>
          )}
          <textarea
            className="comment-form__input"
            placeholder="Escreva um comentário..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            maxLength={1000}
            rows={3}
            disabled={submitting}
            required
          />
          <div className="comment-form__footer">
            <span className="comment-form__char-count">
              {newComment.length}/1000
            </span>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || !newComment.trim()}
            >
              {submitting ? 'Enviando...' : 'Comentar'}
            </button>
          </div>
        </form>
      ) : (
        <p className="comment-section__login-prompt">
          <a href="/login">Faça login</a> para comentar.
        </p>
      )}

      {/* Lista de comentários */}
      {loading ? (
        <div className="comment-list">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="comment-skeleton">
              <div className="skeleton" style={{ width: '120px', height: '1rem' }} />
              <div className="skeleton" style={{ width: '100%', height: '2.5rem', marginTop: '0.5rem' }} />
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="comment-section__empty">
          Nenhum comentário ainda. Seja o primeiro! 🎬
        </p>
      ) : (
        <div className="comment-list">
          {comments.map((comment) => (
            <div key={comment.id} className="comment glass-card animate-fade-in-up">
              <div className="comment__header">
                <div className="comment__avatar">
                  {comment.user.name.charAt(0).toUpperCase()}
                </div>
                <div className="comment__meta">
                  <span className="comment__author">{comment.user.name}</span>
                  <span className="comment__date">{formatDate(comment.createdAt)}</span>
                </div>
                {user?.id === comment.user.id && (
                  <button
                    className="comment__delete"
                    onClick={() => handleDelete(comment.id)}
                    aria-label="Deletar comentário"
                    title="Deletar"
                  >
                    🗑️
                  </button>
                )}
              </div>
              <p className="comment__content">{comment.content}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
