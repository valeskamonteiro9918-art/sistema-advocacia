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
  Lock,
  LogOut,
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
  // --- AUTENTICAÇÃO SUPABASE ---
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [isResetMode, setIsResetMode] = useState(false);

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
      setAuthError('E-mail ou senha incorretos.');
    }
    setLoadingAuth(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setAuthError('Informe seu e-mail.');
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
      setAuthSuccess('Instruções enviadas para o seu e-mail!');
    }
    setLoadingAuth(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // --- CÓDIGO ORIGINAL INTACTO ---
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
  const [processedScanKeys, setProcessedScanKeys] = useState([]);
  const [taskDraft, setTaskDraft] = useState('');
  const [taskFilter, setTaskFilter] = useState('Todas');
  const [tasks, setTasks] = useState([
    { id: 't1', title: 'Revisar publicação e definir providências', description: 'Conferir prazo e estratégia processual', status: 'A fazer', priority: 'Alta', dueDate: '2026-10-30', assignee: 'Dra. Valeska' },
    { id: 't2', title: 'Preparar documentos para audiência', description: 'Validar documentos com o cliente', status: 'Em andamento', priority: 'Média', dueDate: '2026-11-03', assignee: 'Dra. Valeska' },
    { id: 't3', title: 'Conferir cálculo de verbas', description: 'Revisar valores e descontos', status: 'Em revisão', priority: 'Alta', dueDate: '2026-11-05', assignee: 'Dra. Valeska' }
  ]);

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
  const handleAddProcess = (e) => {
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

  const handleAddClient = (e) => {
    e.preventDefault();
    if (!newClient.name) return;
    const item = { id: Date.now().toString(), ...newClient };
    setClients([item, ...clients]);
    setNewClient({ name: '', type: 'Pessoa Física', document: '', phone: '', email: '', status: 'Ativo' });
    setIsNewClientOpen(false);
  };

  const handleAddDeadline = (e) => {
    e.preventDefault();
    if (!newDeadline.title) return;
    const item = { id: Date.now().toString(), ...newDeadline, completed: false, status: 'Em Andamento' };
    setDeadlines([item, ...deadlines]);
    setNewDeadline({ title: '', client: '', process: '', dueDate: '2026-10-28', dueTime: '17:00', type: 'FATAL' });
    setIsNewDeadlineOpen(false);
  };

  const updateDeadlineStatus = (id, newStatus) => {
    setDeadlines(prev => prev.map(d => d.id === id ? { 
      ...d, 
      status: newStatus, 
      completed: newStatus === 'Finalizado' 
    } : d));
  };

  const handleMouseEnterItem = (e, item) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoverPos({
      x: Math.min(Math.max(rect.left - 40, 10), window.innerWidth - 280),
      y: rect.top < 220 ? rect.bottom + 8 : rect.top - 210
    });
    setHoveredDeadline(item);
  };

  const handleMouseLeaveItem = () => {
    setHoveredDeadline(null);
  };

  const handleAddTemplate = (e) => {
    e.preventDefault();
    if (!newTemplate.title) return;
    if (editingItem?.type === 'template') {
      const updated = { ...editingItem.data, ...newTemplate };
      setTemplates(prev => prev.map(t => t.id === updated.id ? updated : t));
      setSelectedTemplate(updated);
      setEditingItem(null);
    } else {
      const item = { id: Date.now().toString(), ...newTemplate };
      setTemplates(prev => [item, ...prev]);
      setSelectedTemplate(item);
    }
    setNewTemplate({ category: 'Cível / JEC', title: '', description: '', content: '' });
    setIsNewTemplateOpen(false);
  };

  const saveEditedItem = () => {
    if (!editingItem) return;
    const { type, data } = editingItem;
    if (type === 'process') {
      const updated = { ...data, value: Number(data.value || 0), honorarios: Number(data.honorarios || 0), descontos: Number(data.descontos || 0) };
      setProcesses(prev => prev.map(item => item.id === updated.id ? updated : item));
    } else if (type === 'client') {
      setClients(prev => prev.map(item => item.id === data.id ? data : item));
    }
    setEditingItem(null);
  };

  const addTask = (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    const title = String(taskDraft || '').trim();
    if (!title) {
      window.alert('Digite o nome da tarefa antes de clicar em Criar.');
      return;
    }
    setTasks(prev => [{ id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, title, description: '', status: 'A fazer', priority: 'Média', dueDate: '', assignee: 'Dra. Valeska' }, ...prev]);
    setTaskDraft('');
  };

  const moveTask = (taskId, status) => setTasks(prev => prev.map(task => task.id === taskId ? { ...task, status } : task));

  const handleRunScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const newIntimacao = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        court: 'TJES - Capixaba Push',
        title: 'Nova Publicação Disponibilizada',
        process: '5046388-53.2025.8.08.0048',
        snippet: 'Publicação no Diário da Justiça referente a prazo para contestação de reconvenção...'
      };
      const scanKey = `${newIntimacao.process}|${newIntimacao.title}`;
      setScannedPush(prev => {
        const alreadyProcessed = processedScanKeys.includes(scanKey);
        const alreadyVisible = prev.some(item => `${item.process}|${item.title}` === scanKey);
        return alreadyProcessed || alreadyVisible ? prev : [newIntimacao, ...prev];
      });
      setIsScanning(false);
    }, 1200);
  };

  const handleMoveScanToAgenda = (item) => {
    const agendaItem = {
      id: Date.now().toString(),
      title: item.title,
      client: 'Cliente Relacionado ao Processo',
      process: item.process,
      court: item.court,
      dueDate: '2026-11-05',
      dueTime: '23:59',
      type: 'FATAL',
      status: 'Pendente',
      completed: false
    };
    setDeadlines(prev => [...prev, agendaItem]);
    setProcessedScanKeys(prev => [...new Set([...prev, `${item.process}|${item.title}`])]);
    setScannedPush(prev => prev.filter((s) => s.id !== item.id));
  };

  // Calendar Helpers
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const currentYear = currentDate.getFullYear();
  const currentMonthIdx = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

  const totalDays = getDaysInMonth(currentYear, currentMonthIdx);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonthIdx);

  const categories = ['Todas', ...Array.from(new Set(templates.map((t) => t.category)))];
  const filteredTemplates = selectedCategory === 'Todas' ? templates : templates.filter((t) => t.category === selectedCategory);

  // --- TELA DE LOGIN (BLOQUEIA O ACESSO SE NÃO TIVER LOGADO) ---
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 font-sans" style={{ backgroundColor: PALETTE.bordoEscuro }}>
        <div className="w-full max-w-md p-8 rounded-2xl shadow-2xl border space-y-6" style={{ backgroundColor: PALETTE.bordoPrincipal, borderColor: PALETTE.dourado }}>
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-2 shadow-inner mb-1" style={{ borderColor: PALETTE.dourado, backgroundColor: PALETTE.bordoEscuro }}>
              {isResetMode ? <KeyRound size={28} style={{ color: PALETTE.douradoClaro }} /> : <Lock size={28} style={{ color: PALETTE.douradoClaro }} />}
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
              {loadingAuth ? 'A processar...' : isResetMode ? 'Enviar link de redefinição' : 'Entrar no Sistema'}
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

  // --- INTERFACE PRINCIPAL (EXATAMENTE A MESMA DO SEU CÓDIGO) ---
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
              { id: 'tasks', label: 'Tarefas', icon: Briefcase },
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

        {/* Footer Info & Botão Sair */}
        <div className="p-4 border-t text-center text-[10px]" style={{ borderColor: `${PALETTE.dourado}30`, color: PALETTE.douradoClaro }}>
          <p className="font-semibold">Serra / ES • OAB/ES</p>
          <p className="opacity-60 mt-0.5 mb-3">Sistema Advocacia v2.5</p>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold text-rose-200 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 transition"
          >
            <LogOut size={14} /> Sair do Sistema
          </button>
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
                    <p className="text-[10px]" style={{ color: PALETTE.textoApoio }}>
                      Consultas Iniciais convertidas em contratos
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border bg-white shadow-sm space-y-1" style={{ borderColor: PALETTE.linhasBordas }}>
                    <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: PALETTE.textoApoio }}>
                      Tempo Médio de Resposta ao Lead
                    </span>
                    <p className="text-2xl font-bold font-serif" style={{ color: PALETTE.dourado }}>
                      18 min
                    </p>
                    <p className="text-[10px]" style={{ color: PALETTE.textoApoio }}>
                      Atendimento rápido via WhatsApp / Email
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border bg-white shadow-sm space-y-1" style={{ borderColor: PALETTE.linhasBordas }}>
                    <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: PALETTE.textoApoio }}>
                      Custo de Aquisição de Cliente (CAC)
                    </span>
                    <p className="text-2xl font-bold font-serif" style={{ color: PALETTE.textoPrincipal }}>
                      R$ 145,00
                    </p>
                    <p className="text-[10px]" style={{ color: PALETTE.textoApoio }}>
                      Investimento médio por novo cliente captado
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VARREDURA & PUSH */}
          {activeTab === 'push' && (
            <div className="p-6 rounded-2xl border space-y-6" style={{ backgroundColor: PALETTE.fundoCartoes, borderColor: PALETTE.linhasBordas }}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4" style={{ borderColor: PALETTE.linhasBordas }}>
                <div>
                  <h3 className="font-serif font-bold text-lg" style={{ color: PALETTE.textoPrincipal }}>
                    Varredura Eletrônica & Notificações Push
                  </h3>
                  <p className="text-xs" style={{ color: PALETTE.textoApoio }}>
                    Monitoramento em tempo real nos Diários Eletrônicos (TJES, TRT17, TJMG).
                  </p>
                </div>

                <button
                  onClick={handleRunScan}
                  disabled={isScanning}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs text-white flex items-center gap-2 shadow hover:brightness-110 transition shrink-0 disabled:opacity-50"
                  style={{ backgroundColor: PALETTE.bordoPrincipal }}
                >
                  <Search size={15} /> {isScanning ? 'Varrendo Sistemas...' : 'Executar Nova Varredura'}
                </button>
              </div>

              <div className="space-y-3">
                {scannedPush.map((item) => (
                  <div key={item.id} className="p-4 rounded-xl border bg-white shadow-sm space-y-2" style={{ borderColor: PALETTE.linhasBordas }}>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded" style={{ backgroundColor: `${PALETTE.dourado}30`, color: PALETTE.bordoEscuro }}>
                          {item.court}
                        </span>
                        <h4 className="font-bold text-sm mt-1" style={{ color: PALETTE.textoPrincipal }}>{item.title}</h4>
                        <p className="text-xs font-mono" style={{ color: PALETTE.bordoPrincipal }}>Proc: {item.process}</p>
                      </div>
                      <span className="text-xs font-mono font-bold" style={{ color: PALETTE.textoApoio }}>{item.date}</span>
                    </div>

                    <p className="text-xs p-2.5 rounded border italic" style={{ backgroundColor: PALETTE.fundoPagina, borderColor: PALETTE.linhasBordas, color: PALETTE.textoApoio }}>
                      "{item.snippet}"
                    </p>

                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => handleMoveScanToAgenda(item)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-white flex items-center gap-1.5 shadow hover:brightness-110 transition"
                        style={{ backgroundColor: PALETTE.bordoPrincipal }}
                      >
                        <CalendarIcon size={14} /> Adicionar à Agenda e Remover da Varredura
                      </button>
                    </div>
                  </div>
                ))}

                {scannedPush.length === 0 && (
                  <div className="text-center py-8 text-xs italic" style={{ color: PALETTE.textoApoio }}>
                    Nenhuma nova intimação pendente na varredura.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: GESTÃO DE PROCESSOS */}
          {activeTab === 'processes' && (
            <div className="p-6 rounded-2xl border space-y-6" style={{ backgroundColor: PALETTE.fundoCartoes, borderColor: PALETTE.linhasBordas }}>
              <div className="flex justify-between items-center border-b pb-4" style={{ borderColor: PALETTE.linhasBordas }}>
                <div>
                  <h3 className="font-serif font-bold text-lg" style={{ color: PALETTE.textoPrincipal }}>
                    Gestão de Processos
                  </h3>
                  <p className="text-xs" style={{ color: PALETTE.textoApoio }}>
                    Listagem e acompanhamento das ações ativas do escritório.
                  </p>
                </div>

                <button
                  onClick={() => setIsNewProcessOpen(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow hover:brightness-110 transition"
                  style={{ backgroundColor: PALETTE.bordoPrincipal }}
                >
                  <Plus size={15} /> Adicionar Processo
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {processes.map((proc) => (
                  <div key={proc.id} className="p-4 rounded-xl border bg-white shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" style={{ borderColor: PALETTE.linhasBordas }}>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold" style={{ color: PALETTE.bordoPrincipal }}>{proc.number}</span>
                        <button onClick={() => setEditingItem({ type: 'process', data: { ...proc } })} className="p-1 hover:bg-black/5 rounded" title="Editar processo">
                          <Pencil size={13} style={{ color: PALETTE.dourado }} />
                        </button>
                        <button onClick={() => { if (window.confirm('Excluir este processo?')) setProcesses(prev => prev.filter(p => p.id !== proc.id)); }} className="p-1 hover:bg-rose-50 rounded" title="Excluir processo">
                          <Trash2 size={13} className="text-rose-600" />
                        </button>
                      </div>
                      <h4 className="font-bold text-sm" style={{ color: PALETTE.textoPrincipal }}>{proc.client}</h4>
                      <p className="text-xs" style={{ color: PALETTE.textoApoio }}>{proc.action} • {proc.court}</p>
                    </div>

                    <div className="text-right flex sm:flex-col justify-between w-full sm:w-auto items-center sm:items-end">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: `${PALETTE.dourado}30`, color: PALETTE.bordoEscuro }}>
                        {proc.status}
                      </span>
                      <span className="font-mono text-sm font-bold text-emerald-800 mt-1">
                        R$ {proc.value?.toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: CLIENTES (CRM) */}
          {activeTab === 'crm' && (
            <div className="p-6 rounded-2xl border space-y-6" style={{ backgroundColor: PALETTE.fundoCartoes, borderColor: PALETTE.linhasBordas }}>
              <div className="flex justify-between items-center border-b pb-4" style={{ borderColor: PALETTE.linhasBordas }}>
                <div>
                  <h3 className="font-serif font-bold text-lg" style={{ color: PALETTE.textoPrincipal }}>
                    CRM de Clientes
                  </h3>
                  <p className="text-xs" style={{ color: PALETTE.textoApoio }}>
                    Base de contatos e integração com WhatsApp.
                  </p>
                </div>

                <button
                  onClick={() => setIsNewClientOpen(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow hover:brightness-110 transition"
                  style={{ backgroundColor: PALETTE.bordoPrincipal }}
                >
                  <Plus size={15} /> Cadastrar Cliente
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {clients.map((cli) => (
                  <div key={cli.id} className="p-4 rounded-xl border bg-white shadow-sm space-y-3" style={{ borderColor: PALETTE.linhasBordas }}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-sm" style={{ color: PALETTE.textoPrincipal }}>{cli.name}</h4>
                        <p className="text-xs" style={{ color: PALETTE.textoApoio }}>{cli.type} • CPF/CNPJ: {cli.document}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setEditingItem({ type: 'client', data: { ...cli } })} className="p-1 hover:bg-black/5 rounded" title="Editar cliente">
                          <Pencil size={14} style={{ color: PALETTE.dourado }} />
                        </button>
                        <button onClick={() => { if (window.confirm('Excluir este cliente?')) setClients(prev => prev.filter(c => c.id !== cli.id)); }} className="p-1 hover:bg-rose-50 rounded" title="Excluir cliente">
                          <Trash2 size={14} className="text-rose-600" />
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 border-t flex justify-between items-center text-xs" style={{ borderColor: PALETTE.linhasBordas }}>
                      <span style={{ color: PALETTE.textoApoio }}>{cli.email}</span>
                      
                      <a
                        href={`https://wa.me/55${cli.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg font-bold text-white flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 transition shadow-sm"
                      >
                        <MessageCircle size={14} /> WhatsApp
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: AGENDA DE PRAZOS */}
          {activeTab === 'agenda' && (
            <div className="p-6 rounded-2xl border space-y-6" style={{ backgroundColor: PALETTE.fundoCartoes, borderColor: PALETTE.linhasBordas }}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4" style={{ borderColor: PALETTE.linhasBordas }}>
                <div>
                  <h3 className="font-serif font-bold text-lg" style={{ color: PALETTE.textoPrincipal }}>
                    Agenda Processual
                  </h3>
                  <p className="text-xs" style={{ color: PALETTE.textoApoio }}>
                    Acompanhamento de compromissos e prazos com status de andamento e inspeção flutuante.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex bg-white rounded-xl border p-1" style={{ borderColor: PALETTE.linhasBordas }}>
                    <button
                      onClick={() => setCalendarView('grid')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        calendarView === 'grid' ? 'shadow-sm text-white' : 'hover:bg-black/5'
                      }`}
                      style={{
                        backgroundColor: calendarView === 'grid' ? PALETTE.bordoPrincipal : 'transparent',
                        color: calendarView === 'grid' ? '#FFFFFF' : PALETTE.textoPrincipal
                      }}
                    >
                      Mês (Grade)
                    </button>
                    <button
                      onClick={() => setCalendarView('list')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        calendarView === 'list' ? 'shadow-sm text-white' : 'hover:bg-black/5'
                      }`}
                      style={{
                        backgroundColor: calendarView === 'list' ? PALETTE.bordoPrincipal : 'transparent',
                        color: calendarView === 'list' ? '#FFFFFF' : PALETTE.textoPrincipal
                      }}
                    >
                      Lista
                    </button>
                  </div>

                  <button
                    onClick={() => setIsNewDeadlineOpen(true)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow hover:brightness-110 transition"
                    style={{ backgroundColor: PALETTE.bordoPrincipal }}
                  >
                    <Plus size={15} /> Cadastrar Prazo
                  </button>
                </div>
              </div>

              {/* Grid Calendar View */}
              {calendarView === 'grid' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-white p-3 rounded-xl border" style={{ borderColor: PALETTE.linhasBordas }}>
                    <button onClick={prevMonth} className="p-1.5 hover:bg-black/5 rounded-lg">
                      <ChevronLeft size={18} style={{ color: PALETTE.bordoPrincipal }} />
                    </button>
                    <h4 className="font-serif font-bold text-base uppercase tracking-wider" style={{ color: PALETTE.bordoEscuro }}>
                      {monthName}
                    </h4>
                    <button onClick={nextMonth} className="p-1.5 hover:bg-black/5 rounded-lg">
                      <ChevronRight size={18} style={{ color: PALETTE.bordoPrincipal }} />
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs p-2 bg-white rounded-xl border" style={{ borderColor: PALETTE.linhasBordas, color: PALETTE.textoApoio }}>
                    <div>Dom</div><div>Seg</div><div>Ter</div><div>Qua</div><div>Qui</div><div>Sex</div><div>Sáb</div>
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: firstDay }).map((_, i) => (
                      <div key={`empty-${i}`} className="h-28 rounded-xl border border-dashed opacity-30" style={{ borderColor: PALETTE.linhasBordas }} />
                    ))}

                    {Array.from({ length: totalDays }).map((_, i) => {
                      const dayNum = i + 1;
                      const dateStr = `${currentYear}-${String(currentMonthIdx + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                      const dayDeadlines = deadlines.filter((d) => d.dueDate === dateStr);

                      return (
                        <div
                          key={`day-${dayNum}`}
                          onClick={() => { setNewDeadline(prev => ({ ...prev, dueDate: dateStr })); setIsNewDeadlineOpen(true); }}
                          title="Clique para cadastrar um compromisso neste dia"
                          className="h-28 p-2 rounded-xl border bg-white flex flex-col justify-between hover:border-amber-400 transition relative overflow-visible cursor-pointer"
                          style={{ borderColor: PALETTE.linhasBordas }}
                        >
                          <span className="font-bold text-xs font-mono" style={{ color: PALETTE.textoPrincipal }}>
                            {dayNum}
                          </span>

                          <div className="space-y-1 overflow-y-auto flex-1 my-1">
                            {dayDeadlines.map((item) => (
                              <div
                                key={item.id}
                                onMouseEnter={(e) => handleMouseEnterItem(e, item)}
                                onMouseLeave={handleMouseLeaveItem}
                                onClick={(e) => { e.stopPropagation(); setSelectedDeadlineModal({ ...item }); }}
                                className="p-1.5 rounded text-[10px] font-bold cursor-pointer transition truncate border shadow-sm"
                                style={{
                                  backgroundColor: item.completed ? '#D1FAE5' : item.type === 'FATAL' ? '#FEE2E2' : '#FEF3C7',
                                  color: item.completed ? '#065F46' : item.type === 'FATAL' ? '#991B1B' : '#92400E',
                                  borderColor: item.type === 'FATAL' ? '#FCA5A5' : PALETTE.dourado
                                }}
                              >
                                <span className={item.completed ? 'line-through opacity-70' : ''}>
                                  {item.dueTime} • {item.title}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* List View */}
              {calendarView === 'list' && (
                <div className="space-y-3">
                  {deadlines.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedDeadlineModal({ ...item })}
                      className="p-4 rounded-xl border bg-white shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 cursor-pointer hover:border-amber-400 transition"
                      style={{ borderColor: PALETTE.linhasBordas }}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded text-white" style={{ backgroundColor: item.type === 'FATAL' ? PALETTE.descontos : PALETTE.dourado }}>
                            {item.type}
                          </span>
                          <span className="font-mono text-xs font-bold" style={{ color: PALETTE.bordoPrincipal }}>
                            {item.dueDate} às {item.dueTime}h
                          </span>
                        </div>
                        <h4 className={`font-bold text-sm ${item.completed ? 'line-through text-slate-400' : ''}`} style={{ color: PALETTE.textoPrincipal }}>
                          {item.title}
                        </h4>
                        <p className="text-xs" style={{ color: PALETTE.textoApoio }}>
                          Cliente: {item.client} • Proc: {item.process}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border" style={{ borderColor: PALETTE.dourado }}>
                          {item.status || 'Pendente'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: MODELOS DE PEÇAS */}
          {activeTab === 'templates' && (
            <div className="p-6 rounded-2xl border space-y-6" style={{ backgroundColor: PALETTE.fundoCartoes, borderColor: PALETTE.linhasBordas }}>
              <div className="flex justify-between items-center border-b pb-4" style={{ borderColor: PALETTE.linhasBordas }}>
                <div>
                  <h3 className="font-serif font-bold text-lg" style={{ color: PALETTE.textoPrincipal }}>
                    Modelos de Peças
                  </h3>
                  <p className="text-xs" style={{ color: PALETTE.textoApoio }}>
                    Repositório de minutas e petições padronizadas do escritório.
                  </p>
                </div>

                <button
                  onClick={() => { setEditingItem(null); setNewTemplate({ category: 'Cível / JEC', title: '', description: '', content: '' }); setIsNewTemplateOpen(true); }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow hover:brightness-110 transition"
                  style={{ backgroundColor: PALETTE.bordoPrincipal }}
                >
                  <Plus size={15} /> Novo Modelo
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <div className="flex gap-1 overflow-x-auto pb-1">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap border transition ${
                          selectedCategory === cat ? 'text-white' : 'bg-white'
                        }`}
                        style={{
                          backgroundColor: selectedCategory === cat ? PALETTE.bordoPrincipal : 'transparent',
                          borderColor: PALETTE.linhasBordas
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2">
                    {filteredTemplates.map((tmpl) => (
                      <div
                        key={tmpl.id}
                        onClick={() => setSelectedTemplate(tmpl)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition ${
                          selectedTemplate?.id === tmpl.id ? 'bg-white shadow-md border-amber-500' : 'bg-white/60 hover:bg-white'
                        }`}
                        style={{ borderColor: PALETTE.linhasBordas }}
                      >
                        <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: PALETTE.dourado }}>
                          {tmpl.category}
                        </span>
                        <h4 className="font-bold text-xs mt-0.5" style={{ color: PALETTE.textoPrincipal }}>{tmpl.title}</h4>
                        <div className="flex gap-2 mt-2">
                          <button onClick={(e) => { e.stopPropagation(); setNewTemplate({ category: tmpl.category, title: tmpl.title, description: tmpl.description, content: tmpl.content }); setEditingItem({ type: 'template', data: { ...tmpl } }); setIsNewTemplateOpen(true); }} className="text-[10px] font-bold flex items-center gap-1" style={{ color: PALETTE.bordoPrincipal }}><Pencil size={11}/> Editar</button>
                          <button onClick={(e) => { e.stopPropagation(); if (window.confirm('Excluir este modelo de peça?')) { setTemplates(prev => prev.filter(t => t.id !== tmpl.id)); if (selectedTemplate?.id === tmpl.id) setSelectedTemplate(templates.find(t => t.id !== tmpl.id) || null); } }} className="text-[10px] font-bold flex items-center gap-1 text-rose-700"><Trash2 size={11}/> Excluir</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedTemplate && (
                  <div className="md:col-span-2 p-5 rounded-xl border bg-white shadow-sm space-y-4" style={{ borderColor: PALETTE.linhasBordas }}>
                    <div className="flex justify-between items-center border-b pb-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded text-white" style={{ backgroundColor: PALETTE.bordoPrincipal }}>
                          {selectedTemplate.category}
                        </span>
                        <h3 className="font-serif font-bold text-base mt-1" style={{ color: PALETTE.textoPrincipal }}>
                          {selectedTemplate.title}
                        </h3>
                      </div>

                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(selectedTemplate.content);
                          alert('Modelo copiado para a área de transferência!');
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-white flex items-center gap-1.5 shadow"
                        style={{ backgroundColor: PALETTE.dourado }}
                      >
                        <Copy size={14} /> Copiar Peça
                      </button>
                    </div>

                    <pre className="p-4 rounded-xl border font-mono text-xs whitespace-pre-wrap leading-relaxed overflow-y-auto max-h-[500px]" style={{ backgroundColor: PALETTE.fundoPagina, borderColor: PALETTE.linhasBordas, color: PALETTE.textoPrincipal }}>
                      {selectedTemplate.content}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: FINANCEIRO */}
          {activeTab === 'finances' && (
            <div className="p-6 rounded-2xl border space-y-6" style={{ backgroundColor: PALETTE.fundoCartoes, borderColor: PALETTE.linhasBordas }}>
              <div className="border-b pb-4" style={{ borderColor: PALETTE.linhasBordas }}>
                <h3 className="font-serif font-bold text-lg" style={{ color: PALETTE.textoPrincipal }}>
                  Financeiro Executivo
                </h3>
                <p className="text-xs" style={{ color: PALETTE.textoApoio }}>
                  Gestão completa de honorários, fluxo de caixa, custas e prestação de contas.
                </p>
              </div>

              {/* 1. KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border bg-white shadow-sm space-y-1" style={{ borderColor: PALETTE.linhasBordas }}>
                  <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: PALETTE.textoApoio }}>Saldo em Conta</span>
                  <p className="text-xl font-bold font-mono text-emerald-800">R$ 148.500,00</p>
                </div>
                <div className="p-4 rounded-xl border bg-white shadow-sm space-y-1" style={{ borderColor: PALETTE.linhasBordas }}>
                  <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: PALETTE.textoApoio }}>Projeção 30/60/90d</span>
                  <p className="text-xl font-bold font-mono" style={{ color: PALETTE.bordoPrincipal }}>R$ 210.800,00</p>
                </div>
                <div className="p-4 rounded-xl border bg-white shadow-sm space-y-1" style={{ borderColor: PALETTE.linhasBordas }}>
                  <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: PALETTE.textoApoio }}>Taxa Inadimplência</span>
                  <p className="text-xl font-bold font-mono text-amber-800">4,2% (R$ 3.100)</p>
                </div>
                <div className="p-4 rounded-xl border bg-white shadow-sm space-y-1" style={{ borderColor: PALETTE.linhasBordas }}>
                  <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: PALETTE.textoApoio }}>Honorários a Receber</span>
                  <p className="text-xl font-bold font-mono text-emerald-700">R$ 69.390,00</p>
                </div>
              </div>

              {/* 2. Seleção de Processo para Apuração */}
              <div className="p-4 rounded-xl border bg-white shadow-sm space-y-3" style={{ borderColor: PALETTE.linhasBordas }}>
                <label className="font-bold text-xs block" style={{ color: PALETTE.textoPrincipal }}>
                  Selecionar Processo para Apuração e Prestação de Contas
                </label>
                <select
                  value={selectedVerbasProcId}
                  onChange={(e) => setSelectedVerbasProcId(e.target.value)}
                  className="w-full p-2.5 border rounded-xl font-bold text-xs bg-amber-50 cursor-pointer"
                  style={{ borderColor: PALETTE.dourado }}
                >
                  {processes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.number} • {p.client} ({p.action})
                    </option>
                  ))}
                </select>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
                  <div className="p-3 rounded-lg border bg-amber-50/50" style={{ borderColor: PALETTE.linhasBordas }}>
                    <span className="block text-[10px] font-bold text-slate-500">VALOR TOTAL DA CAUSA</span>
                    <input aria-label="Valor total da causa" type="number" value={selectedVerbasProc.value ?? 0} onChange={(e) => setProcesses(prev => prev.map(p => p.id === selectedVerbasProc.id ? { ...p, value: Number(e.target.value) } : p))} className="w-full mt-1 p-1.5 border rounded font-mono text-sm font-bold text-slate-800" />
                  </div>
                  <div className="p-3 rounded-lg border bg-emerald-50/50" style={{ borderColor: PALETTE.linhasBordas }}>
                    <span className="block text-[10px] font-bold text-emerald-700">HONORÁRIOS CONTRATADOS</span>
                    <input aria-label="Honorários contratados" type="number" value={selectedVerbasProc.honorarios ?? 0} onChange={(e) => setProcesses(prev => prev.map(p => p.id === selectedVerbasProc.id ? { ...p, honorarios: Number(e.target.value) } : p))} className="w-full mt-1 p-1.5 border rounded font-mono text-sm font-bold text-emerald-900" />
                  </div>
                  <div className="p-3 rounded-lg border bg-rose-50/50" style={{ borderColor: PALETTE.linhasBordas }}>
                    <span className="block text-[10px] font-bold text-rose-700">DESCONTOS E CUSTAS</span>
                    <input aria-label="Descontos e custas" type="number" value={selectedVerbasProc.descontos ?? 0} onChange={(e) => setProcesses(prev => prev.map(p => p.id === selectedVerbasProc.id ? { ...p, descontos: Number(e.target.value) } : p))} className="w-full mt-1 p-1.5 border rounded font-mono text-sm font-bold text-rose-900" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: TAREFAS - QUADRO DINÂMICO */}
          {activeTab === 'tasks' && (
            <div className="space-y-5">
              <div className="p-6 rounded-2xl border shadow-sm" style={{ backgroundColor: PALETTE.fundoCartoes, borderColor: PALETTE.linhasBordas }}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-serif font-bold text-lg" style={{ color: PALETTE.textoPrincipal }}>Quadro de Tarefas</h3>
                    <p className="text-xs mt-1" style={{ color: PALETTE.textoApoio }}>Organize atividades por etapa, prioridade e prazo. Arraste os cartões entre as colunas.</p>
                  </div>
                  <form onSubmit={addTask} className="flex gap-2 w-full md:w-auto">
                    <input value={taskDraft} onChange={e => setTaskDraft(e.target.value)} placeholder="Nome da nova tarefa..." className="flex-1 md:w-64 p-2.5 border rounded-xl text-xs bg-white" style={{ borderColor: PALETTE.linhasBordas }} />
                    <button type="button" onClick={() => addTask()} disabled={!taskDraft.trim()} className="px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed" style={{ backgroundColor: PALETTE.bordoPrincipal }}><Plus size={14}/> Criar</button>
                  </form>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  <button onClick={() => setTaskFilter('Todas')} className="px-3 py-1.5 rounded-lg text-xs font-bold border" style={{ backgroundColor: taskFilter === 'Todas' ? PALETTE.bordoPrincipal : '#fff', color: taskFilter === 'Todas' ? '#fff' : PALETTE.textoPrincipal, borderColor: PALETTE.linhasBordas }}>Todas</button>
                  {['Alta', 'Média', 'Baixa'].map(priority => <button key={priority} onClick={() => setTaskFilter(priority)} className="px-3 py-1.5 rounded-lg text-xs font-bold border" style={{ backgroundColor: taskFilter === priority ? PALETTE.bordoPrincipal : '#fff', color: taskFilter === priority ? '#fff' : PALETTE.textoPrincipal, borderColor: PALETTE.linhasBordas }}>{priority} prioridade</button>)}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
                {['A fazer', 'Em andamento', 'Em revisão', 'Concluída'].map(status => {
                  const columnTasks = tasks.filter(task => task.status === status && (taskFilter === 'Todas' || task.priority === taskFilter));
                  return <section key={status} onDragOver={e => e.preventDefault()} onDrop={e => { const id = e.dataTransfer.getData('text/plain'); if (id) moveTask(id, status); }} className="rounded-2xl border p-3 min-h-72" style={{ backgroundColor: '#EDE4D6', borderColor: PALETTE.linhasBordas }}>
                    <div className="flex items-center justify-between px-1 pb-3">
                      <h4 className="text-xs font-bold uppercase tracking-wide" style={{ color: PALETTE.bordoEscuro }}>{status}</h4>
                      <span className="text-[10px] rounded-full px-2 py-1 bg-white font-bold">{columnTasks.length}</span>
                    </div>
                    <div className="space-y-3">
                      {columnTasks.map(task => <article key={task.id} draggable onDragStart={e => e.dataTransfer.setData('text/plain', task.id)} className="p-3 rounded-xl bg-white border shadow-sm cursor-grab active:cursor-grabbing space-y-2" style={{ borderColor: PALETTE.linhasBordas }}>
                        <div className="flex justify-between gap-2 items-start">
                          <h5 className="text-xs font-bold leading-relaxed" style={{ color: PALETTE.textoPrincipal }}>{task.title}</h5>
                          <button onClick={() => { if (window.confirm('Excluir esta tarefa?')) setTasks(prev => prev.filter(t => t.id !== task.id)); }} title="Excluir tarefa" className="text-rose-600"><Trash2 size={13}/></button>
                        </div>
                        {task.description && <p className="text-[10px]" style={{ color: PALETTE.textoApoio }}>{task.description}</p>}
                        <div className="flex flex-wrap gap-1.5">
                          <span className="text-[9px] font-bold px-2 py-1 rounded-full" style={{ backgroundColor: task.priority === 'Alta' ? '#FEE2E2' : task.priority === 'Média' ? '#FEF3C7' : '#D1FAE5', color: task.priority === 'Alta' ? '#991B1B' : task.priority === 'Média' ? '#92400E' : '#065F46' }}>{task.priority}</span>
                          {task.dueDate && <span className="text-[9px] px-2 py-1 rounded-full bg-slate-100 text-slate-600">{task.dueDate}</span>}
                        </div>
                        <div className="flex gap-1 pt-1">
                          <select aria-label="Prioridade da tarefa" value={task.priority} onChange={e => setTasks(prev => prev.map(t => t.id === task.id ? { ...t, priority: e.target.value } : t))} className="min-w-0 flex-1 text-[10px] border rounded p-1 bg-white">
                            <option>Alta</option><option>Média</option><option>Baixa</option>
                          </select>
                          <select aria-label="Mover tarefa" value={task.status} onChange={e => moveTask(task.id, e.target.value)} className="min-w-0 flex-1 text-[10px] border rounded p-1 bg-white">
                            {['A fazer', 'Em andamento', 'Em revisão', 'Concluída'].map(s => <option key={s}>{s}</option>)}
                          </select>
                        </div>
                      </article>)}
                      {columnTasks.length === 0 && <p className="text-[10px] text-center py-8 opacity-60">Solte uma tarefa aqui</p>}
                    </div>
                  </section>;
                })}
              </div>
            </div>
          )}

          {/* TAB 8: CALCULADORAS JURÍDICAS */}
          {activeTab === 'calculadoras' && (
            <div className="p-6 rounded-2xl border space-y-6" style={{ backgroundColor: PALETTE.fundoCartoes, borderColor: PALETTE.linhasBordas }}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4" style={{ borderColor: PALETTE.linhasBordas }}>
                <div>
                  <h3 className="font-serif font-bold text-lg" style={{ color: PALETTE.textoPrincipal }}>
                    Calculadoras Jurídicas
                  </h3>
                  <p className="text-xs" style={{ color: PALETTE.textoApoio }}>
                    Simulação completa de verbas trabalhistas e apuração de gasto mensal da criança.
                  </p>
                </div>

                {/* Sub-tab switcher */}
                <div className="flex bg-white rounded-xl border p-1" style={{ borderColor: PALETTE.linhasBordas }}>
                  <button
                    onClick={() => setCalcSubTab('trabalhista')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      calcSubTab === 'trabalhista' ? 'shadow-sm text-white' : 'hover:bg-black/5'
                    }`}
                    style={{
                      backgroundColor: calcSubTab === 'trabalhista' ? PALETTE.bordoPrincipal : 'transparent',
                      color: calcSubTab === 'trabalhista' ? '#FFFFFF' : PALETTE.textoPrincipal
                    }}
                  >
                    Calculadora Trabalhista
                  </button>
                  <button
                    onClick={() => setCalcSubTab('crianca')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      calcSubTab === 'crianca' ? 'shadow-sm text-white' : 'hover:bg-black/5'
                    }`}
                    style={{
                      backgroundColor: calcSubTab === 'crianca' ? PALETTE.bordoPrincipal : 'transparent',
                      color: calcSubTab === 'crianca' ? '#FFFFFF' : PALETTE.textoPrincipal
                    }}
                  >
                    Gasto Mensal da Criança
                  </button>
                </div>
              </div>

              {/* Sub-tab 1: Trabalhista */}
              {calcSubTab === 'trabalhista' && (
                <div className="w-full rounded-2xl overflow-hidden border shadow-sm bg-white" style={{ borderColor: PALETTE.linhasBordas }}>
                  <iframe
                    title="Calculadora Trabalhista"
                    className="w-full h-[900px] border-0"
                    srcDoc={`<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Calculadora de Verbas Trabalhistas | Valeska Monteiro</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<style>
:root{--bg:#f3ece0;--card:#faf6ee;--ink:#2a1a20;--mute:#7a6a6e;--wine:#7d1f3d;--wine2:#5f1730;--gold:#a8843f;--tint:#efe3c8;--line:#e3d6c0;--ok:#2f7a4f;--neg:#a33a3a;--accent:#7d1f3d;
box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#1d1115;--card:#2a1a20;--ink:#f3ece0;--mute:#b9a6ae;--tint:#3a2a24;--line:#43303a;--ok:#6fcf97;--neg:#ef8d8d;--accent:#e08aa3;--gold:#d9bd7e;color-scheme:dark}}
:root[data-theme="dark"]{--bg:#1d1115;--card:#2a1a20;--ink:#f3ece0;--mute:#b9a6ae;--tint:#3a2a24;--line:#43303a;--ok:#6fcf97;--neg:#ef8d8d;--accent:#e08aa3;--gold:#d9bd7e;color-scheme:dark}
html{scroll-padding-top:env(safe-area-inset-top,0px)}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font-family:'Inter',system-ui,sans-serif;line-height:1.5}
.hero{background:linear-gradient(var(--wine),var(--wine2));color:#f6efe2;text-align:center;padding:34px 18px 38px}
.kicker{color:#d9bd7e;letter-spacing:.2em;font-size:11px;font-weight:600;margin:0 0 8px}
h1{font-family:'Playfair Display',serif;font-size:31px;line-height:1.1;margin:0 auto 10px;max-width:640px}
.hero p{margin:4px auto;max-width:560px;font-size:14px;opacity:.92}
.wrap{max-width:1040px;margin:0 auto;padding:16px 16px 100px}
.chips{display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end;margin-bottom:12px}
.chip{border:1px solid var(--wine);background:transparent;color:var(--accent);border-radius:999px;padding:6px 12px;font:inherit;font-size:12px;cursor:pointer}
.chip.s{cursor:default;color:var(--mute);border-color:var(--line)}
.chip.wine{font-weight:600}
.intro{font-size:14px;color:var(--mute);margin:0 0 16px}
.layout{display:grid;grid-template-columns:1fr 330px;gap:20px;align-items:start}
@media(max-width:860px){.layout{grid-template-columns:1fr}}
details.card{background:var(--card);border:1px solid var(--line);border-radius:10px;margin-bottom:16px}
summary{list-style:none;cursor:pointer;padding:16px 20px;display:flex;justify-content:space-between;align-items:baseline;gap:10px;font-family:'Playfair Display',serif;font-size:20px;font-weight:700;color:var(--accent)}
summary::-webkit-details-marker{display:none}
summary small{font-family:'Inter',sans-serif;font-size:12px;font-weight:600;color:var(--mute)}
summary:focus-visible,button:focus-visible,input:focus-visible,select:focus-visible{outline:2px solid var(--gold);outline-offset:2px}
.body{padding:2px 20px 22px;border-top:1px solid var(--gold)}
.fg{display:grid;grid-template-columns:1fr 1fr;gap:18px 20px;margin-top:14px}
@media(max-width:560px){.fg{grid-template-columns:1fr}}
.full{grid-column:1/-1}
.l{display:block;font-size:11px;letter-spacing:.08em;text-transform:uppercase;font-weight:600;color:var(--mute)}
.f input,.f select{width:100%;border:0;border-bottom:1.5px solid var(--line);background:transparent;color:var(--ink);font:inherit;font-size:16px;padding:8px 0;border-radius:0}
.f input:focus,.f select:focus{border-bottom-color:var(--wine);outline:none}
.f input:focus-visible,.f select:focus-visible{outline:none;border-bottom-color:var(--accent)}
.f textarea{width:100%;min-height:120px;border:1.5px solid var(--line);border-radius:8px;background:transparent;color:var(--ink);font:inherit;font-size:15px;padding:10px 12px;resize:vertical;margin-top:6px}.f textarea:focus{outline:none;border-color:var(--wine)}
.help{font-size:12.5px;color:var(--mute);margin:4px 0 0}
.q{font-weight:600;font-size:15px;margin:20px 0 4px}
.opts{display:grid;gap:8px;margin-top:8px}
.opt{position:relative;display:block;cursor:pointer}
.opt input{position:absolute;opacity:0;inset:0;width:100%;height:100%;cursor:pointer;margin:0}
.box{display:block;border:1.5px solid var(--line);border-radius:10px;padding:11px 14px;background:transparent}
.box b{display:block;font-size:15px}.box span{font-size:12.5px;color:var(--mute)}
.opt input:checked+.box{border-color:var(--wine);background:var(--tint)}
.opt input:focus-visible+.box{outline:2px solid var(--gold);outline-offset:2px}
.row{display:grid;grid-template-columns:1fr 120px 28px;gap:10px;align-items:end;margin-top:10px}
.row button{border:0;background:none;color:var(--mute);font-size:18px;cursor:pointer}
.add{border:0;background:none;color:var(--accent);font:inherit;font-weight:600;font-size:13px;cursor:pointer;margin-top:10px;padding:0}
.sum{position:sticky;top:16px;min-width:0;overflow:hidden;background:var(--card);border:1px solid var(--line);border-radius:10px;padding:18px}
.sum h3{margin:0 0 10px;font-size:11px;letter-spacing:.14em;color:var(--mute)}
.tot{border:1.5px solid var(--gold);background:var(--tint);border-radius:8px;padding:14px;text-align:center}
.tot .v{font-family:'Playfair Display',serif;font-size:30px;font-weight:700;color:var(--accent);line-height:1.1}
.tot .k{font-size:10.5px;letter-spacing:.12em;color:var(--mute)}
.mini{display:flex;gap:12px;justify-content:space-between;font-size:13.5px;padding:8px 2px;border-bottom:1px solid var(--line)}
.hint{font-size:13px;color:var(--mute);margin:12px 0 0}
.sum table{width:100%;border-collapse:collapse;font-size:12.5px;margin-top:6px}
.sum td{padding:5px 2px;border-bottom:1px solid var(--line);vertical-align:top}
.sum td:last-child{text-align:right;white-space:nowrap}
.sum tr.p td:last-child{color:var(--ok)}.sum tr.d td:last-child{color:var(--neg)}
.sum td:first-child{overflow-wrap:anywhere}.sum td.nt{white-space:normal;text-align:left;color:var(--mute);font-size:12px;line-height:1.4;padding-top:10px}.mini b{white-space:nowrap}
.sum summary{font:600 13px 'Inter',sans-serif;padding:10px 0;color:var(--accent)}
.b{display:block;width:100%;border-radius:8px;padding:12px;font:inherit;font-weight:600;font-size:14px;cursor:pointer;margin-top:8px;text-align:center}
.b.w{background:var(--wine);color:#fff;border:1.5px solid var(--wine)}
.b.o{background:transparent;color:var(--ink);border:1.5px solid var(--line)}
.b.ow{background:transparent;color:var(--accent);border:1.5px solid var(--wine)}
.b:disabled{opacity:.45;cursor:not-allowed}
.note{font-size:11.5px;color:var(--mute);margin:12px 0 0}
.bar{display:none}
@media(max-width:860px){.bar{display:flex;position:fixed;left:0;right:0;bottom:0;z-index:5;background:var(--wine);color:#fff;padding:10px 16px calc(10px + env(safe-area-inset-bottom,0px));justify-content:space-between;align-items:center}
.bar button{background:#f6efe2;color:var(--wine);border:0;border-radius:999px;padding:9px 16px;font:inherit;font-weight:600;font-size:13px}.bar b{font-family:'Playfair Display',serif;font-size:22px}.bar small{display:block;font-size:10.5px;opacity:.8}
.sum{position:static}}
#toast{position:fixed;left:50%;bottom:calc(80px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);background:var(--ink);color:var(--bg);padding:10px 16px;border-radius:999px;font-size:14px;opacity:0;pointer-events:none;transition:opacity .2s;z-index:9}
#toast.on{opacity:1}
.hide{display:none!important}
</style>
</head>
<body>
<div class="hero">
<p class="kicker">APURAÇÃO DE VERBAS</p>
<h1>Calculadora de Verbas Trabalhistas e Indenizações</h1>
</div>
<div class="wrap">
<div class="chips">
<span class="chip s" id="saved">Salvo automaticamente neste aparelho</span>
<button class="chip" id="bJson">Baixar dados (.json)</button>
<button class="chip" id="bOpen">Abrir dados (.json)</button>
<button class="chip wine" id="bNew">Novo cálculo</button>
<input type="file" id="fOpen" accept=".json,application/json" class="hide">
</div>
<p class="intro">Responda as perguntas abaixo com os dados do seu contrato de trabalho. Valores aproximados já ajudam: o resumo mostra, em tempo real, uma estimativa do que você pode receber, já com os descontos legais. Se não souber alguma informação, deixe em branco e continue.</p>
<div class="layout"><main>

<details class="card" open><summary>1. Quem é você <small id="s1"></small></summary><div class="body"><div class="fg f">
<div><label class="l" for="nome">Nome completo</label><input id="nome" autocomplete="name" placeholder="Como está nos seus documentos"></div>
<div><label class="l" for="idade">Sua idade</label><input id="idade" type="number" min="14" max="99" inputmode="numeric" placeholder="Ex.: 34"></div>
<div class="full"><label class="l" for="ctps">Carteira de trabalho (PDF), opcional</label><input id="ctps" type="file" accept="application/pdf">
<p class="help" id="ctpsH">Fotografe ou escaneie a página do contrato e salve em PDF. O arquivo não sai do seu aparelho; depois é só enviá-lo no WhatsApp junto com o resumo.</p></div>
</div></div></details>

<details class="card" open><summary>2. Seu contrato de trabalho <small id="s2"></small></summary><div class="body"><div class="fg f">
<div><label class="l" for="adm">Quando você começou a trabalhar</label><input id="adm" type="date"><p class="help">Está na carteira, na página do contrato.</p></div>
<div><label class="l" for="des">Quando o contrato terminou</label><input id="des" type="date"><p class="help">Último dia de trabalho, ou data da demissão.</p></div>
<div><label class="l" for="sal">Seu último salário bruto (R$)</label><input id="sal" type="number" step="0.01" min="0" inputmode="decimal" placeholder="0,00"><p class="help">O valor antes dos descontos, como no contracheque.</p></div>
<div><label class="l" for="venc">Férias que você ainda não tirou</label><select id="venc"><option value="0">Nenhuma, estou com as férias em dia</option><option value="1">1 período (12 meses de trabalho sem tirar)</option><option value="2">2 períodos</option><option value="3">3 períodos ou mais</option></select><p class="help">Cada ano de trabalho dá direito a 30 dias de férias.</p></div>
<div class="full"><label class="l" for="fgts">Saldo do FGTS (R$), se souber</label><input id="fgts" type="number" step="0.01" min="0" inputmode="decimal" placeholder="Deixe em branco se não souber"><p class="help">Veja no app FGTS. Sem esse valor, estimamos 8% do salário por mês trabalhado.</p></div>
</div></div></details>

<details class="card" open><summary>3. Como o contrato terminou <small id="s3"></small></summary><div class="body">
<p class="q">O que aconteceu?</p>
<div class="opts" id="mot">
<label class="opt"><input type="radio" name="motivo" value="sjc" checked><span class="box"><b>A empresa me mandou embora</b><span>Dispensa sem justa causa.</span></span></label>
<label class="opt"><input type="radio" name="motivo" value="ri"><span class="box"><b>A empresa descumpriu o contrato</b><span>Rescisão indireta: salário atrasado, FGTS sem depósito, assédio, ofensas.</span></span></label>
<label class="opt"><input type="radio" name="motivo" value="ac"><span class="box"><b>Fizemos um acordo</b><span>Eu e a empresa combinamos juntos de encerrar (art. 484-A da CLT).</span></span></label>
<label class="opt"><input type="radio" name="motivo" value="pd"><span class="box"><b>Eu pedi para sair</b><span>Pedido de demissão.</span></span></label>
<label class="opt"><input type="radio" name="motivo" value="jc"><span class="box"><b>Fui demitido por justa causa</b><span>A empresa alegou falta grave.</span></span></label>
</div>
<div id="avBox"><p class="q" id="avQ">E o aviso prévio?</p>
<div class="opts">
<label class="opt"><input type="radio" name="aviso" value="ind" checked><span class="box"><b id="avI"></b><span id="avIs"></span></span></label>
<label class="opt"><input type="radio" name="aviso" value="trab"><span class="box"><b id="avT"></b><span id="avTs"></span></span></label>
</div></div>
<div class="fg f">
<p class="q full" style="margin:0">Descontos legais</p><p class="help full" style="margin:-10px 0 0">INSS e Imposto de Renda são calculados automaticamente pelas tabelas oficiais. Responda apenas o que se aplica a você.</p><div><label class="l" for="dep">Dependentes no Imposto de Renda</label><input id="dep" type="number" min="0" value="0" inputmode="numeric"><p class="help">Filhos ou cônjuge que você declara. Na dúvida, deixe 0.</p></div>
<div><label class="l" for="pens">Pensão alimentícia que você paga (%)</label><input id="pens" type="number" step="0.01" min="0" max="100" value="0" inputmode="decimal"><p class="help">Percentual descontado por decisão judicial. Deixe 0 se não paga. Também reduz a base do Imposto de Renda.</p></div>
<div><label class="l" for="vt">Recebia vale-transporte?</label><select id="vt"><option value="0">Não</option><option value="1">Sim (desconto de até 6% do salário)</option></select><p class="help">A lei permite descontar 6% do salário, proporcional aos dias trabalhados.</p></div>
<div><label class="l" for="adi13">13º já adiantado (R$)</label><input id="adi13" type="number" step="0.01" min="0" inputmode="decimal" placeholder="0,00"><p class="help">Se já recebeu a 1ª parcela do 13º este ano, informe o valor.</p></div>
<div><label class="l" for="outd">Outros descontos (R$)</label><input id="outd" type="number" step="0.01" min="0" value="0" inputmode="decimal"><p class="help">Faltas, vales, adiantamentos ou parcela de empréstimo consignado.</p></div>
</div></div></details>

<details class="card"><summary>4. Indenizações, se houver <small id="s4"></small></summary><div class="body">
<p class="q">Você sofreu humilhação, assédio ou ofensa no trabalho? (dano moral)</p>
<div class="opts" id="grau">
<label class="opt"><input type="radio" name="grau" value="0" checked><span class="box"><b>Não, ou prefiro avaliar depois</b></span></label>
<label class="opt"><input type="radio" name="grau" value="3"><span class="box"><b>Leve</b><span>Constrangimento pontual.</span></span></label>
<label class="opt"><input type="radio" name="grau" value="5"><span class="box"><b>Média</b><span>Situações repetidas ou ofensas diretas.</span></span></label>
<label class="opt"><input type="radio" name="grau" value="20"><span class="box"><b>Grave</b><span>Humilhação frequente, assédio, abalo sério.</span></span></label>
<label class="opt"><input type="radio" name="grau" value="50"><span class="box"><b>Gravíssima</b><span>Violência, discriminação ou dano permanente.</span></span></label>
</div>
<div class="f" id="relBox" style="margin-top:14px"><label class="l" for="relato">Conte exatamente o que você sofreu</label><textarea id="relato" maxlength="2000" placeholder="Ex.: fui xingado na frente dos colegas, em que dias, quem fez, se havia testemunhas..."></textarea><p class="help">Escreva com suas palavras, com datas, nomes e o que aconteceu. Quanto mais detalhe, melhor a análise da advogada.</p></div>
<div class="f" id="morBox" style="margin-top:14px"><label class="l" for="mor">Valor que você pretende pedir (R$)</label><input id="mor" type="number" step="0.01" min="0" inputmode="decimal" placeholder="Se não souber, deixe em branco"><p class="help">Opcional. É só a sua expectativa: o valor final é definido pelo juiz.</p></div>
<p class="q">Você teve prejuízos em dinheiro por causa disso? (dano material)</p>
<p class="help">Ex.: remédios, tratamento, transporte, salário que deixou de ganhar. Escreva o item e o valor.</p>
<div class="f" id="mats"></div>
<button class="add" id="addM">+ adicionar item</button>
</div></details>

</main>
<aside class="sum" id="sum">
<h3>RESUMO</h3>
<div class="tot"><div class="v" id="total">R$ 0,00</div><div class="k">TOTAL ESTIMADO</div></div>
<div class="mini"><span>Descontos legais (INSS, IR e outros)</span><b id="rD">R$ 0,00</b></div>
<div class="mini"><span>Verbas rescisórias líquidas</span><b id="rL">R$ 0,00</b></div>
<div class="mini"><span>Danos morais</span><b id="rM">R$ 0,00</b></div>
<div class="mini"><span>Danos materiais</span><b id="rT">R$ 0,00</b></div>
<p class="hint" id="hint">Preencha as etapas 1 e 2 para ver o cálculo.</p>
<details id="det" class="hide"><summary>Ver detalhes do cálculo</summary><table id="tb"></table></details>
<button class="b w" id="wa">Enviar no WhatsApp</button>
<div class="hint hide" id="waBox">O PDF foi baixado: anexe-o na conversa. Se o WhatsApp não abriu, copie a mensagem e envie para <b>(27) 99752-5314</b>.<button class="b ow" id="cpy" style="margin-top:8px">Copiar mensagem</button></div>
<button class="b ow" id="pdf">Gerar PDF com os valores</button>
<p class="hint hide" id="dlbox"></p>
<p class="note">Estimativa informativa, sem valor de cálculo judicial. INSS (tabela progressiva) e IRRF (com dedução por dependente, pensão e redutor de 2026) são calculados automaticamente; aviso e férias indenizados e a multa do FGTS são isentos. Confira as tabelas vigentes. Horas extras, comissões e adicionais não estão incluídos. A análise final é da advogada.</p>
</aside></div></div>
<div class="bar"><div><small>TOTAL ESTIMADO</small><b id="barT">R$ 0,00</b></div><button id="goSum">Ver resumo</button></div>
<div id="toast"></div>
<script>
const $=id=>document.getElementById(id);
const brl=n=>n.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const r2=n=>Math.round(n*100)/100;
const pd=s=>{const[a,b,c]=s.split('-').map(Number);return new Date(a,b-1,c)};
const fd=d=>d.toLocaleDateString('pt-BR');
const dim=(y,m)=>new Date(y,m+1,0).getDate();
const ZAP='5527997525314',IDS=['nome','idade','adm','des','sal','venc','fgts','dep','outd','mor','pens','vt','adi13','relato'];
let R=null,mats=[{d:'',v:''}],arq='',lastTxt='';
const rad=n=>(document.querySelector('input[name="'+n+'"]:checked')||{}).value;

function inss(b){const t=[[1621,.075],[2902.84,.09],[4354.27,.12],[8475.55,.14]];let p=0,v=0;b=Math.min(b,8475.55);for(const[l,a]of t){if(b>p){v+=(Math.min(b,l)-p)*a;p=l}}return r2(v)}
function ir(bruto,ins,dep,ex){const b=bruto-ins-dep*189.59-(ex||0);const t=[[2428.80,0,0],[2826.65,.075,182.16],[3751.05,.15,394.16],[4664.68,.225,675.49],[1e12,.275,908.73]];let i=0;for(const[l,a,d]of t){if(b<=l){i=b*a-d;break}}i=Math.max(0,i);if(bruto<=5000)return 0;if(bruto<=7350)i=Math.max(0,i-(978.62-0.133145*bruto));return r2(i)}
function avos13(a,f){const y=f.getFullYear();let n=0;for(let m=0;m<=f.getMonth();m++){let s=1,e=dim(y,m);if(a.getFullYear()===y){if(m<a.getMonth())continue;if(m===a.getMonth())s=a.getDate()}if(m===f.getMonth())e=f.getDate();if(e-s+1>=15)n++}return n}
function avosFer(a,f){let an=new Date(f.getFullYear(),a.getMonth(),a.getDate());if(an>f)an.setFullYear(an.getFullYear()-1);if(an<a)an=a;let m=(f.getFullYear()-an.getFullYear())*12+f.getMonth()-an.getMonth();if(new Date(an.getFullYear(),an.getMonth()+m,an.getDate())>f)m--;const base=new Date(an.getFullYear(),an.getMonth()+m,an.getDate());const dias=Math.round((f-base)/864e5)+1;if(dias>=15)m++;return Math.min(12,Math.max(0,m))}

function syncAviso(){
 const m=rad('motivo'),pdm=m==='pd';
 $('avBox').classList.toggle('hide',m==='jc');
 if(pdm){$('avQ').textContent='Você vai cumprir o aviso prévio?';
 $('avI').textContent='Não vou cumprir';$('avIs').textContent='A empresa pode descontar 1 salário do que você tem a receber.';
 $('avT').textContent='Vou cumprir (trabalhar até o fim do aviso)';$('avTs').textContent='Nada é descontado.'}
 else{$('avQ').textContent='E o aviso prévio?';
 $('avI').textContent='Fui dispensado na hora e a empresa paga o aviso';$('avIs').textContent='Aviso indenizado: você recebe o valor sem precisar trabalhar.';
 $('avT').textContent='Trabalhei durante o aviso';$('avTs').textContent='O aviso foi cumprido trabalhando; nada a receber por ele.'}
}
function compute(){
 const sal=parseFloat($('sal').value);
 if(!$('adm').value||!$('des').value||!(sal>0))return{miss:'Preencha as datas e o salário (etapa 2) para ver o cálculo.'};
 const adm=pd($('adm').value),des=pd($('des').value);
 if(des<adm)return{miss:'A data em que o contrato terminou precisa ser depois da data de início.'};
 const mot=rad('motivo'),aviso=rad('aviso'),dep=+$('dep').value||0,venc=+$('venc').value||0,outd=+$('outd').value||0;
 const L=[];const add=(t,d,v)=>{if(v)L.push({t,d,v:r2(v)})};
 let anos=des.getFullYear()-adm.getFullYear();if(new Date(des.getFullYear(),adm.getMonth(),adm.getDate())>des)anos--;
 const avDias=Math.min(90,30+3*Math.max(0,anos));
 const empresa=['sjc','ri','ac'].includes(mot),ind=aviso==='ind';
 const proj=(empresa&&ind)?new Date(des.getFullYear(),des.getMonth(),des.getDate()+avDias):des;
 const dias=Math.min(30,des.getDate());const saldo=sal/30*dias;
 add(\`Saldo de salário (\${dias} dias)\`,'p',saldo);
 let avP=0;
 if(empresa&&ind){avP=sal/30*avDias*(mot==='ac'?.5:1);add(\`Aviso prévio indenizado (\${avDias} dias\${mot==='ac'?', 50%':''})\`,'p',avP)}
 let dec=0;
 if(mot!=='jc'){const a13=avos13(adm,proj);dec=sal/12*a13;add(\`13º proporcional (\${a13}/12)\`,'p',dec);
 const af=avosFer(adm,proj);const fp=sal/12*af;add(\`Férias proporcionais (\${af}/12)\`,'p',fp);add('1/3 sobre férias proporcionais','p',fp/3)}
 if(venc>0){add(\`Férias vencidas (\${venc} período\${venc>1?'s':''})\`,'p',sal*venc);add('1/3 sobre férias vencidas','p',sal*venc/3)}
 const meses=Math.max(1,(des.getFullYear()-adm.getFullYear())*12+des.getMonth()-adm.getMonth()+1);
 const saldoF=$('fgts').value!==''?parseFloat($('fgts').value):sal*.08*meses;
 const fgtsRes=.08*(saldo+avP+dec);
 let multa=0;if(mot==='sjc'||mot==='ri')multa=.4*(saldoF+fgtsRes);if(mot==='ac')multa=.2*(saldoF+fgtsRes);
 add(\`Multa do FGTS (\${mot==='ac'?20:40}%)\`,'p',multa);
 const pensP=(+$('pens').value||0)/100;const iN=inss(saldo);const pensS=r2(pensP*(saldo-iN));const bS=Math.max(0,saldo-iN-dep*189.59-pensS);add(\`INSS sobre saldo de salário (base \${brl(saldo)})\`,'d',iN);add(\`IRRF sobre saldo de salário (base \${brl(bS)})\`,'d',ir(saldo,iN,dep,pensS));
 let pensT=pensS;if(dec){const i13=inss(dec),p13=r2(pensP*(dec-i13)),b13=Math.max(0,dec-i13-dep*189.59-p13);add(\`INSS sobre 13º (base \${brl(dec)})\`,'d',i13);add(\`IRRF sobre 13º (base \${brl(b13)})\`,'d',ir(dec,i13,dep,p13));pensT+=p13}
 add(\`Pensão alimentícia (\${(pensP*100).toLocaleString('pt-BR')}%)\`,'d',pensT);
 if($('vt').value==='1')add('Vale-transporte (6% do salário)','d',sal*.06*dias/30);
 add('Adiantamento de 13º já recebido','d',+$('adi13').value||0);
 if(mot==='pd'&&ind)add('Desconto de aviso prévio não cumprido','d',sal);
 add('Outros descontos','d',outd);
 let prov=0,desc=0;L.forEach(l=>l.d==='p'?prov+=l.v:desc+=l.v);
 const liquido=r2(prov-desc),mult=+rad('grau')||0;
 const moral=mult>0&&$('mor').value!==''?parseFloat($('mor').value)||0:0;
 const mat=mats.reduce((s,m)=>s+(parseFloat(m.v)||0),0);
 const mLabel={sjc:'Dispensa sem justa causa',ri:'Rescisão indireta',pd:'Pedido de demissão',ac:'Acordo (art. 484-A CLT)',jc:'Dispensa por justa causa'}[mot];
 return{nome:$('nome').value.trim(),dmDef:mult>0&&!moral,relato:mult>0?$('relato').value.trim():'',idade:$('idade').value,adm,des,sal,mLabel,aviso:mot==='jc'?'Não se aplica':(ind?'Indenizado':'Trabalhado'),avDias,anos,L,fgtsRes:r2(fgtsRes),liquido,desc:r2(desc),moral:r2(moral),mat:r2(mat),matItems:mats.filter(m=>parseFloat(m.v)>0),total:r2(liquido+moral+mat),arq}
}
function renderMats(){
 $('mats').innerHTML=mats.map((m,i)=>\`<div class="row"><div><label class="l">Item</label><input data-i="\${i}" data-k="d" value="\${(m.d||'').replace(/"/g,'&quot;')}" placeholder="Ex.: remédios, transporte"></div><div><label class="l">Valor (R$)</label><input data-i="\${i}" data-k="v" type="number" step="0.01" min="0" inputmode="decimal" value="\${m.v}" placeholder="0,00"></div><button data-x="\${i}" aria-label="Remover item">×</button></div>\`).join('');
}
function update(){
 const sal=parseFloat($('sal').value)||0;
 
$('morBox').classList.toggle('hide',!(+rad('grau')));$('relBox').classList.toggle('hide',!(+rad('grau')));
 R=compute();
 const ok=!R.miss,show=ok?R:{liquido:0,moral:0,mat:0,total:0};
 $('total').textContent=$('barT').textContent=brl(show.total);$('rL').textContent=brl(show.liquido);$('rD').textContent=show.desc?'- '+brl(show.desc):brl(0);$('rM').textContent=show.dmDef?'A definir':brl(show.moral);$('rT').textContent=brl(show.mat);
 
$('det').classList.toggle('hide',!ok);
 $('hint').textContent=ok?'Valores calculados. Use os botões abaixo para copiar, enviar ou gerar o PDF.':R.miss;
 $('s1').textContent=$('nome').value.trim()&&$('idade').value?'✓ completo':'';
 $('s2').textContent=ok?\`✓ \${R.anos} ano(s) de casa\`:'';
 $('s3').textContent=ok?'✓ '+R.mLabel:'';
 $('s4').textContent=ok&&(R.moral||R.mat)?'✓ '+brl(R.moral+R.mat):'';
 if(ok){let h='';R.L.forEach(l=>h+=\`<tr class="\${l.d}"><td>\${l.t}</td><td>\${l.d==='d'?'- ':''}\${brl(l.v)}</td></tr>\`);h+='<tr><td colspan="2" class="nt">Isentos de INSS e IR: aviso prévio indenizado, férias indenizadas com 1/3 e multa do FGTS.</td></tr>';$('tb').innerHTML=h}
 save();
}
function state(){const s={};IDS.forEach(i=>s[i]=$(i).value);s.motivo=rad('motivo');s.aviso=rad('aviso');s.grau=rad('grau');s.mats=mats;return s}
function apply(s){IDS.forEach(i=>{if(s[i]!==undefined)$(i).value=s[i]});['motivo','aviso','grau'].forEach(n=>{const e=document.querySelector(\`input[name="\${n}"][value="\${s[n]}"]\`);if(e)e.checked=true});mats=(s.mats&&s.mats.length)?s.mats:[{d:'',v:''}];renderMats();syncAviso();update()}
function save(){try{localStorage.setItem('calc-trab',JSON.stringify(state()));const t=new Date();$('saved').textContent='Salvo automaticamente às '+t.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}catch(e){}}
function texto(){
 const r=R;let t=\`*Simulação trabalhista*\\nCliente: \${r.nome}\${r.idade?' ('+r.idade+' anos)':''}\\nAdmissão: \${fd(r.adm)} | Desligamento: \${fd(r.des)}\\nMotivo: \${r.mLabel}\\nAviso prévio: \${r.aviso}\\nÚltimo salário: \${brl(r.sal)}\\n\`;
 if(r.arq)t+=\`Carteira de trabalho (PDF): \${r.arq}\\n\`;
 t+=\`\\n*Verbas*\\n\`;r.L.forEach(l=>t+=\`\${l.d==='d'?'(-) ':''}\${l.t}: \${brl(l.v)}\\n\`);
 t+=\`\\nDescontos legais: - \${brl(r.desc)}\\nVerbas líquidas: \${brl(r.liquido)}\\n\`;
 if(r.moral)t+=\`Danos morais: \${brl(r.moral)}\\n\`;else if(r.dmDef)t+='Danos morais: valor a definir (arbitrado pelo juiz)\\n';if(r.relato)t+=\`Relato do que sofreu: \${r.relato}\\n\`;
 if(r.mat){t+=\`Danos materiais: \${brl(r.mat)}\\n\`;r.matItems.forEach(m=>t+=\` - \${m.d||'Item'}: \${brl(parseFloat(m.v))}\\n\`)}
 return t+\`\\n*Total estimado: \${brl(r.total)}*\\n\\nValores estimados, sujeitos à análise da advogada.\`}
function toast(m){const t=$('toast');t.textContent=m;t.classList.add('on');setTimeout(()=>t.classList.remove('on'),3800)}
function needName(){if(R.miss){toast(R.miss);return true}if(!R.nome){toast('Informe seu nome na etapa 1');$('nome').focus();return true}}
function resetForm(){IDS.forEach(i=>$(i).value='');$('dep').value=0;$('outd').value=0;$('pens').value=0;$('vt').value='0';$('venc').value='0';$('ctps').value='';arq='';apply({motivo:'sjc',aviso:'ind',grau:'0',mats:[]});$('ctpsH').textContent='Fotografe ou escaneie a página do contrato e salve em PDF. O arquivo não sai do seu aparelho; depois é só enviá-lo no WhatsApp junto com o resumo.'}
function ensurePdf(){if(window.jspdf)return Promise.resolve(true);return new Promise(r=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js';s.onload=()=>r(!!window.jspdf);s.onerror=()=>r(false);document.head.appendChild(s)})}
async function saveFile(data,filename){
 let dl=null;try{dl=window.claude?await window.claude.use('downloads'):null}catch(e){}
 if(!dl){const u=URL.createObjectURL(data instanceof Blob?data:new Blob([data]));const bx=$('dlbox');bx.classList.remove('hide');bx.innerHTML='Arquivo pronto: <a href="'+u+'" download="'+filename+'" target="_blank" rel="noopener" style="color:var(--accent);font-weight:600">toque aqui para abrir ou baixar</a>';try{const a=document.createElement('a');a.href=u;a.download=filename;document.body.appendChild(a);a.click();a.remove()}catch(e){}return toast('Arquivo gerado. Se o download não iniciar, use o link abaixo do botão.')}
 try{await dl.save({filename,data})}catch(e){if(!e||e.code!=='declined')toast('Não foi possível salvar ('+((e&&e.code)||'erro')+'). Tente novamente.')}}
document.addEventListener('input',e=>{const t=e.target;$('waBox').classList.add('hide');if(t.dataset&&t.dataset.i!==undefined){mats[+t.dataset.i][t.dataset.k]=t.value}update()});
document.addEventListener('change',e=>{if(e.target.name==='motivo')syncAviso();update()});
document.addEventListener('click',e=>{const x=e.target.dataset&&e.target.dataset.x;if(x!==undefined&&x!==''){mats.splice(+x,1);if(!mats.length)mats=[{d:'',v:''}];renderMats();update()}});
$('addM').onclick=()=>{mats.push({d:'',v:''});renderMats();const i=document.querySelectorAll('#mats input');i[i.length-2].focus()};
$('ctps').onchange=e=>{const f=e.target.files[0];if(!f)return;if(f.type!=='application/pdf'||f.size>15e6){e.target.value='';arq='';$('ctpsH').textContent='Escolha um arquivo PDF de até 15 MB.';return}arq=f.name;$('ctpsH').textContent='Anexado: '+f.name+'. Lembre de enviá-lo no WhatsApp.';update()};
$('wa').onclick=()=>{
 if(needName())return;
 // Abra o WhatsApp imediatamente durante o clique do usuário. Aguardar a geração
 // do PDF antes de window.open fazia o navegador bloquear a nova janela.
 lastTxt=texto();
 const url='https://wa.me/'+ZAP+'?text='+encodeURIComponent(lastTxt);
 const waWindow=window.open(url,'_blank');
 $('waBox').classList.remove('hide');
 if(!waWindow){
   toast('O navegador bloqueou a janela. Permita pop-ups ou use o link do WhatsApp na mensagem abaixo.');
   const fallback=document.createElement('a');
   fallback.href=url;fallback.target='_blank';fallback.rel='noopener';fallback.textContent='Abrir WhatsApp com a mensagem pronta';
   fallback.style.cssText='display:block;margin-top:8px;color:var(--accent);font-weight:700';
   $('waBox').appendChild(fallback);
 }
};
$('bJson').onclick=()=>saveFile(JSON.stringify(state(),null,1),'calculo-trabalhista.json');
$('bOpen').onclick=()=>$('fOpen').click();
$('fOpen').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{apply(JSON.parse(await f.text()));toast('Dados carregados')}catch(x){toast('Arquivo inválido')}e.target.value=''};
$('bNew').onclick=()=>{const bn=$('bNew');if(!bn.dataset.c){bn.dataset.c='1';bn.textContent='Confirmar: apagar tudo';toast('Toque de novo para apagar os dados e começar do zero');setTimeout(()=>{delete bn.dataset.c;bn.textContent='Novo cálculo'},4000);return}delete bn.dataset.c;bn.textContent='Novo cálculo';IDS.forEach(i=>$(i).value='');$('dep').value=0;$('outd').value=0;$('pens').value=0;$('vt').value='0';$('venc').value='0';$('ctps').value='';arq='';apply({motivo:'sjc',aviso:'ind',grau:'0',mats:[]});$('dlbox').classList.add('hide');$('waBox').classList.add('hide');$('ctpsH').textContent='Fotografe ou escaneie a página do contrato e salve em PDF. O arquivo não sai do seu aparelho; depois é só enviá-lo no WhatsApp junto com o resumo.';toast('Novo cálculo iniciado');window.scrollTo({top:0,behavior:'smooth'})};
$('goSum').onclick=()=>$('sum').scrollIntoView({behavior:'smooth'});
async function gerarPdf(){
 if(!await ensurePdf()){toast('Não foi possível carregar o gerador de PDF. Verifique a internet e tente de novo.');return null}
 const d=new window.jspdf.jsPDF({unit:'mm',format:'a4'});const W=210;let y=0;
 const head=()=>{d.setFillColor(125,31,61);d.rect(0,0,W,30,'F');d.setTextColor(246,239,226);d.setFont('times','bold');d.setFontSize(18);d.text('VALESKA MONTEIRO',15,14);d.setTextColor(217,189,126);d.setFont('helvetica','normal');d.setFontSize(9);d.text('Advocacia e Consultoria Jurídica | OAB/ES 41.715',15,21);y=42};
 head();d.setTextColor(42,26,32);d.setFont('times','bold');d.setFontSize(16);d.text('Simulação de verbas trabalhistas e indenizações',15,y);y+=9;
 d.setFont('helvetica','normal');d.setFontSize(10);
 const info=[\`Cliente: \${R.nome}\${R.idade?' ('+R.idade+' anos)':''}\`,\`Admissão: \${fd(R.adm)} Desligamento: \${fd(R.des)}\`,\`Motivo: \${R.mLabel} Aviso prévio: \${R.aviso}\`,\`Último salário: \${brl(R.sal)}\`];
 if(R.arq)info.push(\`Carteira de trabalho (PDF): \${R.arq}\`);
 info.forEach(s=>{d.text(s,15,y);y+=6});y+=4;
 const row=(a,b,bold,neg)=>{if(y>270){d.addPage();head()}d.setFont('helvetica',bold?'bold':'normal');d.setFontSize(10);d.setTextColor(42,26,32);d.text(a,15,y);if(neg)d.setTextColor(163,58,58);d.text(b,195,y,{align:'right'});d.setDrawColor(227,214,192);d.line(15,y+2,195,y+2);y+=7};
 R.L.forEach(l=>row(l.t,(l.d==='d'?'- ':'')+brl(l.v),false,l.d==='d'));
 y+=2;row('Total de descontos legais (INSS, IR e outros)','- '+brl(R.desc),true,true);row('Verbas rescisórias líquidas',brl(R.liquido),true);
 if(R.moral)row('Indenização por danos morais',brl(R.moral),true);else if(R.dmDef)row('Indenização por danos morais','A definir pelo juiz',true);if(R.relato){d.setFont('helvetica','italic');d.setFontSize(9);d.setTextColor(122,106,110);d.splitTextToSize('Relato do cliente: '+R.relato,175).forEach(s=>{if(y>275){d.addPage();head()}d.text(s,18,y);y+=4.5});y+=2}
 if(R.mat){row('Indenização por danos materiais',brl(R.mat),true);R.matItems.forEach(m=>row(' '+(m.d||'Item'),brl(parseFloat(m.v))))}
 y+=4;if(y>262){d.addPage();head()}d.setFillColor(239,227,200);d.setDrawColor(168,132,63);d.rect(15,y-5,180,14,'FD');d.setFont('times','bold');d.setFontSize(14);d.setTextColor(125,31,61);d.text('TOTAL ESTIMADO',18,y+4);d.text(brl(R.total),192,y+4,{align:'right'});y+=20;
 d.setFont('helvetica','italic');d.setFontSize(8);d.setTextColor(122,106,110);
 d.splitTextToSize('Estimativa informativa, sem valor de cálculo judicial. O depósito de FGTS sobre a rescisão ('+brl(R.fgtsRes)+') vai para a conta vinculada e não integra o total. Horas extras, comissões e adicionais não foram considerados. A análise final é feita pela advogada.',180).forEach(s=>{d.text(s,15,y);y+=4});
 d.setFont('helvetica','normal');d.text('Valeska Monteiro OAB/ES 41.715 | Cel: (27) 99752-5314 | contato@valeskamonteiro.adv.br',105,288,{align:'center'});
 return{blob:d.output('blob'),name:'simulacao-trabalhista-'+R.nome.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g,'')+'.pdf'}
};
$('cpy').onclick=async()=>{const t=lastTxt;if(!t)return toast('Nada para copiar.');try{await navigator.clipboard.writeText(t);toast('Mensagem copiada')}catch(e){const a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();try{document.execCommand('copy');toast('Mensagem copiada')}catch(x){toast('Não foi possível copiar')}a.remove()}};
$('pdf').onclick=async()=>{if(needName())return;const f=await gerarPdf();if(f)saveFile(f.blob,f.name)};
try{const s=localStorage.getItem('calc-trab');if(s)apply(JSON.parse(s));else{renderMats();syncAviso();update()}}catch(e){renderMats();syncAviso();update()}
</script>
</body>
</html>`}
                  />
                </div>
              )}

              {/* Sub-tab 2: Criança */}
              {calcSubTab === 'crianca' && (
                <div className="w-full rounded-2xl overflow-hidden border shadow-sm bg-white" style={{ borderColor: PALETTE.linhasBordas }}>
                  <iframe
                    title="Calculadora Gasto Mensal da Criança"
                    className="w-full h-[900px] border-0"
                    srcDoc={`<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Calculadora de Gasto Mensal da Criança</title>
<style>
 @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600;700&display=swap');

 :root{
 --ink:#2a1a20;
 --ink-soft:#7a6a6e;
 --paper:#f3ece0;
 --paper-alt:#faf6ee;
 --burgundy-900:#5f1730;
 --burgundy-700:#7d1f3d;
 --burgundy-500:#7d1f3d;
 --gold-600:#a8843f;
 --gold-300:#d9bd7e;
 --gold-100:#efe3c8;
 --line:#e3d6c0;
 --green-700:#2f7a4f;
 }

 *{box-sizing:border-box;}
 html,body{margin:0;padding:0;}
 body{
 background:var(--paper);
 color:var(--ink);
 font-family:'Inter',sans-serif;
 -webkit-font-smoothing:antialiased;
 padding:0 0 64px;
 }

 h1,h2,h3,.serif{font-family:'Playfair Display',serif;}
 a,button,input,textarea,select{font-family:inherit;}
 button{cursor:pointer;}

 /* header band */
 .band{
 background:linear-gradient(135deg,var(--burgundy-900),var(--burgundy-700));
 color:var(--paper-alt);
 padding:28px 24px 32px;
 text-align:center;
 border-bottom:3px solid var(--gold-600);
 position:relative;
 }
 .band h1{
 font-size:clamp(24px,4vw,34px);
 font-weight:600;
 margin:0 0 8px;
 letter-spacing:0.3px;
 }
 .band p{
 margin:0 auto;
 max-width:560px;
 font-size:14px;
 color:var(--gold-100);
 line-height:1.55;
 }
 .band .eyebrow{
 text-transform:uppercase;
 letter-spacing:2.5px;
 font-size:11px;
 color:var(--gold-300);
 margin-bottom:8px;
 font-weight:600;
 }

 .topbar{
 max-width:1080px;margin:0 auto;padding:16px 20px 0;
 display:flex;justify-content:flex-start;align-items:center;gap:10px;flex-wrap:wrap;
 }
 .savebadge{
 font-size:13px;color:var(--ink-soft);
 background:var(--paper-alt);border:1.5px solid var(--gold-300);
 border-radius:20px;padding:8px 18px;
 }
 .toolbtn{
 font-size:13px;font-weight:600;color:var(--burgundy-700);
 background:var(--paper-alt);border:1.5px solid var(--gold-300);
 border-radius:20px;padding:8px 18px;
 }
 .toolbtn:hover{background:var(--gold-100);}

 .wrap{max-width:1080px;margin:0 auto;padding:0 20px;}

 /* child info card */
 .info-card{
 background:var(--paper-alt);
 border:1px solid var(--line);
 border-radius:10px;
 padding:22px 24px;
 margin-top:14px;
 box-shadow:0 8px 24px -14px rgba(62,15,28,0.35);
 display:grid;
 grid-template-columns:repeat(auto-fit,minmax(170px,1fr));
 gap:16px;
 }
 .field label{
 display:block;
 font-size:11.5px;
 text-transform:uppercase;
 letter-spacing:1px;
 color:var(--ink-soft);
 margin-bottom:6px;
 font-weight:600;
 }
 .field input, .field textarea{
 width:100%;
 border:none;
 border-bottom:1.5px solid var(--gold-300);
 background:transparent;
 padding:6px 2px;
 font-size:15px;
 color:var(--ink);
 outline:none;
 }
 .field input:focus, .field textarea:focus{border-bottom-color:var(--burgundy-700);}

 .instructions{
 max-width:1080px;
 margin:22px auto 6px;
 padding:0 20px;
 font-size:14px;
 color:var(--ink-soft);
 line-height:1.6;
 }

 /* layout */
 .layout{
 max-width:1080px;
 margin:18px auto 0;
 padding:0 20px;
 display:grid;
 grid-template-columns:1fr 330px;
 gap:28px;
 align-items:start;
 }

 /* ledger sections */
 .cat{
 background:var(--paper-alt);
 border:1px solid var(--line);
 border-radius:10px;
 padding:20px 22px 16px;
 margin-bottom:18px;
 }
 .cat-header{
 display:flex;
 justify-content:space-between;
 align-items:center;
 border-bottom:2px solid var(--gold-600);
 padding-bottom:8px;
 margin-bottom:10px;
 cursor:pointer;
 user-select:none;
 }
 .cat-header-left{display:flex;align-items:center;gap:8px;}
 .cat-header h3{
 margin:0;
 font-size:19px;
 font-weight:600;
 color:var(--burgundy-700);
 letter-spacing:0.2px;
 }
 .cat-chevron{
 font-size:12px;color:var(--gold-600);
 transition:transform .18s ease;
 display:inline-block;
 }
 .cat.collapsed .cat-chevron{transform:rotate(-90deg);}
 .cat.collapsed .items,.cat.collapsed .add-item{display:none;}
 .cat-subtotal{
 font-family:'Playfair Display',serif;
 font-size:16px;
 font-weight:600;
 color:var(--ink-soft);
 white-space:nowrap;
 }

 .item-row{
 display:flex;
 align-items:center;
 gap:10px;
 padding:8px 0;
 border-bottom:1px dotted var(--line);
 }
 .item-row:last-of-type{border-bottom:none;}

 .label-input{
 flex:1;
 min-width:0;
 border:none;
 background:transparent;
 font-size:14.5px;
 color:var(--ink);
 padding:4px 2px;
 outline:none;
 border-bottom:1px dotted transparent;
 }
 .label-input:focus{border-bottom:1px dotted var(--gold-600);}
 .label-input::placeholder{color:#B7A9A0;}

 .value-wrap{
 display:flex;
 align-items:center;
 gap:4px;
 flex:0 0 auto;
 }
 .value-wrap .prefix{font-size:13px;color:var(--ink-soft);}
 .value-input{
 width:92px;
 text-align:right;
 border:none;
 border-bottom:1.5px solid var(--gold-300);
 background:transparent;
 font-size:14.5px;
 padding:4px 2px;
 outline:none;
 color:var(--ink);
 font-variant-numeric:tabular-nums;
 }
 .value-input:focus{border-bottom-color:var(--burgundy-700);}
 .value-input.wide{width:130px;}

 .period-select{
 border:none;
 background:transparent;
 font-size:12px;
 color:var(--ink-soft);
 outline:none;
 cursor:pointer;
 flex:0 0 auto;
 padding:4px 0;
 }
 .period-select:focus{color:var(--burgundy-700);}

 .remove-item{
 background:none;
 border:none;
 color:#B79A9C;
 font-size:17px;
 cursor:pointer;
 line-height:1;
 padding:2px 4px;
 border-radius:4px;
 }
 .remove-item:hover{color:var(--burgundy-700);background:var(--gold-100);}

 .add-item{
 margin-top:6px;
 background:none;
 border:none;
 color:var(--burgundy-700);
 font-size:13px;
 font-weight:600;
 cursor:pointer;
 padding:6px 2px;
 }
 .add-item:hover{text-decoration:underline;}

 .note-card{
 background:var(--paper-alt);
 border:1px solid var(--line);
 border-radius:10px;
 padding:18px 22px;
 margin-bottom:18px;
 }
 .note-card label{
 display:block;font-size:11.5px;text-transform:uppercase;letter-spacing:1px;
 color:var(--ink-soft);margin-bottom:8px;font-weight:600;
 }
 .note-card textarea{
 width:100%;min-height:64px;resize:vertical;border:1px solid var(--line);
 border-radius:6px;padding:10px;font-size:14px;color:var(--ink);outline:none;background:var(--paper);
 }
 .note-card textarea:focus{border-color:var(--gold-600);}

 .left-col{min-width:0;}

 /* pension calculation card */
 .pensao-desc{
 font-size:13px;color:var(--ink-soft);margin:2px 0 16px;line-height:1.55;
 }
 .method-toggle{
 display:flex;gap:20px;flex-wrap:wrap;margin-bottom:16px;font-size:13.5px;
 }
 .method-toggle label{display:flex;align-items:center;gap:7px;cursor:pointer;}
 .method-toggle input[type="radio"]{accent-color:var(--burgundy-700);}
 .method-fields{display:flex;flex-direction:column;gap:14px;margin-bottom:16px;}
 .field-inline label{
 display:block;font-size:12.5px;color:var(--ink-soft);margin-bottom:6px;
 }
 .pensao-result{
 background:var(--gold-100);
 border-radius:8px;
 padding:14px 18px;
 margin-top:6px;
 }
 .pensao-line{
 display:flex;justify-between;align-items:baseline;
 padding:6px 0;font-size:14px;border-bottom:1px dotted var(--gold-300);
 }
 .pensao-line:last-child{border-bottom:none;}
 .pensao-line strong{color:var(--ink);font-weight:600;}
 .pensao-line.highlight strong{
 color:var(--burgundy-700);font-family:'Playfair Display',serif;font-size:20px;
 }
 .pensao-line .small{font-size:12px;color:var(--ink-soft);margin-left:4px;}
 .pensao-note{
 font-size:11.5px;color:var(--ink-soft);margin-top:12px;line-height:1.55;font-style:italic;
 }

 /* summary panel */
 .summary{
 position:sticky;
 top:20px;
 background:var(--paper-alt);
 border:1px solid var(--line);
 border-radius:10px;
 padding:22px;
 }
 .summary .eyebrow{
 text-transform:uppercase;letter-spacing:1.5px;font-size:11px;color:var(--ink-soft);
 font-weight:600;margin-bottom:10px;
 }
 .selo{
 border:2px solid var(--gold-600);
 border-radius:8px;
 padding:16px 14px;
 text-align:center;
 background:linear-gradient(180deg,var(--gold-100),transparent);
 margin-bottom:18px;
 }
 .selo .total-value{
 font-family:'Playfair Display',serif;
 font-size:30px;
 font-weight:600;
 color:var(--burgundy-700);
 display:block;
 line-height:1.2;
 }
 .selo .total-label{
 font-size:11px;
 text-transform:uppercase;
 letter-spacing:1px;
 color:var(--ink-soft);
 }
 .selo .total-value.small{font-size:21px;}
 .selo-divider{height:1px;background:var(--gold-300);margin:12px 0;}

 .bars{margin-bottom:18px;}
 .bar-row{margin-bottom:10px;}
 .bar-row .bar-top{
 display:flex;justify-content:space-between;font-size:12.5px;color:var(--ink-soft);margin-bottom:4px;
 }
 .bar-track{height:6px;background:var(--gold-100);border-radius:4px;overflow:hidden;}
 .bar-fill{height:100%;background:linear-gradient(90deg,var(--burgundy-500),var(--gold-600));border-radius:4px;}
 .bars-empty{font-size:13px;color:var(--ink-soft);font-style:italic;}

 .summary-actions{display:flex;flex-direction:column;gap:8px;}
 .btn{
 display:flex;align-items:center;justify-content:center;gap:8px;
 padding:12px;border-radius:8px;border:1.5px solid transparent;
 font-size:14px;font-weight:600;
 }
 .btn-primary{background:var(--burgundy-700);color:#fff;border-color:var(--burgundy-700);}
 .btn-primary:hover{opacity:0.9;}
 .btn-secondary{background:transparent;border-color:var(--burgundy-700);color:var(--burgundy-700);}
 .btn-secondary:hover{background:var(--gold-100);}
 .btn-tertiary{background:transparent;border-color:transparent;color:var(--ink-soft);font-weight:500;}
 .btn-tertiary:hover{background:var(--paper);color:var(--burgundy-700);}
 .btn-row{display:flex;gap:8px;}
 .btn-row .btn{flex:1;font-size:12px;padding:9px 8px;}
 .toast{
 margin-top:10px;font-size:12.5px;color:var(--burgundy-700);text-align:center;
 opacity:0;transition:opacity .25s ease;height:14px;
 }
 .toast.show{opacity:1;}

 footer{
 max-width:1080px;margin:8px auto 0;padding:0 20px;
 font-size:12px;color:var(--ink-soft);text-align:center;line-height:1.6;
 }

 @media (max-width:880px){
 .layout{grid-template-columns:1fr;}
 .summary{position:static;order:-1;}
 .info-card{grid-template-columns:1fr 1fr;margin-top:14px;}
 }

 @media print{
 .band, .instructions, .add-item, .remove-item, .btn, .toast, .cat-chevron, .topbar{display:none !important;}
 body{background:#fff;padding:0;}
 .info-card{box-shadow:none;margin-top:0;border:1px solid #ccc;}
 .cat, .summary, .note-card{border:1px solid #ccc;box-shadow:none;break-inside:avoid;}
 .cat.collapsed .items,.cat.collapsed .add-item{display:block !important;}
 .layout{grid-template-columns:1fr 260px;}
 .summary{position:static;}
 .period-select{-webkit-appearance:none;appearance:none;padding-right:0;}
 }
</style>
</head>
<body>

 <div class="band">
 <div class="eyebrow">Apuração de despesas</div>
 <h1>Calculadora de Gasto Mensal da Criança</h1>
 <p>Preencha os valores aproximados que a criança gasta por mês. Isso ajuda a organizar, com clareza, as informações usadas no cálculo da pensão alimentícia.</p>
 </div>

 <div class="topbar">
 <span class="savebadge" id="saveBadge"><span id="saveBadgeText">Nada preenchido ainda</span></span>
 <button class="toolbtn" id="exportBtn" type="button">Baixar dados (.json)</button>
 <button class="toolbtn" id="importBtn" type="button">Abrir dados (.json)</button>
 <input type="file" id="importFile" accept="application/json" style="display:none;">
 <button class="toolbtn" id="newCalcBtn" type="button">Novo cálculo</button>
 </div>

 <div class="wrap">
 <div class="info-card">
 <div class="field">
 <label for="childName">Nome da criança</label>
 <input id="childName" type="text" placeholder="Opcional">
 </div>
 <div class="field">
 <label for="childAge">Idade</label>
 <input id="childAge" type="text" placeholder="Opcional">
 </div>
 <div class="field">
 <label for="filledBy">Preenchido por</label>
 <input id="filledBy" type="text" placeholder="Ex.: mãe, pai, responsável">
 </div>
 <div class="field">
 <label for="processo">Nº do processo</label>
 <input id="processo" type="text" placeholder="Opcional">
 </div>
 <div class="field">
 <label for="comarca">Comarca / Vara</label>
 <input id="comarca" type="text" placeholder="Opcional">
 </div>
 <div class="field">
 <label for="advogado">Advogado(a) responsável</label>
 <input id="advogado" type="text" placeholder="Nome e OAB">
 </div>
 </div>
 </div>

 <p class="instructions">
 Cada categoria já traz os gastos mais comuns. Você pode editar a descrição, apagar o que não se aplicar ou adicionar novos itens. Para cada gasto, indique ao lado se o valor informado é <strong>mensal</strong> ou <strong>anual</strong> (ex.: material escolar costuma ser um gasto anual) — a calculadora converte automaticamente para o valor mensal equivalente. Clique no título de uma categoria para recolhê-la. Tudo é salvo automaticamente neste navegador enquanto você preenche.
 </p>

 <div class="layout">
 <div class="left-col">
 <div id="formContainer"></div>

 <section class="cat" id="pensaoSection">
 <div class="cat-header" style="cursor:default;">
 <div class="cat-header-left"><h3>Estimativa da pensão alimentícia</h3></div>
 </div>
 <p class="pensao-desc">
 A partir do gasto mensal total calculated acima, estime o percentual e o valor da pensão considerando a renda de quem vai pagar.
 </p>

 <div class="method-toggle">
 <label><input type="radio" name="pensaoMethod" value="proporcional" checked> Dividir proporcionalmente à renda de cada responsável</label>
 <label><input type="radio" name="pensaoMethod" value="manual"> Definir um percentual fixo</label>
 </div>

 <div id="methodProporcional" class="method-fields">
 <div class="field-inline">
 <label for="rendaAlimentante">Renda mensal de quem vai pagar (alimentante)</label>
 <div class="value-wrap"><span class="prefix">R$</span>
 <input id="rendaAlimentante" class="value-input wide" type="text" inputmode="decimal" placeholder="0,00">
 </div>
 </div>
 <div class="field-inline">
 <label for="rendaGuardiao">Renda mensal do responsável guardião (opcional)</label>
 <div class="value-wrap"><span class="prefix">R$</span>
 <input id="rendaGuardiao" class="value-input wide" type="text" inputmode="decimal" placeholder="0,00">
 </div>
 </div>
 </div>

 <div id="methodManual" class="method-fields" style="display:none;">
 <div class="field-inline">
 <label for="percentualManual">Percentual do gasto total sob responsabilidade do alimentante</label>
 <div class="value-wrap">
 <input id="percentualManual" class="value-input" style="width:70px;" type="text" inputmode="decimal" placeholder="30">
 <span class="prefix">%</span>
 </div>
 </div>
 <div class="field-inline">
 <label for="rendaAlimentanteManual">Renda mensal de quem vai pagar (opcional, só para referência)</label>
 <div class="value-wrap"><span class="prefix">R$</span>
 <input id="rendaAlimentanteManual" class="value-input wide" type="text" inputmode="decimal" placeholder="0,00">
 </div>
 </div>
 </div>

 <div class="pensao-result">
 <div class="pensao-line"><span>Percentual aplicado</span><strong id="pensaoPercentual">—</strong></div>
 <div class="pensao-line highlight"><span>Valor estimado da pensão</span><strong id="pensaoValor">R$ 0,00</strong></div>
 <div class="pensao-line" id="pensaoRendaPctLine" style="display:none;">
 <span>Equivale a</span>
 <span><strong id="pensaoRendaPct">—</strong><span class="small">da renda do alimentante</span></span>
 </div>
 </div>

 <p class="pensao-note">
 Estimativa para apoiar a negociação ou a petição. O valor final da pensão considera outros elementos previstos no art. 1.694 do Código Civil (binômio necessidade-possibilidade), a critério do juízo.
 </p>
 </section>
 </div>

 <aside class="summary">
 <div class="eyebrow">Resumo</div>
 <div class="selo">
 <span class="total-value" id="grandTotal">R$ 0,00</span>
 <span class="total-label">Total mensal estimado</span>
 <div class="selo-divider"></div>
 <span class="total-value small" id="pensaoValorSummary">R$ 0,00</span>
 <span class="total-label">Pensão estimada</span>
 </div>

 <div class="bars" id="bars">
 <div class="bars-empty">Preencha os gastos para ver a distribuição por categoria.</div>
 </div>

 <div class="summary-actions">
 <button class="btn btn-primary" id="whatsappBtn" type="button">Enviar no WhatsApp</button>
 <button class="btn btn-secondary" id="printBtn" type="button">Gerar PDF com os valores</button>
 </div>
 <div class="toast" id="toast"></div>
 </aside>
 </div>

 <div class="wrap">
 <div class="note-card">
 <label for="obs">Observações</label>
 <textarea id="obs" placeholder="Alguma informação adicional relevante sobre os gastos da criança..."></textarea>
 </div>
 </div>

 <footer>
 Ferramenta de apoio para organização de dados — os valores devem ser conferidos com comprovantes sempre que possível. Os dados ficam salvos apenas neste navegador, neste computador.
 </footer>

<script>
(function(){
 let uid = 0;
 const newId = () => 'i' + (uid++);
 const STORAGE_KEY = 'calcGastoCriancaV2';

 function defaultCategories(){
 uid = 0;
 return [
 { id:'moradia', name:'Moradia (parte da criança)', items:[
 {id:newId(),label:'Aluguel ou financiamento (proporcional)',value:0,period:'mensal'},
 {id:newId(),label:'Condomínio (proporcional)',value:0,period:'mensal'},
 {id:newId(),label:'IPTU (proporcional)',value:0,period:'anual'},
 {id:newId(),label:'Água, luz, gás e internet (proporcional)',value:0,period:'mensal'},
 ], collapsed:false},
 { id:'alimentacao', name:'Alimentação', items:[
 {id:newId(),label:'Supermercado / feira',value:0,period:'mensal'},
 {id:newId(),label:'Lanches e alimentação escolar',value:0,period:'mensal'},
 ], collapsed:false},
 { id:'educacao', name:'Educação', items:[
 {id:newId(),label:'Mensalidade escolar',value:0,period:'mensal'},
 {id:newId(),label:'Material e uniforme escolar',value:0,period:'anual'},
 {id:newId(),label:'Transporte escolar',value:0,period:'mensal'},
 {id:newId(),label:'Atividades extracurriculares',value:0,period:'mensal'},
 ], collapsed:false},
 { id:'saude', name:'Saúde', items:[
 {id:newId(),label:'Plano de saúde',value:0,period:'mensal'},
 {id:newId(),label:'Medicamentos',value:0,period:'mensal'},
 {id:newId(),label:'Terapias e consultas',value:0,period:'mensal'},
 ], collapsed:false},
 { id:'vestuario', name:'Vestuário', items:[
 {id:newId(),label:'Roupas',value:0,period:'anual'},
 {id:newId(),label:'Calçados',value:0,period:'anual'},
 ], collapsed:false},
 { id:'lazer', name:'Lazer e cuidados', items:[
 {id:newId(),label:'Passeios e lazer',value:0,period:'mensal'},
 {id:newId(),label:'Cursos e esportes',value:0,period:'mensal'},
 {id:newId(),label:'Babá / creche',value:0,period:'mensal'},
 {id:newId(),label:'Produtos de higiene',value:0,period:'mensal'},
 ], collapsed:false},
 { id:'outros', name:'Outros gastos', items:[], collapsed:false },
 ];
 }

 let categories = defaultCategories();

 const formContainer = document.getElementById('formContainer');

 function escapeHtml(str){
 return String(str).replace(/[&<>"']/g, c => ({
 '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
 }[c]));
 }

 function formatNumber(n){
 return n.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
 }

 function formatCurrency(n){
 return 'R$ ' + formatNumber(n);
 }

 function parseNumber(str){
 if(!str) return 0;
 let s = str.trim().replace(/[^\\d,.-]/g,'');
 if(s.includes(',') && s.includes('.')){
 s = s.replace(/\\./g,'').replace(',', '.');
 } else if(s.includes(',')){
 s = s.replace(',', '.');
 }
 const n = parseFloat(s);
 return isNaN(n) ? 0 : n;
 }

 function monthlyValue(item){
 const v = parseFloat(item.value) || 0;
 return item.period === 'anual' ? v / 12 : v;
 }

 function rowHtml(catId, item){
 const isAnual = item.period === 'anual';
 return \`
 <div class="item-row" data-item="\${item.id}">
 <input class="label-input" type="text" data-role="label" data-cat="\${catId}" data-item="\${item.id}"
 value="\${escapeHtml(item.label)}" placeholder="Descrição do gasto">
 <div class="value-wrap">
 <span class="prefix">R$</span>
 <input class="value-input" type="text" inputmode="decimal" data-role="value" data-cat="\${catId}" data-item="\${item.id}"
 value="\${item.value ? formatNumber(item.value) : ''}" placeholder="0,00">
 </div>
 <select class="period-select" data-role="period" data-cat="\${catId}" data-item="\${item.id}" title="O valor informado é mensal ou anual?">
 <option value="mensal" \${!isAnual ? 'selected' : ''}>/mês</option>
 <option value="anual" \${isAnual ? 'selected' : ''}>/ano</option>
 </select>
 <button class="remove-item" type="button" data-role="remove" data-cat="\${catId}" data-item="\${item.id}" title="Remover">× border</button>
 </div>\`;
 }

 function catHtml(cat){
 return \`
 <section class="cat \${cat.collapsed ? 'collapsed' : ''}" data-cat="\${cat.id}">
 <div class="cat-header" data-role="toggle-cat" data-cat="\${cat.id}">
 <div class="cat-header-left">
 <span class="cat-chevron">▾</span>
 <h3>\${escapeHtml(cat.name)}</h3>
 </div>
 <span class="cat-subtotal" id="subtotal-\${cat.id}">R$ 0,00</span>
 </div>
 <div class="items">
 \${cat.items.map(item => rowHtml(cat.id, item)).join('')}
 </div>
 <button class="add-item" type="button" data-role="add" data-cat="\${cat.id}">+ adicionar item</button>
 </section>\`;
 }

 function renderForm(){
 formContainer.innerHTML = categories.map(catHtml).join('');
 updateTotals();
 }

 function updateTotals(){
 let grand = 0;
 const catTotals = [];
 categories.forEach(cat => {
 const sub = cat.items.reduce((sum, it) => sum + monthlyValue(it), 0);
 grand += sub;
 catTotals.push({name: cat.name, value: sub});
 const el = document.getElementById('subtotal-' + cat.id);
 if(el) el.textContent = formatCurrency(sub);
 });

 document.getElementById('grandTotal').textContent = formatCurrency(grand);

 const barsEl = document.getElementById('bars');
 const withValue = catTotals.filter(c => c.value > 0).sort((a,b) => b.value - a.value);
 if(withValue.length === 0){
 barsEl.innerHTML = '<div class="bars-empty">Preencha os gastos para ver a distribuição por categoria.</div>';
 } else {
 barsEl.innerHTML = withValue.map(c => {
 const pct = grand > 0 ? Math.round((c.value / grand) * 100) : 0;
 return \`
 <div class="bar-row">
 <div class="bar-top"><span>\${escapeHtml(c.name)}</span><span>\${formatCurrency(c.value)}</span></div>
 <div class="bar-track"><div class="bar-fill" style="width:\${pct}%"></div></div>
 </div>\`;
 }).join('');
 }

 computePensao(grand);
 scheduleSave();
 }

 function computePensao(grandTotalArg){
 const grand = typeof grandTotalArg === 'number'
 ? grandTotalArg
 : categories.reduce((sum, cat) => sum + cat.items.reduce((s, it) => s + monthlyValue(it), 0), 0);

 const methodEl = document.querySelector('input[name="pensaoMethod"]:checked');
 const method = methodEl ? methodEl.value : 'proporcional';

 let percentual = 0;
 let rendaRef = 0;

 if(method === 'proporcional'){
 const rA = parseNumber(document.getElementById('rendaAlimentante').value);
 const rG = parseNumber(document.getElementById('rendaGuardiao').value);
 rendaRef = rA;
 percentual = (rA + rG) > 0 ? (rA / (rA + rG)) * 100 : 0;
 } else {
 percentual = parseNumber(document.getElementById('percentualManual').value);
 rendaRef = parseNumber(document.getElementById('rendaAlimentanteManual').value);
 }

 const valorPensao = grand * (percentual / 100);

 document.getElementById('pensaoPercentual').textContent = percentual > 0
 ? percentual.toFixed(1).replace('.', ',') + '%'
 : '—';
 document.getElementById('pensaoValor').textContent = formatCurrency(valorPensao);
 document.getElementById('pensaoValorSummary').textContent = formatCurrency(valorPensao);

 const pctLine = document.getElementById('pensaoRendaPctLine');
 let pctOfIncome = 0;
 if(rendaRef > 0){
 pctOfIncome = (valorPensao / rendaRef) * 100;
 document.getElementById('pensaoRendaPct').textContent = pctOfIncome.toFixed(1).replace('.', ',') + '% ';
 pctLine.style.display = 'flex';
 } else {
 pctLine.style.display = 'none';
 }

 return { percentual, valorPensao, rendaRef, pctOfIncome, method };
 }

 // ---------- persistence ----------
 let saveTimer = null;
 const saveBadge = document.getElementById('saveBadge');
 const saveBadgeText = document.getElementById('saveBadgeText');

 function currentState(){
 return {
 version: 2,
 child: {
 name: document.getElementById('childName').value,
 age: document.getElementById('childAge').value,
 filledBy: document.getElementById('filledBy').value,
 processo: document.getElementById('processo').value,
 comarca: document.getElementById('comarca').value,
 advogado: document.getElementById('advogado').value,
 },
 categories: categories,
 pensaoMethod: document.querySelector('input[name="pensaoMethod"]:checked').value,
 rendaAlimentante: document.getElementById('rendaAlimentante').value,
 rendaGuardiao: document.getElementById('rendaGuardiao').value,
 percentualManual: document.getElementById('percentualManual').value,
 rendaAlimentanteManual: document.getElementById('rendaAlimentanteManual').value,
 obs: document.getElementById('obs').value,
 savedAt: new Date().toISOString(),
 };
 }

 function scheduleSave(){
 saveBadge.classList.add('saving');
 saveBadgeText.textContent = 'Salvando...';
 clearTimeout(saveTimer);
 saveTimer = setTimeout(doSave, 500);
 }

 function doSave(){
 try{
 localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState()));
 const now = new Date();
 const hh = String(now.getHours()).padStart(2,'0');
 const mm = String(now.getMinutes()).padStart(2,'0');
 saveBadge.classList.remove('saving');
 saveBadgeText.textContent = 'Salvo automaticamente às ' + hh + ':' + mm;
 }catch(e){
 saveBadge.classList.remove('saving');
 saveBadgeText.textContent = 'Não foi possível salvar automaticamente';
 }
 }

 function applyState(state){
 if(!state) return;
 document.getElementById('childName').value = state.child?.name || '';
 document.getElementById('childAge').value = state.child?.age || '';
 document.getElementById('filledBy').value = state.child?.filledBy || '';
 document.getElementById('processo').value = state.child?.processo || '';
 document.getElementById('comarca').value = state.child?.comarca || '';
 document.getElementById('advogado').value = state.child?.advogado || '';
 document.getElementById('obs').value = state.obs || '';

 if(Array.isArray(state.categories) && state.categories.length){
 uid = 0;
 categories = state.categories.map(cat => ({
 id: cat.id,
 name: cat.name,
 collapsed: !!cat.collapsed,
 items: (cat.items || []).map(it => {
 uid++;
 return { id: it.id || newId(), label: it.label || '', value: parseFloat(it.value) || 0, period: it.period === 'anual' ? 'anual' : 'mensal' };
 })
 }));
 }

 const method = state.pensaoMethod === 'manual' ? 'manual' : 'proporcional';
 document.querySelector(\`input[name="pensaoMethod"][value="\${method}"]\`).checked = true;
 document.getElementById('methodProporcional').style.display = method === 'proporcional' ? 'flex' : 'none';
 document.getElementById('methodManual').style.display = method === 'manual' ? 'flex' : 'none';

 document.getElementById('rendaAlimentante').value = state.rendaAlimentante ? formatNumber(parseNumber(state.rendaAlimentante)) : '';
 document.getElementById('rendaGuardiao').value = state.rendaGuardiao ? formatNumber(parseNumber(state.rendaGuardiao)) : '';
 document.getElementById('percentualManual').value = state.percentualManual ? parseNumber(state.percentualManual).toFixed(1).replace('.',',') : '';
 document.getElementById('rendaAlimentanteManual').value = state.rendaAlimentanteManual ? formatNumber(parseNumber(state.rendaAlimentanteManual)) : '';

 renderForm();
 }

 function hasAnyData(state){
 if(!state) return false;
 if(state.child && (state.child.name || state.child.age || state.child.filledBy || state.child.processo || state.child.comarca || state.child.advogado)) return true;
 if(state.obs) return true;
 if(state.rendaAlimentante || state.rendaGuardiao || state.percentualManual) return true;
 if(Array.isArray(state.categories)){
 return state.categories.some(cat => (cat.items||[]).some(it => (parseFloat(it.value)||0) > 0 || (it.label && it.label.trim() && !defaultLabels.has(it.label.trim()))));
 }
 return false;
 }

 const defaultLabels = new Set();
 defaultCategories().forEach(c => c.items.forEach(i => defaultLabels.add(i.label)));

 // ---------- event delegation ----------
 formContainer.addEventListener('input', e => {
 const t = e.target;
 if(t.dataset.role === 'value'){
 const cat = categories.find(c => c.id === t.dataset.cat);
 const item = cat && cat.items.find(i => i.id === t.dataset.item);
 if(item){
 item.value = parseNumber(t.value);
 updateTotals();
 }
 } else if(t.dataset.role === 'label'){
 const cat = categories.find(c => c.id === t.dataset.cat);
 const item = cat && cat.items.find(i => i.id === t.dataset.item);
 if(item){ item.label = t.value; scheduleSave(); }
 }
 });

 formContainer.addEventListener('change', e => {
 const t = e.target;
 if(t.dataset.role === 'period'){
 const cat = categories.find(c => c.id === t.dataset.cat);
 const item = cat && cat.items.find(i => i.id === t.dataset.item);
 if(item){
 item.period = t.value;
 updateTotals();
 }
 }
 });

 formContainer.addEventListener('focusout', e => {
 const t = e.target;
 if(t.dataset && t.dataset.role === 'value'){
 const cat = categories.find(c => c.id === t.dataset.cat);
 const item = cat && cat.items.find(i => i.id === t.dataset.item);
 if(item) t.value = item.value ? formatNumber(item.value) : '';
 }
 });

 formContainer.addEventListener('click', e => {
 const toggleHeader = e.target.closest('[data-role="toggle-cat"]');
 if(toggleHeader){
 const cat = categories.find(c => c.id === toggleHeader.dataset.cat);
 if(cat){
 cat.collapsed = !cat.collapsed;
 toggleHeader.closest('.cat').classList.toggle('collapsed', cat.collapsed);
 scheduleSave();
 }
 return;
 }
 const t = e.target;
 if(t.dataset.role === 'add'){
 const cat = categories.find(c => c.id === t.dataset.cat);
 const item = {id:newId(), label:'', value:0, period:'mensal'};
 cat.items.push(item);
 renderForm();
 const newLabel = formContainer.querySelector(\`.label-input[data-item="\${item.id}"]\`);
 if(newLabel) newLabel.focus();
 } else if(t.dataset.role === 'remove'){
 const cat = categories.find(c => c.id === t.dataset.cat);
 cat.items = cat.items.filter(i => i.id !== t.dataset.item);
 renderForm();
 }
 });

 document.querySelectorAll('input[name="pensaoMethod"]').forEach(radio => {
 radio.addEventListener('change', () => {
 document.getElementById('methodProporcional').style.display =
 document.querySelector('input[name="pensaoMethod"]:checked').value === 'proporcional' ? 'flex' : 'none';
 document.getElementById('methodManual').style.display =
 document.querySelector('input[name="pensaoMethod"]:checked').value === 'manual' ? 'flex' : 'none';
 computePensao();
 scheduleSave();
 });
 });

 ['rendaAlimentante', 'rendaGuardiao', 'percentualManual', 'rendaAlimentanteManual'].forEach(id => {
 const el = document.getElementById(id);
 el.addEventListener('input', () => { computePensao(); scheduleSave(); });
 el.addEventListener('focusout', () => {
 if(id === 'percentualManual'){
 const n = parseNumber(el.value);
 el.value = n ? n.toFixed(1).replace('.', ',') : '';
 } else {
 const n = parseNumber(el.value);
 el.value = n ? formatNumber(n) : '';
 }
 });
 });

 ['childName','childAge','filledBy','processo','comarca','advogado','obs'].forEach(id => {
 document.getElementById(id).addEventListener('input', scheduleSave);
 });

 // ---------- resumo de texto (negociação) ----------
 function buildResumoText(){
 const name = document.getElementById('childName').value.trim();
 const age = document.getElementById('childAge').value.trim();
 const filledBy = document.getElementById('filledBy').value.trim();
 const processo = document.getElementById('processo').value.trim();
 const comarca = document.getElementById('comarca').value.trim();
 const advogado = document.getElementById('advogado').value.trim();
 const obs = document.getElementById('obs').value.trim();
 const today = new Date().toLocaleDateString('pt-BR');

 let lines = [];
 lines.push('RESUMO DE GASTOS MENSAIS DA CRIANÇA');
 if(name) lines.push('Criança: ' + name + (age ? ' (' + age + ')' : ''));
 if(filledBy) lines.push('Preenchido por: ' + filledBy);
 if(processo) lines.push('Processo: ' + processo);
 if(comarca) lines.push('Comarca/Vara: ' + comarca);
 if(advogado) lines.push('Advogado(a) responsável: ' + advogado);
 lines.push('Data: ' + today);
 lines.push('');

 let grand = 0;
 categories.forEach(cat => {
 const filled = cat.items.filter(i => (parseFloat(i.value) || 0) > 0 || i.label.trim());
 if(filled.length === 0) return;
 const sub = cat.items.reduce((s,i) => s + monthlyValue(i), 0);
 grand += sub;
 lines.push(cat.name.toUpperCase());
 filled.forEach(i => {
 const raw = parseFloat(i.value) || 0;
 const label = i.label.trim() || '(sem descrição)';
 if(i.period === 'anual'){
 lines.push('- ' + label + ': ' + formatCurrency(raw) + '/ano (equivale a ' + formatCurrency(raw / 12) + '/mês)');
 } else {
 lines.push('- ' + label + ': ' + formatCurrency(raw) + '/mês');
 }
 });
 lines.push('Subtotal mensal: ' + formatCurrency(sub));
 lines.push('');
 });

 lines.push('TOTAL MENSAL ESTIMADO: ' + formatCurrency(grand));

 const pensao = computePensao(grand);
 lines.push('');
 lines.push('CÁLCULO DA PENSÃO ALIMENTÍCIA');
 lines.push('Método: ' + (pensao.method === 'proporcional' ? 'proporcional à renda de cada responsável' : 'percentual fixo'));
 lines.push('Percentual aplicado: ' + (pensao.percentual > 0 ? pensao.percentual.toFixed(1).replace('.', ',') + '%' : 'não informado'));
 lines.push('Valor estimado da pensão: ' + formatCurrency(pensao.valorPensao));
 if(pensao.rendaRef > 0){
 lines.push('Equivale a ' + pensao.pctOfIncome.toFixed(1).replace('.', ',') + '% da renda do alimentante informada (' + formatCurrency(pensao.rendaRef) + ')');
 }

 if(obs) { lines.push(''); lines.push('Observações: ' + obs); }

 return lines.join('\\n');
 }

 function showToast(msg){
 const toast = document.getElementById('toast');
 toast.textContent = msg;
 toast.classList.add('show');
 setTimeout(() => toast.classList.remove('show'), 2400);
 }

 document.getElementById('whatsappBtn').addEventListener('click', () => {
 // Não gerar/abrir o documento de impressão neste mesmo clique: dois pop-ups
 // concorrentes faziam o WhatsApp ser bloqueado em vários navegadores.
 const text = buildResumoText();
 const url = 'https://wa.me/?text=' + encodeURIComponent(text);
 const waWindow = window.open(url, '_blank');
 if(!waWindow){
   showToast('O navegador bloqueou a janela. Permita pop-ups para abrir o WhatsApp.');
   let link = document.getElementById('whatsappFallbackLink');
   if(!link){
     link = document.createElement('a');
     link.id = 'whatsappFallbackLink';
     link.textContent = 'Abrir WhatsApp com a mensagem pronta';
     link.target = '_blank'; link.rel = 'noopener';
     link.style.cssText = 'display:block;margin-top:8px;color:#7d1f3d;font-weight:700';
     document.getElementById('whatsappBtn').insertAdjacentElement('afterend', link);
   }
   link.href = url;
 } else {
   showToast('Mensagem preparada no WhatsApp. Para anexar um PDF, gere-o no botão ao lado e anexe o arquivo na conversa.');
 }
 });

 // ---------- PDF / documento formal ----------
 function buildPrintableHtml(){
 const name = document.getElementById('childName').value.trim();
 const age = document.getElementById('childAge').value.trim();
 const filledBy = document.getElementById('filledBy').value.trim();
 const processo = document.getElementById('processo').value.trim();
 const comarca = document.getElementById('comarca').value.trim();
 const advogado = document.getElementById('advogado').value.trim();
 const obs = document.getElementById('obs').value.trim();
 const today = new Date().toLocaleDateString('pt-BR');

 let grand = 0;
 const catBlocks = categories.map(cat => {
 const filled = cat.items.filter(i => (parseFloat(i.value) || 0) > 0 || i.label.trim());
 if(filled.length === 0) return '';
 const sub = cat.items.reduce((s,i) => s + monthlyValue(i), 0);
 grand += sub;
 const rows = filled.map(i => {
 const raw = parseFloat(i.value) || 0;
 const label = escapeHtml(i.label.trim() || '(sem descrição)');
 const tag = i.period === 'anual' ? '/ano' : '/mês';
 const extra = i.period === 'anual' ? \` <span class="muted">(equivale a \${formatCurrency(raw/12)}/mês)</span>\` : '';
 return \`<div class="prow"><span>\${label}</span><span>\${formatCurrency(raw)}\${tag}\${extra}</span></div>\`;
 }).join('');
 return \`
 <div class="pcat">
 <div class="pcat-head"><h3>\${escapeHtml(cat.name)}</h3><strong>\${formatCurrency(sub)}</strong></div>
 \${rows}
 </div>\`;
 }).join('');

 const pensao = computePensao(grand);

 return \`<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8">
<title>Resumo de Gastos - \${escapeHtml(name || 'Criança')}</title>
<style>
 @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600;700&display=swap');
 *{box-sizing:border-box;}
 body{font-family:'Inter',sans-serif;color:#2a1a20;max-width:760px;margin:0 auto;padding:36px 28px 60px;}
 h1{font-family:'Playfair Display',serif;color:#7d1f3d;font-size:26px;margin:0 0 4px;}
 .sub{color:#7a6a6e;font-size:13px;margin-bottom:24px;}
 .meta{font-size:13.5px;color:#2a1a20;margin-bottom:4px;}
 .pcat{margin-bottom:16px;border-bottom:1px solid #e3d6c0;padding-bottom:10px;}
 .pcat-head{display:flex;justify-content:space-between;border-bottom:2px solid #a8843f;padding-bottom:6px;margin-bottom:8px;}
 .pcat-head h3{font-family:'Playfair Display',serif;font-size:17px;color:#7d1f3d;margin:0;}
 .prow{display:flex;justify-content:space-between;font-size:13.5px;padding:3px 0;}
 .muted{color:#7a6a6e;font-size:12px;}
 .total-box{background:#efe3c8;border:1.5px solid #a8843f;border-radius:8px;padding:16px 18px;margin:22px 0;text-align:center;}
 .total-box .val{font-family:'Playfair Display',serif;font-size:26px;color:#7d1f3d;font-weight:600;}
 .pensao-box{border:1px solid #e3d6c0;border-radius:8px;padding:14px 18px;margin-bottom:20px;}
 .pensao-box .line{display:flex;justify-content:space-between;font-size:14px;padding:5px 0;border-bottom:1px dotted #d9bd7e;}
 .pensao-box .line:last-child{border-bottom:none;}
 .obs{font-size:13px;color:#2a1a20;margin-top:10px;}
 .note{font-size:11px;color:#7a6a6e;font-style:italic;margin-top:18px;line-height:1.5;}
 .sig-block{margin-top:52px;text-align:center;}
 .sig-line{width:320px;margin:0 auto 6px;border-top:1px solid #2a1a20;}
 .sig-name{font-size:13.5px;color:#2a1a20;}
 .sig-role{font-size:12px;color:#7a6a6e;margin-top:2px;}
 .sig-place{font-size:13px;color:#2a1a20;margin-bottom:46px;text-align:right;}
 .print-actions{margin:0 0 24px;}
 .print-actions button{background:#7d1f3d;color:#fff;border:none;padding:10px 16px;border-radius:6px;font-size:13.5px;cursor:pointer;}
 @media print{ .print-actions{display:none;} body{padding:0 8px;} }
</style></head>
<body>
 <div class="print-actions"><button onclick="window.print()">Imprimir / salvar como PDF</button></div>
 <h1>Resumo de Gastos Mensais da Criança</h1>
 <div class="sub">Documento gerado em \${today}</div>
 \${name ? \`<div class="meta"><strong>Criança:</strong> \${escapeHtml(name)}\${age ? ' ('+escapeHtml(age)+')' : ''}</div>\` : ''}
 \${filledBy ? \`<div class="meta"><strong>Preenchido por:</strong> \${escapeHtml(filledBy)}</div>\` : ''}
 \${processo ? \`<div class="meta"><strong>Processo:</strong> \${escapeHtml(processo)}</div>\` : ''}
 \${comarca ? \`<div class="meta"><strong>Comarca/Vara:</strong> \${escapeHtml(comarca)}</div>\` : ''}

 <div style="margin-top:22px;">\${catBlocks}</div>

 <div class="total-box">
 <div class="val">\${formatCurrency(grand)}</div>
 <div class="muted">Total mensal estimado</div>
 </div>

 <div class="pensao-box">
 <div class="line"><span>Método</span><strong>\${pensao.method === 'proporcional' ? 'Proporcional à renda' : 'Percentual fixo'}</strong></div>
 <div class="line"><span>Percentual aplicado</span><strong>\${pensao.percentual > 0 ? pensao.percentual.toFixed(1).replace('.',',')+'%' : '—'}</strong></div>
 <div class="line"><span>Valor estimado da pensão</span><strong>\${formatCurrency(pensao.valorPensao)}</strong></div>
 \${pensao.rendaRef > 0 ? \`<div class="line"><span>Equivale a</span><strong>\${pensao.pctOfIncome.toFixed(1).replace('.',',')}% da renda do alimentante</strong></div>\` : ''}
 </div>

 \${obs ? \`<div class="obs"><strong>Observações:</strong> \${escapeHtml(obs)}</div>\` : ''}

 <div class="note">Estimativa para apoiar a negociação ou a petição. O valor final da pensão considers outros elementos previstos no art. 1.694 do Código Civil (binômio necessidade-possibilidade), a critério do juízo.</div>

 <div class="sig-place">\${comarca ? escapeHtml(comarca) + ', ' : ''}\${today}</div>
 <div class="sig-block">
 <div class="sig-line"></div>
 <div class="sig-name">\${advogado ? escapeHtml(advogado) : '&nbsp;'}</div>
 <div class="sig-role">Advogado(a)\${processo ? ' — Processo nº ' + escapeHtml(processo) : ''}</div>
 </div>
</body></html>\`;
 }

 function gerarPdf(){
 const printWindow = window.open('', '_blank');
 if(!printWindow){
 showToast('Permita pop-ups no navegador para gerar o PDF.');
 return false;
 }
 printWindow.document.open();
 printWindow.document.write(buildPrintableHtml());
 printWindow.document.close();
 setTimeout(() => {
 try{ printWindow.focus(); printWindow.print(); }catch(e){}
 }, 400);
 return true;
 }

 document.getElementById('printBtn').addEventListener('click', () => {
 gerarPdf();
 });

 // ---------- exportar / importar dados ----------
 document.getElementById('exportBtn').addEventListener('click', () => {
 const state = currentState();
 const blob = new Blob([JSON.stringify(state, null, 2)], {type:'application/json'});
 const url = URL.createObjectURL(blob);
 const a = document.createElement('a');
 const name = (document.getElementById('childName').value.trim() || 'calculo').replace(/[^a-zA-Z0-9-_]+/g,'-');
 const dateStr = new Date().toISOString().slice(0,10);
 a.href = url;
 a.download = \`gasto-crianca-\${name}-\${dateStr}.json\`;
 document.body.appendChild(a);
 a.click();
 document.body.removeChild(a);
 URL.revokeObjectURL(url);
 showToast('Arquivo baixado. Envie por e-mail ou WhatsApp.');
 });

 const importFile = document.getElementById('importFile');
 document.getElementById('importBtn').addEventListener('click', () => importFile.click());
 importFile.addEventListener('change', (e) => {
 const file = e.target.files[0];
 if(!file) return;
 const reader = new FileReader();
 reader.onload = () => {
 try{
 const state = JSON.parse(reader.result);
 applyState(state);
 doSave();
 showToast('Dados carregados com sucesso.');
 }catch(err){
 showToast('Arquivo inválido. Verifique se é um .json gerado por esta calculadora.');
 }
 };
 reader.readAsText(file);
 importFile.value = '';
 });

 // ---------- novo cálculo ----------
 document.getElementById('newCalcBtn').addEventListener('click', () => {
 const ok = window.confirm('Isso vai limpar todos os campos e apagar o cálculo salvo neste navegador. Se quiser guardar os dados atuais, baixe o arquivo .json antes. Deseja continuar?');
 if(!ok) return;
 localStorage.removeItem(STORAGE_KEY);
 categories = defaultCategories();
 ['childName','childAge','filledBy','processo','comarca','advogado','obs','rendaAlimentante','rendaGuardiao','percentualManual','rendaAlimentanteManual'].forEach(id => {
 document.getElementById(id).value = '';
 });
 document.querySelector('input[name="pensaoMethod"][value="proporcional"]').checked = true;
 document.getElementById('methodProporcional').style.display = 'flex';
 document.getElementById('methodManual').style.display = 'none';
 renderForm();
 saveBadgeText.textContent = 'Nada preenchido ainda';
 showToast('Novo cálculo iniciado.');
 });

 // ---------- restauração silenciosa ao abrir ----------
 try{
 const raw = localStorage.getItem(STORAGE_KEY);
 const parsed = raw ? JSON.parse(raw) : null;
 if(parsed && hasAnyData(parsed)){
 applyState(parsed);
 doSave();
 } else {
 renderForm();
 }
 }catch(e){
 renderForm();
 }

})();
</script>

</body>
</html>`}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* MODAL: NOVO PROCESSO */}
      {isNewProcessOpen && (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-white shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-serif font-bold text-base" style={{ color: PALETTE.bordoEscuro }}>Cadastrar Novo Processo</h3>
              <button onClick={() => setIsNewProcessOpen(false)}><X size={18} /></button>
            </div>

            <form onSubmit={handleAddProcess} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Número do Processo</label>
                <input type="text" required value={newProcess.number} onChange={(e) => setNewProcess({ ...newProcess, number: e.target.value })} className="w-full p-2.5 border rounded-lg" placeholder="0000000-00.2026.8.08.0000" />
              </div>
              <div>
                <label className="font-bold block mb-1">Cliente</label>
                <input type="text" required value={newProcess.client} onChange={(e) => setNewProcess({ ...newProcess, client: e.target.value })} className="w-full p-2.5 border rounded-lg" placeholder="Nome do Cliente" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">Ação</label>
                  <input type="text" value={newProcess.action} onChange={(e) => setNewProcess({ ...newProcess, action: e.target.value })} className="w-full p-2.5 border rounded-lg" placeholder="Ação de Cobrança" />
                </div>
                <div>
                  <label className="font-bold block mb-1">Vara / Tribunal</label>
                  <input type="text" value={newProcess.court} onChange={(e) => setNewProcess({ ...newProcess, court: e.target.value })} className="w-full p-2.5 border rounded-lg" placeholder="TJES / TRT17" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold block mb-1">Valor Causa (R$)</label>
                  <input type="number" value={newProcess.value} onChange={(e) => setNewProcess({ ...newProcess, value: e.target.value })} className="w-full p-2.5 border rounded-lg" placeholder="50000" />
                </div>
                <div>
                  <label className="font-bold block mb-1">Honorários (R$)</label>
                  <input type="number" value={newProcess.honorarios} onChange={(e) => setNewProcess({ ...newProcess, honorarios: e.target.value })} className="w-full p-2.5 border rounded-lg" placeholder="15000" />
                </div>
                <div>
                  <label className="font-bold block mb-1">Descontos (R$)</label>
                  <input type="number" value={newProcess.descontos} onChange={(e) => setNewProcess({ ...newProcess, descontos: e.target.value })} className="w-full p-2.5 border rounded-lg" placeholder="500" />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button type="button" onClick={() => setIsNewProcessOpen(false)} className="px-4 py-2 rounded-lg border font-bold">Cancelar</button>
                <button type="submit" className="px-4 py-2 rounded-lg text-white font-bold" style={{ backgroundColor: PALETTE.bordoPrincipal }}>Salvar Processo</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NOVO CLIENTE */}
      {isNewClientOpen && (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-2xl bg-white shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-serif font-bold text-base" style={{ color: PALETTE.bordoEscuro }}>Cadastrar Novo Cliente</h3>
              <button onClick={() => setIsNewClientOpen(false)}><X size={18} /></button>
            </div>

            <form onSubmit={handleAddClient} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Nome Completo</label>
                <input type="text" required value={newClient.name} onChange={(e) => setNewClient({ ...newClient, name: e.target.value })} className="w-full p-2.5 border rounded-lg" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">CPF / CNPJ</label>
                  <input type="text" value={newClient.document} onChange={(e) => setNewClient({ ...newClient, document: e.target.value })} className="w-full p-2.5 border rounded-lg" />
                </div>
                <div>
                  <label className="font-bold block mb-1">Telefone (WhatsApp)</label>
                  <input type="text" value={newClient.phone} onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })} className="w-full p-2.5 border rounded-lg" placeholder="27999999999" />
                </div>
              </div>
              <div>
                <label className="font-bold block mb-1">E-mail</label>
                <input type="email" value={newClient.email} onChange={(e) => setNewClient({ ...newClient, email: e.target.value })} className="w-full p-2.5 border rounded-lg" />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button type="button" onClick={() => setIsNewClientOpen(false)} className="px-4 py-2 rounded-lg border font-bold">Cancelar</button>
                <button type="submit" className="px-4 py-2 rounded-lg text-white font-bold" style={{ backgroundColor: PALETTE.bordoPrincipal }}>Cadastrar Cliente</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR PROCESSO OU CLIENTE */}
      {editingItem && editingItem.type !== 'template' && (
        <div className="fixed inset-0 bg-black/60 z-[10000] flex items-center justify-center p-4">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-white shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-serif font-bold text-base" style={{ color: PALETTE.bordoEscuro }}>{editingItem.type === 'process' ? 'Editar Processo' : 'Editar Cliente'}</h3>
              <button onClick={() => setEditingItem(null)}><X size={18}/></button>
            </div>
            <div className="space-y-3 text-xs">
              {(editingItem.type === 'process' ? [
                ['number','Número do Processo'],['client','Cliente'],['action','Ação'],['court','Vara / Tribunal'],['value','Valor da Causa (R$)','number'],['honorarios','Honorários (R$)','number'],['descontos','Descontos (R$)','number'],['status','Status']
              ] : [['name','Nome'],['type','Tipo'],['document','CPF / CNPJ'],['phone','Telefone'],['email','E-mail'],['status','Status']]).map(([field,label,inputType]) => (
                <div key={field}>
                  <label className="font-bold block mb-1">{label}</label>
                  <input type={inputType || 'text'} value={editingItem.data[field] ?? ''} onChange={e => setEditingItem(prev => ({ ...prev, data: { ...prev.data, [field]: e.target.value } }))} className="w-full p-2.5 border rounded-lg"/>
                </div>
              ))}
              <div className="pt-3 flex justify-end gap-2">
                <button onClick={() => setEditingItem(null)} className="px-4 py-2 rounded-lg border font-bold">Cancelar</button>
                <button onClick={saveEditedItem} className="px-4 py-2 rounded-lg text-white font-bold" style={{ backgroundColor: PALETTE.bordoPrincipal }}>Salvar Alterações</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NOVO PRAZO */}
      {isNewDeadlineOpen && (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-2xl bg-white shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-serif font-bold text-base" style={{ color: PALETTE.bordoEscuro }}>Cadastrar Novo Prazo</h3>
              <button onClick={() => setIsNewDeadlineOpen(false)}><X size={18} /></button>
            </div>

            <form onSubmit={handleAddDeadline} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Descrição / Título do Prazo</label>
                <input type="text" required value={newDeadline.title} onChange={(e) => setNewDeadline({ ...newDeadline, title: e.target.value })} className="w-full p-2.5 border rounded-lg" placeholder="Manifestação de Réplica" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">Cliente</label>
                  <input type="text" value={newDeadline.client} onChange={(e) => setNewDeadline({ ...newDeadline, client: e.target.value })} className="w-full p-2.5 border rounded-lg" />
                </div>
                <div>
                  <label className="font-bold block mb-1">Processo</label>
                  <input type="text" value={newDeadline.process} onChange={(e) => setNewDeadline({ ...newDeadline, process: e.target.value })} className="w-full p-2.5 border rounded-lg" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">Data</label>
                  <input type="date" value={newDeadline.dueDate} onChange={(e) => setNewDeadline({ ...newDeadline, dueDate: e.target.value })} className="w-full p-2.5 border rounded-lg" />
                </div>
                <div>
                  <label className="font-bold block mb-1">Horário</label>
                  <input type="time" value={newDeadline.dueTime} onChange={(e) => setNewDeadline({ ...newDeadline, dueTime: e.target.value })} className="w-full p-2.5 border rounded-lg" />
                </div>
              </div>
              <div>
                <label className="font-bold block mb-1">Urgência</label>
                <select value={newDeadline.type} onChange={(e) => setNewDeadline({ ...newDeadline, type: e.target.value })} className="w-full p-2.5 border rounded-lg bg-white">
                  <option value="FATAL">FATAL</option>
                  <option value="NORMAL">NORMAL</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button type="button" onClick={() => setIsNewDeadlineOpen(false)} className="px-4 py-2 rounded-lg border font-bold">Cancelar</button>
                <button type="submit" className="px-4 py-2 rounded-lg text-white font-bold" style={{ backgroundColor: PALETTE.bordoPrincipal }}>Salvar Prazo</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NOVO MODELO */}
      {isNewTemplateOpen && (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-white shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-serif font-bold text-base" style={{ color: PALETTE.bordoEscuro }}>{editingItem?.type === 'template' ? 'Editar Modelo de Peça' : 'Cadastrar Modelo de Peça'}</h3>
              <button onClick={() => { setIsNewTemplateOpen(false); setEditingItem(null); }}><X size={18} /></button>
            </div>

            <form onSubmit={handleAddTemplate} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Categoria</label>
                <select value={newTemplate.category} onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })} className="w-full p-2.5 border rounded-lg bg-white">
                  <option value="Cível / JEC">Cível / JEC</option>
                  <option value="Cível / Execução">Cível / Execução</option>
                  <option value="Trabalhista">Trabalhista</option>
                  <option value="Família">Família</option>
                </select>
              </div>
              <div>
                <label className="font-bold block mb-1">Título</label>
                <input type="text" required value={newTemplate.title} onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })} className="w-full p-2.5 border rounded-lg" />
              </div>
              <div>
                <label className="font-bold block mb-1">Descrição Curta</label>
                <input type="text" value={newTemplate.description} onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })} className="w-full p-2.5 border rounded-lg" />
              </div>
              <div>
                <label className="font-bold block mb-1">Conteúdo do Modelo</label>
                <textarea rows={6} value={newTemplate.content} onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })} className="w-full p-2.5 border rounded-lg font-mono text-xs" />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button type="button" onClick={() => { setIsNewTemplateOpen(false); setEditingItem(null); }} className="px-4 py-2 rounded-lg border font-bold">Cancelar</button>
                <button type="submit" className="px-4 py-2 rounded-lg text-white font-bold" style={{ backgroundColor: PALETTE.bordoPrincipal }}>{editingItem?.type === 'template' ? 'Salvar Alterações' : 'Salvar Modelo'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR STATUS DO COMPROMISSO (AO CLICAR) */}
      {selectedDeadlineModal && (
        <div className="fixed inset-0 bg-black/60 z-[10000] flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-2xl bg-white shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-serif font-bold text-base" style={{ color: PALETTE.bordoEscuro }}>
                Editar / Alterar Status do Compromisso
              </h3>
              <button onClick={() => setSelectedDeadlineModal(null)}><X size={18} /></button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold block mb-1">Título do Prazo</label>
                <input
                  type="text"
                  value={selectedDeadlineModal.title}
                  onChange={(e) => setSelectedDeadlineModal({ ...selectedDeadlineModal, title: e.target.value })}
                  className="w-full p-2.5 border rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Status Atual</label>
                <select
                  value={selectedDeadlineModal.status || 'Em Andamento'}
                  onChange={(e) => {
                    const newStatus = e.target.value;
                    setSelectedDeadlineModal({
                      ...selectedDeadlineModal,
                      status: newStatus,
                      completed: newStatus === 'Finalizado'
                    });
                  }}
                  className="w-full p-2.5 border rounded-lg font-bold bg-amber-50 cursor-pointer"
                  style={{ borderColor: PALETTE.dourado }}
                >
                  <option value="Pendente">Pendente</option>
                  <option value="Em Andamento">Em Andamento</option>
                  <option value="Finalizado">Finalizado / Cumprido</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">Data</label>
                  <input
                    type="date"
                    value={selectedDeadlineModal.dueDate}
                    onChange={(e) => setSelectedDeadlineModal({ ...selectedDeadlineModal, dueDate: e.target.value })}
                    className="w-full p-2.5 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Horário</label>
                  <input
                    type="time"
                    value={selectedDeadlineModal.dueTime}
                    onChange={(e) => setSelectedDeadlineModal({ ...selectedDeadlineModal, dueTime: e.target.value })}
                    className="w-full p-2.5 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Tipo / Urgência</label>
                <select
                  value={selectedDeadlineModal.type}
                  onChange={(e) => setSelectedDeadlineModal({ ...selectedDeadlineModal, type: e.target.value })}
                  className="w-full p-2.5 border rounded-lg bg-white"
                >
                  <option value="FATAL">FATAL</option>
                  <option value="NORMAL">NORMAL</option>
                </select>
              </div>

              <div className="pt-3 flex justify-between items-center border-t">
                <button
                  type="button"
                  onClick={() => {
                    setDeadlines(deadlines.filter((d) => d.id !== selectedDeadlineModal.id));
                    setSelectedDeadlineModal(null);
                  }}
                  className="px-3 py-2 rounded-lg text-rose-700 font-bold flex items-center gap-1 hover:bg-rose-50"
                >
                  <Trash2 size={14} /> Excluir
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedDeadlineModal(null)}
                    className="px-4 py-2 rounded-lg border font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDeadlines(deadlines.map((d) => (d.id === selectedDeadlineModal.id ? selectedDeadlineModal : d)));
                      setSelectedDeadlineModal(null);
                    }}
                    className="px-4 py-2 rounded-lg text-white font-bold"
                    style={{ backgroundColor: PALETTE.bordoPrincipal }}
                  >
                    Salvar Alterações
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
