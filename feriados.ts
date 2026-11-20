// Calendário forense por processo: cada processo conta os dias úteis de acordo com o seu ESTADO e a sua COMARCA.
// Vale para todos: sábados, domingos, feriados nacionais, Carnaval, Paixão de Cristo, Corpus Christi e o recesso forense (20/12 a 20/01).
// Vale só para o estado do processo: feriados estaduais (lista abaixo).
// Vale só para a comarca do processo: feriados municipais e suspensões cadastrados pela advogada em Configurações.

export const UFS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

export type FeriadoCustom = { id: string; escopo: 'nacional' | 'uf' | 'comarca'; uf?: string; comarca?: string; data: string; fim?: string; repete?: boolean; nome: string };
export type Contexto = { uf: string; comarca: string };

export const norm = (s: any) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

const pad = (n: number) => String(n).padStart(2, '0');
export const isoOf = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function easterSunday(year: number) {
  const a = year % 19, b = Math.floor(year / 100), c = year % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

// Feriados estaduais mais comuns. Os que não estiverem aqui podem ser cadastrados em Configurações.
const ESTADUAIS: Record<string, { md?: string; pascoa?: number; nome: string }[]> = {
  ES: [{ pascoa: 1, nome: 'Nossa Senhora da Penha (segunda-feira de Páscoa)' }],
  SP: [{ md: '07-09', nome: 'Revolução Constitucionalista' }],
  RJ: [{ md: '04-23', nome: 'São Jorge' }],
  RS: [{ md: '09-20', nome: 'Revolução Farroupilha' }],
  SC: [{ md: '08-11', nome: 'Dia de Santa Catarina' }],
  PR: [{ md: '12-19', nome: 'Emancipação do Paraná' }],
  CE: [{ md: '03-25', nome: 'Data Magna do Ceará' }],
  BA: [{ md: '07-02', nome: 'Independência da Bahia' }],
  AM: [{ md: '09-05', nome: 'Elevação do Amazonas à categoria de província' }],
  PA: [{ md: '08-15', nome: 'Adesão do Grão-Pará à Independência' }],
  DF: [{ md: '11-30', nome: 'Dia do Evangélico' }]
};

const nacionalCache: Record<number, Map<string, string>> = {};
function nacionais(year: number) {
  if (nacionalCache[year]) return nacionalCache[year];
  const m = new Map<string, string>();
  const nomes: Record<string, string> = { '01-01': 'Confraternização Universal', '04-21': 'Tiradentes', '05-01': 'Dia do Trabalho', '09-07': 'Independência', '10-12': 'Nossa Senhora Aparecida', '11-02': 'Finados', '11-15': 'Proclamação da República', '11-20': 'Consciência Negra', '12-25': 'Natal' };
  Object.entries(nomes).forEach(([md, n]) => m.set(`${year}-${md}`, n));
  const easter = easterSunday(year);
  const shift = (days: number) => { const d = new Date(easter); d.setDate(d.getDate() + days); return isoOf(d); };
  m.set(shift(-48), 'Carnaval'); m.set(shift(-47), 'Carnaval'); m.set(shift(-2), 'Sexta-feira da Paixão'); m.set(shift(60), 'Corpus Christi');
  nacionalCache[year] = m;
  return m;
}

export function recessoForense(d: Date) {
  const m = d.getMonth() + 1, day = d.getDate();
  return (m === 12 && day >= 20) || (m === 1 && day <= 20);
}

// Motivo pelo qual o dia NÃO conta como útil (ou '' se for dia útil).
export function motivoNaoUtil(d: Date, ctx: Contexto, custom: FeriadoCustom[] = []): string {
  const wd = d.getDay();
  if (wd === 0 || wd === 6) return 'Fim de semana';
  if (recessoForense(d)) return 'Recesso forense';
  const iso = isoOf(d);
  const nac = nacionais(d.getFullYear()).get(iso);
  if (nac) return nac;
  const uf = (ctx.uf || '').toUpperCase();
  for (const f of ESTADUAIS[uf] || []) {
    if (f.md && iso === `${d.getFullYear()}-${f.md}`) return f.nome;
    if (f.pascoa !== undefined) { const e = easterSunday(d.getFullYear()); e.setDate(e.getDate() + f.pascoa); if (isoOf(e) === iso) return f.nome; }
  }
  const cid = norm(ctx.comarca);
  for (const c of custom) {
    const escopoOk = c.escopo === 'nacional' || (c.escopo === 'uf' && (c.uf || '').toUpperCase() === uf) || (c.escopo === 'comarca' && (c.uf || '').toUpperCase() === uf && norm(c.comarca) === cid && cid !== '');
    if (!escopoOk) continue;
    const ini = c.repete ? `${d.getFullYear()}-${c.data.slice(5)}` : c.data;
    const fim = c.fim ? (c.repete ? `${d.getFullYear()}-${c.fim.slice(5)}` : c.fim) : ini;
    if (iso >= ini && iso <= fim) return c.nome;
  }
  return '';
}

export const ehDiaUtil = (d: Date, ctx: Contexto, custom: FeriadoCustom[] = []) => motivoNaoUtil(d, ctx, custom) === '';

export function diasUteisAte(dateValue: string, ctx: Contexto, custom: FeriadoCustom[] = []) {
  if (!dateValue) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const due = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(due.getTime())) return null;
  if (due < today) return -1;
  let count = 0;
  const cursor = new Date(today);
  while (cursor < due) { cursor.setDate(cursor.getDate() + 1); if (ehDiaUtil(cursor, ctx, custom)) count += 1; }
  return count;
}

// Soma dias a partir de uma data. Em dias úteis, pula fins de semana, feriados e recesso do processo; o termo final cai no próximo dia útil.
export function somarDias(base: Date, n: number, uteis: boolean, ctx: Contexto, custom: FeriadoCustom[] = []) {
  const d = new Date(base);
  let left = n;
  while (left > 0) { d.setDate(d.getDate() + 1); if (!uteis || ehDiaUtil(d, ctx, custom)) left -= 1; }
  while (!ehDiaUtil(d, ctx, custom)) d.setDate(d.getDate() + 1);
  return d;
}

// Estado a partir do tribunal (TJES, TRT17...). Devolve '' se não reconhecer.
const TRIBUNAIS: [RegExp, string][] = [
  [/\bTJES\b|\bTRT[\s-]*17\b|\bTRE[\s-]*ES\b/i, 'ES'], [/\bTJSP\b|\bTRT[\s-]*(2|15)\b/i, 'SP'], [/\bTJRJ\b|\bTRT[\s-]*1\b(?!\d)/i, 'RJ'],
  [/\bTJMG\b|\bTRT[\s-]*3\b(?!\d)/i, 'MG'], [/\bTJBA\b|\bTRT[\s-]*5\b(?!\d)/i, 'BA'], [/\bTJRS\b|\bTRT[\s-]*4\b(?!\d)/i, 'RS'],
  [/\bTJPR\b|\bTRT[\s-]*9\b(?!\d)/i, 'PR'], [/\bTJSC\b|\bTRT[\s-]*12\b/i, 'SC'], [/\bTJDFT\b|\bTRT[\s-]*10\b/i, 'DF'],
  [/\bTJCE\b|\bTRT[\s-]*7\b(?!\d)/i, 'CE'], [/\bTJPE\b|\bTRT[\s-]*6\b(?!\d)/i, 'PE'], [/\bTJGO\b|\bTRT[\s-]*18\b/i, 'GO']
];
export const ufDoTribunal = (court: any) => { const t = String(court || ''); for (const [re, uf] of TRIBUNAIS) if (re.test(t)) return uf; return ''; };

// Comarca: usa o campo do processo; se vazio, tenta ler "... de Vitória" / "... Serra" do texto do tribunal.
export function comarcaDoTexto(court: any) {
  const t = String(court || '');
  const m = t.match(/\b(?:de|do|da)\s+([A-ZÀ-Ú][\p{L}]+(?:\s+(?:de|do|da|dos|das)?\s*[A-ZÀ-Ú][\p{L}]+)*)\s*$/u) || t.match(/\bJEC\s+(?:de\s+)?([A-ZÀ-Ú][\p{L}]+)\s*$/u);
  return m ? m[1].trim() : '';
}

export function contextoDoProcesso(proc: any, padraoUf = 'ES'): Contexto {
  if (!proc) return { uf: padraoUf, comarca: '' };
  const uf = (proc.uf && UFS.includes(String(proc.uf).toUpperCase()) ? String(proc.uf).toUpperCase() : '') || ufDoTribunal(proc.court) || padraoUf;
  const comarca = String(proc.comarca || '').trim() || comarcaDoTexto(proc.court);
  return { uf, comarca };
}

export const digitos = (s: any) => String(s || '').replace(/\D/g, '');
