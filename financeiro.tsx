import React, { useEffect, useMemo, useState } from 'react';
import { downloadDocx, DocxParagraph } from './docx';
import { fixCase } from './texto';

// ---------------------------------------------------------------------------
// Regras financeiras do escritório
// - "Pago" em uma receita equivale a "Recebido".
// - Alvarás, depósitos judiciais e repasses são valores de terceiros ("memo"):
//   aparecem nos painéis e no extrato, mas não entram no saldo nem no DRE do escritório.
// ---------------------------------------------------------------------------

export const MEMO_CATEGORIES = ['Alvará', 'Depósito judicial', 'Repasse ao cliente'];
export const PROCESS_COST_CATEGORIES = ['Custas processuais', 'Despesas do processo', 'Diligência/perícia', 'Adiantamento do escritório'];
const REIMBURSEMENT_CATEGORY = 'Reembolso de despesas';
const FEE_TYPES = ['Contratual', 'Êxito', 'Sucumbência'];
const DOC_STATUS = ['Sem documento', 'NF a emitir', 'NF emitida', 'Boleto emitido', 'Boleto pago'];

export const brl = (n: number) => Number(n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const r2 = (n: number) => Math.round((Number(n) || 0) * 100) / 100;
const pad = (n: number) => String(n).padStart(2, '0');
const isoOf = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const todayLocal = () => isoOf(new Date());
const addDays = (iso: string, days: number) => { const d = new Date(`${iso}T00:00:00`); d.setDate(d.getDate() + days); return isoOf(d); };
const fmtDate = (iso?: string) => (iso && /^\d{4}-\d{2}-\d{2}/.test(iso) ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}` : '—');
const norm = (s: any) => String(s || '').trim().toLowerCase();
const dateOf = (e: any) => e.paidAt || e.dueDate || String(e.createdAt || '').slice(0, 10) || '';
const sum = (list: any[]) => r2(list.reduce((acc, e) => acc + Number(e.amount || 0), 0));

export const isMemo = (e: any) => e.memo === true || MEMO_CATEGORIES.includes(e.category);
const isReceived = (e: any) => e.kind === 'Receita' && (e.status === 'Recebido' || e.status === 'Pago');
const isPaidExpense = (e: any) => e.kind === 'Despesa' && (e.status === 'Pago' || e.status === 'Recebido');
const isOpenIncome = (e: any) => e.kind === 'Receita' && (e.status === 'Pendente' || e.status === 'Atrasado');
const isOpenExpense = (e: any) => e.kind === 'Despesa' && (e.status === 'Pendente' || e.status === 'Atrasado');
const isOverdue = (e: any, today: string) => (isOpenIncome(e) || isOpenExpense(e)) && e.dueDate && e.dueDate < today;
const isFee = (e: any) => e.kind === 'Receita' && e.category === 'Honorários' && !isMemo(e);

export function financeSummary(entries: any[], today = todayLocal()) {
  const own = entries.filter(e => !isMemo(e));
  const saldo = r2(sum(own.filter(isReceived)) - sum(own.filter(isPaidExpense)));
  const fees = own.filter(isFee);
  const feesOpen = fees.filter(isOpenIncome);
  const feesOverdue = feesOpen.filter(e => e.dueDate && e.dueDate < today);
  const incomeDue = own.filter(e => e.kind === 'Receita' && e.dueDate && e.dueDate <= today && e.category !== REIMBURSEMENT_CATEGORY);
  const overdueIncome = incomeDue.filter(e => isOpenIncome(e));
  const base = sum(incomeDue);
  const overdueValue = sum(overdueIncome);
  return {
    saldo,
    aReceber: sum(feesOpen),
    aReceberVencido: sum(feesOverdue),
    aReceberAVencer: r2(sum(feesOpen) - sum(feesOverdue)),
    inadimplenciaPct: base > 0 ? Math.round((overdueValue / base) * 100) : 0,
    inadimplenciaValor: overdueValue,
    inadimplenciaQtd: overdueIncome.length,
    baseVencida: base
  };
}

function cashflow(entries: any[], today: string) {
  const own = entries.filter(e => !isMemo(e));
  const limits = [30, 60, 90];
  const rows: any[] = [];
  const open = own.filter(e => isOpenIncome(e) || isOpenExpense(e));
  const make = (label: string, test: (e: any) => boolean) => {
    const inList = open.filter(test);
    return { label, entradas: sum(inList.filter(e => e.kind === 'Receita')), saidas: sum(inList.filter(e => e.kind === 'Despesa')) };
  };
  rows.push(make('Em atraso', e => !!e.dueDate && e.dueDate < today));
  let prev = 0;
  limits.forEach(lim => {
    const from = addDays(today, prev), to = addDays(today, lim);
    rows.push(make(prev === 0 ? 'Próximos 30 dias' : `${prev + 1} a ${lim} dias`, e => !!e.dueDate && e.dueDate >= today && (prev === 0 ? e.dueDate <= to : e.dueDate > from && e.dueDate <= to)));
    prev = lim;
  });
  rows.push(make('Sem vencimento definido', e => !e.dueDate));
  const saldo = financeSummary(entries, today).saldo;
  let acumulado = saldo;
  rows.forEach((r, i) => {
    r.saldoPeriodo = r2(r.entradas - r.saidas);
    if (i >= 1 && i <= 3) { acumulado = r2(acumulado + r.saldoPeriodo); r.acumulado = acumulado; }
  });
  return { rows, saldoAtual: saldo, projetado90: acumulado };
}

function copyText(text: string) {
  try {
    if (navigator.clipboard?.writeText) { navigator.clipboard.writeText(text); return true; }
  } catch { /* usa o plano B */ }
  const ta = document.createElement('textarea');
  ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
  document.body.appendChild(ta); ta.select();
  let ok = false;
  try { ok = document.execCommand('copy'); } catch { ok = false; }
  ta.remove();
  return ok;
}

function downloadCsv(filename: string, rows: (string | number)[][]) {
  const esc = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = '﻿' + rows.map(r => r.map(esc).join(';')).join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}

let idCounter = 0;
const newId = () => `fin-${Date.now()}-${idCounter++}`;

type Props = {
  PALETTE: any;
  entries: any[];
  setEntries: (updater: any) => void;
  processes: any[];
  clients: any[];
  officeSettings: any;
  notify: (msg: string) => void;
  promptInstallments: (client?: string) => void;
  openClientFinance?: (name: string) => void;
};

export default function FinanceModule({ PALETTE, entries, setEntries, processes, clients, officeSettings, notify, promptInstallments, openClientFinance }: Props) {
  const [tab, setTab] = useState<'resumo' | 'lancamentos' | 'relatorios' | 'mais'>(() => { try { const v = sessionStorage.getItem('vm-fin-tab'); return (['resumo', 'lancamentos', 'relatorios', 'mais'].includes(v || '') ? v : 'resumo') as any; } catch { return 'resumo'; } });
  useEffect(() => { try { sessionStorage.setItem('vm-fin-tab', tab); } catch { /* sem armazenamento */ } }, [tab]);
  const [adv, setAdv] = useState<null | 'honorarios' | 'custas' | 'alvaras'>(null);
  const [isEntryOpen, setIsEntryOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pickOpen, setPickOpen] = useState(false);
  const [pickName, setPickName] = useState('');
  const today = todayLocal();

  const input = 'p-2.5 border rounded-lg text-xs w-full';
  const inputStyle = { borderColor: PALETTE.linhasBordas, backgroundColor: PALETTE.fundoCartoes, color: PALETTE.textoPrincipal } as React.CSSProperties;
  const card = 'p-4 rounded-xl border space-y-3';
  const cardStyle = { backgroundColor: PALETTE.fundoCartoes, borderColor: PALETTE.linhasBordas } as React.CSSProperties;
  const primaryBtn = 'px-4 py-2.5 rounded-lg text-xs font-bold text-white';
  const ghostBtn = 'px-3 py-2 rounded-lg border text-xs font-bold';
  const label = 'text-[10px] font-bold uppercase tracking-wider block';

  const update = (id: string, patch: any) => setEntries((prev: any[]) => prev.map(e => {
    if (e.id !== id) return e;
    const next = { ...e, ...patch };
    if (patch.status && patch.status !== e.status) {
      next.paidAt = (patch.status === 'Recebido' || patch.status === 'Pago') ? todayLocal() : undefined;
    }
    return next;
  }));
  const remove = (id: string) => {
    if (!window.confirm('Excluir este lançamento? Esta ação não pode ser desfeita.')) return;
    setEntries((prev: any[]) => prev.filter(e => e.id !== id && e.linkedTo !== id));
  };
  const add = (items: any[]) => setEntries((prev: any[]) => [...items.map(it => ({ createdAt: new Date().toISOString(), ...it, id: it.id || newId() })), ...prev]);

  const summary = useMemo(() => financeSummary(entries, today), [entries, today]);
  const flow = useMemo(() => cashflow(entries, today), [entries, today]);

  const clientNames = useMemo(() => {
    const set = new Map<string, string>();
    clients.forEach((c: any) => c?.name && set.set(norm(c.name), String(c.name).trim()));
    processes.forEach((p: any) => p?.client && !set.has(norm(p.client)) && set.set(norm(p.client), String(p.client).trim()));
    entries.forEach((e: any) => e?.client && !set.has(norm(e.client)) && set.set(norm(e.client), String(e.client).trim()));
    return [...set.values()].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [clients, processes, entries]);

  const processLabel = (p: any) => `${p.number}${p.client ? ' · ' + p.client : ''}`;
  const processByNumber = (n: string) => processes.find((p: any) => p.number === n);

  const Kpi = ({ title, value, sub, color }: { title: string; value: string; sub?: string; color?: string }) => (
    <div className="p-4 rounded-xl border shadow-sm space-y-1" style={cardStyle}>
      <span className={label} style={{ color: PALETTE.textoApoio }}>{title}</span>
      <p className="text-xl font-bold font-mono" style={{ color: color || PALETTE.textoPrincipal }}>{value}</p>
      {sub && <p className="text-[10px]" style={{ color: PALETTE.textoApoio }}>{sub}</p>}
    </div>
  );

  const tabs: [typeof tab, string][] = [['resumo', 'Resumo'], ['lancamentos', 'Lançamentos'], ['relatorios', 'Relatórios'], ['mais', 'Mais ferramentas']];

  // ----------------------------- Visão geral -----------------------------
  const [draft, setDraft] = useState({ title: '', kind: 'Receita', category: 'Honorários', client: '', amount: '', dueDate: '', status: 'Pendente' });
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterText, setFilterText] = useState('');
  const submitDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.title.trim() || Number(draft.amount) <= 0) { window.alert('Informe a descrição e um valor maior que zero.'); return; }
    const done = draft.status === 'Recebido' || draft.status === 'Pago';
    if (editingId) {
      update(editingId, { title: fixCase(draft.title.trim()), kind: draft.kind, category: draft.category, client: fixCase(draft.client.trim()), amount: Number(draft.amount), dueDate: draft.dueDate, status: draft.status });
      setEditingId(null); setIsEntryOpen(false); notify('Lançamento atualizado.');
      return;
    }
    add([{ ...draft, title: fixCase(draft.title.trim()), client: fixCase(draft.client.trim()), amount: Number(draft.amount), paidAt: done ? today : undefined }]);
    setDraft({ title: '', kind: 'Receita', category: 'Honorários', client: '', amount: '', dueDate: '', status: 'Pendente' });
    setIsEntryOpen(false);
    notify('Lançamento financeiro cadastrado.');
  };
  const visibleEntries = entries
    .filter(e => filterStatus === 'Todos' || e.status === filterStatus)
    .filter(e => !filterText.trim() || `${e.title} ${e.client} ${e.category}`.toLowerCase().includes(filterText.trim().toLowerCase()))
    .slice()
    .sort((a, b) => String(a.dueDate || '9999').localeCompare(String(b.dueDate || '9999')));

  const EntryRow = ({ e, extra }: { e: any; extra?: React.ReactNode }) => (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-lg border" style={{ borderColor: PALETTE.linhasBordas, backgroundColor: PALETTE.fundoPagina }}>
      <div className="min-w-0">
        <p className="text-xs font-bold" style={{ color: PALETTE.textoPrincipal }}>{e.title}</p>
        <p className="text-[10px] mt-1" style={{ color: PALETTE.textoApoio }}>
          {e.kind} · {e.category}{e.feeType ? ` (${e.feeType})` : ''}{e.client ? ` · ${e.client}` : ''}{e.process ? ` · Proc. ${e.process}` : ''}{e.dueDate ? ` · Venc. ${fmtDate(e.dueDate)}` : ''}
          {isOverdue(e, today) ? ' · VENCIDO' : ''}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0 md:justify-end">
        {extra}
        <span className="w-[130px] text-right text-sm font-bold font-mono whitespace-nowrap" style={{ color: e.kind === 'Receita' ? PALETTE.valoresReceber : PALETTE.descontos }}>{e.kind === 'Despesa' ? '− ' : '+ '}{brl(e.amount)}</span>
        <select aria-label="Alterar status do lançamento" value={e.status} onChange={ev => update(e.id, { status: ev.target.value })} className="w-[96px] text-[10px] p-1.5 border rounded" style={inputStyle}>
          <option>Pendente</option><option>Recebido</option><option>Pago</option><option>Atrasado</option>
        </select>
        <button type="button" aria-label="Editar lançamento" onClick={() => openEditEntry(e)} className="text-[10px] px-2 py-1.5 border rounded font-bold" style={{ borderColor: PALETTE.linhasBordas, color: PALETTE.textoPrincipal }}>Editar</button>
        <button type="button" aria-label="Excluir lançamento" onClick={() => remove(e.id)} className="text-[10px] px-2 py-1.5 border rounded font-bold" style={{ borderColor: PALETTE.linhasBordas, color: PALETTE.descontos }}>Excluir</button>
      </div>
    </div>
  );

  const renderFluxo = () => (
      <section className={card} style={cardStyle}>
        <h4 className="font-serif font-bold text-base" style={{ color: PALETTE.textoPrincipal }}>Entradas e saídas previstas (30, 60 e 90 dias)</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs" style={{ color: PALETTE.textoPrincipal }}>
            <thead><tr style={{ color: PALETTE.textoApoio }} className="text-left text-[10px] uppercase tracking-wider"><th className="py-2 pr-3">Período</th><th className="py-2 pr-3 text-right">Entradas previstas</th><th className="py-2 pr-3 text-right">Saídas previstas</th><th className="py-2 pr-3 text-right">Resultado do período</th><th className="py-2 text-right">Saldo projetado</th></tr></thead>
            <tbody>
              <tr className="border-t" style={{ borderColor: PALETTE.linhasBordas }}><td className="py-2 pr-3 font-semibold">Saldo atual</td><td /><td /><td /><td className="py-2 text-right font-mono font-bold">{brl(flow.saldoAtual)}</td></tr>
              {flow.rows.map((r: any) => (
                <tr key={r.label} className="border-t" style={{ borderColor: PALETTE.linhasBordas }}>
                  <td className="py-2 pr-3 font-semibold">{r.label}</td>
                  <td className="py-2 pr-3 text-right font-mono" style={{ color: PALETTE.valoresReceber }}>{brl(r.entradas)}</td>
                  <td className="py-2 pr-3 text-right font-mono" style={{ color: PALETTE.descontos }}>{brl(r.saidas)}</td>
                  <td className="py-2 pr-3 text-right font-mono">{brl(r.saldoPeriodo)}</td>
                  <td className="py-2 text-right font-mono font-bold">{r.acumulado !== undefined ? brl(r.acumulado) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[10px]" style={{ color: PALETTE.textoApoio }}>Valores em atraso e sem vencimento aparecem à parte e não entram no saldo projetado, porque não há data certa de recebimento.</p>
      </section>
  );

  const monthKey = today.slice(0, 7);
  const own = entries.filter((e: any) => !isMemo(e));
  const recebidoMes = sum(own.filter((e: any) => isReceived(e) && dateOf(e).slice(0, 7) === monthKey));
  const openIncome = own.filter((e: any) => isOpenIncome(e) && e.category !== REIMBURSEMENT_CATEGORY);
  const devedores = (() => {
    const map = new Map<string, any>();
    openIncome.forEach((e: any) => {
      const key = norm(e.client) || norm(e.title);
      const row = map.get(key) || { name: String(e.client || e.title).trim(), total: 0, vencido: 0, primeiro: '', itens: 0 };
      row.total = r2(row.total + Number(e.amount || 0)); row.itens += 1;
      if (e.dueDate && e.dueDate < today) { row.vencido = r2(row.vencido + Number(e.amount || 0)); }
      if (e.dueDate && (!row.primeiro || e.dueDate < row.primeiro)) row.primeiro = e.dueDate;
      map.set(key, row);
    });
    return [...map.values()].sort((a, b) => (b.vencido > 0 ? 1 : 0) - (a.vencido > 0 ? 1 : 0) || String(a.primeiro || '9999').localeCompare(String(b.primeiro || '9999')));
  })();
  const proximos = entries.filter((e: any) => !isMemo(e) && (isOpenIncome(e) || isOpenExpense(e)) && e.dueDate && e.dueDate >= today).slice().sort((a: any, b: any) => String(a.dueDate).localeCompare(String(b.dueDate))).slice(0, 5);
  const cobranca = (row: any) => `Olá, ${String(row.name).split(' ')[0]}! Passando para lembrar do pagamento dos honorários: ${brl(row.total)} em aberto${row.vencido > 0 ? `, sendo ${brl(row.vencido)} já vencidos` : ''}. Se precisar combinar de outra forma, é só me avisar. Obrigada!`;

  const openEntryForm = (kind: 'Receita' | 'Despesa') => {
    setEditingId(null);
    setDraft({ title: '', kind, category: kind === 'Receita' ? 'Honorários' : 'Despesas operacionais', client: '', amount: '', dueDate: '', status: 'Pendente' });
    setIsEntryOpen(true);
  };

  const openEditEntry = (e: any) => {
    setEditingId(e.id);
    setDraft({ title: e.title || '', kind: e.kind || 'Receita', category: e.category || 'Honorários', client: e.client || '', amount: String(e.amount ?? ''), dueDate: e.dueDate || '', status: e.status || 'Pendente' });
    setIsEntryOpen(true);
  };

  const renderResumo = () => (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => openEntryForm('Receita')} className={primaryBtn} style={{ backgroundColor: PALETTE.bordoPrincipal }}>+ Registrar entrada</button>
        <button type="button" onClick={() => openEntryForm('Despesa')} className={ghostBtn} style={{ borderColor: PALETTE.linhasBordas, color: PALETTE.textoPrincipal }}>+ Registrar saída</button>
        <button type="button" onClick={() => { setPickName(''); setPickOpen(true); }} className={ghostBtn} style={{ borderColor: PALETTE.linhasBordas, color: PALETTE.textoPrincipal }}>Plano de pagamento de um cliente</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Kpi title="Recebido neste mês" value={brl(recebidoMes)} sub="Entradas já pagas neste mês" color={PALETTE.valoresReceber} />
        <Kpi title="Ainda vou receber" value={brl(summary.aReceber)} sub={summary.aReceberVencido > 0 ? `${brl(summary.aReceberVencido)} já venceram` : 'Nada vencido'} color={summary.aReceberVencido > 0 ? PALETTE.descontos : PALETTE.textoPrincipal} />
        <Kpi title="Saldo do escritório" value={brl(summary.saldo)} sub="Tudo que entrou menos o que saiu" />
      </div>

      <section className={card} style={cardStyle}>
        <div>
          <h4 className="font-serif font-bold text-base" style={{ color: PALETTE.textoPrincipal }}>Quem me deve</h4>
          <p className="text-xs mt-1" style={{ color: PALETTE.textoApoio }}>Honorários em aberto por cliente. Os vencidos aparecem primeiro.</p>
        </div>
        <div className="space-y-2">
          {devedores.map(row => (
            <div key={row.name} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg border" style={{ borderColor: row.vencido > 0 ? PALETTE.descontos : PALETTE.linhasBordas, backgroundColor: PALETTE.fundoPagina }}>
              <div className="min-w-0">
                <p className="text-sm font-bold" style={{ color: PALETTE.textoPrincipal }}>{row.name}</p>
                <p className="text-[11px] mt-0.5" style={{ color: row.vencido > 0 ? PALETTE.descontos : PALETTE.textoApoio }}>{row.vencido > 0 ? `${brl(row.vencido)} vencido · ` : ''}{row.itens} parcela{row.itens === 1 ? '' : 's'}{row.primeiro ? ` · próxima em ${fmtDate(row.primeiro)}` : ''}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="w-[130px] text-right text-sm font-bold font-mono whitespace-nowrap" style={{ color: PALETTE.valoresReceber }}>+ {brl(row.total)}</span>
                <button type="button" onClick={() => notify(copyText(cobranca(row)) ? 'Mensagem de cobrança copiada. Cole no WhatsApp.' : 'Não foi possível copiar.')} className={ghostBtn} style={{ borderColor: PALETTE.linhasBordas, color: PALETTE.textoPrincipal }}>Copiar cobrança</button>
              </div>
            </div>
          ))}
          {devedores.length === 0 && <p className="text-xs text-center py-5" style={{ color: PALETTE.textoApoio }}>Ninguém deve nada no momento.</p>}
        </div>
      </section>

      <section className={card} style={cardStyle}>
        <h4 className="font-serif font-bold text-base" style={{ color: PALETTE.textoPrincipal }}>Próximos vencimentos</h4>
        <div className="space-y-2">
          {proximos.map((e: any) => <EntryRow key={e.id} e={e} />)}
          {proximos.length === 0 && <p className="text-xs text-center py-5" style={{ color: PALETTE.textoApoio }}>Nada a vencer nos próximos dias.</p>}
        </div>
      </section>
    </div>
  );

  const renderLancamentos = () => (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-xs" style={{ color: PALETTE.textoApoio }}>Todas as entradas e saídas do escritório, da mais próxima de vencer para a mais distante.</p>
        <div className="flex gap-2">
          <button type="button" onClick={() => openEntryForm('Receita')} className={primaryBtn} style={{ backgroundColor: PALETTE.bordoPrincipal }}>+ Registrar entrada</button>
          <button type="button" onClick={() => openEntryForm('Despesa')} className={ghostBtn} style={{ borderColor: PALETTE.linhasBordas, color: PALETTE.textoPrincipal }}>+ Registrar saída</button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        <input aria-label="Buscar lançamento" placeholder="Buscar por descrição, cliente ou categoria" value={filterText} onChange={e => setFilterText(e.target.value)} className="p-2 border rounded-lg text-xs flex-1 min-w-[200px]" style={inputStyle} />
        <select aria-label="Filtrar por status" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="p-2 border rounded-lg text-xs" style={inputStyle}><option>Todos</option><option>Pendente</option><option>Recebido</option><option>Pago</option><option>Atrasado</option></select>
      </div>
      <div className="space-y-2">
        {visibleEntries.map(e => <EntryRow key={e.id} e={e} />)}
        {visibleEntries.length === 0 && <p className="text-xs text-center py-6" style={{ color: PALETTE.textoApoio }}>Nenhum lançamento encontrado.</p>}
      </div>
    </div>
  );

  const renderEntryModal = () => !isEntryOpen ? null : (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-6 overflow-y-auto" style={{ backgroundColor: 'rgba(17,24,39,0.55)' }} role="dialog" aria-modal="true" aria-label={editingId ? 'Editar lançamento' : draft.kind === 'Receita' ? 'Registrar entrada' : 'Registrar saída'} onMouseDown={e => { if (e.target === e.currentTarget) setIsEntryOpen(false); }}>
      <form onSubmit={submitDraft} className="w-full max-w-lg rounded-2xl shadow-2xl p-5 space-y-3 my-auto" style={{ backgroundColor: PALETTE.fundoCartoes }}>
        <div className="flex items-start justify-between gap-3 border-b pb-3" style={{ borderColor: PALETTE.linhasBordas }}>
          <div>
            <h4 className="font-serif font-bold text-lg" style={{ color: PALETTE.textoPrincipal }}>{editingId ? 'Editar lançamento' : draft.kind === 'Receita' ? 'Registrar entrada' : 'Registrar saída'}</h4>
            <p className="text-xs mt-0.5" style={{ color: PALETTE.textoApoio }}>{draft.kind === 'Receita' ? 'Dinheiro que você recebeu ou vai receber.' : 'Dinheiro que você pagou ou vai pagar.'}</p>
          </div>
          <button type="button" onClick={() => { setIsEntryOpen(false); setEditingId(null); }} aria-label="Fechar" className="px-2 py-1 rounded-lg hover:bg-black/5 text-lg leading-none" style={{ color: PALETTE.textoPrincipal }}>×</button>
        </div>
        <input required aria-label="Descrição do lançamento" placeholder={draft.kind === 'Receita' ? 'O que é? (ex.: honorários, 1ª parcela)' : 'O que é? (ex.: custas, internet)'} value={draft.title} onChange={e => setDraft(p => ({ ...p, title: e.target.value }))} className={input} style={inputStyle} />
        <input list="fin-clientes" aria-label="Cliente" placeholder="Cliente (se for de algum)" value={draft.client} onChange={e => setDraft(p => ({ ...p, client: e.target.value }))} className={input} style={inputStyle} />
        <div className="grid grid-cols-2 gap-3">
          <input required min="0.01" step="0.01" type="number" aria-label="Valor" placeholder="Valor em R$" value={draft.amount} onChange={e => setDraft(p => ({ ...p, amount: e.target.value }))} className={input} style={inputStyle} />
          <input type="date" aria-label="Vencimento" value={draft.dueDate} onChange={e => setDraft(p => ({ ...p, dueDate: e.target.value }))} className={input} style={inputStyle} />
        </div>
        <label className="flex items-center gap-2 text-xs font-semibold" style={{ color: PALETTE.textoPrincipal }}>
          <input type="checkbox" checked={draft.status === 'Recebido' || draft.status === 'Pago'} onChange={e => setDraft(p => ({ ...p, status: e.target.checked ? (p.kind === 'Receita' ? 'Recebido' : 'Pago') : 'Pendente' }))} />
          {draft.kind === 'Receita' ? 'Já recebi' : 'Já paguei'}
        </label>
        <details>
          <summary className="text-[11px] font-bold cursor-pointer" style={{ color: PALETTE.textoApoio }}>Mais opções (categoria)</summary>
          <select aria-label="Categoria" value={draft.category} onChange={e => setDraft(p => ({ ...p, category: e.target.value }))} className={`${input} mt-2`} style={inputStyle}><option>Honorários</option><option>Custas processuais</option><option>Despesas do processo</option><option>Despesas operacionais</option><option>Consultoria</option><option>Outros</option></select>
        </details>
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={() => { setIsEntryOpen(false); setEditingId(null); }} className={ghostBtn} style={{ borderColor: PALETTE.linhasBordas, color: PALETTE.textoPrincipal }}>Cancelar</button>
          <button type="submit" className={primaryBtn} style={{ backgroundColor: PALETTE.bordoPrincipal }}>Salvar</button>
        </div>
      </form>
    </div>
  );

  const renderPicker = () => !pickOpen ? null : (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3" style={{ backgroundColor: 'rgba(17,24,39,0.55)' }} role="dialog" aria-modal="true" aria-label="Escolher cliente" onMouseDown={e => { if (e.target === e.currentTarget) setPickOpen(false); }}>
      <form onSubmit={e => { e.preventDefault(); if (!pickName.trim()) return; setPickOpen(false); openClientFinance ? openClientFinance(pickName.trim()) : promptInstallments(pickName.trim()); }} className="w-full max-w-sm rounded-2xl shadow-2xl p-5 space-y-3" style={{ backgroundColor: PALETTE.fundoCartoes }}>
        <h4 className="font-serif font-bold text-lg" style={{ color: PALETTE.textoPrincipal }}>De qual cliente?</h4>
        <input autoFocus list="fin-clientes" aria-label="Cliente" placeholder="Digite ou escolha o cliente" value={pickName} onChange={e => setPickName(e.target.value)} className={input} style={inputStyle} />
        <div className="flex justify-end gap-2"><button type="button" onClick={() => setPickOpen(false)} className={ghostBtn} style={{ borderColor: PALETTE.linhasBordas, color: PALETTE.textoPrincipal }}>Cancelar</button><button type="submit" className={primaryBtn} style={{ backgroundColor: PALETTE.bordoPrincipal }}>Abrir</button></div>
      </form>
    </div>
  );

  const ADV_ITEMS: [NonNullable<typeof adv>, string, string][] = [
    ['honorarios', 'Honorários por processo', 'Contratual, de êxito e sucumbência de cada processo, com nota fiscal e boleto.'],
    ['custas', 'Custas e reembolsos', 'O que o escritório adiantou e precisa cobrar de volta do cliente.'],
    ['alvaras', 'Alvarás e repasses', 'Alvará recebido, parte do escritório e repasse ao cliente.']
  ];
  const renderMais = () => adv === null ? (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {ADV_ITEMS.map(([k, name, desc]) => (
        <button key={k} type="button" onClick={() => setAdv(k)} className="text-left p-4 rounded-xl border transition hover:shadow-sm" style={cardStyle}>
          <span className="block text-sm font-bold" style={{ color: PALETTE.textoPrincipal }}>{name}</span>
          <span className="block text-xs mt-1" style={{ color: PALETTE.textoApoio }}>{desc}</span>
        </button>
      ))}
    </div>
  ) : (
    <div className="space-y-4">
      <button type="button" onClick={() => setAdv(null)} className="text-xs font-bold hover:underline" style={{ color: PALETTE.bordoPrincipal }}>← Voltar para Mais ferramentas</button>
      {adv === 'honorarios' && renderHonorarios()}
      {adv === 'custas' && renderCustas()}
      {adv === 'alvaras' && renderAlvaras()}
    </div>
  );

  // ----------------------------- Honorários -----------------------------
  const [fee, setFee] = useState({ processNumber: '', client: '', feeType: 'Contratual', title: '', amount: '', dueDate: '', status: 'Pendente' });
  const [feeFilter, setFeeFilter] = useState('Todos');
  const fees = entries.filter(isFee);
  const feeOf = (e: any) => e.feeType || 'Contratual';
  const submitFee = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!fee.client.trim() || Number(fee.amount) <= 0) { window.alert('Informe o cliente e um valor maior que zero.'); return; }
    const done = fee.status === 'Recebido' || fee.status === 'Pago';
    add([{
      title: fee.title.trim() || `Honorários ${fee.feeType.toLowerCase()} · ${fee.client.trim()}`,
      kind: 'Receita', category: 'Honorários', feeType: fee.feeType, client: fee.client.trim(), process: fee.processNumber || undefined,
      amount: Number(fee.amount), dueDate: fee.dueDate, status: fee.status, paidAt: done ? today : undefined, docStatus: 'Sem documento'
    }]);
    setFee(p => ({ ...p, title: '', amount: '', dueDate: '' }));
    notify('Honorários cadastrados.');
  };
  const feeCards = FEE_TYPES.map(t => {
    const list = fees.filter(e => feeOf(e) === t);
    return { t, total: sum(list), recebido: sum(list.filter(isReceived)), aberto: sum(list.filter(isOpenIncome)), vencido: sum(list.filter(e => isOpenIncome(e) && e.dueDate && e.dueDate < today)) };
  });
  const receivedWithoutDoc = fees.filter(e => isReceived(e) && (!e.docStatus || e.docStatus === 'Sem documento' || e.docStatus === 'NF a emitir'));
  const renderHonorarios = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {feeCards.map(c => (
          <div key={c.t} className="p-4 rounded-xl border shadow-sm space-y-1" style={cardStyle}>
            <span className={label} style={{ color: PALETTE.textoApoio }}>Honorários {c.t === 'Contratual' ? 'contratuais' : c.t === 'Êxito' ? 'de êxito' : 'de sucumbência'}</span>
            <p className="text-lg font-bold font-mono" style={{ color: PALETTE.textoPrincipal }}>{brl(c.total)}</p>
            <p className="text-[10px]" style={{ color: PALETTE.textoApoio }}>Recebido {brl(c.recebido)} · Em aberto {brl(c.aberto)}{c.vencido > 0 ? ` (${brl(c.vencido)} vencidos)` : ''}</p>
          </div>
        ))}
      </div>
      {receivedWithoutDoc.length > 0 && (
        <div role="alert" className="p-3 rounded-xl border text-xs" style={{ borderColor: PALETTE.descontos, color: PALETTE.descontos, backgroundColor: PALETTE.fundoCartoes }}>
          Atenção: {receivedWithoutDoc.length} honorário{receivedWithoutDoc.length === 1 ? '' : 's'} recebido{receivedWithoutDoc.length === 1 ? '' : 's'} sem nota fiscal emitida ({brl(sum(receivedWithoutDoc))}). Atualize o campo "Documento fiscal" abaixo.
        </div>
      )}
      <section className={card} style={cardStyle}>
        <h4 className="font-serif font-bold text-base" style={{ color: PALETTE.textoPrincipal }}>Novo honorário</h4>
        <form onSubmit={submitFee} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <select aria-label="Processo" value={fee.processNumber} onChange={e => { const p = processByNumber(e.target.value); setFee(f => ({ ...f, processNumber: e.target.value, client: p?.client || f.client })); }} className={input} style={inputStyle}>
            <option value="">Processo (opcional)</option>{processes.map((p: any) => <option key={p.id} value={p.number}>{processLabel(p)}</option>)}
          </select>
          <input list="fin-clientes" required aria-label="Cliente" placeholder="Cliente" value={fee.client} onChange={e => setFee(f => ({ ...f, client: e.target.value }))} className={input} style={inputStyle} />
          <select aria-label="Tipo de honorário" value={fee.feeType} onChange={e => setFee(f => ({ ...f, feeType: e.target.value }))} className={input} style={inputStyle}>{FEE_TYPES.map(t => <option key={t}>{t}</option>)}</select>
          <input aria-label="Descrição" placeholder="Descrição (opcional)" value={fee.title} onChange={e => setFee(f => ({ ...f, title: e.target.value }))} className={input} style={inputStyle} />
          <input required type="number" min="0.01" step="0.01" aria-label="Valor" placeholder="Valor em R$" value={fee.amount} onChange={e => setFee(f => ({ ...f, amount: e.target.value }))} className={input} style={inputStyle} />
          <input type="date" aria-label="Vencimento" value={fee.dueDate} onChange={e => setFee(f => ({ ...f, dueDate: e.target.value }))} className={input} style={inputStyle} />
          <select aria-label="Status" value={fee.status} onChange={e => setFee(f => ({ ...f, status: e.target.value }))} className={input} style={inputStyle}><option>Pendente</option><option>Recebido</option><option>Atrasado</option></select>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => promptInstallments(fee.client)} className={ghostBtn} style={{ borderColor: PALETTE.linhasBordas, color: PALETTE.textoPrincipal }}>Gerar parcelas</button>
            <button type="submit" className={primaryBtn} style={{ backgroundColor: PALETTE.bordoPrincipal }}>Adicionar</button>
          </div>
        </form>
      </section>
      <section className={card} style={cardStyle}>
        <div className="flex flex-wrap justify-between items-center gap-2">
          <h4 className="font-serif font-bold text-base" style={{ color: PALETTE.textoPrincipal }}>Honorários cadastrados</h4>
          <select aria-label="Filtrar honorários" value={feeFilter} onChange={e => setFeeFilter(e.target.value)} className="p-2 border rounded-lg text-xs" style={inputStyle}><option>Todos</option>{FEE_TYPES.map(t => <option key={t}>{t}</option>)}</select>
        </div>
        <div className="space-y-2">
          {fees.filter(e => feeFilter === 'Todos' || feeOf(e) === feeFilter).sort((a, b) => String(a.dueDate || '9999').localeCompare(String(b.dueDate || '9999'))).map(e => (
            <EntryRow key={e.id} e={{ ...e, feeType: feeOf(e) }} extra={
              <>
                <select aria-label="Documento fiscal" value={e.docStatus || 'Sem documento'} onChange={ev => update(e.id, { docStatus: ev.target.value })} className="text-[10px] p-1.5 border rounded" style={inputStyle}>{DOC_STATUS.map(d => <option key={d}>{d}</option>)}</select>
                <input aria-label="Número da NF ou boleto" placeholder="Nº NF/boleto" value={e.docNumber || ''} onChange={ev => update(e.id, { docNumber: ev.target.value })} className="text-[10px] p-1.5 border rounded w-24" style={inputStyle} />
              </>
            } />
          ))}
          {fees.length === 0 && <p className="text-xs text-center py-6" style={{ color: PALETTE.textoApoio }}>Nenhum honorário cadastrado.</p>}
        </div>
      </section>
    </div>
  );

  // ----------------------------- Custas e reembolsos -----------------------------
  const [cost, setCost] = useState({ processNumber: '', client: '', category: 'Custas processuais', title: '', amount: '', date: today, reimbursable: true });
  const costs = entries.filter(e => e.kind === 'Despesa' && PROCESS_COST_CATEGORIES.includes(e.category) && !isMemo(e));
  const reimbStatus = (e: any) => e.reimb || (e.reimbursable === false ? 'Não reembolsável' : 'A reembolsar');
  const submitCost = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!cost.client.trim() || Number(cost.amount) <= 0) { window.alert('Informe o cliente e um valor maior que zero.'); return; }
    add([{
      title: cost.title.trim() || `${cost.category} · ${cost.client.trim()}`, kind: 'Despesa', category: cost.category, client: cost.client.trim(), process: cost.processNumber || undefined,
      amount: Number(cost.amount), dueDate: cost.date, status: 'Pago', paidAt: cost.date, reimbursable: cost.reimbursable, reimb: cost.reimbursable ? 'A reembolsar' : 'Não reembolsável'
    }]);
    setCost(c => ({ ...c, title: '', amount: '' }));
    notify('Despesa registrada.');
  };
  const setReimb = (e: any, status: string) => {
    setEntries((prev: any[]) => {
      let next = prev.map(x => x.id === e.id ? { ...x, reimb: status, reimbursable: status !== 'Não reembolsável' } : x).filter(x => !(x.linkedTo === e.id));
      if (status === 'Reembolsado') {
        next = [{ id: newId(), createdAt: new Date().toISOString(), title: `Reembolso · ${e.title}`, kind: 'Receita', category: REIMBURSEMENT_CATEGORY, client: e.client, process: e.process, amount: Number(e.amount || 0), dueDate: todayLocal(), status: 'Recebido', paidAt: todayLocal(), linkedTo: e.id }, ...next];
      }
      return next;
    });
  };
  const reimbByClient = useMemo(() => {
    const map = new Map<string, any>();
    costs.forEach(e => {
      const key = norm(e.client) || '(sem cliente)';
      const row = map.get(key) || { client: e.client || '(sem cliente)', adiantado: 0, reembolsado: 0, aReembolsar: 0, itens: [] as any[] };
      const st = reimbStatus(e);
      if (st !== 'Não reembolsável') {
        row.adiantado = r2(row.adiantado + Number(e.amount || 0));
        if (st === 'Reembolsado') row.reembolsado = r2(row.reembolsado + Number(e.amount || 0)); else { row.aReembolsar = r2(row.aReembolsar + Number(e.amount || 0)); row.itens.push(e); }
      }
      map.set(key, row);
    });
    return [...map.values()].filter(r => r.adiantado > 0).sort((a, b) => b.aReembolsar - a.aReembolsar);
  }, [costs]);
  const billingText = (row: any) => [
    `Prezado(a) ${row.client},`, '',
    `Segue o demonstrativo das custas e despesas adiantadas pelo escritório ${officeSettings?.officeName || 'Valeska Monteiro Advocacia'} para o seu caso, pendentes de reembolso:`, '',
    ...row.itens.map((e: any) => `- ${fmtDate(e.dueDate)} · ${e.title}${e.process ? ' (Proc. ' + e.process + ')' : ''}: ${brl(e.amount)}`), '',
    `Total a reembolsar: ${brl(row.aReembolsar)}`, '',
    'Fico à disposição para qualquer esclarecimento.', 'Dra. Valeska Monteiro, OAB/ES 41.715'
  ].join('\n');
  const renderCustas = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Kpi title="Adiantado pelo escritório" value={brl(sum(reimbByClient.map(r => ({ amount: r.adiantado }))))} sub="Custas e despesas reembolsáveis" />
        <Kpi title="Já reembolsado" value={brl(sum(reimbByClient.map(r => ({ amount: r.reembolsado }))))} color={PALETTE.valoresReceber} />
        <Kpi title="A reembolsar" value={brl(sum(reimbByClient.map(r => ({ amount: r.aReembolsar }))))} color={PALETTE.descontos} />
      </div>
      <section className={card} style={cardStyle}>
        <h4 className="font-serif font-bold text-base" style={{ color: PALETTE.textoPrincipal }}>Painel de reembolso por cliente</h4>
        <div className="space-y-2">
          {reimbByClient.map(row => (
            <div key={row.client} className="flex flex-col md:flex-row md:items-center justify-between gap-2 p-3 rounded-lg border" style={{ borderColor: PALETTE.linhasBordas, backgroundColor: PALETTE.fundoPagina }}>
              <div><p className="text-xs font-bold" style={{ color: PALETTE.textoPrincipal }}>{row.client}</p><p className="text-[10px]" style={{ color: PALETTE.textoApoio }}>Adiantado {brl(row.adiantado)} · Reembolsado {brl(row.reembolsado)} · A reembolsar {brl(row.aReembolsar)}</p></div>
              {row.aReembolsar > 0 && <button type="button" onClick={() => notify(copyText(billingText(row)) ? 'Demonstrativo de cobrança copiado. Cole no WhatsApp ou e-mail.' : 'Não foi possível copiar.')} className={ghostBtn} style={{ borderColor: PALETTE.linhasBordas, color: PALETTE.textoPrincipal }}>Copiar cobrança</button>}
            </div>
          ))}
          {reimbByClient.length === 0 && <p className="text-xs text-center py-4" style={{ color: PALETTE.textoApoio }}>Nenhuma despesa reembolsável registrada.</p>}
        </div>
      </section>
      <section className={card} style={cardStyle}>
        <h4 className="font-serif font-bold text-base" style={{ color: PALETTE.textoPrincipal }}>Registrar custa ou despesa do processo</h4>
        <form onSubmit={submitCost} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <select aria-label="Processo" value={cost.processNumber} onChange={e => { const p = processByNumber(e.target.value); setCost(c => ({ ...c, processNumber: e.target.value, client: p?.client || c.client })); }} className={input} style={inputStyle}><option value="">Processo (opcional)</option>{processes.map((p: any) => <option key={p.id} value={p.number}>{processLabel(p)}</option>)}</select>
          <input list="fin-clientes" required aria-label="Cliente" placeholder="Cliente" value={cost.client} onChange={e => setCost(c => ({ ...c, client: e.target.value }))} className={input} style={inputStyle} />
          <select aria-label="Categoria da despesa" value={cost.category} onChange={e => setCost(c => ({ ...c, category: e.target.value }))} className={input} style={inputStyle}>{PROCESS_COST_CATEGORIES.map(c => <option key={c}>{c}</option>)}</select>
          <input aria-label="Descrição" placeholder="Descrição (opcional)" value={cost.title} onChange={e => setCost(c => ({ ...c, title: e.target.value }))} className={input} style={inputStyle} />
          <input required type="number" min="0.01" step="0.01" aria-label="Valor" placeholder="Valor em R$" value={cost.amount} onChange={e => setCost(c => ({ ...c, amount: e.target.value }))} className={input} style={inputStyle} />
          <input type="date" aria-label="Data do pagamento" value={cost.date} onChange={e => setCost(c => ({ ...c, date: e.target.value }))} className={input} style={inputStyle} />
          <label className="flex items-center gap-2 text-xs" style={{ color: PALETTE.textoPrincipal }}><input type="checkbox" checked={cost.reimbursable} onChange={e => setCost(c => ({ ...c, reimbursable: e.target.checked }))} /> Reembolsável pelo cliente</label>
          <div className="flex justify-end"><button type="submit" className={primaryBtn} style={{ backgroundColor: PALETTE.bordoPrincipal }}>Registrar</button></div>
        </form>
        <div className="space-y-2">
          {costs.slice().sort((a, b) => String(b.dueDate || '').localeCompare(String(a.dueDate || ''))).map(e => (
            <div key={e.id} className="flex flex-col md:flex-row md:items-center justify-between gap-2 p-3 rounded-lg border" style={{ borderColor: PALETTE.linhasBordas, backgroundColor: PALETTE.fundoPagina }}>
              <div className="min-w-0"><p className="text-xs font-bold" style={{ color: PALETTE.textoPrincipal }}>{e.title}</p><p className="text-[10px] mt-1" style={{ color: PALETTE.textoApoio }}>{e.category}{e.client ? ` · ${e.client}` : ''}{e.process ? ` · Proc. ${e.process}` : ''} · {fmtDate(e.dueDate)}</p></div>
              <div className="flex items-center gap-2"><span className="w-[130px] text-right text-sm font-bold font-mono whitespace-nowrap" style={{ color: PALETTE.descontos }}>− {brl(e.amount)}</span>
                <select aria-label="Situação do reembolso" value={reimbStatus(e)} onChange={ev => setReimb(e, ev.target.value)} className="text-[10px] p-1.5 border rounded" style={inputStyle}><option>A reembolsar</option><option>Reembolsado</option><option>Não reembolsável</option></select>
                <button type="button" aria-label="Excluir despesa" onClick={() => remove(e.id)} className="text-[10px] px-2 py-1.5 border rounded font-bold" style={{ borderColor: PALETTE.linhasBordas, color: PALETTE.descontos }}>Excluir</button></div>
            </div>
          ))}
          {costs.length === 0 && <p className="text-xs text-center py-4" style={{ color: PALETTE.textoApoio }}>Nenhuma custa ou despesa de processo registrada.</p>}
        </div>
      </section>
    </div>
  );

  // ----------------------------- Alvarás, repasses e depósitos -----------------------------
  const [calc, setCalc] = useState({ processNumber: '', client: '', gross: '', pct: '20', deductReimb: true, other: '' });
  const calcResult = useMemo(() => {
    const gross = Number(calc.gross) || 0, pct = Number(calc.pct) || 0, other = Number(calc.other) || 0;
    const honorarios = r2(gross * pct / 100);
    const pending = calc.deductReimb && calc.client.trim() ? costs.filter(e => norm(e.client) === norm(calc.client) && reimbStatus(e) === 'A reembolsar') : [];
    const reimb = sum(pending);
    return { gross, honorarios, reimb, pending, other, liquid: r2(gross - honorarios - reimb - other) };
  }, [calc, costs]);
  const registerPayout = () => {
    if (!calc.client.trim() || calcResult.gross <= 0) { window.alert('Informe o cliente e o valor do alvará.'); return; }
    if (calcResult.liquid < 0) { window.alert('Os descontos superam o valor do alvará. Revise os percentuais e valores antes de registrar.'); return; }
    const resumo = `Alvará: ${brl(calcResult.gross)}\nHonorários (${calc.pct}%): ${brl(calcResult.honorarios)}\nReembolso de custas: ${brl(calcResult.reimb)}\nOutros descontos: ${brl(calcResult.other)}\nRepasse líquido ao cliente: ${brl(calcResult.liquid)}\n\nRegistrar estes lançamentos?`;
    if (!window.confirm(resumo)) return;
    const base = { client: calc.client.trim(), process: calc.processNumber || undefined };
    const items: any[] = [
      { ...base, title: `Alvará/levantamento · ${base.client}`, kind: 'Receita', category: 'Alvará', memo: true, amount: calcResult.gross, dueDate: today, status: 'Recebido', paidAt: today, alvaraStatus: 'Levantado' },
      { ...base, title: `Honorários de êxito · ${base.client}`, kind: 'Receita', category: 'Honorários', feeType: 'Êxito', amount: calcResult.honorarios, dueDate: today, status: 'Recebido', paidAt: today, docStatus: 'NF a emitir' },
      { ...base, title: `Repasse ao cliente · ${base.client}`, kind: 'Despesa', category: 'Repasse ao cliente', memo: true, amount: calcResult.liquid, dueDate: today, status: 'Pendente' }
    ].filter(i => i.amount > 0);
    setEntries((prev: any[]) => {
      let next = [...prev];
      calcResult.pending.forEach((e: any) => {
        next = next.map(x => x.id === e.id ? { ...x, reimb: 'Reembolsado' } : x);
        items.push({ title: `Reembolso · ${e.title}`, kind: 'Receita', category: REIMBURSEMENT_CATEGORY, client: e.client, process: e.process, amount: Number(e.amount || 0), dueDate: today, status: 'Recebido', paidAt: today, linkedTo: e.id });
      });
      return [...items.map(it => ({ createdAt: new Date().toISOString(), ...it, id: newId() })), ...next];
    });
    setCalc({ processNumber: '', client: '', gross: '', pct: calc.pct, deductReimb: true, other: '' });
    notify('Alvará, honorários, reembolsos e repasse registrados.');
  };
  const [dep, setDep] = useState({ processNumber: '', client: '', amount: '', date: today, kind: 'Depósito judicial' });
  const submitDeposit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!dep.client.trim() || Number(dep.amount) <= 0) { window.alert('Informe o cliente e um valor maior que zero.'); return; }
    add([{ title: `${dep.kind} · ${dep.client.trim()}`, kind: 'Receita', category: 'Depósito judicial', memo: true, depositKind: dep.kind, client: dep.client.trim(), process: dep.processNumber || undefined, amount: Number(dep.amount), dueDate: dep.date, status: 'Pendente', depositStatus: 'Em depósito' }]);
    setDep(d => ({ ...d, amount: '' }));
    notify('Depósito registrado.');
  };
  const alvaras = entries.filter(e => e.category === 'Alvará');
  const repasses = entries.filter(e => e.category === 'Repasse ao cliente');
  const depositos = entries.filter(e => e.category === 'Depósito judicial');
  const renderAlvaras = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Kpi title="Alvarás levantados" value={brl(sum(alvaras))} sub={`${alvaras.length} registro(s)`} />
        <Kpi title="Repasses pendentes ao cliente" value={brl(sum(repasses.filter(e => e.status !== 'Pago')))} color={PALETTE.descontos} />
        <Kpi title="Depósitos judiciais em aberto" value={brl(sum(depositos.filter(e => (e.depositStatus || 'Em depósito') === 'Em depósito')))} />
      </div>
      <p className="text-[10px]" style={{ color: PALETTE.textoApoio }}>Alvarás, depósitos e repasses são valores de terceiros: aparecem aqui e no extrato do cliente, mas não entram no saldo nem no DRE do escritório.</p>
      <section className={card} style={cardStyle}>
        <h4 className="font-serif font-bold text-base" style={{ color: PALETTE.textoPrincipal }}>Calculadora de repasses</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <select aria-label="Processo" value={calc.processNumber} onChange={e => { const p = processByNumber(e.target.value); setCalc(c => ({ ...c, processNumber: e.target.value, client: p?.client || c.client })); }} className={input} style={inputStyle}><option value="">Processo (opcional)</option>{processes.map((p: any) => <option key={p.id} value={p.number}>{processLabel(p)}</option>)}</select>
          <input list="fin-clientes" aria-label="Cliente" placeholder="Cliente" value={calc.client} onChange={e => setCalc(c => ({ ...c, client: e.target.value }))} className={input} style={inputStyle} />
          <input type="number" min="0" step="0.01" aria-label="Valor do alvará" placeholder="Valor do alvará (R$)" value={calc.gross} onChange={e => setCalc(c => ({ ...c, gross: e.target.value }))} className={input} style={inputStyle} />
          <input type="number" min="0" max="100" step="0.01" aria-label="Percentual de honorários" placeholder="% honorários de êxito" value={calc.pct} onChange={e => setCalc(c => ({ ...c, pct: e.target.value }))} className={input} style={inputStyle} />
          <input type="number" min="0" step="0.01" aria-label="Outros descontos" placeholder="Outros descontos (R$)" value={calc.other} onChange={e => setCalc(c => ({ ...c, other: e.target.value }))} className={input} style={inputStyle} />
          <label className="flex items-center gap-2 text-xs md:col-span-2" style={{ color: PALETTE.textoPrincipal }}><input type="checkbox" checked={calc.deductReimb} onChange={e => setCalc(c => ({ ...c, deductReimb: e.target.checked }))} /> Descontar custas adiantadas ainda não reembolsadas do cliente</label>
          <div className="flex justify-end"><button type="button" onClick={registerPayout} className={primaryBtn} style={{ backgroundColor: PALETTE.bordoPrincipal }}>Registrar alvará e repasse</button></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2" data-testid="calc-result">
          {[['Valor do alvará', calcResult.gross], ['Honorários', calcResult.honorarios], ['Reembolso de custas', calcResult.reimb], ['Outros descontos', calcResult.other], ['Repasse líquido ao cliente', calcResult.liquid]].map(([t, v]: any) => (
            <div key={t} className="p-3 rounded-lg border" style={{ borderColor: PALETTE.linhasBordas, backgroundColor: PALETTE.fundoPagina }}><span className={label} style={{ color: PALETTE.textoApoio }}>{t}</span><p className="text-sm font-bold font-mono" style={{ color: t === 'Repasse líquido ao cliente' ? (calcResult.liquid < 0 ? PALETTE.descontos : PALETTE.valoresReceber) : PALETTE.textoPrincipal }}>{brl(v)}</p></div>
          ))}
        </div>
      </section>
      <section className={card} style={cardStyle}>
        <h4 className="font-serif font-bold text-base" style={{ color: PALETTE.textoPrincipal }}>Alvarás e repasses</h4>
        <div className="space-y-2">
          {[...alvaras, ...repasses].sort((a, b) => String(b.dueDate || '').localeCompare(String(a.dueDate || ''))).map(e => (
            <EntryRow key={e.id} e={e} extra={e.category === 'Alvará' ? <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ backgroundColor: `${PALETTE.valoresReceber}22`, color: PALETTE.valoresReceber }}>{e.alvaraStatus || 'Levantado'}</span> : null} />
          ))}
          {alvaras.length + repasses.length === 0 && <p className="text-xs text-center py-4" style={{ color: PALETTE.textoApoio }}>Nenhum alvará ou repasse registrado.</p>}
        </div>
      </section>
      <section className={card} style={cardStyle}>
        <h4 className="font-serif font-bold text-base" style={{ color: PALETTE.textoPrincipal }}>Depósitos judiciais</h4>
        <form onSubmit={submitDeposit} className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <select aria-label="Processo" value={dep.processNumber} onChange={e => { const p = processByNumber(e.target.value); setDep(d => ({ ...d, processNumber: e.target.value, client: p?.client || d.client })); }} className={input} style={inputStyle}><option value="">Processo (opcional)</option>{processes.map((p: any) => <option key={p.id} value={p.number}>{processLabel(p)}</option>)}</select>
          <input list="fin-clientes" required aria-label="Cliente" placeholder="Cliente" value={dep.client} onChange={e => setDep(d => ({ ...d, client: e.target.value }))} className={input} style={inputStyle} />
          <select aria-label="Tipo de depósito" value={dep.kind} onChange={e => setDep(d => ({ ...d, kind: e.target.value }))} className={input} style={inputStyle}><option>Depósito judicial</option><option>Depósito recursal</option><option>Caução</option></select>
          <input required type="number" min="0.01" step="0.01" aria-label="Valor" placeholder="Valor em R$" value={dep.amount} onChange={e => setDep(d => ({ ...d, amount: e.target.value }))} className={input} style={inputStyle} />
          <button type="submit" className={primaryBtn} style={{ backgroundColor: PALETTE.bordoPrincipal }}>Registrar</button>
        </form>
        <div className="space-y-2">
          {depositos.map(e => (
            <EntryRow key={e.id} e={{ ...e, status: e.status }} extra={<select aria-label="Situação do depósito" value={e.depositStatus || 'Em depósito'} onChange={ev => update(e.id, { depositStatus: ev.target.value })} className="text-[10px] p-1.5 border rounded" style={inputStyle}><option>Em depósito</option><option>Levantado</option><option>Convertido em pagamento</option></select>} />
          ))}
          {depositos.length === 0 && <p className="text-xs text-center py-4" style={{ color: PALETTE.textoApoio }}>Nenhum depósito judicial registrado.</p>}
        </div>
      </section>
    </div>
  );

  // ----------------------------- Relatórios -----------------------------
  const [period, setPeriod] = useState(today.slice(0, 7));
  const [rentBy, setRentBy] = useState<'cliente' | 'processo'>('cliente');
  const [stmtClient, setStmtClient] = useState('');
  const [stmtFrom, setStmtFrom] = useState('');
  const [stmtTo, setStmtTo] = useState('');
  const inPeriod = (e: any) => !period || String(dateOf(e)).startsWith(period);

  const dre = useMemo(() => {
    const own = entries.filter(e => !isMemo(e));
    const rec = own.filter(e => isReceived(e) && e.category !== REIMBURSEMENT_CATEGORY && inPeriod(e));
    const byFee = FEE_TYPES.map(t => ({ label: `Honorários ${t === 'Contratual' ? 'contratuais' : t === 'Êxito' ? 'de êxito' : 'de sucumbência'}`, value: sum(rec.filter(e => isFee(e) && feeOf(e) === t)) }));
    const others = [...new Set(rec.filter(e => !isFee(e)).map(e => e.category || 'Outros'))].map(c => ({ label: c, value: sum(rec.filter(e => !isFee(e) && (e.category || 'Outros') === c)) }));
    const receitas = [...byFee, ...others].filter(l => l.value !== 0);
    const totalReceitas = sum(rec);
    const desp = own.filter(e => isPaidExpense(e) && inPeriod(e));
    const proc = desp.filter(e => PROCESS_COST_CATEGORIES.includes(e.category));
    const oper = desp.filter(e => !PROCESS_COST_CATEGORIES.includes(e.category));
    const operLines = [...new Set(oper.map(e => e.category || 'Outros'))].map(c => ({ label: c, value: sum(oper.filter(e => (e.category || 'Outros') === c)) }));
    const reembolsos = sum(own.filter(e => e.category === REIMBURSEMENT_CATEGORY && isReceived(e) && inPeriod(e)));
    const custasLiq = r2(sum(proc) - reembolsos);
    return { receitas, totalReceitas, operLines, totalOper: sum(oper), custasBruto: sum(proc), reembolsos, custasLiq, resultado: r2(totalReceitas - sum(oper) - custasLiq) };
  }, [entries, period]);

  const rent = useMemo(() => {
    const own = entries.filter(e => !isMemo(e));
    const keyOf = (e: any) => rentBy === 'processo' ? (e.process || '(sem processo)') : (e.client || '(sem cliente)');
    const labelOf = (k: string) => rentBy === 'processo' ? (processByNumber(k) ? `${k} · ${processByNumber(k).client}` : k) : k;
    const map = new Map<string, any>();
    const row = (e: any) => { const k = norm(keyOf(e)); if (!map.has(k)) map.set(k, { key: keyOf(e), recebido: 0, aberto: 0, custas: 0, reembolsos: 0 }); return map.get(k); };
    own.forEach(e => {
      if (isFee(e)) { const r = row(e); if (isReceived(e)) r.recebido = r2(r.recebido + e.amount); else if (isOpenIncome(e)) r.aberto = r2(r.aberto + e.amount); }
      else if (e.kind === 'Despesa' && PROCESS_COST_CATEGORIES.includes(e.category) && isPaidExpense(e)) row(e).custas = r2(row(e).custas + e.amount);
      else if (e.category === REIMBURSEMENT_CATEGORY && isReceived(e)) row(e).reembolsos = r2(row(e).reembolsos + e.amount);
    });
    return [...map.values()].map(r => { const liquido = r2(r.custas - r.reembolsos); const resultado = r2(r.recebido - liquido); return { ...r, label: labelOf(r.key), custasLiq: liquido, resultado, margem: r.recebido > 0 ? Math.round(resultado / r.recebido * 100) : null }; }).sort((a, b) => b.resultado - a.resultado);
  }, [entries, rentBy, processes]);

  const statement = useMemo(() => {
    if (!stmtClient.trim()) return null;
    const mine = entries.filter(e => norm(e.client) === norm(stmtClient) && (!stmtFrom || dateOf(e) >= stmtFrom) && (!stmtTo || dateOf(e) <= stmtTo));
    const f = mine.filter(isFee);
    const c = mine.filter(e => e.kind === 'Despesa' && PROCESS_COST_CATEGORIES.includes(e.category));
    const cReimb = c.filter(e => reimbStatus(e) !== 'Não reembolsável');
    const al = mine.filter(e => e.category === 'Alvará');
    const rp = mine.filter(e => e.category === 'Repasse ao cliente');
    const dp = mine.filter(e => e.category === 'Depósito judicial');
    const t = {
      honTotal: sum(f), honPago: sum(f.filter(isReceived)), honAberto: sum(f.filter(isOpenIncome)),
      cusTotal: sum(cReimb), cusReemb: sum(cReimb.filter(e => reimbStatus(e) === 'Reembolsado')), cusAberto: sum(cReimb.filter(e => reimbStatus(e) === 'A reembolsar')),
      alvara: sum(al), repassePago: sum(rp.filter(e => e.status === 'Pago')), repassePend: sum(rp.filter(e => e.status !== 'Pago')), depositos: sum(dp.filter(e => (e.depositStatus || 'Em depósito') === 'Em depósito'))
    };
    return { f, c, al, rp, dp, t, saldoDevedor: r2(t.honAberto + t.cusAberto) };
  }, [entries, stmtClient, stmtFrom, stmtTo]);

  const statementRows = () => {
    if (!statement) return [] as (string | number)[][];
    const rows: (string | number)[][] = [['Data', 'Tipo', 'Descrição', 'Processo', 'Valor (R$)', 'Situação']];
    const push = (tipo: string, list: any[], st: (e: any) => string) => list.slice().sort((a, b) => String(dateOf(a)).localeCompare(String(dateOf(b)))).forEach(e => rows.push([fmtDate(dateOf(e)), tipo, e.title, e.process || '', Number(e.amount || 0).toFixed(2).replace('.', ','), st(e)]));
    push('Honorários', statement.f, e => `${feeOf(e)} · ${e.status}`);
    push('Custas e despesas', statement.c, e => reimbStatus(e));
    push('Alvará', statement.al, e => e.alvaraStatus || 'Levantado');
    push('Repasse ao cliente', statement.rp, e => e.status);
    push('Depósito judicial', statement.dp, e => e.depositStatus || 'Em depósito');
    return rows;
  };
  const statementDocx = () => {
    if (!statement) return;
    const t = statement.t;
    const ps: DocxParagraph[] = [
      { text: 'EXTRATO DE PRESTAÇÃO DE CONTAS', bold: true, align: 'center' },
      { text: `${officeSettings?.officeName || 'Valeska Monteiro Advocacia'} · ${officeSettings?.oab || 'OAB/ES 41.715'}`, align: 'center' },
      { text: '' },
      { text: `Cliente: ${stmtClient}`, bold: true, align: 'left' },
      { text: `Emitido em ${fmtDate(today)}${stmtFrom || stmtTo ? ` · Período: ${stmtFrom ? fmtDate(stmtFrom) : 'início'} a ${stmtTo ? fmtDate(stmtTo) : 'hoje'}` : ''}`, align: 'left' },
      { text: '' },
      { text: '1. HONORÁRIOS', bold: true, align: 'left' },
      { text: `Contratados: ${brl(t.honTotal)} · Pagos: ${brl(t.honPago)} · Em aberto: ${brl(t.honAberto)}`, align: 'left' },
      ...statement.f.map(e => ({ text: `${fmtDate(e.dueDate)} · ${e.title} (${feeOf(e)}): ${brl(e.amount)} · ${e.status}`, align: 'left' as const })),
      { text: '' },
      { text: '2. CUSTAS E DESPESAS ADIANTADAS', bold: true, align: 'left' },
      { text: `Adiantadas: ${brl(t.cusTotal)} · Reembolsadas: ${brl(t.cusReemb)} · A reembolsar: ${brl(t.cusAberto)}`, align: 'left' },
      ...statement.c.map(e => ({ text: `${fmtDate(e.dueDate)} · ${e.title}: ${brl(e.amount)} · ${reimbStatus(e)}`, align: 'left' as const })),
      { text: '' },
      { text: '3. ALVARÁS, DEPÓSITOS E REPASSES', bold: true, align: 'left' },
      { text: `Alvarás levantados: ${brl(t.alvara)} · Repassado ao cliente: ${brl(t.repassePago)} · Repasse pendente: ${brl(t.repassePend)} · Depósitos em aberto: ${brl(t.depositos)}`, align: 'left' },
      ...[...statement.al, ...statement.rp, ...statement.dp].map(e => ({ text: `${fmtDate(dateOf(e))} · ${e.title}: ${brl(e.amount)}`, align: 'left' as const })),
      { text: '' },
      { text: `SALDO EM ABERTO DO CLIENTE COM O ESCRITÓRIO: ${brl(statement.saldoDevedor)}`, bold: true, align: 'left' },
      { text: '(honorários em aberto + custas a reembolsar)', italic: true, align: 'left' },
      { text: '' },
      { text: 'Serra/ES, ' + fmtDate(today) + '.', align: 'left' },
      { text: '' },
      { text: 'Dra. Valeska Monteiro', align: 'center' },
      { text: officeSettings?.oab || 'OAB/ES 41.715', align: 'center' }
    ];
    downloadDocx(`extrato-${stmtClient.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-').toLowerCase() || 'cliente'}.docx`, ps);
  };

  const renderRelatorios = () => (
    <div className="space-y-5">
      <section className={card} style={cardStyle}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="font-serif font-bold text-base" style={{ color: PALETTE.textoPrincipal }}>DRE (regime de caixa)</h4>
          <div className="flex items-center gap-2"><input type="month" aria-label="Período do DRE" value={period} onChange={e => setPeriod(e.target.value)} className="p-2 border rounded-lg text-xs" style={inputStyle} /><button type="button" onClick={() => setPeriod('')} className={ghostBtn} style={{ borderColor: PALETTE.linhasBordas, color: PALETTE.textoPrincipal }}>Todo o período</button></div>
        </div>
        <table className="w-full text-xs" style={{ color: PALETTE.textoPrincipal }} data-testid="dre">
          <tbody>
            <tr><td colSpan={2} className="pt-2 pb-1 font-bold text-[10px] uppercase tracking-wider" style={{ color: PALETTE.textoApoio }}>Receitas recebidas</td></tr>
            {dre.receitas.map(l => <tr key={l.label} className="border-t" style={{ borderColor: PALETTE.linhasBordas }}><td className="py-1.5">{l.label}</td><td className="py-1.5 text-right font-mono">{brl(l.value)}</td></tr>)}
            {dre.receitas.length === 0 && <tr><td className="py-1.5" style={{ color: PALETTE.textoApoio }}>Nenhuma receita no período</td><td /></tr>}
            <tr className="border-t font-bold" style={{ borderColor: PALETTE.linhasBordas }}><td className="py-1.5">Total de receitas</td><td className="py-1.5 text-right font-mono" style={{ color: PALETTE.valoresReceber }}>{brl(dre.totalReceitas)}</td></tr>
            <tr><td colSpan={2} className="pt-3 pb-1 font-bold text-[10px] uppercase tracking-wider" style={{ color: PALETTE.textoApoio }}>Despesas do escritório</td></tr>
            {dre.operLines.map(l => <tr key={l.label} className="border-t" style={{ borderColor: PALETTE.linhasBordas }}><td className="py-1.5">{l.label}</td><td className="py-1.5 text-right font-mono">− {brl(l.value)}</td></tr>)}
            <tr className="border-t" style={{ borderColor: PALETTE.linhasBordas }}><td className="py-1.5">Custas e despesas de processos pagas</td><td className="py-1.5 text-right font-mono">− {brl(dre.custasBruto)}</td></tr>
            <tr className="border-t" style={{ borderColor: PALETTE.linhasBordas }}><td className="py-1.5">(+) Reembolsos recebidos de clientes</td><td className="py-1.5 text-right font-mono">{brl(dre.reembolsos)}</td></tr>
            <tr className="border-t font-bold" style={{ borderColor: PALETTE.linhasBordas }}><td className="py-2">Resultado do período</td><td className="py-2 text-right font-mono" style={{ color: dre.resultado >= 0 ? PALETTE.valoresReceber : PALETTE.descontos }}>{brl(dre.resultado)}</td></tr>
          </tbody>
        </table>
      </section>

      <section className={card} style={cardStyle}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="font-serif font-bold text-base" style={{ color: PALETTE.textoPrincipal }}>Rentabilidade por {rentBy}</h4>
          <select aria-label="Agrupar rentabilidade" value={rentBy} onChange={e => setRentBy(e.target.value as any)} className="p-2 border rounded-lg text-xs" style={inputStyle}><option value="cliente">Cliente</option><option value="processo">Caso (processo)</option></select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs" style={{ color: PALETTE.textoPrincipal }} data-testid="rent">
            <thead><tr className="text-left text-[10px] uppercase tracking-wider" style={{ color: PALETTE.textoApoio }}><th className="py-2 pr-3">{rentBy === 'cliente' ? 'Cliente' : 'Processo'}</th><th className="py-2 pr-3 text-right">Honorários recebidos</th><th className="py-2 pr-3 text-right">A receber</th><th className="py-2 pr-3 text-right">Custas líquidas</th><th className="py-2 pr-3 text-right">Resultado</th><th className="py-2 text-right">Margem</th></tr></thead>
            <tbody>
              {rent.map(r => <tr key={r.key} className="border-t" style={{ borderColor: PALETTE.linhasBordas }}><td className="py-2 pr-3 font-semibold">{r.label}</td><td className="py-2 pr-3 text-right font-mono">{brl(r.recebido)}</td><td className="py-2 pr-3 text-right font-mono">{brl(r.aberto)}</td><td className="py-2 pr-3 text-right font-mono">{brl(r.custasLiq)}</td><td className="py-2 pr-3 text-right font-mono font-bold" style={{ color: r.resultado >= 0 ? PALETTE.valoresReceber : PALETTE.descontos }}>{brl(r.resultado)}</td><td className="py-2 text-right font-mono">{r.margem === null ? '—' : `${r.margem}%`}</td></tr>)}
              {rent.length === 0 && <tr><td colSpan={6} className="py-4 text-center" style={{ color: PALETTE.textoApoio }}>Sem dados para calcular.</td></tr>}
            </tbody>
          </table>
        </div>
        <p className="text-[10px]" style={{ color: PALETTE.textoApoio }}>Resultado = honorários recebidos menos custas pagas que não foram reembolsadas. Horas de trabalho não entram no cálculo.</p>
      </section>

      <section className={card} style={cardStyle}>
        <h4 className="font-serif font-bold text-base" style={{ color: PALETTE.textoPrincipal }}>Extrato de prestação de contas</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <select aria-label="Cliente do extrato" value={stmtClient} onChange={e => setStmtClient(e.target.value)} className={input} style={inputStyle}><option value="">Selecione o cliente</option>{clientNames.map(n => <option key={n}>{n}</option>)}</select>
          <input type="date" aria-label="Período inicial" value={stmtFrom} onChange={e => setStmtFrom(e.target.value)} className={input} style={inputStyle} />
          <input type="date" aria-label="Período final" value={stmtTo} onChange={e => setStmtTo(e.target.value)} className={input} style={inputStyle} />
          <div className="flex gap-2 justify-end">
            <button type="button" disabled={!statement} onClick={() => statement && downloadCsv(`extrato-${norm(stmtClient).replace(/\s+/g, '-')}.csv`, statementRows())} className={ghostBtn} style={{ borderColor: PALETTE.linhasBordas, color: PALETTE.textoPrincipal, opacity: statement ? 1 : 0.5 }}>Baixar CSV</button>
            <button type="button" disabled={!statement} onClick={statementDocx} className={primaryBtn} style={{ backgroundColor: PALETTE.bordoPrincipal, opacity: statement ? 1 : 0.5 }}>Baixar Word (.docx)</button>
          </div>
        </div>
        {statement ? (
          <div className="space-y-3" data-testid="statement">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[['Honorários em aberto', statement.t.honAberto], ['Custas a reembolsar', statement.t.cusAberto], ['Repasse pendente ao cliente', statement.t.repassePend], ['Saldo em aberto do cliente', statement.saldoDevedor]].map(([t, v]: any) => (
                <div key={t} className="p-3 rounded-lg border" style={{ borderColor: PALETTE.linhasBordas, backgroundColor: PALETTE.fundoPagina }}><span className={label} style={{ color: PALETTE.textoApoio }}>{t}</span><p className="text-sm font-bold font-mono" style={{ color: PALETTE.textoPrincipal }}>{brl(v)}</p></div>
              ))}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs" style={{ color: PALETTE.textoPrincipal }}>
                <thead><tr className="text-left text-[10px] uppercase tracking-wider" style={{ color: PALETTE.textoApoio }}><th className="py-2 pr-3">Data</th><th className="py-2 pr-3">Tipo</th><th className="py-2 pr-3">Descrição</th><th className="py-2 pr-3 text-right">Valor</th><th className="py-2">Situação</th></tr></thead>
                <tbody>
                  {statementRows().slice(1).map((r, i) => <tr key={i} className="border-t" style={{ borderColor: PALETTE.linhasBordas }}><td className="py-1.5 pr-3 whitespace-nowrap">{r[0]}</td><td className="py-1.5 pr-3">{r[1]}</td><td className="py-1.5 pr-3">{r[2]}</td><td className="py-1.5 pr-3 text-right font-mono">{r[4]}</td><td className="py-1.5">{r[5]}</td></tr>)}
                </tbody>
              </table>
            </div>
          </div>
        ) : <p className="text-xs" style={{ color: PALETTE.textoApoio }}>Selecione um cliente para montar o extrato com honorários, custas, alvarás e repasses.</p>}
      </section>
    </div>
  );

  return (
    <div className="p-6 rounded-2xl border space-y-5" style={{ backgroundColor: PALETTE.fundoCartoes, borderColor: PALETTE.linhasBordas }}>
      <datalist id="fin-clientes">{clientNames.map(n => <option key={n} value={n} />)}</datalist>
      <div className="border-b pb-4" style={{ borderColor: PALETTE.linhasBordas }}>
        <h3 className="font-serif font-bold text-lg" style={{ color: PALETTE.textoPrincipal }}>Financeiro</h3>
        <p className="text-xs" style={{ color: PALETTE.textoApoio }}>O que entrou, o que falta receber e o que foi pago.</p>
      </div>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Módulos do financeiro">
        {tabs.map(([k, name]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => { setTab(k); if (k === 'mais') setAdv(null); }} className="px-3.5 py-2 rounded-lg text-xs font-bold border transition" style={{ backgroundColor: tab === k ? PALETTE.bordoPrincipal : 'transparent', color: tab === k ? '#FFFFFF' : PALETTE.textoPrincipal, borderColor: tab === k ? PALETTE.bordoPrincipal : PALETTE.linhasBordas }}>{name}</button>
        ))}
      </div>
      {tab === 'resumo' && renderResumo()}
      {tab === 'lancamentos' && renderLancamentos()}
      {tab === 'relatorios' && <div className="space-y-5">{renderRelatorios()}{renderFluxo()}</div>}
      {tab === 'mais' && renderMais()}
      {renderEntryModal()}
      {renderPicker()}
    </div>
  );
}
