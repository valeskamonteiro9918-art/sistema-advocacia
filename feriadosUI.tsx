import React, { useState } from 'react';
import { UFS, FeriadoCustom } from './feriados';
import { fixCase } from './texto';

// Cadastro de feriados municipais, estaduais extras e suspensões de prazo (por estado e comarca).

type Props = { PALETTE: any; feriados: FeriadoCustom[]; setFeriados: (f: FeriadoCustom[]) => void; ufPadrao: string; setUfPadrao: (u: string) => void; notify: (m: string) => void; comarcas: string[] };

const fmt = (iso: string, repete?: boolean) => { const [y, m, d] = iso.split('-'); return repete ? `${d}/${m} (todo ano)` : `${d}/${m}/${y}`; };

export default function FeriadosTool({ PALETTE, feriados, setFeriados, ufPadrao, setUfPadrao, notify, comarcas }: Props) {
  const [f, setF] = useState({ escopo: 'comarca' as FeriadoCustom['escopo'], uf: ufPadrao || 'ES', comarca: '', data: '', fim: '', repete: true, nome: '' });
  const input = 'p-2.5 border rounded-lg text-xs w-full';
  const st = { borderColor: PALETTE.linhasBordas, backgroundColor: PALETTE.fundoCartoes, color: PALETTE.textoPrincipal } as React.CSSProperties;
  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.data || !f.nome.trim()) { window.alert('Informe a data e o nome.'); return; }
    if (f.escopo === 'comarca' && !f.comarca.trim()) { window.alert('Informe a comarca (cidade).'); return; }
    if (f.fim && f.fim < f.data) { window.alert('A data final não pode ser antes da inicial.'); return; }
    const item: FeriadoCustom = { id: `fer-${Date.now()}`, escopo: f.escopo, uf: f.escopo === 'nacional' ? undefined : f.uf, comarca: f.escopo === 'comarca' ? fixCase(f.comarca.trim()) : undefined, data: f.data, fim: f.fim || undefined, repete: f.repete, nome: fixCase(f.nome.trim()) };
    setFeriados([...feriados, item]);
    setF(p => ({ ...p, data: '', fim: '', nome: '' }));
    notify('Feriado cadastrado. Os prazos desse local já usam a nova data.');
  };
  const rotulo = (x: FeriadoCustom) => x.escopo === 'nacional' ? 'Todo o país' : x.escopo === 'uf' ? `Estado ${x.uf}` : `${x.comarca} / ${x.uf}`;
  return (
    <section className="p-5 rounded-2xl border space-y-4" style={{ backgroundColor: PALETTE.fundoCartoes, borderColor: PALETTE.linhasBordas }}>
      <div>
        <h4 className="font-bold text-sm" style={{ color: PALETTE.textoPrincipal }}>Feriados e suspensões por comarca</h4>
        <p className="text-[11px] mt-1" style={{ color: PALETTE.textoApoio }}>Cada processo conta os dias úteis pelo estado e pela comarca dele. Já vêm incluídos: feriados nacionais, Carnaval, Paixão de Cristo, Corpus Christi, recesso de 20/12 a 20/01 e os principais feriados estaduais. Aqui você cadastra o que falta: feriado municipal, suspensão de prazo do tribunal, ponto facultativo.</p>
      </div>
      <label className="text-xs font-semibold block" style={{ color: PALETTE.textoPrincipal }}>Estado usado quando o prazo não tem processo ligado
        <select value={ufPadrao} onChange={e => setUfPadrao(e.target.value)} className={`${input} mt-1`} style={{ ...st, maxWidth: 120 }}>{UFS.map(u => <option key={u}>{u}</option>)}</select>
      </label>
      <form onSubmit={add} className="p-3 rounded-xl border space-y-3 text-xs" style={{ borderColor: PALETTE.linhasBordas }}>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Onde vale">
          {([['comarca', 'Só uma comarca (cidade)'], ['uf', 'O estado todo'], ['nacional', 'Todo o país']] as const).map(([k, l]) => (
            <button key={k} type="button" onClick={() => setF(p => ({ ...p, escopo: k }))} aria-pressed={f.escopo === k} className="px-3 py-2 rounded-lg border text-xs font-bold" style={{ backgroundColor: f.escopo === k ? PALETTE.bordoPrincipal : 'transparent', color: f.escopo === k ? '#FFFFFF' : PALETTE.textoPrincipal, borderColor: f.escopo === k ? PALETTE.bordoPrincipal : PALETTE.linhasBordas }}>{l}</button>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {f.escopo !== 'nacional' && <select aria-label="Estado" value={f.uf} onChange={e => setF(p => ({ ...p, uf: e.target.value }))} className={input} style={st}>{UFS.map(u => <option key={u}>{u}</option>)}</select>}
          {f.escopo === 'comarca' && <><input list="lista-comarcas" aria-label="Comarca" placeholder="Comarca (cidade)" value={f.comarca} onChange={e => setF(p => ({ ...p, comarca: e.target.value }))} className={input} style={st} /><datalist id="lista-comarcas">{comarcas.map(c => <option key={c} value={c} />)}</datalist></>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <label className="space-y-1 block"><span className="font-semibold">Data</span><input type="date" value={f.data} onChange={e => setF(p => ({ ...p, data: e.target.value }))} className={input} style={st} /></label>
          <label className="space-y-1 block"><span className="font-semibold">Até (se for mais de um dia)</span><input type="date" value={f.fim} onChange={e => setF(p => ({ ...p, fim: e.target.value }))} className={input} style={st} /></label>
          <label className="space-y-1 block"><span className="font-semibold">Nome</span><input placeholder="Ex.: Aniversário da cidade" value={f.nome} onChange={e => setF(p => ({ ...p, nome: e.target.value }))} className={input} style={st} /></label>
        </div>
        <label className="flex items-center gap-2 font-semibold"><input type="checkbox" checked={f.repete} onChange={e => setF(p => ({ ...p, repete: e.target.checked }))} /> Repete todo ano (feriado fixo)</label>
        <button type="submit" className="px-4 py-2 rounded-lg text-xs font-bold text-white" style={{ backgroundColor: PALETTE.bordoPrincipal }}>Cadastrar feriado</button>
      </form>
      {feriados.length === 0 ? <p className="text-xs" style={{ color: PALETTE.textoApoio }}>Nenhum feriado cadastrado ainda.</p> : (
        <ul className="space-y-2 text-xs">
          {[...feriados].sort((a, b) => a.data.slice(5).localeCompare(b.data.slice(5))).map(x => (
            <li key={x.id} className="flex items-center justify-between gap-3 p-2.5 rounded-lg border" style={{ borderColor: PALETTE.linhasBordas, color: PALETTE.textoPrincipal }}>
              <span><b>{x.nome}</b><span className="block text-[10px]" style={{ color: PALETTE.textoApoio }}>{rotulo(x)} · {fmt(x.data, x.repete)}{x.fim ? ` até ${fmt(x.fim, x.repete)}` : ''}</span></span>
              <button type="button" onClick={() => { if (window.confirm(`Excluir "${x.nome}"?`)) setFeriados(feriados.filter(y => y.id !== x.id)); }} className="px-2.5 py-1.5 rounded-lg border text-[11px] font-bold" style={{ borderColor: PALETTE.linhasBordas, color: '#B45309' }}>Excluir</button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
