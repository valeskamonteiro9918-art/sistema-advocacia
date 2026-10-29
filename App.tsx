import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import {
  Briefcase,
  Users,
  Calendar as CalendarIcon,
  Search,
  DollarSign,
  FileText,
  Copy,
  Calculator,
  LogOut,
  Lock,
  KeyRound
} from 'lucide-react';

const PALETTE = {
  bordoPrincipal: '#7D1F3D',
  bordoEscuro: '#5F1730',
  dourado: '#A8843F',
  douradoClaro: '#D9BD7E',
  fundoPagina: '#F3ECE0',
  fundoCartoes: '#FAF6EE',
  linhasBordas: '#EFE3C8',
  caixaTotal: '#E3D6C0',
  textoPrincipal: '#2A1A20',
  textoApoio: '#7A6A6E',
  valoresReceber: '#2F7A4F',
  descontos: '#A33A3A'
};

export default function App() {
  // Autenticação Supabase
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [isResetMode, setIsResetMode] = useState(false);

  // Estados da Aplicação
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedVerbasProcId, setSelectedVerbasProcId] = useState('1');
  const [calcSubTab, setCalcSubTab] = useState('trabalhista');

  // Monitorizar Sessão no Supabase
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingAuth(true);
    setAuthError('');
    setAuthSuccess('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthError('E-mail ou senha incorretos. Verifique as suas credenciais.');
    }
    setLoadingAuth(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setAuthError('Por favor, informe o seu e-mail para redefinir a senha.');
      return;
    }

    setLoadingAuth(true);
    setAuthError('');
    setAuthSuccess('');

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });

    if (error) {
      setAuthError(error.message);
    } else {
      setAuthSuccess('Enviamos um e-mail com as instruções para redefinir a senha!');
    }
    setLoadingAuth(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Dados dos Processos
  const [processes] = useState([
    {
      id: '1',
      number: '5046388-53.2025.8.08.0048',
      client: 'Valeska Monteiro (Patrono)',
      action: 'Ação de Indenização por Danos Morais',
      court: 'TJES - 4º JEC de Serra',
      value: 35000,
      honorarios: 10500,
      descontos: 500,
      status: 'Sentença Proferida'
    },
    {
      id: '2',
      number: '0001083-23.2026.5.17.0008',
      client: 'Isabela Ferreira Santos',
      action: 'Reclamação Trabalhista - Horas Extras e Citações',
      court: 'TRT17 - 5ª Vara de Vitória',
      value: 62400,
      honorarios: 18720,
      descontos: 1200,
      status: 'Aguardando Audiência'
    },
    {
      id: '3',
      number: '1000797-34.2026.8.13.0543',
      client: 'Jucimara Carvalho Barreto',
      action: 'Ação Monitória / Cumprimento de Sentença',
      court: 'TJMG - Eproc',
      value: 48900,
      honorarios: 14670,
      descontos: 800,
      status: 'Fase de Execução'
    },
    {
      id: '4',
      number: '0001478-18.2026.5.17.0007',
      client: 'Estevão dos Santos Pereira',
      action: 'Reclamatória Trabalhista UNA',
      court: 'TRT17 - 7ª Vara de Vitória',
      value: 85000,
      honorarios: 25500,
      descontos: 2000,
      status: 'Em andamento'
    }
  ]);

  // Dados dos Clientes
  const [clients] = useState([
    { id: '1', name: 'Mosaniel Martins da Cruz', document: '123.456.789-00', phone: '27998812233', email: 'mosaniel.cruz@email.com', status: 'Ativo' },
    { id: '2', name: 'Isabela Ferreira Santos', document: '987.654.321-11', phone: '27997724455', email: 'isabela.ferreira@email.com', status: 'Ativo' },
    { id: '3', name: 'Jucimara Carvalho Barreto', document: '456.789.123-22', phone: '31991128899', email: 'jucimara.barreto@email.com', status: 'Ativo' },
    { id: '4', name: 'Estevão dos Santos Pereira', document: '321.654.987-33', phone: '27995541122', email: 'estevao.pereira@email.com', status: 'Ativo' }
  ]);

  // Dados da Agenda
  const [deadlines] = useState([
    { id: '1', title: 'Manifestação sobre Sentença / Embargos', client: 'Mosaniel Martins da Cruz', process: '5046388-53.2025.8.08.0048', court: 'TJES - 4º JEC Serra', dueDate: '2026-10-28', dueTime: '23:59', type: 'FATAL', status: 'Em Andamento' },
    { id: '2', title: 'Audiência UNA Presencial TRT17', client: 'Estevão dos Santos Pereira', process: '0001478-18.2026.5.17.0007', court: 'TRT17 - 7ª Vara', dueDate: '2026-10-30', dueTime: '14:00', type: 'NORMAL', status: 'Em Andamento' },
    { id: '3', title: 'Pedido de Cumprimento de Sentença', client: 'Jucimara Carvalho Barreto', process: '1000797-34.2026.8.13.0543', court: 'TJMG Eproc', dueDate: '2026-11-03', dueTime: '18:00', type: 'FATAL', status: 'Pendente' }
  ]);

  // Push / Varredura
  const [scannedPush] = useState([
    { id: 'p1', date: '2026-10-28', court: 'TJES - Diário Eletrônico', title: 'Intimação para Réplica', process: '5046388-53.2025.8.08.0048', snippet: 'Fica intimada a Dra. Valeska Monteiro para apresentar Réplica...' },
    { id: 'p2', date: '2026-10-27', court: 'TRT17 - PJe Push', title: 'Designação de Audiência de Conciliação', process: '0001083-23.2026.5.17.0008', snippet: 'Audiência conciliatória designada para o dia 12/11/2026...' }
  ]);

  // Modelos
  const [templates] = useState([
    { id: '1', category: 'Cível / JEC', title: 'Embargos de Declaração contra Sentença', description: 'Peça para sanar omissão, contradição ou obscuridade em sentença com pedido de efeito modificativo.' },
    { id: '2', category: 'Cível / Execução', title: 'Requerimento de Cumprimento de Sentença', description: 'Petição inicial de cumprimento definitivo de sentença com memória discriminada de cálculo.' }
  ]);

  const selectedVerbasProc = processes.find((p) => p.id === selectedVerbasProcId) || processes[0];

  const financialTotals = processes.reduce(
    (acc, p) => {
      acc.causa += Number(p.value || 0);
      acc.honorarios += Number(p.honorarios || 0);
      acc.descontos += Number(p.descontos || 0);
      return acc;
    },
    { causa: 0, honorarios: 0, descontos: 0 }
  );

  // TELA DE AUTENTICAÇÃO (LOGIN / RECUPERAÇÃO DE SENHA)
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 font-sans" style={{ backgroundColor: PALETTE.bordoEscuro }}>
        <div className="w-full max-w-md p-8 rounded-2xl shadow-2xl border space-y-6" style={{ backgroundColor: PALETTE.bordoPrincipal, borderColor: PALETTE.dourado }}>
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-2 shadow-inner mb-1" style={{ borderColor: PALETTE.dourado, backgroundColor: PALETTE.bordoEscuro }}>
              {isResetMode ? (
                <KeyRound size={28} style={{ color: PALETTE.douradoClaro }} />
              ) : (
                <Lock size={28} style={{ color: PALETTE.douradoClaro }} />
              )}
            </div>
            <h1 className="font-serif font-bold text-2xl tracking-wide uppercase" style={{ color: PALETTE.douradoClaro }}>
              DRA. VALESKA MONTEIRO
            </h1>
            <p className="text-xs tracking-wider text-slate-200">
              {isResetMode ? 'Recuperação de Senha de Acesso' : 'Advocacia & Consultoria Jurídica • Acesso Restrito'}
            </p>
          </div>

          <form onSubmit={isResetMode ? handleResetPassword : handleLogin} className="space-y-4">
            {authError && (
              <div className="p-3 text-xs rounded-lg bg-rose-950/80 border border-rose-500 text-rose-200 text-center font-medium">
                {authError}
              </div>
            )}

            {authSuccess && (
              <div className="p-3 text-xs rounded-lg bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-center font-medium">
                {authSuccess}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: PALETTE.douradoClaro }}>
                E-mail Profissional
              </label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full p-3 rounded-xl bg-black/20 border text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition"
                style={{ borderColor: `${PALETTE.dourado}50` }}
                required 
              />
            </div>

            {!isResetMode && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold uppercase tracking-wider" style={{ color: PALETTE.douradoClaro }}>
                    Senha de Acesso
                  </label>
                  <button 
                    type="button" 
                    onClick={() => { setIsResetMode(true); setAuthError(''); setAuthSuccess(''); }}
                    className="text-[11px] underline hover:text-white transition"
                    style={{ color: PALETTE.douradoClaro }}
                  >
                    Esqueci minha senha
                  </button>
                </div>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-3 rounded-xl bg-black/20 border text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition"
                  style={{ borderColor: `${PALETTE.dourado}50` }}
                  required 
                />
              </div>
            )}

            <button 
              type="submit" 
              disabled={loadingAuth}
              className="w-full py-3.5 rounded-xl font-bold text-sm shadow-lg transition hover:brightness-110 active:scale-[0.99] mt-2 flex justify-center items-center gap-2"
              style={{ backgroundColor: PALETTE.dourado, color: PALETTE.bordoEscuro }}
            >
              {loadingAuth 
                ? 'A processar...' 
                : isResetMode 
                  ? 'Enviar link de redefinição' 
                  : 'Entrar no Sistema'}
            </button>

            {isResetMode && (
              <button 
                type="button" 
                onClick={() => { setIsResetMode(false); setAuthError(''); setAuthSuccess(''); }}
                className="w-full text-center text-xs text-slate-300 underline pt-2 block hover:text-white transition"
              >
                Voltar para o login
              </button>
            )}
          </form>

          <p className="text-[10px] text-center text-slate-300 opacity-80 pt-2 border-t" style={{ borderColor: `${PALETTE.dourado}30` }}>
            Serra / ES • Conexão Criptografada via Supabase
          </p>
        </div>
      </div>
    );
  }

  // PAINEL PRINCIPAL (SÓ APARECE APÓS O LOGIN)
  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans" style={{ backgroundColor: PALETTE.fundoPagina, color: PALETTE.textoPrincipal }}>
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 border-r flex-shrink-0 flex flex-col justify-between" style={{ backgroundColor: PALETTE.bordoEscuro, borderColor: PALETTE.bordoPrincipal }}>
        <div>
          <div className="p-6 text-center border-b" style={{ borderColor: `${PALETTE.dourado}30` }}>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-2 shadow-md mb-2" style={{ borderColor: PALETTE.dourado, backgroundColor: PALETTE.bordoPrincipal }}>
              <span className="font-serif font-bold text-xl tracking-wider" style={{ color: PALETTE.douradoClaro }}>VM</span>
            </div>
            <h1 className="font-serif font-bold text-sm tracking-widest uppercase mt-1" style={{ color: PALETTE.douradoClaro }}>
              DRA. VALESKA MONTEIRO
            </h1>
          </div>

          <nav className="p-3 space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard Executivo', icon: Briefcase },
              { id: 'push', label: 'Varredura & Push', icon: Search },
              { id: 'processes', label: 'Gestão de Processos', icon: FileText },
              { id: 'crm', label: 'Clientes (CRM)', icon: Users },
              { id: 'agenda', label: 'Agenda de Prazos', icon: CalendarIcon },
              { id: 'templates', label: 'Modelos de Peças', icon: Copy },
              { id: 'finances', label: 'Apuração de Verbas', icon: DollarSign },
              { id: 'calculadoras', label: 'Calculadoras Jurídicas', icon: Calculator }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition ${
                    isActive ? 'shadow-md font-bold' : 'hover:bg-white/5 opacity-80'
                  }`}
                  style={{
                    backgroundColor: isActive ? PALETTE.bordoPrincipal : 'transparent',
                    color: isActive ? '#FFFFFF' : PALETTE.fundoPagina
                  }}
                >
                  <Icon size={16} style={{ color: isActive ? PALETTE.douradoClaro : PALETTE.dourado }} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Botão de Sair no Rodapé da Barra Lateral */}
        <div className="p-4 border-t" style={{ borderColor: `${PALETTE.dourado}30` }}>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold text-rose-200 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 transition"
          >
            <LogOut size={14} /> Sair do Sistema
          </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="px-6 py-5 border-b flex justify-between items-center shadow-sm" style={{ backgroundColor: PALETTE.bordoEscuro, borderColor: PALETTE.bordoPrincipal }}>
          <div>
            <h2 className="font-serif font-bold text-lg text-white">Advocacia & Consultoria Jurídica</h2>
            <p className="text-xs" style={{ color: PALETTE.douradoClaro }}>Dra. Valeska Monteiro • Serra / ES</p>
          </div>
        </header>

        <div className="p-6 flex-1 overflow-y-auto">
          {/* DASHBOARD EXECUTIVO */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm" style={{ backgroundColor: PALETTE.fundoCartoes, borderColor: PALETTE.linhasBordas }}>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded text-white" style={{ backgroundColor: PALETTE.bordoPrincipal }}>Painel Executivo</span>
                  <h3 className="font-serif font-bold text-lg mt-1" style={{ color: PALETTE.textoPrincipal }}>Resumo Operacional, Financeiro & Comercial</h3>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border bg-white shadow-sm space-y-1" style={{ borderColor: PALETTE.linhasBordas }}>
                  <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: PALETTE.textoApoio }}>Total da Causa</span>
                  <p className="text-xl font-bold font-mono">R$ {financialTotals.causa.toLocaleString('pt-BR')}</p>
                </div>
                <div className="p-4 rounded-xl border bg-white shadow-sm space-y-1" style={{ borderColor: PALETTE.linhasBordas }}>
                  <span className="text-[10px] font-bold uppercase tracking-wider block text-emerald-800">Honorários Estimados</span>
                  <p className="text-xl font-bold font-mono text-emerald-800">R$ {financialTotals.honorarios.toLocaleString('pt-BR')}</p>
                </div>
                <div className="p-4 rounded-xl border bg-white shadow-sm space-y-1" style={{ borderColor: PALETTE.linhasBordas }}>
                  <span className="text-[10px] font-bold uppercase tracking-wider block text-rose-800">Despesas e Custas</span>
                  <p className="text-xl font-bold font-mono text-rose-800">R$ {financialTotals.descontos.toLocaleString('pt-BR')}</p>
                </div>
              </div>
            </div>
          )}

          {/* VARREDURA & PUSH */}
          {activeTab === 'push' && (
            <div className="space-y-4">
              <h3 className="font-serif font-bold text-lg" style={{ color: PALETTE.bordoPrincipal }}>Varredura de Diários & PJe Push</h3>
              <div className="space-y-3">
                {scannedPush.map((item) => (
                  <div key={item.id} className="p-4 rounded-xl border bg-white shadow-sm space-y-1" style={{ borderColor: PALETTE.linhasBordas }}>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded text-white" style={{ backgroundColor: PALETTE.dourado }}>{item.court}</span>
                    <h4 className="font-bold text-sm">{item.title}</h4>
                    <p className="text-xs text-slate-600">{item.snippet}</p>
                    <p className="text-[10px] font-mono text-slate-400">Processo: {item.process} • {item.date}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GESTÃO DE PROCESSOS */}
          {activeTab === 'processes' && (
            <div className="space-y-4">
              <h3 className="font-serif font-bold text-lg" style={{ color: PALETTE.bordoPrincipal }}>Acervo de Processos</h3>
              <div className="grid grid-cols-1 gap-3">
                {processes.map((p) => (
                  <div key={p.id} className="p-4 rounded-xl border bg-white shadow-sm flex justify-between items-center" style={{ borderColor: PALETTE.linhasBordas }}>
                    <div>
                      <span className="text-xs font-mono font-bold" style={{ color: PALETTE.bordoPrincipal }}>{p.number}</span>
                      <h4 className="font-bold text-sm mt-0.5">{p.action}</h4>
                      <p className="text-xs text-slate-600">Cliente: {p.client} • Tribunal: {p.court}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">{p.status}</span>
                      <p className="text-xs font-mono font-bold mt-1">R$ {p.value.toLocaleString('pt-BR')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CLIENTES (CRM) */}
          {activeTab === 'crm' && (
            <div className="space-y-4">
              <h3 className="font-serif font-bold text-lg" style={{ color: PALETTE.bordoPrincipal }}>Base de Clientes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {clients.map((c) => (
                  <div key={c.id} className="p-4 rounded-xl border bg-white shadow-sm space-y-2" style={{ borderColor: PALETTE.linhasBordas }}>
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-sm">{c.name}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">{c.status}</span>
                    </div>
                    <p className="text-xs text-slate-600">Doc: {c.document} • Tel: {c.phone}</p>
                    <p className="text-xs text-slate-600">E-mail: {c.email}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AGENDA DE PRAZOS */}
          {activeTab === 'agenda' && (
            <div className="space-y-4">
              <h3 className="font-serif font-bold text-lg" style={{ color: PALETTE.bordoPrincipal }}>Agenda de Prazos & Audiências</h3>
              <div className="space-y-3">
                {deadlines.map((d) => (
                  <div key={d.id} className="p-4 rounded-xl border bg-white shadow-sm flex justify-between items-center" style={{ borderColor: PALETTE.linhasBordas }}>
                    <div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded text-white ${d.type === 'FATAL' ? 'bg-rose-700' : 'bg-amber-600'}`}>{d.type}</span>
                      <h4 className="font-bold text-sm mt-1">{d.title}</h4>
                      <p className="text-xs text-slate-600">Cliente: {d.client} • Proc: {d.process}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-mono font-bold text-rose-800">{d.dueDate} às {d.dueTime}</p>
                      <span className="text-xs font-semibold text-slate-500">{d.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MODELOS DE PEÇAS */}
          {activeTab === 'templates' && (
            <div className="space-y-4">
              <h3 className="font-serif font-bold text-lg" style={{ color: PALETTE.bordoPrincipal }}>Biblioteca de Modelos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((t) => (
                  <div key={t.id} className="p-4 rounded-xl border bg-white shadow-sm space-y-2" style={{ borderColor: PALETTE.linhasBordas }}>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded text-white" style={{ backgroundColor: PALETTE.dourado }}>{t.category}</span>
                    <h4 className="font-bold text-sm">{t.title}</h4>
                    <p className="text-xs text-slate-600">{t.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* APURAÇÃO DE VERBAS */}
          {activeTab === 'finances' && (
            <div className="space-y-4">
              <h3 className="font-serif font-bold text-lg" style={{ color: PALETTE.bordoPrincipal }}>Apuração de Verbas & Honorários</h3>
              <div className="p-5 rounded-2xl border bg-white shadow-sm space-y-3" style={{ borderColor: PALETTE.linhasBordas }}>
                <p className="text-xs text-slate-600">Selecione o processo para visualizar a discriminação:</p>
                <select value={selectedVerbasProcId} onChange={(e) => setSelectedVerbasProcId(e.target.value)} className="w-full p-2.5 rounded-xl border text-xs font-bold" style={{ borderColor: PALETTE.linhasBordas }}>
                  {processes.map((p) => (
                    <option key={p.id} value={p.id}>{p.number} - {p.client}</option>
                  ))}
                </select>
                <div className="grid grid-cols-3 gap-3 pt-3">
                  <div className="p-3 rounded-lg bg-slate-50 border text-center" style={{ borderColor: PALETTE.linhasBordas }}>
                    <span className="text-[10px] uppercase font-bold text-slate-500">Valor Causa</span>
                    <p className="text-sm font-mono font-bold">R$ {selectedVerbasProc.value.toLocaleString('pt-BR')}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-center">
                    <span className="text-[10px] uppercase font-bold text-emerald-700">Honorários</span>
                    <p className="text-sm font-mono font-bold text-emerald-800">R$ {selectedVerbasProc.honorarios.toLocaleString('pt-BR')}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-center">
                    <span className="text-[10px] uppercase font-bold text-rose-700">Custas</span>
                    <p className="text-sm font-mono font-bold text-rose-800">R$ {selectedVerbasProc.descontos.toLocaleString('pt-BR')}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CALCULADORAS JURÍDICAS */}
          {activeTab === 'calculadoras' && (
            <div className="space-y-4">
              <h3 className="font-serif font-bold text-lg" style={{ color: PALETTE.bordoPrincipal }}>Calculadoras Jurídicas</h3>
              <div className="p-5 rounded-2xl border bg-white shadow-sm space-y-4" style={{ borderColor: PALETTE.linhasBordas }}>
                <div className="flex gap-2 border-b pb-2" style={{ borderColor: PALETTE.linhasBordas }}>
                  <button onClick={() => setCalcSubTab('trabalhista')} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${calcSubTab === 'trabalhista' ? 'text-white' : 'text-slate-600'}`} style={{ backgroundColor: calcSubTab === 'trabalhista' ? PALETTE.bordoPrincipal : 'transparent' }}>
                    Rescisão Trabalhista
                  </button>
                  <button onClick={() => setCalcSubTab('prazos')} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${calcSubTab === 'prazos' ? 'text-white' : 'text-slate-600'}`} style={{ backgroundColor: calcSubTab === 'prazos' ? PALETTE.bordoPrincipal : 'transparent' }}>
                    Contagem de Prazos
                  </button>
                </div>
                <p className="text-xs text-slate-600">Módulo de simulação operacional ativo.</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
