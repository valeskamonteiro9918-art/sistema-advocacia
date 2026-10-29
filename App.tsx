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

  // --- ESTADOS GERAIS ---
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

  // Popover da Agenda
  const [hoveredDeadline, setHoveredDeadline] = useState<any>(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });

  // --- DADOS PRINCIPAIS DO SISTEMA ---
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

  // --- NOVA ABA DE TAREFAS (ESTILO BITRIX24) ---
  const [tasks, setTasks] = useState([
    {
      id: 't1',
      title: 'Elaborar Réplica à Contestação',
      description: 'Analisar preliminares de mérito da reclamada e protocolar resposta.',
      process: '5046388-53.2025.8.08.0048',
      responsible: 'Dra. Valeska Monteiro',
      dueDate: '2026-10-30',
      status: 'todo' // todo | in_progress | review | done
    },
    {
      id: 't2',
      title: 'Calcular Verbas Rescisórias - Isabela',
      description: 'Rodar planilha de simulação com base nos cartões de ponto anexados.',
      process: '0001083-23.2026.5.17.0008',
      responsible: 'Dra. Dayane',
      dueDate: '2026-10-29',
      status: 'in_progress'
    },
    {
      id: 't3',
      title: 'Conferir Publicações do Diário Eletrônico',
      description: 'Revisar intimações do PJe e distribuir prazos na agenda.',
      process: 'Geral do Escritório',
      responsible: 'Dra. Valeska Monteiro',
      dueDate: '2026-10-28',
      status: 'review'
    },
    {
      id: 't4',
      title: 'Enviar Contrato de Honorários Assinado',
      description: 'Cliente Estevão assinou via Docusign, arquivar na pasta do drive.',
      process: '0001478-18.2026.5.17.0007',
      responsible: 'Dra. Dayane',
      dueDate: '2026-10-26',
      status: 'done'
    }
  ]);

  // Forms
  const [newProcessForm, setNewProcessForm] = useState({
    number: '', client: '', action: '', court: '', value: '', honorarios: '', descontos: '', status: 'Em andamento'
  });

  const [newClientForm, setNewClientForm] = useState({
    name: '', type: 'Pessoa Física', document: '', phone: '', email: '', status: 'Ativo'
  });

  const [newDeadlineForm, setNewDeadlineForm] = useState({
    title: '', client: '', process: '', dueDate: '2026-10-28', dueTime: '17:00', type: 'FATAL'
  });

  const [newTemplateForm, setNewTemplateForm] = useState({
    category: 'Cível / JEC', title: '', description: '', content: ''
  });

  const [newTaskForm, setNewTaskForm] = useState({
    title: '', description: '', process: '', responsible: 'Dra. Valeska Monteiro', dueDate: '2026-10-30', status: 'todo'
  });

  // Apuração de verbas selecionada
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

  // --- HANDLERS DA GESTÃO DE PROCESSOS ---
  const handleSaveProcess = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProcess) {
      setProcesses(processes.map(p => p.id === editingProcess.id ? {
        ...editingProcess,
        value: Number(editingProcess.value || 0),
        honorarios: Number(editingProcess.honorarios || 0),
        descontos: Number(editingProcess.descontos || 0)
      } : p));
      setEditingProcess(null);
    } else {
      const item = {
        id: Date.now().toString(),
        ...newProcessForm,
        value: Number(newProcessForm.value || 0),
        honorarios: Number(newProcessForm.honorarios || 0),
        descontos: Number(newProcessForm.descontos || 0)
      };
      setProcesses([item, ...processes]);
      setNewProcessForm({ number: '', client: '', action: '', court: '', value: '', honorarios: '', descontos: '', status: 'Em andamento' });
      setIsNewProcessOpen(false);
    }
  };

  const handleDeleteProcess = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este processo?')) {
      setProcesses(processes.filter(p => p.id !== id));
      if (editingProcess) setEditingProcess(null);
    }
  };

  // --- HANDLERS DO CRM DE CLIENTES ---
  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClient) {
      setClients(clients.map(c => c.id === editingClient.id ? editingClient : c));
      setEditingClient(null);
    } else {
      const item = { id: Date.now().toString(), ...newClientForm };
      setClients([item, ...clients]);
      setNewClientForm({ name: '', type: 'Pessoa Física', document: '', phone: '', email: '', status: 'Ativo' });
      setIsNewClientOpen(false);
    }
  };

  const handleDeleteClient = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      setClients(clients.filter(c => c.id !== id));
      if (editingClient) setEditingClient(null);
    }
  };

  // --- HANDLERS DE MODELOS DE PEÇAS ---
  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTemplate) {
      setTemplates(templates.map(t => t.id === editingTemplate.id ? editingTemplate : t));
      if (selectedTemplate?.id === editingTemplate.id) setSelectedTemplate(editingTemplate);
      setEditingTemplate(null);
    } else {
      const item = { id: Date.now().toString(), ...newTemplateForm };
      setTemplates([item, ...templates]);
      setSelectedTemplate(item);
      setNewTemplateForm({ category: 'Cível / JEC', title: '', description: '', content: '' });
      setIsNewTemplateOpen(false);
    }
  };

  const handleDeleteTemplate = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este modelo de peça?')) {
      const updated = templates.filter(t => t.id !== id);
      setTemplates(updated);
      if (selectedTemplate?.id === id) setSelectedTemplate(updated[0] || null);
      if (editingTemplate) setEditingTemplate(null);
    }
  };

  // --- HANDLERS DA AGENDA ---
  const handleSaveDeadline = (e: React.FormEvent) => {
    e.preventDefault();
    const item = { id: Date.now().toString(), ...newDeadlineForm, completed: false, status: 'Em Andamento' };
    setDeadlines([item, ...deadlines]);
    setNewDeadlineForm({ title: '', client: '', process: '', dueDate: '2026-10-28', dueTime: '17:00', type: 'FATAL' });
    setIsNewDeadlineOpen(false);
  };

  const handleOpenDayModal = (dateStr: string) => {
    setNewDeadlineForm({
      ...newDeadlineForm,
      dueDate: dateStr
    });
    setIsNewDeadlineOpen(true);
  };

  // --- HANDLERS DA VARREDURA (NÃO VOLTAR MAIS A MESMA NOTIFICAÇÃO) ---
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
          snippet: 'Publicação no Diário da Justiça referente a prazo para contestação de reconvenção...'
        };
        setScannedPush([newIntimacao, ...scannedPush]);
      }
      setIsScanning(false);
    }, 1000);
  };

  const handleMoveScanToAgenda = (item: any) => {
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
    setDeadlines([...deadlines, agendaItem]);
    setDismissedScanIds([...dismissedScanIds, item.id]);
    setScannedPush(scannedPush.filter((s) => s.id !== item.id));
  };

  // --- HANDLERS DE APURAÇÃO DE VERBAS (EDIÇÃO DIRETA) ---
  const handleUpdateProcVerbas = (field: string, val: number) => {
    setProcesses(processes.map(p => p.id === selectedVerbasProcId ? { ...p, [field]: val } : p));
  };

  // --- HANDLERS DA ABA DE TAREFAS (BITRIX24) ---
  const handleSaveTask = (e: React.FormEvent) => {
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
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
      setTasks(tasks.filter(t => t.id !== id));
      if (editingTask) setEditingTask(null);
    }
  };

  const handleMoveTaskStatus = (id: string, newStatus: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  // Helpers Calendário
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
      {/* CARD FLUTUANTE DA AGENDA */}
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

      {/* BARRA LATERAL */}
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
              { id: 'tasks', label: 'Tarefas (Bitrix24)', icon: CheckSquare },
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

      {/* CONTEÚDO PRINCIPAL */}
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
          {/* TAB 1: DASHBOARD EXECUTIVO */}
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

          {/* TAB 2: TAREFAS (NOVA ABA ESTILO BITRIX24) */}
          {activeTab === 'tasks' && (
            <div className="p-6 rounded-2xl border space-y-6" style={{ backgroundColor: PALETTE.fundoCartoes, borderColor: PALETTE.linhasBordas }}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4" style={{ borderColor: PALETTE.linhasBordas }}>
                <div>
                  <h3 className="font-serif font-bold text-lg" style={{ color: PALETTE.textoPrincipal }}>
                    Quadro Dinâmico de Tarefas
                  </h3>
                  <p className="text-xs" style={{ color: PALETTE.textoApoio }}>
                    Fluxo de trabalho interno em colunas dinâmicas (Estilo Bitrix24 / Kanban).
                  </p>
                </div>

                <button
                  onClick={() => setIsNewTaskOpen(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow hover:brightness-110 transition"
                  style={{ backgroundColor: PALETTE.bordoPrincipal }}
                >
                  <Plus size={15} /> Criar Nova Tarefa
                </button>
              </div>

              {/* Colunas do Kanban */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                {[
                  { id: 'todo', title: 'A Fazer', color: 'border-rose-400 bg-rose-50/30' },
                  { id: 'in_progress', title: 'Em Andamento', color: 'border-amber-400 bg-amber-50/30' },
                  { id: 'review', title: 'Revisão / Aprovação', color: 'border-blue-400 bg-blue-50/30' },
                  { id: 'done', title: 'Concluído', color: 'border-emerald-400 bg-emerald-50/30' }
                ].map(col => {
                  const colTasks = tasks.filter(t => t.status === col.id);
                  return (
                    <div key={col.id} className={`p-3 rounded-2xl border bg-white/70 shadow-sm space-y-3 min-h-[500px] ${col.color}`}>
                      <div className="flex justify-between items-center border-b pb-2 px-1">
                        <h4 className="font-serif font-bold text-xs uppercase tracking-wider" style={{ color: PALETTE.bordoEscuro }}>
                          {col.title}
                        </h4>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white border">
                          {colTasks.length}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {colTasks.map(task => (
                          <div
                            key={task.id}
                            className="p-4 rounded-xl border bg-white shadow-md hover:shadow-lg transition space-y-2.5 relative group"
                            style={{ borderColor: PALETTE.linhasBordas }}
                          >
                            <div className="flex justify-between items-start">
                              <h5 className="font-bold text-xs text-slate-900 leading-snug">{task.title}</h5>
                              <button
                                onClick={() => setEditingTask({ ...task })}
                                className="p-1 hover:bg-slate-100 rounded text-slate-500"
                              >
                                <Pencil size={13} />
                              </button>
                            </div>

                            {task.description && (
                              <p className="text-[11px] text-slate-600 line-clamp-2">{task.description}</p>
                            )}

                            <div className="pt-2 border-t space-y-1 text-[10px] text-slate-500" style={{ borderColor: PALETTE.linhasBordas }}>
                              <p className="flex items-center gap-1 font-mono">
                                <Clock size={12} className="text-amber-600" /> Prazo: {task.dueDate}
                              </p>
                              <p className="flex items-center gap-1 font-bold" style={{ color: PALETTE.bordoPrincipal }}>
                                <UserCheck size={12} /> {task.responsible}
                              </p>
                            </div>

                            {/* Move Status Fast Selector */}
                            <div className="pt-2 flex justify-between gap-1 text-[9px] font-bold border-t" style={{ borderColor: PALETTE.linhasBordas }}>
                              <span className="text-slate-400">Mover:</span>
                              <div className="flex gap-1">
                                {col.id !== 'todo' && (
                                  <button onClick={() => handleMoveTaskStatus(task.id, 'todo')} className="hover:underline text-rose-700">A Fazer</button>
                                )}
                                {col.id !== 'in_progress' && (
                                  <button onClick={() => handleMoveTaskStatus(task.id, 'in_progress')} className="hover:underline text-amber-700">Andamento</button>
                                )}
                                {col.id !== 'review' && (
                                  <button onClick={() => handleMoveTaskStatus(task.id, 'review')} className="hover:underline text-blue-700">Revisão</button>
                                )}
                                {col.id !== 'done' && (
                                  <button onClick={() => handleMoveTaskStatus(task.id, 'done')} className="hover:underline text-emerald-700">Concluído</button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}

                        {colTasks.length === 0 && (
                          <div className="text-center py-8 text-[11px] text-slate-400 italic">
                            Nenhuma tarefa
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: VARREDURA & PUSH */}
          {activeTab === 'push' && (
            <div className="p-6 rounded-2xl border space-y-6" style={{ backgroundColor: PALETTE.fundoCartoes, borderColor: PALETTE.linhasBordas }}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4" style={{ borderColor: PALETTE.linhasBordas }}>
                <div>
                  <h3 className="font-serif font-bold text-lg" style={{ color: PALETTE.textoPrincipal }}>
                    Varredura Eletrônica & Notificações Push
                  </h3>
                  <p className="text-xs" style={{ color: PALETTE.textoApoio }}>
                    Monitoramento em tempo real nos Diários Eletrônicos.
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

          {/* TAB 4: GESTÃO DE PROCESSOS (EDITAR E EXCLUIR) */}
          {activeTab === 'processes' && (
            <div className="p-6 rounded-2xl border space-y-6" style={{ backgroundColor: PALETTE.fundoCartoes, borderColor: PALETTE.linhasBordas }}>
              <div className="flex justify-between items-center border-b pb-4" style={{ borderColor: PALETTE.linhasBordas }}>
                <div>
                  <h3 className="font-serif font-bold text-lg" style={{ color: PALETTE.textoPrincipal }}>
                    Gestão de Processos
                  </h3>
                  <p className="text-xs" style={{ color: PALETTE.textoApoio }}>
                    Listagem, edição completa e exclusão de processos.
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
                        <button onClick={() => setEditingProcess({ ...proc })} className="p-1 hover:bg-black/5 rounded">
                          <Pencil size={14} style={{ color: PALETTE.dourado }} />
                        </button>
                        <button onClick={() => handleDeleteProcess(proc.id)} className="p-1 hover:bg-rose-50 text-rose-700 rounded">
                          <Trash2 size={14} />
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

          {/* TAB 5: CLIENTES CRM (EDITAR CLIENTES) */}
          {activeTab === 'crm' && (
            <div className="p-6 rounded-2xl border space-y-6" style={{ backgroundColor: PALETTE.fundoCartoes, borderColor: PALETTE.linhasBordas }}>
              <div className="flex justify-between items-center border-b pb-4" style={{ borderColor: PALETTE.linhasBordas }}>
                <div>
                  <h3 className="font-serif font-bold text-lg" style={{ color: PALETTE.textoPrincipal }}>
                    CRM de Clientes
                  </h3>
                  <p className="text-xs" style={{ color: PALETTE.textoApoio }}>
                    Gestão, edição e contatos do escritório.
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
                      <div className="flex items-center gap-1">
                        <button onClick={() => setEditingClient({ ...cli })} className="p-1.5 hover:bg-black/5 rounded">
                          <Pencil size={14} style={{ color: PALETTE.dourado }} />
                        </button>
                        <button onClick={() => handleDeleteClient(cli.id)} className="p-1.5 hover:bg-rose-50 text-rose-700 rounded">
                          <Trash2 size={14} />
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

          {/* TAB 6: AGENDA DE PRAZOS (CLICAR NO DIA PARA CADASTRAR) */}
          {activeTab === 'agenda' && (
            <div className="p-6 rounded-2xl border space-y-6" style={{ backgroundColor: PALETTE.fundoCartoes, borderColor: PALETTE.linhasBordas }}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4" style={{ borderColor: PALETTE.linhasBordas }}>
                <div>
                  <h3 className="font-serif font-bold text-lg" style={{ color: PALETTE.textoPrincipal }}>
                    Agenda Processual
                  </h3>
                  <p className="text-xs" style={{ color: PALETTE.textoApoio }}>
                    Clique diretamente em um dia do calendário para agendar um novo compromisso.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsNewDeadlineOpen(true)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow hover:brightness-110 transition"
                    style={{ backgroundColor: PALETTE.bordoPrincipal }}
                  >
                    <Plus size={15} /> Cadastrar Prazo
                  </button>
                </div>
              </div>

              {/* Calendário em Grade */}
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
                        onClick={() => handleOpenDayModal(dateStr)}
                        className="h-28 p-2 rounded-xl border bg-white flex flex-col justify-between hover:border-amber-500 hover:shadow-md transition cursor-pointer relative group"
                        style={{ borderColor: PALETTE.linhasBordas }}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-xs font-mono" style={{ color: PALETTE.textoPrincipal }}>
                            {dayNum}
                          </span>
                          <span className="opacity-0 group-hover:opacity-100 text-[10px] font-bold text-amber-700">+ Add</span>
                        </div>

                        <div className="space-y-1 overflow-y-auto flex-1 my-1">
                          {dayDeadlines.map((item) => (
                            <div
                              key={item.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDeadlineModal({ ...item });
                              }}
                              className="p-1.5 rounded text-[10px] font-bold cursor-pointer transition truncate border shadow-sm"
                              style={{
                                backgroundColor: item.completed ? '#D1FAE5' : item.type === 'FATAL' ? '#FEE2E2' : '#FEF3C7',
                                color: item.completed ? '#065F46' : item.type === 'FATAL' ? '#991B1B' : '#92400E',
                                borderColor: item.type === 'FATAL' ? '#FCA5A5' : PALETTE.dourado
                              }}
                            >
                              {item.dueTime} • {item.title}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: MODELOS DE PEÇAS (EDITAR E EXCLUIR) */}
          {activeTab === 'templates' && (
            <div className="p-6 rounded-2xl border space-y-6" style={{ backgroundColor: PALETTE.fundoCartoes, borderColor: PALETTE.linhasBordas }}>
              <div className="flex justify-between items-center border-b pb-4" style={{ borderColor: PALETTE.linhasBordas }}>
                <div>
                  <h3 className="font-serif font-bold text-lg" style={{ color: PALETTE.textoPrincipal }}>
                    Modelos de Peças
                  </h3>
                  <p className="text-xs" style={{ color: PALETTE.textoApoio }}>
                    Criar, editar e excluir minutas padronizadas.
                  </p>
                </div>

                <button
                  onClick={() => setIsNewTemplateOpen(true)}
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

                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingTemplate({ ...selectedTemplate })}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1 hover:bg-slate-50"
                        >
                          <Pencil size={14} /> Editar Peça
                        </button>
                        <button
                          onClick={() => handleDeleteTemplate(selectedTemplate.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 flex items-center gap-1"
                        >
                          <Trash2 size={14} /> Excluir
                        </button>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(selectedTemplate.content);
                            alert('Modelo copiado!');
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-white flex items-center gap-1.5 shadow"
                          style={{ backgroundColor: PALETTE.dourado }}
                        >
                          <Copy size={14} /> Copiar
                        </button>
                      </div>
                    </div>

                    <pre className="p-4 rounded-xl border font-mono text-xs whitespace-pre-wrap leading-relaxed overflow-y-auto max-h-[500px]" style={{ backgroundColor: PALETTE.fundoPagina, borderColor: PALETTE.linhasBordas, color: PALETTE.textoPrincipal }}>
                      {selectedTemplate.content}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 8: APURAÇÃO DE VERBAS (EDITAR VALORES DIRETAMENTE) */}
          {activeTab === 'finances' && (
            <div className="p-6 rounded-2xl border space-y-6" style={{ backgroundColor: PALETTE.fundoCartoes, borderColor: PALETTE.linhasBordas }}>
              <div className="border-b pb-4" style={{ borderColor: PALETTE.linhasBordas }}>
                <h3 className="font-serif font-bold text-lg" style={{ color: PALETTE.textoPrincipal }}>
                  Apuração de Verbas & Honorários
                </h3>
                <p className="text-xs" style={{ color: PALETTE.textoApoio }}>
                  Edite diretamente os valores do processo selecionado abaixo para recalcular as opções financeiras.
                </p>
              </div>

              <div className="p-4 rounded-xl border bg-white shadow-sm space-y-4" style={{ borderColor: PALETTE.linhasBordas }}>
                <label className="font-bold text-xs block" style={{ color: PALETTE.textoPrincipal }}>
                  Selecionar Processo para Atualizar e Ajustar Valores:
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="p-3.5 rounded-xl border bg-amber-50/50 space-y-1" style={{ borderColor: PALETTE.linhasBordas }}>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Valor Causa (R$)</label>
                    <input
                      type="number"
                      value={selectedVerbasProc.value}
                      onChange={(e) => handleUpdateProcVerbas('value', Number(e.target.value))}
                      className="w-full p-2 border rounded-lg font-mono font-bold text-sm bg-white"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl border bg-emerald-50/50 space-y-1" style={{ borderColor: PALETTE.linhasBordas }}>
                    <label className="block text-[10px] font-bold text-emerald-700 uppercase">Honorários (R$)</label>
                    <input
                      type="number"
                      value={selectedVerbasProc.honorarios}
                      onChange={(e) => handleUpdateProcVerbas('honorarios', Number(e.target.value))}
                      className="w-full p-2 border rounded-lg font-mono font-bold text-sm bg-white text-emerald-800"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl border bg-rose-50/50 space-y-1" style={{ borderColor: PALETTE.linhasBordas }}>
                    <label className="block text-[10px] font-bold text-rose-700 uppercase">Custas / Descontos (R$)</label>
                    <input
                      type="number"
                      value={selectedVerbasProc.descontos}
                      onChange={(e) => handleUpdateProcVerbas('descontos', Number(e.target.value))}
                      className="w-full p-2 border rounded-lg font-mono font-bold text-sm bg-white text-rose-800"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: CALCULADORAS JURÍDICAS */}
          {activeTab === 'calculadoras' && (
            <div className="p-6 rounded-2xl border space-y-6" style={{ backgroundColor: PALETTE.fundoCartoes, borderColor: PALETTE.linhasBordas }}>
              <div className="flex justify-between items-center border-b pb-4" style={{ borderColor: PALETTE.linhasBordas }}>
                <h3 className="font-serif font-bold text-lg" style={{ color: PALETTE.textoPrincipal }}>
                  Calculadoras Jurídicas
                </h3>
              </div>
              <p className="text-xs text-slate-600">Calculadoras de verbas rescisórias e pensão alimentícia integradas.</p>
            </div>
          )}
        </div>
      </main>

      {/* MODAL: PROCESSO (CRIAR / EDITAR) */}
      {(isNewProcessOpen || editingProcess) && (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-white shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-serif font-bold text-base" style={{ color: PALETTE.bordoEscuro }}>
                {editingProcess ? 'Editar Processo' : 'Cadastrar Novo Processo'}
              </h3>
              <button onClick={() => { setIsNewProcessOpen(false); setEditingProcess(null); }}><X size={18} /></button>
            </div>

            <form onSubmit={handleSaveProcess} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Número do Processo</label>
                <input
                  type="text"
                  required
                  value={editingProcess ? editingProcess.number : newProcessForm.number}
                  onChange={(e) => editingProcess ? setEditingProcess({ ...editingProcess, number: e.target.value }) : setNewProcessForm({ ...newProcessForm, number: e.target.value })}
                  className="w-full p-2.5 border rounded-lg"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Cliente</label>
                <input
                  type="text"
                  required
                  value={editingProcess ? editingProcess.client : newProcessForm.client}
                  onChange={(e) => editingProcess ? setEditingProcess({ ...editingProcess, client: e.target.value }) : setNewProcessForm({ ...newProcessForm, client: e.target.value })}
                  className="w-full p-2.5 border rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">Ação</label>
                  <input
                    type="text"
                    value={editingProcess ? editingProcess.action : newProcessForm.action}
                    onChange={(e) => editingProcess ? setEditingProcess({ ...editingProcess, action: e.target.value }) : setNewProcessForm({ ...newProcessForm, action: e.target.value })}
                    className="w-full p-2.5 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Vara / Tribunal</label>
                  <input
                    type="text"
                    value={editingProcess ? editingProcess.court : newProcessForm.court}
                    onChange={(e) => editingProcess ? setEditingProcess({ ...editingProcess, court: e.target.value }) : setNewProcessForm({ ...newProcessForm, court: e.target.value })}
                    className="w-full p-2.5 border rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold block mb-1">Valor Causa (R$)</label>
                  <input
                    type="number"
                    value={editingProcess ? editingProcess.value : newProcessForm.value}
                    onChange={(e) => editingProcess ? setEditingProcess({ ...editingProcess, value: e.target.value }) : setNewProcessForm({ ...newProcessForm, value: e.target.value })}
                    className="w-full p-2.5 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Honorários (R$)</label>
                  <input
                    type="number"
                    value={editingProcess ? editingProcess.honorarios : newProcessForm.honorarios}
                    onChange={(e) => editingProcess ? setEditingProcess({ ...editingProcess, honorarios: e.target.value }) : setNewProcessForm({ ...newProcessForm, honorarios: e.target.value })}
                    className="w-full p-2.5 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Descontos (R$)</label>
                  <input
                    type="number"
                    value={editingProcess ? editingProcess.descontos : newProcessForm.descontos}
                    onChange={(e) => editingProcess ? setEditingProcess({ ...editingProcess, descontos: e.target.value }) : setNewProcessForm({ ...newProcessForm, descontos: e.target.value })}
                    className="w-full p-2.5 border rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-between items-center border-t">
                {editingProcess ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteProcess(editingProcess.id)}
                    className="px-3 py-2 rounded-lg text-rose-700 font-bold flex items-center gap-1 hover:bg-rose-50"
                  >
                    <Trash2 size={14} /> Excluir Processo
                  </button>
                ) : <div />}

                <div className="flex gap-2">
                  <button type="button" onClick={() => { setIsNewProcessOpen(false); setEditingProcess(null); }} className="px-4 py-2 rounded-lg border font-bold">Cancelar</button>
                  <button type="submit" className="px-4 py-2 rounded-lg text-white font-bold" style={{ backgroundColor: PALETTE.bordoPrincipal }}>Salvar</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CLIENTE (CRIAR / EDITAR) */}
      {(isNewClientOpen || editingClient) && (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-2xl bg-white shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-serif font-bold text-base" style={{ color: PALETTE.bordoEscuro }}>
                {editingClient ? 'Editar Cliente' : 'Cadastrar Cliente'}
              </h3>
              <button onClick={() => { setIsNewClientOpen(false); setEditingClient(null); }}><X size={18} /></button>
            </div>

            <form onSubmit={handleSaveClient} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={editingClient ? editingClient.name : newClientForm.name}
                  onChange={(e) => editingClient ? setEditingClient({ ...editingClient, name: e.target.value }) : setNewClientForm({ ...newClientForm, name: e.target.value })}
                  className="w-full p-2.5 border rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">CPF / CNPJ</label>
                  <input
                    type="text"
                    value={editingClient ? editingClient.document : newClientForm.document}
                    onChange={(e) => editingClient ? setEditingClient({ ...editingClient, document: e.target.value }) : setNewClientForm({ ...newClientForm, document: e.target.value })}
                    className="w-full p-2.5 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Telefone (WhatsApp)</label>
                  <input
                    type="text"
                    value={editingClient ? editingClient.phone : newClientForm.phone}
                    onChange={(e) => editingClient ? setEditingClient({ ...editingClient, phone: e.target.value }) : setNewClientForm({ ...newClientForm, phone: e.target.value })}
                    className="w-full p-2.5 border rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="font-bold block mb-1">E-mail</label>
                <input
                  type="email"
                  value={editingClient ? editingClient.email : newClientForm.email}
                  onChange={(e) => editingClient ? setEditingClient({ ...editingClient, email: e.target.value }) : setNewClientForm({ ...newClientForm, email: e.target.value })}
                  className="w-full p-2.5 border rounded-lg"
                />
              </div>

              <div className="pt-3 flex justify-between items-center border-t">
                {editingClient ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteClient(editingClient.id)}
                    className="px-3 py-2 rounded-lg text-rose-700 font-bold flex items-center gap-1 hover:bg-rose-50"
                  >
                    <Trash2 size={14} /> Excluir Cliente
                  </button>
                ) : <div />}

                <div className="flex gap-2">
                  <button type="button" onClick={() => { setIsNewClientOpen(false); setEditingClient(null); }} className="px-4 py-2 rounded-lg border font-bold">Cancelar</button>
                  <button type="submit" className="px-4 py-2 rounded-lg text-white font-bold" style={{ backgroundColor: PALETTE.bordoPrincipal }}>Salvar</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PRAZO */}
      {isNewDeadlineOpen && (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-2xl bg-white shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-serif font-bold text-base" style={{ color: PALETTE.bordoEscuro }}>Cadastrar Prazo</h3>
              <button onClick={() => setIsNewDeadlineOpen(false)}><X size={18} /></button>
            </div>

            <form onSubmit={handleSaveDeadline} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Título do Prazo</label>
                <input type="text" required value={newDeadlineForm.title} onChange={(e) => setNewDeadlineForm({ ...newDeadlineForm, title: e.target.value })} className="w-full p-2.5 border rounded-lg" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">Cliente</label>
                  <input type="text" value={newDeadlineForm.client} onChange={(e) => setNewDeadlineForm({ ...newDeadlineForm, client: e.target.value })} className="w-full p-2.5 border rounded-lg" />
                </div>
                <div>
                  <label className="font-bold block mb-1">Processo</label>
                  <input type="text" value={newDeadlineForm.process} onChange={(e) => setNewDeadlineForm({ ...newDeadlineForm, process: e.target.value })} className="w-full p-2.5 border rounded-lg" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">Data</label>
                  <input type="date" value={newDeadlineForm.dueDate} onChange={(e) => setNewDeadlineForm({ ...newDeadlineForm, dueDate: e.target.value })} className="w-full p-2.5 border rounded-lg" />
                </div>
                <div>
                  <label className="font-bold block mb-1">Horário</label>
                  <input type="time" value={newDeadlineForm.dueTime} onChange={(e) => setNewDeadlineForm({ ...newDeadlineForm, dueTime: e.target.value })} className="w-full p-2.5 border rounded-lg" />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button type="button" onClick={() => setIsNewDeadlineOpen(false)} className="px-4 py-2 rounded-lg border font-bold">Cancelar</button>
                <button type="submit" className="px-4 py-2 rounded-lg text-white font-bold" style={{ backgroundColor: PALETTE.bordoPrincipal }}>Salvar Prazo</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MODELO DE PEÇA (CRIAR / EDITAR) */}
      {(isNewTemplateOpen || editingTemplate) && (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-white shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-serif font-bold text-base" style={{ color: PALETTE.bordoEscuro }}>
                {editingTemplate ? 'Editar Modelo' : 'Cadastrar Modelo'}
              </h3>
              <button onClick={() => { setIsNewTemplateOpen(false); setEditingTemplate(null); }}><X size={18} /></button>
            </div>

            <form onSubmit={handleSaveTemplate} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Categoria</label>
                <select
                  value={editingTemplate ? editingTemplate.category : newTemplateForm.category}
                  onChange={(e) => editingTemplate ? setEditingTemplate({ ...editingTemplate, category: e.target.value }) : setNewTemplateForm({ ...newTemplateForm, category: e.target.value })}
                  className="w-full p-2.5 border rounded-lg bg-white"
                >
                  <option value="Cível / JEC">Cível / JEC</option>
                  <option value="Cível / Execução">Cível / Execução</option>
                  <option value="Trabalhista">Trabalhista</option>
                  <option value="Família">Família</option>
                </select>
              </div>
              <div>
                <label className="font-bold block mb-1">Título</label>
                <input
                  type="text"
                  required
                  value={editingTemplate ? editingTemplate.title : newTemplateForm.title}
                  onChange={(e) => editingTemplate ? setEditingTemplate({ ...editingTemplate, title: e.target.value }) : setNewTemplateForm({ ...newTemplateForm, title: e.target.value })}
                  className="w-full p-2.5 border rounded-lg"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Conteúdo da Minuta</label>
                <textarea
                  rows={8}
                  value={editingTemplate ? editingTemplate.content : newTemplateForm.content}
                  onChange={(e) => editingTemplate ? setEditingTemplate({ ...editingTemplate, content: e.target.value }) : setNewTemplateForm({ ...newTemplateForm, content: e.target.value })}
                  className="w-full p-2.5 border rounded-lg font-mono text-xs"
                />
              </div>

              <div className="pt-3 flex justify-between items-center border-t">
                {editingTemplate ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteTemplate(editingTemplate.id)}
                    className="px-3 py-2 rounded-lg text-rose-700 font-bold flex items-center gap-1 hover:bg-rose-50"
                  >
                    <Trash2 size={14} /> Excluir Modelo
                  </button>
                ) : <div />}

                <div className="flex gap-2">
                  <button type="button" onClick={() => { setIsNewTemplateOpen(false); setEditingTemplate(null); }} className="px-4 py-2 rounded-lg border font-bold">Cancelar</button>
                  <button type="submit" className="px-4 py-2 rounded-lg text-white font-bold" style={{ backgroundColor: PALETTE.bordoPrincipal }}>Salvar Modelo</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TAREFA BITRIX24 (CRIAR / EDITAR) */}
      {(isNewTaskOpen || editingTask) && (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-2xl bg-white shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-serif font-bold text-base" style={{ color: PALETTE.bordoEscuro }}>
                {editingTask ? 'Editar Tarefa' : 'Criar Nova Tarefa'}
              </h3>
              <button onClick={() => { setIsNewTaskOpen(false); setEditingTask(null); }}><X size={18} /></button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Título da Tarefa</label>
                <input
                  type="text"
                  required
                  value={editingTask ? editingTask.title : newTaskForm.title}
                  onChange={(e) => editingTask ? setEditingTask({ ...editingTask, title: e.target.value }) : setNewTaskForm({ ...newTaskForm, title: e.target.value })}
                  className="w-full p-2.5 border rounded-lg"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Descrição</label>
                <textarea
                  rows={3}
                  value={editingTask ? editingTask.description : newTaskForm.description}
                  onChange={(e) => editingTask ? setEditingTask({ ...editingTask, description: e.target.value }) : setNewTaskForm({ ...newTaskForm, description: e.target.value })}
                  className="w-full p-2.5 border rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">Responsável</label>
                  <select
                    value={editingTask ? editingTask.responsible : newTaskForm.responsible}
                    onChange={(e) => editingTask ? setEditingTask({ ...editingTask, responsible: e.target.value }) : setNewTaskForm({ ...newTaskForm, responsible: e.target.value })}
                    className="w-full p-2.5 border rounded-lg bg-white"
                  >
                    <option value="Dra. Valeska Monteiro">Dra. Valeska Monteiro</option>
                    <option value="Dra. Dayane">Dra. Dayane</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1">Coluna / Status</label>
                  <select
                    value={editingTask ? editingTask.status : newTaskForm.status}
                    onChange={(e) => editingTask ? setEditingTask({ ...editingTask, status: e.target.value }) : setNewTaskForm({ ...newTaskForm, status: e.target.value })}
                    className="w-full p-2.5 border rounded-lg bg-white"
                  >
                    <option value="todo">A Fazer</option>
                    <option value="in_progress">Em Andamento</option>
                    <option value="review">Revisão</option>
                    <option value="done">Concluído</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="font-bold block mb-1">Prazo de Entrega</label>
                <input
                  type="date"
                  value={editingTask ? editingTask.dueDate : newTaskForm.dueDate}
                  onChange={(e) => editingTask ? setEditingTask({ ...editingTask, dueDate: e.target.value }) : setNewTaskForm({ ...newTaskForm, dueDate: e.target.value })}
                  className="w-full p-2.5 border rounded-lg"
                />
              </div>

              <div className="pt-3 flex justify-between items-center border-t">
                {editingTask ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteTask(editingTask.id)}
                    className="px-3 py-2 rounded-lg text-rose-700 font-bold flex items-center gap-1 hover:bg-rose-50"
                  >
                    <Trash2 size={14} /> Excluir Tarefa
                  </button>
                ) : <div />}

                <div className="flex gap-2">
                  <button type="button" onClick={() => { setIsNewTaskOpen(false); setEditingTask(null); }} className="px-4 py-2 rounded-lg border font-bold">Cancelar</button>
                  <button type="submit" className="px-4 py-2 rounded-lg text-white font-bold" style={{ backgroundColor: PALETTE.bordoPrincipal }}>Salvar Tarefa</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
