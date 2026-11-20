// Padrão de maiúsculas e minúsculas do sistema.
// Textos escritos todos em MAIÚSCULAS ou todos em minúsculas viram "Nome Próprio" (Iniciais Maiúsculas).
// Textos já misturados (como "Honorários de êxito") ficam como foram digitados.

const SMALL = new Set(['da', 'de', 'do', 'das', 'dos', 'e', 'em', 'na', 'no', 'nas', 'nos', 'para', 'por', 'com', 'a', 'o', 'as', 'os', 'ao', 'aos', 'ou', 'sem', 'sob', 'sobre', 'entre']);
const ACRONYMS = new Set(['cpf', 'cnpj', 'rg', 'oab', 'trt', 'trf', 'stj', 'stf', 'tjes', 'tjsp', 'tjmg', 'inss', 'fgts', 'cnj', 'pje', 'jec', 'cpc', 'pix', 'nf', 'nfe', 'uf', 'es', 'sp', 'rj', 'mg', 'pj', 'pf', 'rpv', 'ctps', 'tst', 'mp', 'dpe', 'cras', 'creas', 'oi', 'ii', 'iii', 'iv', 'vi', 'vii', 'viii', 'ix']);

export function titleCase(text: string): string {
  let first = true;
  return String(text).toLowerCase().replace(/[a-zà-ÿ0-9]+/g, (w) => {
    const isFirst = first; first = false;
    if (/\d/.test(w)) return w;
    if (ACRONYMS.has(w) && w !== 'oi') return w.toUpperCase();
    if (!isFirst && SMALL.has(w)) return w;
    return w.charAt(0).toUpperCase() + w.slice(1);
  });
}

// Só corrige o que está todo em maiúsculas ou todo em minúsculas.
export function fixCase(text: any): string {
  const s = String(text ?? '');
  const letters = s.replace(/[^A-Za-zÀ-ÿ]/g, '');
  if (letters.length < 3) return s;
  if (letters === letters.toUpperCase() || letters === letters.toLowerCase()) return titleCase(s);
  return s;
}
