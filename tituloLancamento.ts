// Padrão do título dos lançamentos: "<O que é> · <Cliente>".
// O "O que é" é sempre escolhido em uma lista (nada de digitar de novo toda vez).

export const TIPOS_ENTRADA = ['Entrada', 'Parcela', 'Honorários contratuais', 'Honorários de êxito', 'Honorários avulsos (sem processo)', 'Consulta', 'Reembolso', 'Outro'];
export const TIPOS_SAIDA = ['Custas processuais', 'Despesas do processo', 'Repasse ao cliente', 'Despesa do escritório', 'Outro'];

export type TituloDraft = { tipo: string; pn: string; pt: string; outro: string };

export const tituloVazio = (kind: string): TituloDraft => ({ tipo: kind === 'Despesa' ? 'Custas processuais' : 'Parcela', pn: '1', pt: '1', outro: '' });

export const montarTitulo = (t: TituloDraft, client: string) => {
  const base = t.tipo === 'Parcela' ? `Parcela ${Number(t.pn) || 1}/${Number(t.pt) || 1}` : t.tipo === 'Outro' ? t.outro.trim() : t.tipo;
  const c = (client || '').trim();
  return c ? `${base} · ${c}` : base;
};

// Lê um título antigo (qualquer formato) e devolve a escolha mais próxima da lista.
export const lerTitulo = (title: string, kind: string, client: string): TituloDraft => {
  const lista = kind === 'Despesa' ? TIPOS_SAIDA : TIPOS_ENTRADA;
  let s = String(title || '').trim();
  const c = (client || '').trim();
  if (c) { const i = s.toLowerCase().lastIndexOf(c.toLowerCase()); if (i > 0) s = s.slice(0, i).replace(/[\s·\-–—,]+$/, ''); }
  s = s.replace(/\s*·\s*[^·]+$/, (m) => (c ? m : m)).trim();
  const head = s.split('·')[0].trim();
  let m = head.match(/(?:honor[aá]rios,?\s*)?parcela\s*(\d+)\s*\/\s*(\d+)/i) || head.match(/^(\d+)\s*\/\s*(\d+)/);
  if (m) return { tipo: 'Parcela', pn: m[1], pt: m[2], outro: '' };
  const achou = lista.find(x => x !== 'Outro' && x !== 'Parcela' && x.toLowerCase() === head.toLowerCase());
  if (achou) return { tipo: achou, pn: '1', pt: '1', outro: '' };
  if (/^entrada/i.test(head)) return { tipo: 'Entrada', pn: '1', pt: '1', outro: '' };
  return { tipo: 'Outro', pn: '1', pt: '1', outro: head };
};
