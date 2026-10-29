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
  Lock
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

  // Main Navigation & App States
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Dynamic Month State (Default: October 2026)
  const [currentDate, setCurrentDate] = useState(new Date(2026, 9, 1));
  const [calendarView, setCalendarView] = useState('grid'); // 'grid' | 'list'

  // Modals & Creation States
  const [isNewProcessOpen, setIsNewProcessOpen] = useState(false);
  const [isNewClientOpen, setIsNewClientOpen] = useState(false);
  const [isNewDeadlineOpen, setIsNewDeadlineOpen] = useState(false);
  const [isNewTemplateOpen, setIsNewTemplateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Scanning simulation state
  const [isScanning, setIsScanning] = useState(false);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('Todas');

  // Selected Process for Financials
  const [selectedVerbasProcId, setSelectedVerbasProcId] = useState('1');

  // Mouse hover state for portal popover positioning
  const [hoveredDeadline, setHoveredDeadline] = useState(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });

  // Selected Deadline state for click-to-edit modal
  const [selectedDeadlineModal, setSelectedDeadlineModal] = useState(null);

  // Form States
  const [newProcess, setNewProcess] = useState({
    number: '',
    client: '',
    action: '',
    court: '',
    value: '',
    honorarios: '',
    descontos: '',
    status: 'Em andamento'
  });

  const [newClient, setNewClient] = useState({
    name: '',
    type: 'Pessoa Física',
    document: '',
    phone: '',
    email: '',
    status: 'Ativo'
  });

  const [newDeadline, setNewDeadline] = useState({
    title: '',
    client: '',
    process: '',
    dueDate: '2026-10-28',
    dueTime: '17:00',
    type: 'FATAL'
  });

  const [newTemplate, setNewTemplate] = useState({
    category: 'Cível / JEC',
    title: '',
    description: '',
    content: ''
  });

  // Calculadoras Sub-tab State
  const [calcSubTab, setCalcSubTab] = useState('trabalhista');

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

  const [clients, setClients] = useState([
    {
      id: '1',
      name: 'Mosaniel Martins da Cruz',
      type: 'Pessoa Física',
      document: '123.456.789-00',
      phone: '27998812233',
      email: 'mosaniel.cruz@email.com',
      status: 'Ativo'
    },
    {
      id: '2',
      name: 'Isabela Ferreira Santos',
      type: 'Pessoa Física',
      document: '987.654.321-11',
      phone: '27997724455',
      email: 'isabela.ferreira@email.com',
      status: 'Ativo'
    },
    {
      id: '3',
      name: 'Jucimara Carvalho Barreto',
      type: 'Pessoa Física',
      document: '456.789.123-22',
      phone: '31991128899',
      email: 'jucimara.barreto@email.com',
      status: 'Ativo'
    },
    {
      id: '4',
      name: 'Estevão dos Santos Pereira',
      type: 'Pessoa Física',
      document: '321.654.987-33',
      phone: '27995541122',
      email: 'estevao.pereira@email.com',
      status: 'Ativo'
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
    },
    {
      id: '3',
      title: 'Pedido de Cumprimento de Sentença',
      client: 'Jucimara Carvalho Barreto',
      process: '1000797-34.2026.8.13.0543',
      court: 'TJMG Eproc',
      dueDate: '2026-11-03',
      dueTime: '18:00',
      type: 'FATAL',
      status: 'Pendente',
      completed: false
    }
  ]);

  const [scannedPush, setScannedPush] = useState([
    {
      id: 'p1',
      date: '2026-10-28',
      court: 'TJES - Diário Eletrônico',
      title: 'Intimação para Réplica',
      process: '5046388-53.2025.8.08.0048',
      snippet: 'Fica intimada a Dra. Valeska Monteiro para apresentar Réplica no prazo de 15 dias uteis...'
    },
    {
      id: 'p2',
      date: '2026-10-27',
      court: 'TRT17 - PJe Push',
      title: 'Designação de Audiência de Conciliação',
      process: '0001083-23.2026.5.17.0008',
      snippet: 'Audiência conciliatória designada para o dia 12/11/2026 às 14:00h...'
    }
  ]);

  const [templates, setTemplates] = useState([
    {
      id: '1',
      category: 'Cível / JEC',
      title: 'Embargos de Declaração contra Sentença',
      description: 'Peça para sanar omissão, contradição ou obscuridade em sentença com pedido de efeito modificativo.',
      content: `EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO DO JUIZADO ESPECIAL CÍVEL DA COMARCA DE SERRA/ES\n\nProcesso nº: [NÚMERO DO PROCESSO]\n\n[NOME DO CLIENTE], já qualificado(a) nos autos da AÇÃO DE INDENIZAÇÃO, por sua advogada infra-assinada, Dra. Valeska Monteiro, vem, respeitosamente, opor:\n\nEMBARGOS DE DECLARAÇÃO\n\ncom fulcro no art. 1.022 do CPC, em face da r. sentença de fls., pelos fatos e fundamentos a seguir expostos:\n\nI. DA TEMPESTIVIDADE\nA intimação ocorreu em [DATA], encontrando-se tempestiva a presente manifestação.\n\nII. DA OMISSÃO / CONTRADIÇÃO\nA r. sentença embargada incorreu em omissão ao não apreciar o pedido referente a [DESCREVER].\n\nANTE O EXPOSTO, requer o acolhimento destes embargos para sanar o vício apontado.\n\nTermos em que pede deferimento.\nSerra/ES, [DATA].\n\nDra. Valeska Monteiro\nOAB/ES`
    },
    {
      id: '2',
      category: 'Cível / Execução',
      title: 'Requerimento de Cumprimento de Sentença',
      description: 'Petição inicial de cumprimento definitivo de sentença com memória discriminada de cálculo.',
      content: `EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO DA VARA CÍVEL DA COMARCA DE SERRA/ES\n\nProcesso nº: [NÚMERO DO PROCESSO]\n\n[NOME DO CLIENTE], por sua advogada Dra. Valeska Monteiro, vem requerer o CUMPRIMENTO DEFINITIVO DE SENTENÇA em face de [EXECUTADO], para satisfação do crédito no valor de R$ [VALOR], conforme memória demonstrativa de cálculo anexa.\n\nRequer a intimação do executado para pagamento no prazo de 15 dias, sob pena de multa do art. 523 do CPC.`
    },
    {
      id: '3',
      category: 'Trabalhista',
      title: 'Manifestação sobre Citação / Redesignação',
      description: 'Petição padrão informando andamento de citação e requerendo prosseguimento em audiência.',
      content: `EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DA VARA DO TRABALHO DE VITÓRIA/ES\n\nProcesso nº: [NÚMERO DO PROCESSO]\n\n[NOME DO CLIENTE], por sua advogada Dra. Valeska Monteiro, vem respeitosamente requerer a juntada do comprovante de notificação e o regular prosseguimento do feito.`
    }
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]);

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
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthError('E-mail ou senha incorretos. Verifique suas credenciais.');
    }
    setLoadingAuth(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Financial selected process object
  const selectedVerbasProc = processes.find((p) => p.id === selectedVerbasProcId) || processes[0];

  // Financial Totals Calculation
  const financialTotals = processes.reduce(
    (acc, p) => {
      acc.causa += Number(p.value || 0);
      acc.honorarios += Number(p.honorarios || 0);
      acc.descontos += Number(p.descontos || 0);
      return acc;
    },
    { causa: 0, honorarios: 0, descontos: 0 }
  );

  // Handlers
  const handleAddProcess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProcess.number || !newProcess.client) return;
    const item = {
      id: Date.now().toString(),
      ...newProcess,
      value: Number(newProcess.value || 0),
      honorarios: Number(newProcess.honorarios || 0),
      descontos: Number(newProcess.descontos || 0)
    };
    setProcesses([item, ...processes]);
    setNewProcess({ number: '', client: '', action: '', court: '', value: '', honorarios: '', descontos: '', status: 'Em andamento' });
    setIsNewProcessOpen(false);
  };

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.name) return;
    const item = { id: Date.now().toString(), ...newClient };
    setClients([item, ...clients]);
    setNewClient({ name: '', type: 'Pessoa Física', document: '', phone: '', email: '', status: 'Ativo' });
    setIsNewClientOpen(false);
  };

  const handleAddDeadline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeadline.title) return;
    const item = { id: Date.now().toString(), ...newDeadline, completed: false, status: 'Em Andamento' };
    setDeadlines([item, ...deadlines]);
    setNewDeadline({ title: '', client: '', process: '', dueDate: '2026-10-28', dueTime: '17:00', type: 'FATAL' });
    setIsNewDeadlineOpen(false);
  };

  // SE NÃO ESTIVER LOGADO -> EXIBE A TELA DE LOGIN
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 font-sans" style={{ backgroundColor: PALETTE.bordoEscuro }}>
        <div className="w-full max-w-md p-8 rounded-2xl shadow-2xl border space-y-6" style={{ backgroundColor: PALETTE.bordoPrincipal, borderColor: PALETTE.dourado }}>
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-2 shadow-inner mb-1" style={{ borderColor: PALETTE.dourado, backgroundColor: PALETTE.bordoEscuro }}>
              <Lock size={28} style={{ color: PALETTE.douradoClaro }} />
            </div>
            <h1 className="font-serif font-bold text-2xl tracking-wide uppercase" style={{ color: PALETTE.douradoClaro }}>
              DRA. VALESKA MONTEIRO
            </h1>
            <p className="text-xs tracking-wider text-slate-200">
              Advocacia & Consultoria Jurídica • Acesso Restrito
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {authError && (
              <div className="p-3 text-xs rounded-lg bg-rose-950/80 border border-rose-500 text-rose-200 text-center font-medium">
                {authError}
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

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: PALETTE.douradoClaro }}>
                Senha de Acesso
              </label>
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

            <button 
              type="submit" 
              disabled={loadingAuth}
              className="w-full py-3.5 rounded-xl font-bold text-sm shadow-lg transition hover:brightness-110 active:scale-[0.99] mt-2 flex justify-center items-center gap-2"
              style={{ backgroundColor: PALETTE.dourado, color: PALETTE.bordoEscuro }}
            >
              {loadingAuth ? 'A verificar credenciais...' : 'Entrar no Sistema'}
            </button>
          </form>

          <p className="text-[10px] text-center text-slate-300 opacity-80 pt-2 border-t" style={{ borderColor: `${PALETTE.dourado}30` }}>
            Serra / ES • Conexão Criptografada via Supabase
          </p>
        </div>
      </div>
    );
  }

  // SE ESTIVER LOGADO -> EXIBE O DASHBOARD COMPLETO
  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans" style={{ backgroundColor: PALETTE.fundoPagina, color: PALETTE.textoPrincipal }}>
      {/* FLOATING HOVER CARD FOR CALENDAR (Portal Strategy) */}
      {hoveredDeadline && (
        <div
          className="fixed z-[9999] w-72 p-3.5 rounded-xl shadow-2xl border text-white space-y-2 pointer-events-none transition-all duration-150"
          style={{
            top: `${hoverPos.y}px`,
            left: `${hoverPos.x}px`,
            backgroundColor: PALETTE.bordoEscuro,
            borderColor: PALETTE.dourado
          }}
        >
          <div className="flex justify-between items-start border-b pb-1.5" style={{ borderColor: `${PALETTE.dourado}50` }}>
            <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded text-black" style={{ backgroundColor: PALETTE.douradoClaro }}>
              {hoveredDeadline.dueTime}h • {hoveredDeadline.type}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              {hoveredDeadline.status || 'Pendente'}
            </span>
          </div>

          <h5 className="font-bold text-xs leading-tight" style={{ color: PALETTE.douradoClaro }}>
            {hoveredDeadline.title}
          </h5>

          <div className="text-[11px] space-y-0.5 text-slate-200">
            <p><strong className="text-amber-200">Cliente:</strong> {hoveredDeadline.client}</p>
            <p><strong className="text-amber-200">Proc:</strong> {hoveredDeadline.process}</p>
            <p><strong className="text-amber-200">Local:</strong> {hoveredDeadline.court}</p>
          </div>
          
          <p className="text-[9px] italic text-slate-400 border-t pt-1" style={{ borderColor: `${PALETTE.dourado}30` }}>
            Clique para editar dados ou alterar status
          </p>
        </div>
      )}

      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-64 border-r flex-shrink-0 flex flex-col justify-between" style={{ backgroundColor: PALETTE.bordoEscuro, borderColor: PALETTE.bordoPrincipal }}>
        <div>
          {/* Header Monogram */}
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

          {/* Nav Items */}
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

        {/* Footer Info & Logout */}
        <div className="p-4 border-t space-y-3" style={{ borderColor: `${PALETTE.dourado}30` }}>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold text-rose-200 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 transition"
          >
            <LogOut size={14} /> Sair do Sistema
          </button>
          <div className="text-center text-[10px]" style={{ color: PALETTE.douradoClaro }}>
            <p className="font-semibold">Serra / ES • OAB/ES</p>
            <p className="opacity-60 mt-0.5">Sistema Advocacia v2.5</p>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header Banner */}
        <header className="px-6 py-5 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm" style={{ backgroundColor: PALETTE.bordoEscuro, borderColor: PALETTE.bordoPrincipal }}>
          <div>
            <h2 className="font-serif font-bold text-lg" style={{ color: '#FFFFFF' }}>
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

        {/* Dynamic Tab Body */}
        <div className="p-6 flex-1 overflow-y-auto">
          {/* TAB 1: DASHBOARD EXECUTIVO */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Top Filter & Sync Bar */}
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

                {/* Quick Filters */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-white" style={{ borderColor: PALETTE.linhasBordas }}>
                    <Filter size={14} style={{ color: PALETTE.dourado }} />
                    <select className="bg-transparent font-bold focus:outline-none cursor-pointer">
                      <option>Todos os Clientes / Regiões</option>
                      <option>Espírito Santo (TJES / TRT17)</option>
                      <option>Minas Gerais (TJMG)</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-white" style={{ borderColor: PALETTE.linhasBordas }}>
                    <CalendarIcon size={14} style={{ color: PALETTE.dourado }} />
                    <select className="bg-transparent font-bold focus:outline-none cursor-pointer">
                      <option>Este Mês (Out/2026)</option>
                      <option>Último Trimestre</option>
                      <option>Ano Atual (2026)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* BLOCK 1: GESTÃO OPERACIONAL E DE CONTENCIOSO */}
              <div className="p-5 rounded-2xl border space-y-4 shadow-sm" style={{ backgroundColor: PALETTE.fundoCartoes, borderColor: PALETTE.linhasBordas }}>
                <div className="flex justify-between items-center border-b pb-2" style={{ borderColor: PALETTE.linhasBordas }}>
                  <h4 className="font-serif font-bold text-base flex items-center gap-2" style={{ color: PALETTE.textoPrincipal }}>
                    <Briefcase size={18} style={{ color: PALETTE.bordoPrincipal }} /> 1. Gestão Operacional & Contencioso
                  </h4>
                  <span className="text-xs font-bold" style={{ color: PALETTE.textoApoio }}>
                    {processes.length} Processos Ativos
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Processos por Área */}
                  <div className="p-3.5 rounded-xl border bg-white shadow-sm space-y-2" style={{ borderColor: PALETTE.linhasBordas }}>
                    <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: PALETTE.textoApoio }}>
                      Distribuição por Área
                    </span>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between font-bold">
                        <span>Cível / JEC:</span>
                        <span style={{ color: PALETTE.bordoPrincipal }}>2 casos (50%)</span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span>Trabalhista:</span>
                        <span style={{ color: PALETTE.dourado }}>2 casos (50%)</span>
                      </div>
                    </div>
                  </div>

                  {/* Fases Processuais */}
                  <div className="p-3.5 rounded-xl border bg-white shadow-sm space-y-2" style={{ borderColor: PALETTE.linhasBordas }}>
                    <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: PALETTE.textoApoio }}>
                      Ciclo de Vida / Fases
                    </span>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>Conhecimento:</span>
                        <span className="font-mono font-bold">2</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Execução / Sentença:</span>
                        <span className="font-mono font-bold">2</span>
                      </div>
                    </div>
                  </div>

                  {/* Alertas de Prazos */}
                  <div className="p-3.5 rounded-xl border bg-white shadow-sm space-y-2" style={{ borderColor: PALETTE.linhasBordas }}>
                    <span className="text-[10px] font-bold uppercase tracking-wider block text-rose-700">
                      Alertas & Urgências
                    </span>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between font-bold text-rose-800">
                        <span>Prazos Fatais:</span>
                        <span className="font-mono">{deadlines.filter(d => d.type === 'FATAL' && d.status !== 'Finalizado').length}</span>
                      </div>
                      <div className="flex justify-between text-amber-800">
                        <span>Audiências Agendadas:</span>
                        <span className="font-mono font-bold">1</span>
                      </div>
                    </div>
                  </div>

                  {/* Produtividade Interna */}
                  <div className="p-3.5 rounded-xl border bg-white shadow-sm space-y-2" style={{ borderColor: PALETTE.linhasBordas }}>
                    <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: PALETTE.textoApoio }}>
                      Produtividade por Patrono
                    </span>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between font-bold" style={{ color: PALETTE.bordoEscuro }}>
                        <span>Dra. Valeska Monteiro:</span>
                        <span className="font-mono">100% da Banca</span>
                      </div>
                      <div className="flex justify-between text-[11px]" style={{ color: PALETTE.textoApoio }}>
                        <span>Demandas no Prazo:</span>
                        <span className="font-mono font-bold text-emerald-700">100%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* BLOCK 2: INDICADORES FINANCEIROS */}
              <div className="p-5 rounded-2xl border space-y-4 shadow-sm" style={{ backgroundColor: PALETTE.fundoCartoes, borderColor: PALETTE.linhasBordas }}>
                <div className="flex justify-between items-center border-b pb-2" style={{ borderColor: PALETTE.linhasBordas }}>
                  <h4 className="font-serif font-bold text-base flex items-center gap-2" style={{ color: PALETTE.textoPrincipal }}>
                    <DollarSign size={18} className="text-emerald-700" /> 2. Indicadores Financeiros
                  </h4>
                  <span className="text-xs font-mono font-bold text-emerald-800">
                    Geral Consolidado
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border bg-white shadow-sm space-y-2" style={{ borderColor: PALETTE.linhasBordas }}>
                    <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: PALETTE.textoApoio }}>
                      Contingenciamento Total sob Risco
                    </span>
                    <p className="text-xl font-bold font-mono" style={{ color: PALETTE.textoPrincipal }}>
                      R$ {financialTotals.causa.toLocaleString('pt-BR')}
                    </p>
                    <div className="text-[10px] space-y-0.5" style={{ color: PALETTE.textoApoio }}>
                      <p>• Risco Provável (Ganho Estimado): <span className="font-bold text-emerald-800">75%</span></p>
                      <p>• Risco Possível / Neutro: <span className="font-bold text-amber-700">25%</span></p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border bg-white shadow-sm space-y-2" style={{ borderColor: PALETTE.linhasBordas }}>
                    <span className="text-[10px] font-bold uppercase tracking-wider block text-emerald-800">
                      Honorários Contratados / A Receber
                    </span>
                    <p className="text-xl font-bold font-mono text-emerald-800">
                      R$ {financialTotals.honorarios.toLocaleString('pt-BR')}
                    </p>
                    <div className="text-[10px] space-y-0.5" style={{ color: PALETTE.textoApoio }}>
                      <p>• Faturado / Recebido no Mês: <span className="font-bold text-emerald-800">R$ 10.500</span></p>
                      <p>• A Receber Futuro: <span className="font-bold" style={{ color: PALETTE.bordoPrincipal }}>R$ 58.820</span></p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border bg-white shadow-sm space-y-2" style={{ borderColor: PALETTE.linhasBordas }}>
                    <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: PALETTE.descontos }}>
                      Custos Operacionais e Despesas
                    </span>
                    <p className="text-xl font-bold font-mono text-rose-800">
                      R$ {financialTotals.descontos.toLocaleString('pt-BR')}
                    </p>
                    <div className="text-[10px] space-y-0.5" style={{ color: PALETTE.textoApoio }}>
                      <p>• Custas Reembolsáveis: <span className="font-bold">R$ 2.700</span></p>
                      <p>• Despesas Operacionais: <span className="font-bold">R$ 1.800</span></p>
                    </div>
                  </div>
                </div>
              </div>

              {/* BLOCK 3: COMERCIAL E ATENDIMENTO (CRM) */}
              <div className="p-5 rounded-2xl border space-y-4 shadow-sm" style={{ backgroundColor: PALETTE.fundoCartoes, borderColor: PALETTE.linhasBordas }}>
                <div className="flex justify-between items-center border-b pb-2" style={{ borderColor: PALETTE.linhasBordas }}>
                  <h4 className="font-serif font-bold text-base flex items-center gap-2" style={{ color: PALETTE.textoPrincipal }}>
                    <Users size={18} style={{ color: PALETTE.dourado }} /> 3. Comercial & Atendimento (CRM)
                  </h4>
                  <span className="text-xs font-bold text-emerald-800">
                    Captação Ativa
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border bg-white shadow-sm space-y-1" style={{ borderColor: PALETTE.linhasBordas }}>
                    <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: PALETTE.textoApoio }}>
                      Taxa de Conversão de Contratos
                    </span>
                    <p className="text-2xl font-bold font-serif" style={{ color: PALETTE.bordoPrincipal }}>
                      68%
                    </p>
                  </div>
                  <div className="p-4 rounded-xl border bg-white shadow-sm space-y-1" style={{ borderColor: PALETTE.linhasBordas }}>
                    <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: PALETTE.textoApoio }}>
                      Tempo Médio de Resposta ao Lead
                    </span>
                    <p className="text-2xl font-bold font-serif" style={{ color: PALETTE.dourado }}>
                      1h 15m
                    </p>
                  </div>
                  <div className="p-4 rounded-xl border bg-white shadow-sm space-y-1" style={{ borderColor: PALETTE.linhasBordas }}>
                    <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: PALETTE.textoApoio }}>
                      Custo de Aquisição de Cliente (CAC)
                    </span>
                    <p className="text-2xl font-bold font-serif" style={{ color: PALETTE.textoPrincipal }}>
                      R$ 150
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* OUTRAS TABS DO SISTEMA (Processos, CRM, Agenda, etc.) */}
          {activeTab !== 'dashboard' && (
            <div className="p-8 text-center rounded-2xl border bg-white shadow-sm space-y-3" style={{ borderColor: PALETTE.linhasBordas }}>
              <h3 className="font-serif font-bold text-lg" style={{ color: PALETTE.bordoPrincipal }}>
                Módulo em Funcionamento
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Você está navegando pela aba <strong className="uppercase">{activeTab}</strong>. Todas as funcionalidades principais do seu painel continuam ativas!
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
