import React, { useEffect, useState } from 'react';
import { X, MessageCircle, Copy } from 'lucide-react';

// Janela de mensagens prontas: escolhe o modelo à esquerda, vê e edita o texto à direita e abre o WhatsApp no número cadastrado.
// Nada é enviado sozinho: o WhatsApp abre com o texto pronto e quem envia é a Dra.

export type MsgOption = { key: string; label: string; hint?: string; text: string };
type Props = { PALETTE: any; name: string; phone: string; subtitle?: string; options: MsgOption[]; onClose: () => void };

const whatsUrl = (phone: string, text: string) => {
  const d = String(phone || '').replace(/\D/g, '');
  if (!d) return '';
  const full = d.length > 11 ? d : `55${d}`;
  return `https://wa.me/${full}?text=${encodeURIComponent(text)}`;
};

export default function MessageComposer({ PALETTE, name, phone, subtitle, options, onClose }: Props) {
  const [sel, setSel] = useState<string>(options[0]?.key || '');
  const [text, setText] = useState<string>(options[0]?.text || '');
  const [edited, setEdited] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const pick = (o: MsgOption) => {
    if (edited && text.trim() && !window.confirm('Você editou o texto atual. Trocar de modelo apaga essas alterações. Continuar?')) return;
    setSel(o.key); setText(o.text); setEdited(false); setNote('');
  };
  const hasPhone = String(phone || '').replace(/\D/g, '').length >= 10;
  const pending = (text.match(/\[[^\]]+\]/g) || []);

  const send = () => {
    if (!text.trim()) return;
    if (pending.length && !window.confirm(`Ainda há trechos para preencher: ${pending.slice(0, 3).join(', ')}${pending.length > 3 ? '…' : ''}. Abrir o WhatsApp assim mesmo?`)) return;
    const url = whatsUrl(phone, text);
    if (!url) return;
    const w = window.open(url, '_blank', 'noopener,noreferrer');
    setNote(w ? 'WhatsApp aberto com a mensagem. Confira e envie por lá.' : 'O navegador bloqueou a janela. Permita pop-ups para abrir o WhatsApp.');
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); setNote('Texto copiado.'); } catch { setNote('Não foi possível copiar. Selecione o texto e use Ctrl+C.'); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6" style={{ backgroundColor: 'rgba(17,24,39,0.55)' }} role="dialog" aria-modal="true" aria-label={`Mensagem para ${name}`} onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden" style={{ backgroundColor: PALETTE.fundoCartoes, color: PALETTE.textoPrincipal }}>
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b" style={{ borderColor: PALETTE.linhasBordas }}>
          <div className="min-w-0">
            <h3 className="font-serif font-bold text-lg truncate">Mensagem para {name}</h3>
            <p className="text-xs mt-0.5" style={{ color: PALETTE.textoApoio }}>{subtitle ? `${subtitle} · ` : ''}{hasPhone ? `WhatsApp ${phone}` : 'Sem telefone cadastrado'}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar" className="p-1.5 rounded-lg hover:bg-black/5"><X size={18} /></button>
        </div>

        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-[250px_1fr]">
          <div className="border-b md:border-b-0 md:border-r overflow-y-auto max-h-44 md:max-h-none p-2" style={{ borderColor: PALETTE.linhasBordas, backgroundColor: PALETTE.fundoPagina }}>
            <p className="px-2 pt-1 pb-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: PALETTE.textoApoio }}>Escolha a mensagem</p>
            {options.map(o => (
              <button key={o.key} type="button" onClick={() => pick(o)} className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold mb-1 transition" style={{ backgroundColor: sel === o.key ? PALETTE.bordoPrincipal : 'transparent', color: sel === o.key ? '#FFFFFF' : PALETTE.textoPrincipal }}>
                {o.label}
                {o.hint && <span className="block text-[10px] font-normal mt-0.5" style={{ opacity: 0.75 }}>{o.hint}</span>}
              </button>
            ))}
          </div>

          <div className="p-4 flex flex-col gap-3 min-h-0">
            <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: PALETTE.textoApoio }} htmlFor="msg-texto">Prévia (você pode editar)</label>
            <textarea id="msg-texto" value={text} onChange={e => { setText(e.target.value); setEdited(true); setNote(''); }} className="flex-1 min-h-[220px] w-full rounded-xl border p-3 text-sm leading-relaxed resize-none" style={{ borderColor: PALETTE.linhasBordas, backgroundColor: PALETTE.fundoPagina, color: PALETTE.textoPrincipal }} />
            {pending.length > 0 && <p className="text-[11px] font-semibold" style={{ color: '#B45309' }}>Preencha os trechos entre [colchetes] antes de enviar: {pending.join(' ')}</p>}
            {!hasPhone && <p className="text-[11px] font-semibold" style={{ color: PALETTE.descontos }}>Cadastre o telefone para poder abrir o WhatsApp. Você ainda pode copiar o texto.</p>}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px]" style={{ color: PALETTE.textoApoio }}>{note || 'O sistema não envia nada sozinho: o WhatsApp abre com o texto pronto.'}</span>
              <div className="flex gap-2">
                <button type="button" onClick={copy} className="px-3 py-2 rounded-lg text-xs font-bold border flex items-center gap-1.5" style={{ borderColor: PALETTE.linhasBordas }}><Copy size={13} /> Copiar</button>
                <button type="button" onClick={send} disabled={!hasPhone || !text.trim()} className="px-4 py-2 rounded-lg text-xs font-bold text-white flex items-center gap-1.5 disabled:opacity-40" style={{ backgroundColor: '#047857' }}><MessageCircle size={14} /> Enviar no WhatsApp</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
