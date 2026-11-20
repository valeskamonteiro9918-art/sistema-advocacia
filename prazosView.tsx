import React, { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Member, deadlineResponsible, isMine } from './equipe';

// Lista de prazos e compromissos agrupada por urgência: Vencidos, Hoje, Esta semana, Próximos, Sem data e Cumpridos.

const pad = (n: number) => String(n).padStart(2, '0');
const isoOf = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const dayFrom = (v: any) => { const m = String(v || '').match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null; };
const MESES = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
const norm = (s: any) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

type Props = {
  PALETTE: any;
  deadlines: any[];
  processes: any[];
  team: Member[];
  me: Member | null;
  businessDaysUntil: (iso: string) => number | null;
  onOpen: (item: any) => void;
  onNew: () => void;
};

export default function PrazosView({ PALETTE, deadlines, processes, team, me, businessDaysUntil, onOpen, onNew }: Props) {
  const [who, setWho] = useState<string>('todos');
  const [kind, setKind] = useState<'todos' | 'fatal' | 'compromisso'>('todos');
  const [q, setQ] = useState('');
  const [showDone, setShowDone] = useState(false);

  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);
  const todayIso = isoOf(today);
  const weekEnd = isoOf(new Date(today.getTime() + 7 * 86400000));

  const rows = useMemo(() => deadlines.map(d => ({ d, resp: deadlineResponsible(d, processes), done: !!d.completed || d.status === 'Finalizado' })), [deadlines, processes]);

  const filtered = useMemo(() => rows.filter(({ d, resp }) => {
    if (who !== 'todos' && !isMine(resp, who)) return false;
    if (kind === 'fatal' && d.type !== 'FATAL') return false;
    if (kind === 'compromisso' && d.type === 'FATAL') return false;
    if (q.trim()) {
      const hay = norm(`${d.title} ${d.client} ${d.process} ${d.court}`);
      if (!hay.includes(norm(q))) return false;
    }
    return true;
  }).sort((a, b) => String(a.d.dueDate || '9999').localeCompare(String(b.d.dueDate || '9999')) || String(a.d.dueTime || '').localeCompare(String(b.d.dueTime || ''))), [rows, who, kind, q]);

  const open = filtered.filter(r => !r.done);
  const groups = [
    { id: 'venc', label: 'Vencidos', tone: PALETTE.descontos, items: open.filter(r => r.d.dueDate && r.d.dueDate < todayIso) },
    { id: 'hoje', label: 'Hoje', tone: PALETTE.descontos, items: open.filter(r => r.d.dueDate === todayIso) },
    { id: 'sem', label: 'Próximos 7 dias', tone: PALETTE.dourado, items: open.filter(r => r.d.dueDate > todayIso && r.d.dueDate <= weekEnd) },
    { id: 'prox', label: 'Mais adiante', tone: PALETTE.bordoPrincipal, items: open.filter(r => r.d.dueDate > weekEnd) },
    { id: 'sd', label: 'Sem data', tone: PALETTE.textoApoio, items: open.filter(r => !r.d.dueDate) }
  ];
  const done = filtered.filter(r => r.done);
  const allOpen = rows.filter(r => !r.done);
  const kpi = [
    { label: 'Em aberto', value: allOpen.length, tone: PALETTE.textoPrincipal },
    { label: 'Fatais em aberto', value: allOpen.filter(r => r.d.type === 'FATAL').length, tone: PALETTE.descontos },
    { label: 'Vencidos', value: allOpen.filter(r => r.d.dueDate && r.d.dueDate < todayIso).length, tone: PALETTE.descontos },
    { label: 'Próximos 7 dias', value: allOpen.filter(r => r.d.dueDate >= todayIso && r.d.dueDate <= weekEnd).length, tone: PALETTE.bordoPrincipal }
  ];

  const respLabel = (r: string) => r === 'ambas' ? 'Ambas' : (team.find(m => m.id === r)?.short || r);

  const card = ({ d, resp, done: isDone }: any, tone: string) => {
    const dt = dayFrom(d.dueDate);
    const diff = dt ? Math.round((dt.getTime() - today.getTime()) / 86400000) : null;
    let when = 'Sem data';
    if (isDone) when = 'Cumprido';
    else if (diff !== null) when = diff < 0 ? `Vencido há ${-diff} dia${diff === -1 ? '' : 's'}` : diff === 0 ? 'Hoje' : diff === 1 ? 'Amanhã' : `em ${diff} dias`;
    let uteis = '';
    if (!isDone && diff !== null && diff > 1) { try { const n = businessDaysUntil(d.dueDate); if (Number.isFinite(n)) uteis = `${n} dias úteis`; } catch { /* sem estimativa */ } }
    const fatal = d.type === 'FATAL';
    const where = [d.client, d.process ? `Proc. ${d.process}` : '', d.court].filter(Boolean).join(' · ');
    return (
      <button type="button" key={d.id} onClick={() => onOpen({ ...d })} className="w-full text-left flex items-stretch gap-3 rounded-xl border overflow-hidden transition hover:shadow-sm" style={{ borderColor: PALETTE.linhasBordas, backgroundColor: PALETTE.fundoCartoes, opacity: isDone ? 0.7 : 1 }}>
        <span className="w-1.5 shrink-0" style={{ backgroundColor: isDone ? PALETTE.valoresReceber : tone }} />
        <span className="w-14 shrink-0 py-3 flex flex-col items-center justify-center">
          <span className="font-serif text-xl leading-none" style={{ color: PALETTE.textoPrincipal }}>{dt ? pad(dt.getDate()) : '—'}</span>
          <span className="text-[10px] font-semibold mt-1" style={{ color: PALETTE.textoApoio }}>{dt ? MESES[dt.getMonth()] : 'S/D'}</span>
        </span>
        <span className="min-w-0 flex-1 py-3 pr-2">
          <span className="flex flex-wrap items-center gap-1.5">
            <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full" style={{ backgroundColor: fatal ? `${PALETTE.descontos}22` : `${PALETTE.dourado}22`, color: fatal ? PALETTE.descontos : PALETTE.dourado }}>{fatal ? 'Prazo fatal' : 'Compromisso'}</span>
            {d.dueTime && <span className="text-[10px]" style={{ color: PALETTE.textoApoio }}>{d.dueTime}</span>}
          </span>
          <span className="block text-sm font-bold mt-1 leading-snug" style={{ color: PALETTE.textoPrincipal }}>{d.title}</span>
          {where && <span className="block text-xs mt-0.5 truncate" style={{ color: PALETTE.textoApoio }}>{where}</span>}
        </span>
        <span className="shrink-0 py-3 pr-4 flex flex-col items-end justify-center gap-1">
          <span className="text-xs font-bold" style={{ color: isDone ? PALETTE.valoresReceber : tone }}>{when}</span>
          {uteis && <span className="text-[10px]" style={{ color: PALETTE.textoApoio }}>{uteis}</span>}
          <span className="text-[10px] px-2 py-0.5 rounded-full border" style={{ borderColor: PALETTE.linhasBordas, color: PALETTE.textoApoio }}>{respLabel(resp)}</span>
        </span>
      </button>
    );
  };

  const chip = (active: boolean) => ({ backgroundColor: active ? PALETTE.bordoPrincipal : 'transparent', color: active ? '#FFFFFF' : PALETTE.textoPrincipal, borderColor: active ? PALETTE.bordoPrincipal : PALETTE.linhasBordas });

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h3 className="font-serif font-bold text-xl" style={{ color: PALETTE.textoPrincipal }}>Prazos e compromissos</h3>
          <p className="text-xs mt-1" style={{ color: PALETTE.textoApoio }}>O que vence primeiro aparece no topo. Clique em um item para ver ou editar.</p>
        </div>
        <button type="button" onClick={onNew} className="px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-2 w-fit" style={{ backgroundColor: PALETTE.bordoPrincipal }}><Plus size={14} /> Cadastrar prazo</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpi.map(k => (
          <div key={k.label} className="rounded-xl border p-3" style={{ borderColor: PALETTE.linhasBordas, backgroundColor: PALETTE.fundoCartoes }}>
            <div className="text-[10px] uppercase font-bold tracking-wide" style={{ color: PALETTE.textoApoio }}>{k.label}</div>
            <div className="font-serif text-2xl mt-1" style={{ color: k.value ? k.tone : PALETTE.textoApoio }}>{k.value}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setWho('todos')} className="px-3 py-1.5 rounded-full text-xs font-bold border" style={chip(who === 'todos')}>Todos</button>
          {team.map(m => <button key={m.id} type="button" onClick={() => setWho(m.id)} className="px-3 py-1.5 rounded-full text-xs font-bold border" style={chip(who === m.id)}>{me && me.id === m.id ? `Meus (${m.short})` : m.short}</button>)}
          <span className="w-px mx-1" style={{ backgroundColor: PALETTE.linhasBordas }} />
          {([['todos', 'Todos os tipos'], ['fatal', 'Só fatais'], ['compromisso', 'Audiências e compromissos']] as const).map(([k, l]) => <button key={k} type="button" onClick={() => setKind(k)} className="px-3 py-1.5 rounded-full text-xs font-bold border" style={chip(kind === k)}>{l}</button>)}
        </div>
        <label className="relative w-full lg:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: PALETTE.textoApoio }} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar cliente, processo ou assunto" aria-label="Buscar prazos" className="w-full pl-8 pr-3 py-2 rounded-lg border text-xs" style={{ borderColor: PALETTE.linhasBordas, backgroundColor: PALETTE.fundoCartoes, color: PALETTE.textoPrincipal }} />
        </label>
      </div>

      {groups.map(g => g.items.length > 0 && (
        <section key={g.id} className="space-y-2">
          <h4 className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: g.tone }}>{g.label}<span className="rounded-full px-2 py-0.5 text-[10px]" style={{ backgroundColor: `${g.tone}20` }}>{g.items.length}</span></h4>
          <div className="space-y-2">{g.items.map(r => card(r, g.tone))}</div>
        </section>
      ))}

      {open.length === 0 && (
        <div className="text-center py-10 text-sm rounded-xl border" style={{ borderColor: PALETTE.linhasBordas, color: PALETTE.textoApoio }}>
          {deadlines.length === 0 ? 'Nenhum prazo cadastrado.' : 'Nenhum prazo em aberto com esses filtros.'}
        </div>
      )}

      {done.length > 0 && (
        <section className="space-y-2">
          <button type="button" onClick={() => setShowDone(v => !v)} className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: PALETTE.textoApoio }}>
            Cumpridos ({done.length}) <span>{showDone ? '▲' : '▼'}</span>
          </button>
          {showDone && <div className="space-y-2">{[...done].reverse().map(r => card(r, PALETTE.valoresReceber))}</div>}
        </section>
      )}

      <p className="text-[10px]" style={{ color: PALETTE.textoApoio }}>Os dias úteis são uma estimativa: descontam feriados nacionais, Carnaval, Paixão de Cristo, Corpus Christi, Nossa Senhora da Penha (ES) e o recesso forense de 20/12 a 20/01. Feriados municipais e suspensões específicas do tribunal não estão incluídos. Confira sempre a contagem no sistema oficial.</p>
    </div>
  );
}
