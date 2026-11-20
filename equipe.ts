// Equipe do escritório e regras de "de quem é cada coisa".
// Cada processo, prazo e tarefa tem um responsável: 'valeska', 'dayane' ou 'ambas'.
// O que não tiver responsável marcado conta como da Dra. Valeska.

export type Member = { id: string; name: string; short: string; emails: string[] };

export const DEFAULT_TEAM: Member[] = [
  { id: 'valeska', name: 'Dra. Valeska', short: 'Valeska', emails: ['valeskamonteiro.adv@gmail.com', 'contato@valeskamonteiro.adv.br'] },
  { id: 'dayane', name: 'Dra. Dayane', short: 'Dayane', emails: ['dayanecarvalho.adv@outlook.com'] }
];

export const RESPONSIBLE_OPTIONS = [
  { value: 'valeska', label: 'Dra. Valeska' },
  { value: 'dayane', label: 'Dra. Dayane' },
  { value: 'ambas', label: 'Ambas' }
];

const norm = (s: any) => String(s || '').trim().toLowerCase();
const digits = (s: any) => String(s || '').replace(/\D/g, '');

export function teamOf(officeSettings: any): Member[] {
  const saved = Array.isArray(officeSettings?.team) ? officeSettings.team : [];
  return DEFAULT_TEAM.map(d => {
    const s = saved.find((x: any) => x?.id === d.id);
    const emails = Array.isArray(s?.emails) ? s.emails.map(norm).filter(Boolean) : d.emails;
    return { ...d, emails };
  });
}

export function memberByEmail(team: Member[], email: any): Member | null {
  const e = norm(email);
  if (!e) return null;
  return team.find(m => m.emails.map(norm).includes(e)) || null;
}

export function processResponsible(p: any): string {
  const r = norm(p?.responsible);
  return r === 'dayane' || r === 'ambas' ? r : 'valeska';
}

export function deadlineResponsible(d: any, processes: any[]): string {
  const r = norm(d?.responsible);
  if (r === 'valeska' || r === 'dayane' || r === 'ambas') return r;
  const num = digits(d?.process);
  const p = num ? processes.find(x => digits(x.number) === num) : null;
  return p ? processResponsible(p) : 'valeska';
}

export function taskResponsible(t: any): string {
  const a = norm(t?.assignee);
  if (a.includes('dayane')) return 'dayane';
  if (a.includes('valeska')) return 'valeska';
  if (a.includes('ambas')) return 'ambas';
  if (a) return 'ambas'; // secretaria / apoio: aparece para as duas
  return 'valeska';
}

export const isMine = (responsible: string, meId: string) => responsible === meId || responsible === 'ambas';
