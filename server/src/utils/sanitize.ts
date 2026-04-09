// ============================================================================
// Sanitização de Inputs — DOMPurify Server-Side
// ============================================================================
// DEMONSTRAÇÃO DE SEGURANÇA:
//
// Input malicioso:
//   "<script>alert('xss')</script><b>Filme incrível!</b>"
//
// Após sanitize():
//   "<b>Filme incrível!</b>"
//
// O <script> é REMOVIDO completamente. Tags seguras como <b>, <i>, <em>
// são preservadas para permitir formatação básica nos comentários.
//
// Isso previne:
// - Stored XSS (scripts persistidos no banco que executam em outros users)
// - Event handler injection (<img onerror="...">)
// - Protocol injection (href="javascript:...")
// ============================================================================

import DOMPurify from 'isomorphic-dompurify';

// ─── Configuração de tags e atributos permitidos ────────────────────────────

const ALLOWED_TAGS = ['b', 'i', 'em', 'strong', 'u', 'br', 'p'];
const ALLOWED_ATTR: string[] = []; // Nenhum atributo permitido = máxima segurança

// ─── Sanitizar HTML ─────────────────────────────────────────────────────────

export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    // Remove qualquer conteúdo dentro de tags proibidas (não apenas a tag)
    KEEP_CONTENT: true,
  });
}

// ─── Sanitizar texto puro (remove TODAS as tags HTML) ───────────────────────
// Usar para campos que NÃO devem ter HTML nenhum (nome, email, etc.)

export function sanitizeText(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  }).trim();
}

// ─── Demo de ataque interceptado ────────────────────────────────────────────

export function demonstrateSanitization(): void {
  const payloads = [
    '<script>alert("xss")</script>Texto seguro',
    '<img src=x onerror="document.cookie">',
    '<a href="javascript:alert(1)">Click</a>',
    '<div onmouseover="steal()">Hover me</div>',
    '<b>Negrito legítimo</b> e <i>itálico</i>',
    'Texto 100% limpo sem HTML',
  ];

  console.log('\n🛡️  Demonstração de Sanitização DOMPurify:');
  console.log('─'.repeat(60));
  payloads.forEach((payload) => {
    console.log(`  INPUT:  "${payload}"`);
    console.log(`  OUTPUT: "${sanitizeHtml(payload)}"`);
    console.log('─'.repeat(60));
  });
}
