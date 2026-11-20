import React, { useMemo, useState } from 'react';
import { brl, todayLocal, isMemo } from './financeiro';
import { fixCase } from './texto';

// Financeiro dentro do cliente: plano de pagamento padronizado (total, entrada e número de parcelas),
// lista de parcelas com "recebi", edição e cobrança.

const pad = (n: number) => String(n).padStart(2, '0');
const norm = (s: any) => String(s || '').trim().toLowerCase();
const fmt = (iso?: string) => (iso && /^\d{4}-\d{2}-\d{2}/.test(iso) ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}` : 'sem data');
const addMonths = (iso: string, n: number) => {
  const [y, m, d] = iso.split('-').map(Number);
  const t = new Date(y, m - 1 + n, 1);
  const last = new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate();
  return `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(Math.min(d, last))}`;
};
const r2 = (n: number) => Math.round(n * 100) / 100;
const PARCELAS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 18, 24];

type Props = {
  PALETTE: any;
  client: { name: string; phone?: string };
  entries: any[];
  setEntries: (updater: any) => void;
  notify: (msg: string) => void;
  onClose: () => void;
};

export function buildPlan(total: number, entrada: number, n: number, first: string) {
  const cents = Math.round(total * 100);
  const ent = Math.min(cents, Math.max(0, Math.round(entrada * 100)));
  const resto = cents - ent;
  const base = n > 0 ? Math.floor(resto / n) : 0;
  const rows: { label: string; amount: number; due: string }[] = [];
  if (ent > 0) rows.push({ label: 'Entrada', amount: ent / 100, due: first });
  const start = ent > 0 ? 1 : 0;
  for (let i = 0; i < n && resto > 0; i++) {
    const valor = i === n - 1 ? resto - base * (n - 1) : base;
    rows.push({ label: `Parcela ${i + 1}/${n}`, amount: valor / 100, due: addMonths(first, start + i) });
  }
  return rows;
}

export default function ClientFinanceModal({ PALETTE, client, entries, setEntries, notify, onClose }: Props) {
  const today = todayLocal();
  const name = String(client.name || '').trim();
  const mine = useMemo(() => entries.filter(e => norm(e.client) === norm(name) && !isMemo(e)).slice().sort((a, b) => String(a.dueDate || '9999').localeCompare(String(b.dueDate || '9999'))), [entries, name]);
  const fees = mine.filter(e => e.kind === 'Receita');
  const received = (e: any) => e.status === 'Recebido' || e.status === 'Pago';
  const contratado = r2(fees.reduce((a, e) => a + Number(e.amount || 0), 0));
  const recebido = r2(fees.filter(received).reduce((a, e) => a + Number(e.amount || 0), 0));
  const aberto = fees.filter(e => !received(e));
  const aReceber = r2(aberto.reduce((a, e) => a + Number(e.amount || 0), 0));
  const vencido = r2(aberto.filter(e => e.dueDate && e.dueDate < today).reduce((a, e) => a + Number(e.amount || 0), 0));

  const [showPlan, setShowPlan] = useState(fees.length === 0);
  const [plan, setPlan] = useState({ total: '', entrada: '0', parcelas: 3, first: today });
  const total = Number(plan.total) || 0;
  const preview = total > 0 ? buildPlan(total, Number(plan.entrada) || 0, plan.parcelas, plan.first) : [];
  const [editId, setEditId] = useState<string | null>(null);
  const [ed, setEd] = useState({ title: '', amount: '', dueDate: '' });

  const inputCls = 'p-2.5 border rounded-lg text-xs w-full';
  const inputStyle = { borderColor: PALETTE.linhasBordas, backgroundColor: PALETTE.fundoCartoes, color: PALETTE.textoPrincipal } as React.CSSProperties;
  const ghost = 'px-3 py-2 rounded-lg border text-xs font-bold';
  const lab = 'text-[10px] font-bold uppercase tracking-wider block mb-1';

  const generate = () => {
    if (!(total > 0)) { window.alert('Informe o valor total dos honorários.'); return; }
    if ((Number(plan.entrada) || 0) > total) { window.alert('A entrada não pode ser maior que o valor total.'); return; }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(plan.first)) { window.alert('Informe a data do primeiro vencimento.'); return; }
    if (fees.length > 0 && !window.confirm('Este cliente já tem lançamentos. O novo plano será somado aos que já existem. Continuar?')) return;
    const stamp = Date.now();
    const novos = preview.map((r, i) => ({ id: `fin-${stamp}-${i}`, createdAt: new Date().toISOString(), title: `Honorários, ${r.label.toLowerCase()} · ${name}`, kind: 'Receita', category: 'Honorários', client: name, amount: r.amount, dueDate: r.due, status: 'Pendente' }));
    setEntries((prev: any[]) => [...novos, ...prev]);
    setShowPlan(false);
    setPlan({ total: '', entrada: '0', parcelas: 3, first: today });
    notify(`Plano criado: ${novos.length} lançamento(s) para ${name}.`);
  };

  const patch = (id: string, p: any) => setEntries((prev: any[]) => prev.map(e => e.id === id ? { ...e, ...p } : e));
  const markPaid = (e: any) => patch(e.id, { status: 'Recebido', paidAt: today });
  const undo = (e: any) => patch(e.id, { status: 'Pendente', paidAt: undefined });
  const remove = (e: any) => { if (window.confirm('Excluir este lançamento? Não dá para desfazer.')) setEntries((prev: any[]) => prev.filter(x => x.id !== e.id)); };
  const startEdit = (e: any) => { setEditId(e.id); setEd({ title: e.title || '', amount: String(e.amount ?? ''), dueDate: e.dueDate || '' }); };
  const saveEdit = () => {
    if (!ed.title.trim() || !(Number(ed.amount) > 0)) { window.alert('Informe a descrição e um valor maior que zero.'); return; }
    patch(editId as string, { title: fixCase(ed.title.trim()), amount: Number(ed.amount), dueDate: ed.dueDate });
    setEditId(null);
  };
  const cobranca = () => {
    const first = name.split(' ')[0];
    const txt = `Olá, ${first}! Passando para lembrar do pagamento dos honorários: ${brl(aReceber)} em aberto${vencido > 0 ? `, sendo ${brl(vencido)} já vencidos` : ''}. Se precisar combinar de outra forma, é só me avisar. Obrigada!`;
    try { navigator.clipboard.writeText(txt); notify('Mensagem de cobrança copiada. Cole no WhatsApp.'); } catch { window.prompt('Copie a mensagem:', txt); }
  };

  const Kpi = ({ t, v, c }: { t: string; v: string; c?: string }) => (
    <div className="p-3 rounded-xl border" style={{ borderColor: PALETTE.linhasBordas, backgroundColor: PALETTE.fundoPagina }}>
      <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: PALETTE.textoApoio }}>{t}</span>
      <span className="text-lg font-bold font-mono" style={{ color: c || PALETTE.textoPrincipal }}>{v}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-6 overflow-y-auto" style={{ backgroundColor: 'rgba(17,24,39,0.55)' }} role="dialog" aria-modal="true" aria-label={`Financeiro de ${name}`} onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-3xl rounded-2xl shadow-2xl p-5 space-y-4 my-auto" style={{ backgroundColor: PALETTE.fundoCartoes, color: PALETTE.textoPrincipal }}>
        <div className="flex items-start justify-between gap-3 border-b pb-3" style={{ borderColor: PALETTE.linhasBordas }}>
          <div><h3 className="font-serif font-bold text-lg">Financeiro de {name}</h3><p className="text-xs mt-0.5" style={{ color: PALETTE.textoApoio }}>Honorários, parcelas e o que já foi recebido.</p></div>
          <button type="button" onClick={onClose} aria-label="Fechar" className="px-2 py-1 rounded-lg hover:bg-black/5 text-lg leading-none">×</button>
        </div>

        {fees.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Kpi t="Contratado" v={brl(contratado)} />
            <Kpi t="Já recebi" v={brl(recebido)} c={PALETTE.valoresReceber} />
            <Kpi t="Falta receber" v={brl(aReceber)} />
            <Kpi t="Vencido" v={brl(vencido)} c={vencido > 0 ? PALETTE.descontos : PALETTE.textoApoio} />
          </div>
        )}

        <section className="rounded-xl border p-4 space-y-3" style={{ borderColor: PALETTE.linhasBordas }}>
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-serif font-bold text-base">Plano de pagamento</h4>
            {!showPlan && <button type="button" onClick={() => setShowPlan(true)} className={ghost} style={{ borderColor: PALETTE.linhasBordas }}>+ Novo plano</button>}
          </div>
          {showPlan && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div><label className={lab} style={{ color: PALETTE.textoApoio }} htmlFor="pl-total">Valor total (R$)</label><input id="pl-total" type="number" min="0" step="0.01" value={plan.total} onChange={e => setPlan(p => ({ ...p, total: e.target.value }))} className={inputCls} style={inputStyle} /></div>
                <div><label className={lab} style={{ color: PALETTE.textoApoio }} htmlFor="pl-ent">Entrada (R$)</label><input id="pl-ent" type="number" min="0" step="0.01" value={plan.entrada} onChange={e => setPlan(p => ({ ...p, entrada: e.target.value }))} className={inputCls} style={inputStyle} /></div>
                <div><label className={lab} style={{ color: PALETTE.textoApoio }} htmlFor="pl-n">Parcelas</label><select id="pl-n" value={plan.parcelas} onChange={e => setPlan(p => ({ ...p, parcelas: Number(e.target.value) }))} className={inputCls} style={inputStyle}>{PARCELAS.map(n => <option key={n} value={n}>{n === 1 ? '1 parcela' : `${n} parcelas`}</option>)}</select></div>
                <div><label className={lab} style={{ color: PALETTE.textoApoio }} htmlFor="pl-d">{Number(plan.entrada) > 0 ? 'Vencimento da entrada' : '1º vencimento'}</label><input id="pl-d" type="date" value={plan.first} onChange={e => setPlan(p => ({ ...p, first: e.target.value }))} className={inputCls} style={inputStyle} /></div>
              </div>
              {preview.length > 0 && (
                <div className="rounded-lg p-3 text-xs space-y-1" style={{ backgroundColor: PALETTE.fundoPagina }}>
                  <p className="font-bold mb-1">Como vai ficar:</p>
                  {preview.map(r => <div key={r.label} className="flex justify-between gap-3"><span>{r.label} · {fmt(r.due)}</span><span className="font-mono font-bold">{brl(r.amount)}</span></div>)}
                </div>
              )}
              <div className="flex justify-end gap-2">
                {fees.length > 0 && <button type="button" onClick={() => setShowPlan(false)} className={ghost} style={{ borderColor: PALETTE.linhasBordas }}>Cancelar</button>}
                <button type="button" onClick={generate} className="px-4 py-2.5 rounded-lg text-xs font-bold text-white" style={{ backgroundColor: PALETTE.bordoPrincipal }}>Gerar plano</button>
              </div>
            </>
          )}
        </section>

        {mine.length > 0 && (
          <section className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-serif font-bold text-base">Parcelas e lançamentos</h4>
              {aReceber > 0 && <button type="button" onClick={cobranca} className={ghost} style={{ borderColor: PALETTE.linhasBordas }}>Copiar cobrança</button>}
            </div>
            {mine.map(e => {
              const done = received(e);
              const late = !done && e.dueDate && e.dueDate < today;
              if (editId === e.id) return (
                <div key={e.id} className="p-3 rounded-lg border grid grid-cols-1 md:grid-cols-[1fr_120px_150px_auto] gap-2 items-center" style={{ borderColor: PALETTE.bordoPrincipal }}>
                  <input aria-label="Descrição" value={ed.title} onChange={x => setEd(p => ({ ...p, title: x.target.value }))} className={inputCls} style={inputStyle} />
                  <input aria-label="Valor" type="number" step="0.01" value={ed.amount} onChange={x => setEd(p => ({ ...p, amount: x.target.value }))} className={inputCls} style={inputStyle} />
                  <input aria-label="Vencimento" type="date" value={ed.dueDate} onChange={x => setEd(p => ({ ...p, dueDate: x.target.value }))} className={inputCls} style={inputStyle} />
                  <div className="flex gap-2"><button type="button" onClick={saveEdit} className="px-3 py-2 rounded-lg text-xs font-bold text-white" style={{ backgroundColor: PALETTE.bordoPrincipal }}>Salvar</button><button type="button" onClick={() => setEditId(null)} className={ghost} style={{ borderColor: PALETTE.linhasBordas }}>Cancelar</button></div>
                </div>
              );
              return (
                <div key={e.id} className="flex flex-col md:flex-row md:items-center justify-between gap-2 p-3 rounded-lg border" style={{ borderColor: late ? PALETTE.descontos : PALETTE.linhasBordas, backgroundColor: PALETTE.fundoPagina, opacity: done ? 0.75 : 1 }}>
                  <div className="min-w-0">
                    <p className="text-xs font-bold">{e.title}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: late ? PALETTE.descontos : PALETTE.textoApoio }}>{e.kind === 'Despesa' ? 'Despesa' : e.category} · vence {fmt(e.dueDate)}{done ? ` · recebido${e.paidAt ? ' em ' + fmt(e.paidAt) : ''}` : late ? ' · VENCIDO' : ''}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 md:justify-end">
                    <span className="text-xs font-bold font-mono" style={{ color: e.kind === 'Despesa' ? PALETTE.descontos : PALETTE.valoresReceber }}>{e.kind === 'Despesa' ? '− ' : ''}{brl(e.amount)}</span>
                    {done ? <button type="button" onClick={() => undo(e)} className={ghost} style={{ borderColor: PALETTE.linhasBordas }}>Desfazer</button> : <button type="button" onClick={() => markPaid(e)} className="px-3 py-2 rounded-lg text-xs font-bold text-white" style={{ backgroundColor: '#047857' }}>Recebi</button>}
                    <button type="button" onClick={() => startEdit(e)} className={ghost} style={{ borderColor: PALETTE.linhasBordas }}>Editar</button>
                    <button type="button" aria-label="Excluir lançamento" onClick={() => remove(e)} className={ghost} style={{ borderColor: PALETTE.linhasBordas, color: PALETTE.descontos }}>Excluir</button>
                  </div>
                </div>
              );
            })}
          </section>
        )}
        {mine.length === 0 && !showPlan && <p className="text-xs text-center py-4" style={{ color: PALETTE.textoApoio }}>Nenhum lançamento para este cliente ainda.</p>}
      </div>
    </div>
  );
}
