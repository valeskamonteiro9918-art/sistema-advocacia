import React, { useMemo } from 'react';
import { Member, processResponsible, deadlineResponsible, taskResponsible, isMine } from './equipe';

// ---------------------------------------------------------------------------
// Meu painel: mostra só o que é da pessoa logada (ou das duas, quando marcado "Ambas").
// ---------------------------------------------------------------------------

const digits = (s: any) => String(s || '').replace(/\D/g, '');
const pad = (n: number) => String(n).padStart(2, '0');
const isoOf = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const dayFrom = (v: any) => { const m = String(v || '').match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null; };
const fmt = (iso: string) => (iso && /^\d{4}-\d{2}-\d{2}/.test(iso) ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}` : '—');
const diffDays = (iso: string, today: Date) => { const d = dayFrom(iso); return d ? Math.round((d.getTime() - today.getTime()) / 86400000) : 9999; };
const closed = (p: any) => /arquiv|encerr|baix|extint|transit|conclu|finaliz/i.test(String(p?.status || ''));

type Props = {
  PALETTE: any;
  me: Member;
  team: Member[];
  processes: any[];
  deadlines: any[];
  tasks: any[];
  processMovements: any[];
  drafts: any[];
  inactivityLimitDays: number;
  dateLabel: string;
  onGo: (tab: string) => void;
};

export default function MeuPainel({ PALETTE, me, processes, deadlines, tasks, processMovements, drafts, inactivityLimitDays, dateLabel, onGo }: Props) {
  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);
  const todayIso = isoOf(today);

  const data = useMemo(() => {
    const myProcesses = processes.filter(p => !closed(p) && isMine(processResponsible(p), me.id));
    const myDeadlines = deadlines
      .filter(d => d.status !== 'Finalizado' && !d.completed && isMine(deadlineResponsible(d, processes), me.id))
      .sort((a, b) => String(a.dueDate || '9999').localeCompare(String(b.dueDate || '9999')) || String(a.dueTime || '').localeCompare(String(b.dueTime || '')));
    const overdue = myDeadlines.filter(d => d.dueDate && d.dueDate < todayIso);
    const todayList = myDeadlines.filter(d => d.dueDate === todayIso);
    const next7 = myDeadlines.filter(d => d.dueDate && diffDays(d.dueDate, today) > 0 && diffDays(d.dueDate, today) <= 7);
    const upcoming = myDeadlines.filter(d => d.dueDate && d.dueDate >= todayIso).slice(0, 8);
    const myTasks = tasks.filter(t => t.status !== 'Concluída' && isMine(taskResponsible(t), me.id))
      .sort((a, b) => String(a.dueDate || '9999').localeCompare(String(b.dueDate || '9999')));
    const tasksOverdue = myTasks.filter(t => t.dueDate && t.dueDate < todayIso);
    // processos parados (sem movimentação há muito tempo)
    const stalled = myProcesses.map(p => {
      const ds = [dayFrom(p.monitorSince), ...processMovements.filter(m => digits(m.process) === digits(p.number)).map(m => dayFrom(m.date))].filter(Boolean) as Date[];
      if (!ds.length) return null;
      const last = new Date(Math.max(...ds.map(d => d.getTime())));
      const dias = Math.floor((today.getTime() - last.getTime()) / 86400000);
      return dias >= inactivityLimitDays ? { p, dias } : null;
    }).filter(Boolean).sort((a: any, b: any) => b.dias - a.dias) as { p: any; dias: number }[];
    const myNumbers = new Set(myProcesses.map(p => digits(p.number)));
    const myDrafts = drafts.filter(d => d.status === 'Aguardando sua revisão' && myNumbers.has(digits(d.process)));
    return { myProcesses, overdue, todayList, next7, upcoming, myTasks, tasksOverdue, stalled, myDrafts };
  }, [processes, deadlines, tasks, processMovements, drafts, me.id, todayIso, inactivityLimitDays, today]);

  const card = 'rounded-2xl border p-4 md:p-5';
  const cardStyle = { backgroundColor: PALETTE.fundoCartoes, borderColor: PALETTE.linhasBordas } as React.CSSProperties;
  const h = 'font-serif font-bold text-base';

  const Kpi = ({ title, value, sub, alert }: { title: string; value: number; sub: string; alert?: boolean }) => (
    <div className="rounded-2xl border p-4" style={{ ...cardStyle, borderColor: alert && value > 0 ? PALETTE.descontos : PALETTE.linhasBordas }}>
      <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: PALETTE.textoApoio }}>{title}</p>
      <p className="text-3xl font-serif mt-1" style={{ color: alert && value > 0 ? PALETTE.descontos : PALETTE.textoPrincipal }}>{value}</p>
      <p className="text-[11px] mt-1" style={{ color: PALETTE.textoApoio }}>{sub}</p>
    </div>
  );

  const attention: { text: string; go: string }[] = [];
  if (data.overdue.length) attention.push({ text: `${data.overdue.length} prazo${data.overdue.length === 1 ? '' : 's'} vencido${data.overdue.length === 1 ? '' : 's'} sem baixa`, go: 'agenda' });
  if (data.todayList.length) attention.push({ text: `${data.todayList.length} prazo${data.todayList.length === 1 ? '' : 's'} para hoje`, go: 'agenda' });
  if (data.tasksOverdue.length) attention.push({ text: `${data.tasksOverdue.length} tarefa${data.tasksOverdue.length === 1 ? '' : 's'} atrasada${data.tasksOverdue.length === 1 ? '' : 's'}`, go: 'tasks' });
  if (data.myDrafts.length) attention.push({ text: `${data.myDrafts.length} mensagem${data.myDrafts.length === 1 ? '' : 'ns'} para cliente aguardando sua revisão`, go: 'processes' });
  if (data.stalled.length) attention.push({ text: `${data.stalled.length} processo${data.stalled.length === 1 ? '' : 's'} sem movimentação há ${inactivityLimitDays} dias ou mais`, go: 'processes' });

  const when = (iso: string) => {
    const n = diffDays(iso, today);
    return n === 0 ? 'hoje' : n === 1 ? 'amanhã' : n < 0 ? `vencido há ${-n} dia${n === -1 ? '' : 's'}` : `em ${n} dias`;
  };

  return (
    <div className="space-y-4 md:space-y-5" style={{ color: PALETTE.textoPrincipal }}>
      <div>
        <h3 className="font-serif text-2xl md:text-[28px] leading-tight">Meu painel · {me.name}</h3>
        <p className="mt-1 text-xs capitalize" style={{ color: PALETTE.textoApoio }}>{dateLabel}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Kpi title="Meus processos ativos" value={data.myProcesses.length} sub="Sob minha responsabilidade" />
        <Kpi title="Prazos vencidos ou hoje" value={data.overdue.length + data.todayList.length} sub="Exigem ação imediata" alert />
        <Kpi title="Prazos nos próximos 7 dias" value={data.next7.length} sub="Meus compromissos da semana" />
        <Kpi title="Minhas tarefas abertas" value={data.myTasks.length} sub={data.tasksOverdue.length ? `${data.tasksOverdue.length} atrasada${data.tasksOverdue.length === 1 ? '' : 's'}` : 'Nenhuma atrasada'} />
      </div>

      <section className={card} style={cardStyle}>
        <h4 className={h}>Precisa de atenção</h4>
        {attention.length === 0 ? (
          <p className="text-xs mt-2" style={{ color: PALETTE.valoresReceber }}>Tudo em dia por aqui.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {attention.map(a => (
              <li key={a.text} className="flex items-center justify-between gap-3 rounded-xl border px-3 py-2 text-xs" style={{ borderColor: PALETTE.linhasBordas, backgroundColor: PALETTE.fundoPagina }}>
                <span>{a.text}</span>
                <button type="button" onClick={() => onGo(a.go)} className="font-bold shrink-0" style={{ color: PALETTE.bordoPrincipal }}>Abrir</button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
        <section className={card} style={cardStyle}>
          <div className="flex items-center justify-between"><h4 className={h}>Meus próximos prazos</h4><button type="button" onClick={() => onGo('agenda')} className="text-[11px] font-bold" style={{ color: PALETTE.bordoPrincipal }}>Ver agenda</button></div>
          <div className="mt-3 space-y-2">
            {data.upcoming.length === 0 && <p className="text-xs" style={{ color: PALETTE.textoApoio }}>Nenhum prazo futuro para você.</p>}
            {data.upcoming.map(d => (
              <div key={d.id} className="flex items-start gap-3 rounded-xl border p-3" style={{ borderColor: PALETTE.linhasBordas, backgroundColor: PALETTE.fundoPagina }}>
                <div className="w-11 shrink-0 text-center"><p className="text-sm font-bold leading-none">{fmt(d.dueDate)}</p><p className="text-[10px]" style={{ color: PALETTE.textoApoio }}>{d.dueTime || ''}</p></div>
                <div className="min-w-0 flex-1"><p className="text-xs font-bold truncate">{d.title}</p><p className="text-[11px]" style={{ color: PALETTE.textoApoio }}>{[d.client, when(d.dueDate)].filter(Boolean).join(' · ')}</p></div>
                {d.type === 'FATAL' && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full text-white shrink-0" style={{ backgroundColor: PALETTE.descontos }}>FATAL</span>}
              </div>
            ))}
          </div>
        </section>

        <section className={card} style={cardStyle}>
          <div className="flex items-center justify-between"><h4 className={h}>Minhas tarefas</h4><button type="button" onClick={() => onGo('tasks')} className="text-[11px] font-bold" style={{ color: PALETTE.bordoPrincipal }}>Ver tarefas</button></div>
          <div className="mt-3 space-y-2">
            {data.myTasks.length === 0 && <p className="text-xs" style={{ color: PALETTE.textoApoio }}>Nenhuma tarefa aberta para você.</p>}
            {data.myTasks.slice(0, 8).map(t => (
              <div key={t.id} className="flex items-start justify-between gap-3 rounded-xl border p-3" style={{ borderColor: PALETTE.linhasBordas, backgroundColor: PALETTE.fundoPagina }}>
                <div className="min-w-0"><p className="text-xs font-bold truncate">{t.title}</p><p className="text-[11px]" style={{ color: t.dueDate && t.dueDate < todayIso ? PALETTE.descontos : PALETTE.textoApoio }}>{t.dueDate ? `${fmt(t.dueDate)} · ${when(t.dueDate)}` : 'Sem data'} · {t.status}</p></div>
                {t.priority && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ backgroundColor: `${PALETTE.dourado}30`, color: PALETTE.bordoEscuro }}>{t.priority}</span>}
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className={card} style={cardStyle}>
        <div className="flex items-center justify-between"><h4 className={h}>Meus processos</h4><button type="button" onClick={() => onGo('processes')} className="text-[11px] font-bold" style={{ color: PALETTE.bordoPrincipal }}>Ver todos</button></div>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
          {data.myProcesses.length === 0 && <p className="text-xs" style={{ color: PALETTE.textoApoio }}>Nenhum processo ativo marcado como seu.</p>}
          {data.myProcesses.slice(0, 10).map(p => (
            <div key={p.id} className="rounded-xl border p-3" style={{ borderColor: PALETTE.linhasBordas, backgroundColor: PALETTE.fundoPagina }}>
              <p className="text-xs font-bold truncate">{p.client}</p>
              <p className="text-[11px] font-mono" style={{ color: PALETTE.textoApoio }}>{p.number}</p>
              <p className="text-[11px] truncate" style={{ color: PALETTE.textoApoio }}>{p.action}</p>
            </div>
          ))}
        </div>
        {data.myProcesses.length > 10 && <p className="text-[11px] mt-2" style={{ color: PALETTE.textoApoio }}>E mais {data.myProcesses.length - 10} processos.</p>}
      </section>
    </div>
  );
}

// Resumo da equipe: aparece no topo do painel do escritório.
export function EquipeResumo({ PALETTE, team, processes, deadlines, tasks }: { PALETTE: any; team: Member[]; processes: any[]; deadlines: any[]; tasks: any[] }) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayIso = isoOf(today);
  const rows = team.map(m => {
    const ps = processes.filter(p => !closed(p) && isMine(processResponsible(p), m.id));
    const ds = deadlines.filter(d => d.status !== 'Finalizado' && !d.completed && isMine(deadlineResponsible(d, processes), m.id));
    const ts = tasks.filter(t => t.status !== 'Concluída' && isMine(taskResponsible(t), m.id));
    return {
      m,
      processos: ps.length,
      vencidos: ds.filter(d => d.dueDate && d.dueDate < todayIso).length,
      semana: ds.filter(d => d.dueDate && diffDays(d.dueDate, today) >= 0 && diffDays(d.dueDate, today) <= 7).length,
      tarefas: ts.length
    };
  });
  return (
    <section className="rounded-2xl border p-4 md:p-5" style={{ backgroundColor: PALETTE.fundoCartoes, borderColor: PALETTE.linhasBordas }}>
      <h4 className="font-serif font-bold text-base">Equipe</h4>
      <p className="text-[11px] mt-0.5" style={{ color: PALETTE.textoApoio }}>Itens marcados como "Ambas" contam para as duas.</p>
      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
        {rows.map(r => (
          <div key={r.m.id} className="rounded-xl border p-3" style={{ borderColor: PALETTE.linhasBordas, backgroundColor: PALETTE.fundoPagina }}>
            <p className="text-xs font-bold">{r.m.name}</p>
            <div className="mt-2 grid grid-cols-4 gap-2 text-center">
              {[['Processos', r.processos, false], ['Vencidos', r.vencidos, true], ['Prazos 7 dias', r.semana, false], ['Tarefas', r.tarefas, false]].map(([t, v, al]: any) => (
                <div key={t}><p className="text-lg font-serif" style={{ color: al && v > 0 ? PALETTE.descontos : PALETTE.textoPrincipal }}>{v}</p><p className="text-[10px]" style={{ color: PALETTE.textoApoio }}>{t}</p></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
