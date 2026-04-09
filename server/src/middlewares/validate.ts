// ============================================================================
// Zod Validation Middleware — "NUNCA confie no front-end"
// ============================================================================
// Este middleware intercepta TODA request antes do controller e valida:
// - body (dados do formulário/JSON)
// - params (IDs na URL)
// - query (filtros e paginação)
//
// Se a validação FALHAR, o request é REJEITADO com erro 400 e detalhes
// do que está errado — o controller NUNCA é alcançado com dados sujos.
//
// Uso:
//   router.post('/comments', validate(createCommentSchema), controller)
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError, ZodEffects } from 'zod';

interface ValidationSchema {
  body?: AnyZodObject | ZodEffects<AnyZodObject>;
  params?: AnyZodObject;
  query?: AnyZodObject;
}

export function validate(schema: ValidationSchema) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Valida cada parte do request que tiver schema definido
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }
      if (schema.params) {
        req.params = (await schema.params.parseAsync(req.params)) as Record<
          string,
          string
        >;
      }
      if (schema.query) {
        req.query = (await schema.query.parseAsync(req.query)) as Record<
          string,
          string
        >;
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Formata os erros de forma clara para o frontend exibir
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        res.status(400).json({
          error: 'Dados inválidos',
          code: 'VALIDATION_ERROR',
          details: formattedErrors,
        });
        return;
      }

      // Erro inesperado — não expõe detalhes internos
      res.status(500).json({
        error: 'Erro interno de validação',
        code: 'INTERNAL_ERROR',
      });
    }
  };
}
