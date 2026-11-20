import React, { useMemo, useState } from 'react';
import { fixCase } from './texto';

// Padroniza o nome dos clientes: o mesmo nome que está no cadastro passa a valer em processos, prazos e lançamentos.
// Só propõe quando o nome curto está contido, sem dúvida, em UM único cliente cadastrado. Nada muda sem você aplicar.

const STOP = new Set(['da', 'de', 'do', 'dos', 'das', 'e']);
const norm = (s: any) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
const tokens = (s: any) => new Set(norm(s).split(' ').filter(t => t && !STOP.has(t)));

type Props = {
  PALETTE: any;
  clients: any[]; setClients: (u: any) => void;
  processes: any[]; setProcesses: (u: any) => void;
  deadlines: any[]; setDeadlines: (u: any) => void;
  entries: any[]; setEntries: (u: any) => void;
  leads: any[]; setLeads: (u: any) => void;
  notify: (m: string) => void;
};

type Rename = { from: string; to: string; where: string[] };

export function planNames(clients: any[], processes: any[], deadlines: any[], entries: any[]) {
  const found = new Map<string, { raw: Set<string>; where: Set<string> }>();
  const add = (name: any, where: string) => {
    const raw = String(name ?? '');
    const k = norm(raw);
    if (!k) return;
    const cur = found.get(k) || { raw: new Set<string>(), where: new Set<string>() };
    cur.raw.add(raw); cur.where.add(where); found.set(k, cur);
  };
  processes.forEach(p => add(p.client, 'processos'));
  deadlines.forEach(d => add(d.client, 'prazos'));
  entries.forEach(e => add(e.client, 'financeiro'));

  const renames: Rename[] = [];
  const missing: { name: string; where: string[] }[] = [];
  found.forEach((info, k) => {
    const exact = clients.find(c => norm(c.name) === k);
    if (exact) {
      info.raw.forEach(r => { if (r !== String(exact.name)) renames.push({ from: r, to: String(exact.name), where: [...info.where] }); });
      return;
    }
    const tk = tokens(k);
    const cands = tk.size >= 2 ? clients.filter(c => { const ct = tokens(c.name); return [...tk].every(t => ct.has(t)); }) : [];
    if (cands.length === 1) {
      info.raw.forEach(r => renames.push({ from: r, to: String(cands[0].name), where: [...info.where] }));
    } else {
      const canon = [...info.raw][0].trim();
      info.raw.forEach(r => { if (r !== canon) renames.push({ from: r, to: canon, where: [...info.where] }); });
      missing.push({ name: canon, where: [...info.where] });
    }
  });
  return { renames, missing };
}

type CaseFix = { from: string; to: string; where: string };
const CASE_FIELDS: { list: 'clients' | 'processes' | 'deadlines' | 'entries' | 'leads'; field: string; label: string }[] = [
  { list: 'clients', field: 'name', label: 'clientes' },
  { list: 'processes', field: 'client', label: 'processos (cliente)' },
  { list: 'processes', field: 'action', label: 'processos (ação)' },
  { list: 'deadlines', field: 'title', label: 'prazos' },
  { list: 'deadlines', field: 'client', label: 'prazos (cliente)' },
  { list: 'entries', field: 'title', label: 'financeiro' },
  { list: 'entries', field: 'client', label: 'financeiro (cliente)' },
  { list: 'leads', field: 'name', label: 'captação' }
];

export default function NamesTool({ PALETTE, clients, setClients, processes, setProcesses, deadlines, setDeadlines, entries, setEntries, leads, setLeads, notify }: Props) {
  const [open, setOpen] = useState(false);
  const plan = useMemo(() => planNames(clients, processes, deadlines, entries), [clients, processes, deadlines, entries]);
  const [pick, setPick] = useState<Record<string, boolean>>({});
  const caseFixes = useMemo(() => {
    const lists: any = { clients, processes, deadlines, entries, leads };
    const renamed = new Set(plan.renames.map(r => r.from));
    const seen = new Map<string, CaseFix>();
    CASE_FIELDS.forEach(f => (lists[f.list] as any[]).forEach(item => {
      const v = String(item?.[f.field] ?? '');
      if (!v.trim() || renamed.has(v)) return;
      const to = fixCase(v);
      if (to !== v) seen.set(`${f.list}.${f.field}|${v}`, { from: v, to, where: f.label });
    }));
    return [...seen.entries()].map(([k, v]) => ({ key: k, ...v }));
  }, [clients, processes, deadlines, entries, leads, plan]);
  const isCase = (k: string) => pick[`c:${k}`] !== false;
  const total = plan.renames.length + plan.missing.length + caseFixes.length;
  const isRen = (r: Rename) => pick[`r:${r.from}`] !== false;
  const isNew = (n: string) => pick[`n:${n}`] === true;

  const apply = () => {
    const map = new Map<string, string>();
    plan.renames.filter(isRen).forEach(r => map.set(r.from, r.to));
    const fix = (list: any[]) => list.map(x => (map.has(String(x.client ?? '')) ? { ...x, client: map.get(String(x.client)) } : x));
    if (map.size) { setProcesses((p: any[]) => fix(p)); setDeadlines((p: any[]) => fix(p)); setEntries((p: any[]) => fix(p)); }
    const chosen = caseFixes.filter(c => isCase(c.key));
    if (chosen.length) {
      const setters: any = { clients: setClients, processes: setProcesses, deadlines: setDeadlines, entries: setEntries, leads: setLeads };
      const byTarget = new Map<string, Map<string, string>>();
      chosen.forEach(c => { const t = c.key.split('|')[0]; const m = byTarget.get(t) || new Map<string, string>(); m.set(c.from, c.to); byTarget.set(t, m); });
      byTarget.forEach((m, t) => { const [list, field] = t.split('.'); setters[list]((prev: any[]) => prev.map(it => (m.has(String(it?.[field] ?? '')) ? { ...it, [field]: m.get(String(it[field])) } : it))); });
    }
    const novos = plan.missing.filter(m => isNew(m.name)).map((m, i) => ({ id: `cli-${Date.now()}-${i}`, name: m.name, type: 'Pessoa Física', document: '', phone: '', email: '', status: 'Ativo' }));
    if (novos.length) setClients((p: any[]) => [...novos, ...p]);
    notify(`${map.size} nome(s) padronizado(s), ${chosen.length} texto(s) ajustado(s) e ${novos.length} cliente(s) cadastrado(s).`);
    setPick({});
  };

  const btn = 'px-3 py-2 rounded-lg border text-xs font-bold';
  return (
    <section className="p-5 rounded-2xl border space-y-3" style={{ backgroundColor: PALETTE.fundoCartoes, borderColor: PALETTE.linhasBordas }}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 className="font-bold text-sm" style={{ color: PALETTE.textoPrincipal }}>Padronizar nomes e letras</h4>
          <p className="text-[11px] mt-1" style={{ color: PALETTE.textoApoio }}>Deixa o nome de cada cliente igual em processos, prazos e financeiro e corrige textos todos em maiúsculas ou minúsculas. Você confere a lista antes de aplicar.</p>
        </div>
        <button type="button" onClick={() => setOpen(o => !o)} className={btn} style={{ borderColor: PALETTE.linhasBordas, color: PALETTE.textoPrincipal }}>{open ? 'Fechar' : `Verificar (${total})`}</button>
      </div>
      {open && (
        <div className="space-y-4 text-xs" style={{ color: PALETTE.textoPrincipal }}>
          {total === 0 && <p style={{ color: PALETTE.textoApoio }}>Tudo certo: todos os nomes já combinam com o cadastro.</p>}
          {plan.renames.length > 0 && (
            <div className="space-y-2">
              <p className="font-bold">Trocar para o nome do cadastro</p>
              {plan.renames.map(r => (
                <label key={r.from} className="flex items-start gap-2 p-2 rounded-lg border" style={{ borderColor: PALETTE.linhasBordas }}>
                  <input type="checkbox" checked={isRen(r)} onChange={e => setPick(p => ({ ...p, [`r:${r.from}`]: e.target.checked }))} className="mt-0.5" />
                  <span><b>"{r.from}"</b> → <b>{r.to}</b><span className="block text-[10px]" style={{ color: PALETTE.textoApoio }}>em {r.where.join(', ')}</span></span>
                </label>
              ))}
            </div>
          )}
          {plan.missing.length > 0 && (
            <div className="space-y-2">
              <p className="font-bold">Aparecem no sistema, mas não estão cadastrados</p>
              <p className="text-[10px]" style={{ color: PALETTE.textoApoio }}>Marque só os que são pessoas novas. Se for a mesma pessoa de outro cadastro, deixe desmarcado.</p>
              {plan.missing.map(m => (
                <label key={m.name} className="flex items-start gap-2 p-2 rounded-lg border" style={{ borderColor: PALETTE.linhasBordas }}>
                  <input type="checkbox" checked={isNew(m.name)} onChange={e => setPick(p => ({ ...p, [`n:${m.name}`]: e.target.checked }))} className="mt-0.5" />
                  <span>Cadastrar <b>{m.name}</b><span className="block text-[10px]" style={{ color: PALETTE.textoApoio }}>em {m.where.join(', ')}</span></span>
                </label>
              ))}
            </div>
          )}
          {caseFixes.length > 0 && (
            <div className="space-y-2">
              <p className="font-bold">Letras maiúsculas e minúsculas</p>
              <p className="text-[10px]" style={{ color: PALETTE.textoApoio }}>Textos escritos todos em maiúsculas ou todos em minúsculas passam a ter só as iniciais maiúsculas.</p>
              {caseFixes.map(c => (
                <label key={c.key} className="flex items-start gap-2 p-2 rounded-lg border" style={{ borderColor: PALETTE.linhasBordas }}>
                  <input type="checkbox" checked={isCase(c.key)} onChange={e => setPick(p => ({ ...p, [`c:${c.key}`]: e.target.checked }))} className="mt-0.5" />
                  <span><b>"{c.from}"</b> → <b>{c.to}</b><span className="block text-[10px]" style={{ color: PALETTE.textoApoio }}>em {c.where}</span></span>
                </label>
              ))}
            </div>
          )}
          {total > 0 && <div className="flex justify-end"><button type="button" onClick={apply} className="px-4 py-2.5 rounded-lg text-xs font-bold text-white" style={{ backgroundColor: PALETTE.bordoPrincipal }}>Aplicar marcados</button></div>}
        </div>
      )}
    </section>
  );
}
