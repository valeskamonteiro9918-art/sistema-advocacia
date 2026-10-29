import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import {
  Briefcase,
  Users,
  Calendar as CalendarIcon,
  Search,
  Plus,
  Trash2,
  DollarSign,
  FileText,
  Copy,
  ChevronLeft,
  ChevronRight,
  Pencil,
  MessageCircle,
  Filter,
  X,
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
  // Autenticação Supabase State
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [isResetMode, setIsResetMode] = useState(false);

  // Main Navigation & App States
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Dynamic Month State
  const [currentDate, setCurrentDate] = useState(new Date(2026, 9, 1));
  const [calendarView, setCalendarView] = useState('grid');

  // Modals & Creation States
  const [isNewProcessOpen, setIsNewProcessOpen] = useState(false);
  const [isNewClientOpen, setIsNewClientOpen] = useState(false);
  const [isNewDeadlineOpen, setIsNewDeadlineOpen] = useState(false);
  const [isNewTemplateOpen, setIsNewTemplateOpen] = useState(false);

  // Filters & Hover States
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [selectedVerbasProcId, setSelectedVerbasProcId] = useState('1');
  const [hoveredDeadline, setHoveredDeadline] = useState(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });

  // Main Data States
  const [processes, setProcesses] = useState([
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

  const [deadlines, setDeadlines] = useState([
    {
      id: '1',
      title: 'Manifestação sobre Sentença / Embargos',
      client: 'Mosaniel Martins da Cruz',
      process: '5046388-53.2025.8.08.0048',
      court: 'TJES - 4º JEC Serra',
      dueDate: '2026-10-28',
      dueTime: '23:59',
      type: 'FATAL',
      status: 'Em Andamento',
      completed: false
    },
    {
      id: '2',
      title: 'Audiência UNA Presencial TRT17',
      client: 'Estevão dos Santos Pereira',
      process: '0001478-18.2026.5.17.0007',
      court: 'TRT17 - 7ª Vara',
      dueDate: '2026-10-30',
      dueTime: '14:00',
      type: 'NORMAL',
      status: 'Em Andamento',
      completed: false
    }
  ]);

  // Monitor Supabase Auth State
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
      setAuthError('E-mail ou senha incorretos. Verifique suas credenciais.');
    }
    setLoadingAuth(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setAuthError('Por favor, informe seu e-mail para redefinir a senha.');
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

  const financialTotals = processes.reduce(
    (acc, p) => {
      acc.causa += Number(p.value || 0);
      acc.honorarios += Number(p.honorarios || 0);
      acc.descontos += Number(p.descontos || 0);
      return acc;
    },
    { causa: 0, honorarios: 0, descontos: 0 }
  );

  // TELA DE LOGIN OU REDEFINIÇÃO DE SENHA
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

  // PAINEL PRINCIPAL DO SISTEMA
  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans" style={{ backgroundColor: PALETTE.fundoPagina, color: PALETTE.textoPrincipal }}>
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 border-r flex-shrink-0 flex flex-col justify-between" style={{ backgroundColor: PALETTE.bordoEscuro, borderColor: PALETTE.bordoPrincipal }}>
        <div>
          <div className="p-6 text-center border-b" style={{ borderColor: `${PALETTE.dourado}30` }}>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-2 shadow-md mb-2" style={{ borderColor: PALETTE.dourado, backgroundColor: PALETTE.bordoPrincipal }}>
              <span className="font-serif font-bold text-xl tracking-wider" style={{ color: PALETTE.douradoClaro }}>
                VM
              </span>
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

        {/* Rodapé da Barra Lateral (Apenas o Botão de Sair) */}
        <div className="p-4 border-t" style={{ borderColor: `${PALETTE.dourado}30` }}>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold text-rose-200 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 transition"
          >
            <LogOut size={14} /> Sair do Sistema
          </button>
        </div>
      </aside>

      {/* ÁREA DE CONTEÚDO PRINCIPAL */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="px-6 py-5 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm" style={{ backgroundColor: PALETTE.bordoEscuro, borderColor: PALETTE.bordoPrincipal }}>
          <div>
            <h2 className="font-serif font-bold text-lg text-white">
              Advocacia & Consultoria Jurídica
            </h2>
            <p className="text-xs" style={{ color: PALETTE.douradoClaro }}>
              Dra. Valeska Monteiro • Serra / ES
            </p>
          </div>

          <button
            onClick={() => setIsNewProcessOpen(true)}
            className="px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md hover:brightness-110 transition"
            style={{ backgroundColor: PALETTE.dourado, color: PALETTE.bordoEscuro }}
          >
            + Novo Processo
          </button>
        </header>

        <div className="p-6 flex-1 overflow-y-auto">
          {/* DASHBOARD EXECUTIVO COMPLETO */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Barra do Topo */}
              <div className="p-4 rounded-2xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm" style={{ backgroundColor: PALETTE.fundoCartoes, borderColor: PALETTE.linhasBordas }}>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded text-white" style={{ backgroundColor: PALETTE.bordoPrincipal }}>
                      Painel Executivo
                    </span>
                    <span className="text-xs font-mono font-semibold" style={{ color: PALETTE.valoresReceber }}>
                      • Conectado via API (Sync Ativo)
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-lg mt-1" style={{ color: PALETTE.textoPrincipal }}>
                    Resumo Operacional, Financeiro & Comercial
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-white" style={{ borderColor: PALETTE.linhasBordas }}>
                    <Filter size={14} style={{ color: PALETTE.dourado }} />
                    <select className="bg-transparent font-bold focus:outline-none cursor-pointer">
                      <option>Todos os Clientes / Regiões</option>
                      <option>Espírito Santo (TJES / TRT17)</option>
                      <option>Minas Gerais (TJMG)</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5 px-3 py-1.5
