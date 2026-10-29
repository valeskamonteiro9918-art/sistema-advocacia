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
  KeyRound,
  CheckSquare,
  Clock,
  UserCheck
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

  // --- CÓDIGO ORIGINAL & NOVOS ESTADOS ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentDate, setCurrentDate] = useState(new Date(2026, 9, 1));
  const [calendarView, setCalendarView] = useState('grid');

  // Modais de Criação/Edição
  const [isNewProcessOpen, setIsNewProcessOpen] = useState(false);
  const [editingProcess, setEditingProcess] = useState<any>(null);

  const [isNewClientOpen, setIsNewClientOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);

  const [isNewDeadlineOpen, setIsNewDeadlineOpen] = useState(false);
  const [selectedDeadlineModal, setSelectedDeadlineModal] = useState<any>(null);

  const [isNewTemplateOpen, setIsNewTemplateOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);

  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);

  // Varredura
  const [isScanning, setIsScanning] = useState(false);
  const [dismissedScanIds, setDismissedScanIds] = useState<string[]>([]);

  // Filtros
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [selectedVerbasProcId, setSelectedVerbasProcId] = useState('1');
  const [calcSubTab, setCalcSubTab] = useState('trabalhista');

  // Popovers
  const [hoveredDeadline, setHoveredDeadline] = useState<any>(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });

  // Form States Originais
  const [newProcess, setNewProcess] = useState({
    number: '', client: '', action: '', court: '', value: '', honorarios: '', descontos: '', status: 'Em andamento'
  });

  const [newClient, setNewClient] = useState({
    name: '', type: 'Pessoa Física', document: '', phone: '', email: '', status: 'Ativo'
  });

  const [newDeadline, setNewDeadline] = useState({
    title: '', client: '', process: '', dueDate: '2026-10-28', dueTime: '17:00', type: 'FATAL'
  });

  const [newTemplate, setNewTemplate] = useState({
    category: 'Cível / JEC', title: '', description: '', content: ''
  });

  const [newTaskForm, setNewTaskForm] = useState({
    title: '', description: '', process: '', responsible: 'Dra. Valeska Monteiro', dueDate: '2026-10-30', status: 'todo'
  });

  // Base de Dados
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
    }
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState<any>(templates[0]);

  // Aba de Tarefas Dinâmicas
  const [tasks, setTasks] = useState([
    {
      id: 't1',
      title: 'Elaborar Réplica à Contestação',
      description: 'Analisar preliminares de mérito e fundamentar nos autos.',
      process: '5046388-53.2025.8.08.0048',
      responsible: 'Dra. Valeska Monteiro',
      dueDate: '2026-10-30',
      status: 'todo'
    },
    {
      id: 't2',
      title: 'Calcular Verbas Rescisórias',
      description: 'Conferir os cartões de ponto anexados ao processo.',
      process: '0001083-23.2026.5.17.0008',
      responsible: 'Dra. Dayane',
      dueDate: '2026-10-29',
      status: 'in_progress'
    }
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

  // --- HANDLERS E FUNÇÕES ---
  const handleAddProcess = (e: any) => {
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

  const handleUpdateProcess = (e: any) => {
    e.preventDefault();
    setProcesses(processes.map(p => p.id === editingProcess.id ? {
      ...editingProcess,
      value: Number(editingProcess.value || 0),
      honorarios: Number(editingProcess.honorarios || 0),
      descontos: Number(editingProcess.descontos || 0)
    } : p));
    setEditingProcess(null);
  };

  const handleDeleteProcess = (id: string) => {
    if (confirm('Deseja excluir este processo?')) {
      setProcesses(processes.filter(p => p.id !== id));
      setEditingProcess(null);
    }
  };

  const handleAddClient = (e: any) => {
    e.preventDefault();
    if (!newClient.name) return;
    const item = { id: Date.now().toString(), ...newClient };
    setClients([item, ...clients]);
    setNewClient({ name: '', type: 'Pessoa Física', document: '', phone: '', email: '', status: 'Ativo' });
    setIsNewClientOpen(false);
  };

  const handleUpdateClient = (e: any) => {
    e.preventDefault();
    setClients(clients.map(c => c.id === editingClient.id ? editingClient : c));
    setEditingClient(null);
  };

  const handleDeleteClient = (id: string) => {
    if (confirm('Deseja excluir este cliente?')) {
      setClients(clients.filter(c => c.id !== id));
      setEditingClient(null);
    }
  };

  const handleAddDeadline = (e: any) => {
    e.preventDefault();
    if (!newDeadline.title) return;
    const item = { id: Date.now().toString(), ...newDeadline, completed: false, status: 'Em Andamento' };
    setDeadlines([item, ...deadlines]);
    setNewDeadline({ title: '', client: '', process: '', dueDate: '2026-10-28', dueTime: '17:00', type: 'FATAL' });
    setIsNewDeadlineOpen(false);
  };

  const handleMouseEnterItem = (e: any, item: any) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoverPos({
      x: Math.min(Math.max(rect.left - 40, 10), window.innerWidth - 280),
      y: rect.top < 220 ? rect.bottom + 8 : rect.top - 210
    });
    setHoveredDeadline(item);
  };

  const handleMouseLeaveItem = () => setHoveredDeadline(null);

  const handleAddTemplate = (e: any) => {
    e.preventDefault();
    if (!newTemplate.title) return;
    const item = { id: Date.now().toString(), ...newTemplate };
    setTemplates([item, ...templates]);
    setSelectedTemplate(item);
    setNewTemplate({ category: 'Cível / JEC', title: '', description: '', content: '' });
    setIsNewTemplateOpen(false);
  };

  const handleUpdateTemplate = (e: any) => {
    e.preventDefault();
    setTemplates(templates.map(t => t.id === editingTemplate.id ? editingTemplate : t));
    if (selectedTemplate?.id === editingTemplate.id) setSelectedTemplate(editingTemplate);
    setEditingTemplate(null);
  };

  const handleDeleteTemplate = (id: string) => {
    if (confirm('Deseja excluir este modelo?')) {
      const rest = templates.filter(t => t.id !== id);
      setTemplates(rest);
      if (selectedTemplate?.id === id) setSelectedTemplate(rest[0] || null);
      setEditingTemplate(null);
    }
  };

  const handleRunScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const scanId = `p_${Date.now()}`;
      if (!dismissedScanIds.includes(scanId)) {
        const newIntimacao = {
          id: scanId,
          date: new Date().toISOString().split('T')[0],
          court: 'TJES - Capixaba Push',
          title: 'Nova Publicação Disponibilizada',
          process: '5046388-53.2025.8.08.0048',
          snippet: 'Publicação referente a prazo para contestação...'
        };
        setScannedPush([newIntimacao, ...scannedPush]);
      }
      setIsScanning(false);
    }, 1200);
  };

  const handleMoveScanToAgenda = (item: any) => {
    const agendaItem = {
      id: Date.now().toString(),
      title: item.title,
      client: 'Cliente Relacionado',
      process: item.process,
      court: item.court,
      dueDate: '2026-11-05',
      dueTime: '23:59',
      type: 'FATAL',
      status: 'Pendente',
      completed: false
    };
    setDeadlines([...deadlines, agendaItem]);
    setDismissedScanIds([...dismissedScanIds, item.id]);
    setScannedPush(scannedPush.filter((s) => s.id !== item.id));
  };

  const handleSaveTask = (e: any) => {
    e.preventDefault();
    if (editingTask) {
      setTasks(tasks.map(t => t.id === editingTask.id ? editingTask : t));
      setEditingTask(null);
    } else {
      const item = { id: Date.now().toString(), ...newTaskForm };
      setTasks([...tasks, item]);
      setNewTaskForm({ title: '', description: '', process: '', responsible: 'Dra. Valeska Monteiro', dueDate: '2026-10-30', status: 'todo' });
      setIsNewTaskOpen(false);
    }
  };

  const handleDeleteTask = (id: string) => {
    if (confirm('Deseja excluir esta tarefa?')) {
      setTasks(tasks.filter(t => t.id !== id));
      setEditingTask(null);
    }
  };

  // Calendar Helpers
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const currentYear = currentDate.getFullYear();
  const currentMonthIdx = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
  const totalDays = getDaysInMonth(currentYear, currentMonthIdx);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonthIdx);

  const categories = ['Todas', ...Array.from(new Set(templates.map((t) => t.category)))];
  const filteredTemplates = selectedCategory === 'Todas' ? templates : templates.filter((t) => t.category === selectedCategory);

  // --- TELA DE LOGIN ---
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

  // --- INTERFACE PRINCIPAL ---
  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans" style={{ backgroundColor: PALETTE.fundoPagina, color: PALETTE.textoPrincipal }}>
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
          </div>
        </div>
      )}

      {/* SIDEBAR NAVIGATION */}
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
              { id: 'tasks', label: 'Quadro de Tarefas', icon: CheckSquare },
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

        <div className="p-4 border-t text-center text-[10px]" style={{ borderColor: `${PALETTE.dourado}30`, color: PALETTE.douradoClaro }}>
          <p className="font-semibold">Serra / ES • OAB/ES</p>
          <p className="opacity-60 mt-0.5 mb-3">Sistema Advocacia v2.6</p>
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

        <div className="p-6 flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
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
                  <span className="text-[10px] font-bold uppercase tracking-wider block text-rose-800">Despesas / Custas</span>
                  <p className="text-xl font-bold font-mono text-rose-800">R$ {financialTotals.descontos.toLocaleString('pt-BR')}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB: QUADRO DE TAREFAS */}
          {activeTab === 'tasks' && (
            <div className="p-6 rounded-2xl border space-y-6" style={{ backgroundColor: PALETTE.fundoCartoes, borderColor: PALETTE.linhasBordas }}>
              <div className="flex justify-between items-center border-b pb-4" style={{ borderColor: PALETTE.linhasBordas }}>
                <div>
                  <h3 className="font-serif font-bold text-lg" style={{ color: PALETTE.textoPrincipal }}>
                    Quadro Dinâmico de Tarefas
                  </h3>
                  <p className="text-xs" style={{ color: PALETTE.textoApoio }}>
                    Fluxo de trabalho interno em colunas dinâmicas.
                  </p>
                </div>
                <button
                  onClick={() => setIsNewTaskOpen(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow"
                  style={{ backgroundColor: PALETTE.bordoPrincipal }}
                >
                  <Plus size={15} /> Nova Tarefa
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                {[
                  { id: 'todo', title: 'A Fazer', color: 'border-rose-400 bg-rose-50/20' },
                  { id: 'in_progress', title: 'Em Andamento', color: 'border-amber-400 bg-amber-50/20' },
                  { id: 'review', title: 'Revisão', color: 'border-blue-400 bg-blue-50/20' },
                  { id: 'done', title: 'Concluído', color: 'border-emerald-400 bg-emerald-50/20' }
                ].map(col => (
                  <div key={col.id} className={`p-3 rounded-2xl border bg-white shadow-sm space-y-3 min-h-[450px] ${col.color}`}>
                    <h4 className="font-serif font-bold text-xs uppercase tracking-wider border-b pb-2" style={{ color: PALETTE.bordoEscuro }}>
                      {col.title}
                    </h4>
                    <div className="space-y-2">
                      {tasks.filter(t => t.status === col.id).map(task => (
                        <div key={task.id} className="p-3 rounded-xl border bg-white shadow-sm space-y-2 text-xs" style={{ borderColor: PALETTE.linhasBordas }}>
                          <div className="flex justify-between items-start">
                            <h5 className="font-bold">{task.title}</h5>
                            <button onClick={() => setEditingTask({ ...task })} className="p-1 hover:bg-slate-100 rounded text-slate-500">
                              <Pencil size={12} />
                            </button>
                          </div>
                          {task.description && <p className="text-[11px] text-slate-600">{task.description}</p>}
                          <div className="text-[10px] text-slate-500 border-t pt-1 space-y-0.5">
                            <p><strong>Prazo:</strong> {task.dueDate}</p>
                            <p><strong>Resp:</strong> {task.responsible}</p>
                          </div>
                          <div className="flex justify-between text-[9px] pt-1 font-bold border-t">
                            <span className="text-slate-400">Mover:</span>
                            <div className="flex gap-1">
                              {col.id !== 'todo' && <button onClick={() => setTasks(tasks.map(t => t.id === task.id ? {...t, status: 'todo'} : t))} className="text-rose-700">A Fazer</button>}
                              {col.id !== 'in_progress' && <button onClick={() => setTasks(tasks.map(t => t.id === task.id ? {...t, status: 'in_progress'} : t))} className="text-amber-700">Andamento</button>}
                              {col.id !== 'done' && <button onClick={() => setTasks(tasks.map(t => t.id === task.id ? {...t, status: 'done'} : t))} className="text-emerald-700">Concluído</button>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'push' && (
            <div className="p-6 rounded-2xl border space-y-6" style={{ backgroundColor: PALETTE.fundoCartoes, borderColor: PALETTE.linhasBordas }}>
              <div className="flex justify-between items-center border-b pb-4" style={{ borderColor: PALETTE.linhasBordas }}>
                <h3 className="font-serif font-bold text-lg" style={{ color: PALETTE.textoPrincipal }}>Varredura & Push</h3>
                <button onClick={handleRunScan} disabled={isScanning} className="px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5" style={{ backgroundColor: PALETTE.bordoPrincipal }}>
                  <Search size={15} /> {isScanning ? 'Varrendo...' : 'Executar Varredura'}
                </button>
              </div>

              <div className="space-y-3">
                {scannedPush.map((item) => (
                  <div key={item.id} className="p-4 rounded-xl border bg-white shadow-sm space-y-2" style={{ borderColor: PALETTE.linhasBordas }}>
                    <div className="flex justify-between">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded" style={{ backgroundColor: `${PALETTE.dourado}30` }}>{item.court}</span>
                      <span className="text-xs font-mono font-bold">{item.date}</span>
                    </div>
                    <h4 className="font-bold text-sm">{item.title}</h4>
                    <p className="text-xs text-slate-600">{item.snippet}</p>
                    <div className="flex justify-end pt-1">
                      <button onClick={() => handleMoveScanToAgenda(item)} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white" style={{ backgroundColor: PALETTE.bordoPrincipal }}>
                        <CalendarIcon size={14} className="inline mr-1" /> Enviar para Agenda
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'processes' && (
            <div className="p-6 rounded-2xl border space-y-6" style={{ backgroundColor: PALETTE.fundoCartoes, borderColor: PALETTE.linhasBordas }}>
              <div className="flex justify-between items-center border-b pb-4" style={{ borderColor: PALETTE.linhasBordas }}>
                <h3 className="font-serif font-bold text-lg" style={{ color: PALETTE.textoPrincipal }}>Gestão de Processos</h3>
                <button onClick={() => setIsNewProcessOpen(true)} className="px-4 py-2 rounded-xl text-xs font-bold text-white" style={{ backgroundColor: PALETTE.bordoPrincipal }}>
                  <Plus size={15} className="inline mr-1" /> Adicionar Processo
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {processes.map((proc) => (
                  <div key={proc.id} className="p-4 rounded-xl border bg-white shadow-sm flex justify-between items-center" style={{ borderColor: PALETTE.linhasBordas }}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold" style={{ color: PALETTE.bordoPrincipal }}>{proc.number}</span>
                        <button onClick={() => setEditingProcess({ ...proc })} className="p-1 hover:bg-black/5 rounded">
                          <Pencil size={13} style={{ color: PALETTE.dourado }} />
                        </button>
                        <button onClick={() => handleDeleteProcess(proc.id)} className="p-1 hover:bg-rose-50 text-rose-700 rounded">
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <h4 className="font-bold text-sm mt-1">{proc.client}</h4>
                      <p className="text-xs text-slate-600">{proc.action} • {proc.court}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">{proc.status}</span>
                      <p className="text-xs font-mono font-bold mt-1">R$ {proc.value.toLocaleString('pt-BR')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'crm' && (
            <div className="p-6 rounded-2xl border space-y-6" style={{ backgroundColor: PALETTE.fundoCartoes, borderColor: PALETTE.linhasBordas }}>
              <div className="flex justify-between items-center border-b pb-4" style={{ borderColor: PALETTE.linhasBordas }}>
                <h3 className="font-serif font-bold text-lg" style={{ color: PALETTE.textoPrincipal }}>Clientes (CRM)</h3>
                <button onClick={() => setIsNewClientOpen(true)} className="px-4 py-2 rounded-xl text-xs font-bold text-white" style={{ backgroundColor: PALETTE.bordoPrincipal }}>
                  <Plus size={15} className="inline mr-1" /> Cadastrar Cliente
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {clients.map((cli) => (
                  <div key={cli.id} className="p-4 rounded-xl border bg-white shadow-sm space-y-2" style={{ borderColor: PALETTE.linhasBordas }}>
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-sm">{cli.name}</h4>
                      <div className="flex gap-1">
                        <button onClick={() => setEditingClient({ ...cli })} className="p-1 hover:bg-black/5 rounded">
                          <Pencil size={13} style={{ color: PALETTE.dourado }} />
                        </button>
                        <button onClick={() => handleDeleteClient(cli.id)} className="p-1 hover:bg-rose-50 text-rose-700 rounded">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600">Doc: {cli.document} • Tel: {cli.phone}</p>
                    <p className="text-xs text-slate-600">{cli.email}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'agenda' && (
            <div className="p-6 rounded-2xl border space-y-6" style={{ backgroundColor: PALETTE.fundoCartoes, borderColor: PALETTE.linhasBordas }}>
              <div className="flex justify-between items-center border-b pb-4" style={{ borderColor: PALETTE.linhasBordas }}>
                <h3 className="font-serif font-bold text-lg" style={{ color: PALETTE.textoPrincipal }}>Agenda de Prazos</h3>
                <button onClick={() => setIsNewDeadlineOpen(true)} className="px-4 py-2 rounded-xl text-xs font-bold text-white" style={{ backgroundColor: PALETTE.bordoPrincipal }}>
                  <Plus size={15} className="inline mr-1" /> Cadastrar Prazo
                </button>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: totalDays }).map((_, i) => {
                  const dayNum = i + 1;
                  const dateStr = `${currentYear}-${String(currentMonthIdx + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                  const dayDeadlines = deadlines.filter((d) => d.dueDate === dateStr);

                  return (
                    <div
                      key={dayNum}
                      onClick={() => {
                        setNewDeadline({ ...newDeadline, dueDate: dateStr });
                        setIsNewDeadlineOpen(true);
                      }}
                      className="h-28 p-2 rounded-xl border bg-white hover:border-amber-500 cursor-pointer flex flex-col justify-between"
                      style={{ borderColor: PALETTE.linhasBordas }}
                    >
                      <span className="font-bold text-xs">{dayNum}</span>
                      <div className="space-y-1 overflow-y-auto">
                        {dayDeadlines.map((item) => (
                          <div
                            key={item.id}
                            onClick={(e) => { e.stopPropagation(); setSelectedDeadlineModal(item); }}
                            className="p-1 rounded text-[10px] font-bold bg-amber-100 text-amber-900 truncate"
                          >
                            {item.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="p-6 rounded-2xl border space-y-6" style={{ backgroundColor: PALETTE.fundoCartoes, borderColor: PALETTE.linhasBordas }}>
              <div className="flex justify-between items-center border-b pb-4" style={{ borderColor: PALETTE.linhasBordas }}>
                <h3 className="font-serif font-bold text-lg" style={{ color: PALETTE.textoPrincipal }}>Modelos de Peças</h3>
                <button onClick={() => setIsNewTemplateOpen(true)} className="px-4 py-2 rounded-xl text-xs font-bold text-white" style={{ backgroundColor: PALETTE.bordoPrincipal }}>
                  <Plus size={15} className="inline mr-1" /> Novo Modelo
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  {templates.map((tmpl) => (
                    <div key={tmpl.id} onClick={() => setSelectedTemplate(tmpl)} className="p-3 rounded-xl border bg-white cursor-pointer" style={{ borderColor: PALETTE.linhasBordas }}>
                      <h4 className="font-bold text-xs">{tmpl.title}</h4>
                    </div>
                  ))}
                </div>

                {selectedTemplate && (
                  <div className="md:col-span-2 p-4 rounded-xl border bg-white space-y-3" style={{ borderColor: PALETTE.linhasBordas }}>
                    <div className="flex justify-between items-center border-b pb-2">
                      <h4 className="font-bold text-sm">{selectedTemplate.title}</h4>
                      <div className="flex gap-2">
                        <button onClick={() => setEditingTemplate({ ...selectedTemplate })} className="px-2 py-1 text-xs border rounded font-bold">
                          <Pencil size={12} className="inline mr-1" /> Editar
                        </button>
                        <button onClick={() => handleDeleteTemplate(selectedTemplate.id)} className="px-2 py-1 text-xs bg-rose-50 text-rose-700 rounded font-bold">
                          <Trash2 size={12} className="inline mr-1" /> Excluir
                        </button>
                      </div>
                    </div>
                    <pre className="text-xs p-3 bg-slate-50 border rounded font-mono whitespace-pre-wrap">{selectedTemplate.content}</pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'finances' && (
            <div className="p-6 rounded-2xl border space-y-6" style={{ backgroundColor: PALETTE.fundoCartoes, borderColor: PALETTE.linhasBordas }}>
              <h3 className="font-serif font-bold text-lg" style={{ color: PALETTE.textoPrincipal }}>Apuração de Verbas</h3>
              <div className="p-4 rounded-xl border bg-white space-y-3" style={{ borderColor: PALETTE.linhasBordas }}>
                <select value={selectedVerbasProcId} onChange={(e) => setSelectedVerbasProcId(e.target.value)} className="w-full p-2 border rounded font-bold text-xs">
                  {processes.map((p) => (
                    <option key={p.id} value={p.id}>{p.number} - {p.client}</option>
                  ))}
                </select>

                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="text-[10px] font-bold block">Valor Causa (R$)</label>
                    <input
                      type="number"
                      value={selectedVerbasProc.value}
                      onChange={(e) => setProcesses(processes.map(p => p.id === selectedVerbasProcId ? { ...p, value: Number(e.target.value) } : p))}
                      className="w-full p-2 border rounded font-mono text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold block">Honorários (R$)</label>
                    <input
                      type="number"
                      value={selectedVerbasProc.honorarios}
                      onChange={(e) => setProcesses(processes.map(p => p.id === selectedVerbasProcId ? { ...p, honorarios: Number(e.target.value) } : p))}
                      className="w-full p-2 border rounded font-mono text-xs font-bold text-emerald-800"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold block">Descontos (R$)</label>
                    <input
                      type="number"
                      value={selectedVerbasProc.descontos}
                      onChange={(e) => setProcesses(processes.map(p => p.id === selectedVerbasProcId ? { ...p, descontos: Number(e.target.value) } : p))}
                      className="w-full p-2 border rounded font-mono text-xs font-bold text-rose-800"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'calculadoras' && (
            <div className="p-6 rounded-2xl border space-y-6" style={{ backgroundColor: PALETTE.fundoCartoes, borderColor: PALETTE.linhasBordas }}>
              <h3 className="font-serif font-bold text-lg" style={{ color: PALETTE.textoPrincipal }}>Calculadoras Jurídicas</h3>
            </div>
          )}
        </div>
      </main>

      {/* MODAL PROCESSO */}
      {(isNewProcessOpen || editingProcess) && (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-2xl bg-white space-y-4">
            <h3 className="font-bold text-base">{editingProcess ? 'Editar Processo' : 'Novo Processo'}</h3>
            <form onSubmit={editingProcess ? handleUpdateProcess : handleAddProcess} className="space-y-3 text-xs">
              <input type="text" placeholder="Número" value={editingProcess ? editingProcess.number : newProcess.number} onChange={(e) => editingProcess ? setEditingProcess({ ...editingProcess, number: e.target.value }) : setNewProcess({ ...newProcess, number: e.target.value })} className="w-full p-2 border rounded" required />
              <input type="text" placeholder="Cliente" value={editingProcess ? editingProcess.client : newProcess.client} onChange={(e) => editingProcess ? setEditingProcess({ ...editingProcess, client: e.target.value }) : setNewProcess({ ...newProcess, client: e.target.value })} className="w-full p-2 border rounded" required />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => { setIsNewProcessOpen(false); setEditingProcess(null); }} className="px-3 py-1.5 border rounded">Cancelar</button>
                <button type="submit" className="px-3 py-1.5 text-white font-bold rounded" style={{ backgroundColor: PALETTE.bordoPrincipal }}>Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TAREFA QUADRO */}
      {(isNewTaskOpen || editingTask) && (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-2xl bg-white space-y-4">
            <h3 className="font-bold text-base">{editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}</h3>
            <form onSubmit={handleSaveTask} className="space-y-3 text-xs">
              <input type="text" placeholder="Título" value={editingTask ? editingTask.title : newTaskForm.title} onChange={(e) => editingTask ? setEditingTask({ ...editingTask, title: e.target.value }) : setNewTaskForm({ ...newTaskForm, title: e.target.value })} className="w-full p-2 border rounded" required />
              <textarea placeholder="Descrição" value={editingTask ? editingTask.description : newTaskForm.description} onChange={(e) => editingTask ? setEditingTask({ ...editingTask, description: e.target.value }) : setNewTaskForm({ ...newTaskForm, description: e.target.value })} className="w-full p-2 border rounded" />
              <div className="flex justify-between items-center pt-2">
                {editingTask ? <button type="button" onClick={() => handleDeleteTask(editingTask.id)} className="text-rose-700 font-bold">Excluir</button> : <div />}
                <div className="flex gap-2">
                  <button type="button" onClick={() => { setIsNewTaskOpen(false); setEditingTask(null); }} className="px-3 py-1.5 border rounded">Cancelar</button>
                  <button type="submit" className="px-3 py-1.5 text-white font-bold rounded" style={{ backgroundColor: PALETTE.bordoPrincipal }}>Salvar</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
