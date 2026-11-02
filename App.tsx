import React, { useState, useEffect, useRef } from 'react';
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
  Sun,
  Moon,
  UserPlus,
  Wallet,
  FolderOpen,
  BarChart3,
  Settings,
  CalendarDays,
  ClipboardList,
  Download,
  Upload,
  FileUp,
  CheckCircle2,
  Clock3,
  Target,
  User,
  Paperclip,
  CheckSquare,
  MessageSquare,
  Clock
} from 'lucide-react';

const MENU_PALETTE = {
  fundo: '#5A1A2C',
  destaque: '#F5EEE9',
  monograma: '#7E1B33',
  ativo: '#7E0A25',
  texto: '#FFFFFF',
  subtitulo: '#B598A0',
  linha: '#6B3141'
};

const LIGHT_PALETTE = {
  bordoPrincipal: '#7E0A25',
  bordoEscuro: '#111827',
  dourado: '#7E1B33',
  douradoClaro: '#7E0A25',
  fundoPagina: '#F3F4F6',
  fundoCartoes: '#FFFFFF',
  linhasBordas: '#E5E7EB',
  caixaTotal: '#F9F1F3',
  textoPrincipal: '#111827',
  textoApoio: '#6B7280',
  valoresReceber: '#059669',
  descontos: '#D97706'
};

const DARK_PALETTE = {
  bordoPrincipal: '#7E0A25',
  bordoEscuro: '#F9FAFB',
  dourado: '#F5EEE9',
  douradoClaro: '#F5EEE9',
  fundoPagina: '#121820',
  fundoCartoes: '#1E293B',
  linhasBordas: '#334155',
  caixaTotal: '#2B2229',
  textoPrincipal: '#F9FAFB',
  textoApoio: '#9CA3AF',
  valoresReceber: '#34D399',
  descontos: '#F59E0B'
};

function readLocalValue(key: string, fallback: any) {
  try {
    if (typeof window === 'undefined') return fallback;
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

const OFFICE_DB_NAME = 'valeska-monteiro-office-db';
const OFFICE_DB_STORE = 'app-state';
const OFFICE_DB_KEY = 'office-data-v1';

function openOfficeDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      reject(new Error('IndexedDB não está disponível neste navegador.'));
      return;
    }
    const request = window.indexedDB.open(OFFICE_DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(OFFICE_DB_STORE)) db.createObjectStore(OFFICE_DB_STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Não foi possível abrir o armazenamento local.'));
  });
}

async function loadSavedOfficeData(): Promise<any | null> {
  try {
    const db = await openOfficeDb();
    const result = await new Promise<any>((resolve, reject) => {
      const transaction = db.transaction(OFFICE_DB_STORE, 'readonly');
      const request = transaction.objectStore(OFFICE_DB_STORE).get(OFFICE_DB_KEY);
      request.onsuccess = () => resolve(request.result ?? null);
      request.onerror = () => reject(request.error || new Error('Não foi possível ler os dados locais.'));
      transaction.oncomplete = () => db.close();
      transaction.onerror = () => reject(transaction.error || new Error('Falha ao ler os dados locais.'));
    });
    if (result) return result;
  } catch (error) {
    console.warn('IndexedDB indisponível; tentando recuperar o backup local:', error);
  }
  return readLocalValue('vm-office-data-v1', null);
}

async function saveOfficeDataLocally(payload: any): Promise<'indexedDB' | 'localStorage'> {
  let indexedDbSaved = false;
  try {
    const db = await openOfficeDb();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(OFFICE_DB_STORE, 'readwrite');
      transaction.objectStore(OFFICE_DB_STORE).put(payload, OFFICE_DB_KEY);
      transaction.oncomplete = () => { db.close(); resolve(); };
      transaction.onerror = () => reject(transaction.error || new Error('Não foi possível gravar os dados locais.'));
      transaction.onabort = () => reject(transaction.error || new Error('Gravação local cancelada.'));
    });
    indexedDbSaved = true;
  } catch (error) {
    console.warn('IndexedDB não conseguiu salvar; tentando localStorage:', error);
  }

  try {
    window.localStorage.setItem('vm-office-data-v1', JSON.stringify(payload));
    return indexedDbSaved ? 'indexedDB' : 'localStorage';
  } catch (error) {
    if (indexedDbSaved) return 'indexedDB';
    throw error;
  }
}

async function saveRecoverySnapshotIfMissing(payload: any, key: string): Promise<void> {
  try {
    const db = await openOfficeDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(OFFICE_DB_STORE, 'readwrite');
      const store = tx.objectStore(OFFICE_DB_STORE);
      const getRequest = store.get(key);
      getRequest.onsuccess = () => {
        if (getRequest.result === undefined) store.put(payload, key);
      };
      getRequest.onerror = () => reject(getRequest.error || new Error('Não foi possível verificar a cópia de recuperação.'));
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = () => reject(tx.error || new Error('Não foi possível guardar a cópia de recuperação.'));
      tx.onabort = () => reject(tx.error || new Error('Cópia de recuperação cancelada.'));
    });
  } catch (error) {
    const existing = window.localStorage.getItem(key);
    if (!existing) window.localStorage.setItem(key, JSON.stringify(payload));
  }
}

function estimateBusinessDaysUntil(dateValue: string) {
  if (!dateValue) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(due.getTime())) return null;
  if (due < today) return -1;
  let count = 0;
  const cursor = new Date(today);
  while (cursor < due) {
    cursor.setDate(cursor.getDate() + 1);
    const weekday = cursor.getDay();
    if (weekday !== 0 && weekday !== 6) count += 1;
  }
  return count;
}

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return typeof window !== 'undefined' && window.localStorage.getItem('vm-sidebar-collapsed') === 'true';
    } catch {
      return false;
    }
  });
  const PALETTE = isDarkMode ? DARK_PALETTE : LIGHT_PALETTE;

  useEffect(() => {
    try {
      window.localStorage.setItem('vm-sidebar-collapsed', isSidebarCollapsed ? 'true' : 'false');
    } catch {}
  }, [isSidebarCollapsed]);

  const toggleSidebar = () => setIsSidebarCollapsed((current) => !current);

  useEffect(() => {
    try {
      setIsDarkMode(window.localStorage.getItem('vm-theme') === 'dark');
    } catch (error) {}
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((current) => {
      const next = !current;
      try {
        window.localStorage.setItem('vm-theme', next ? 'dark' : 'light');
      } catch (error) {}
      return next;
    });
  };

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

  // --- ESTADOS DA APLICAÇÃO ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardSearch, setDashboardSearch] = useState('');
  const [agendaSubTab, setAgendaSubTab] = useState('prazos');
  const [workspaceSubTab, setWorkspaceSubTab] = useState('modelos');

  const [leads, setLeads] = useState<any[]>(() => readLocalValue('vm-leads', []));
  const [leadDraft, setLeadDraft] = useState({ name: '', phone: '', email: '', area: 'Família', source: 'Indicação', stage: 'Novo contato', estimatedValue: '', nextAction: '', notes: '' });
  const [financialEntries, setFinancialEntries] = useState<any[]>(() => readLocalValue('vm-financial-entries', []));
  const [financialDraft, setFinancialDraft] = useState({ title: '', kind: 'Receita', category: 'Honorários', client: '', amount: '', dueDate: '', status: 'Pendente' });
  const [documents, setDocuments] = useState<any[]>(() => readLocalValue('vm-documents', []));
  const [documentDraft, setDocumentDraft] = useState({ title: '', client: '', process: '', category: 'Contrato de honorários', fileName: '', dataUrl: '', size: 0 });
  const [officeSettings, setOfficeSettings] = useState<any>(() => readLocalValue('vm-office-settings', { officeName: 'Valeska Monteiro Advocacia', oab: 'OAB/ES 41.715', email: 'contato@valeskamonteiro.adv.br', phone: '(27) 99752-5314', address: 'Serra / ES', lgpdConsent: false, lgpdAcceptedAt: '' }));
  const [moduleNotice, setModuleNotice] = useState('');

  const [currentDate, setCurrentDate] = useState(new Date(2026, 9, 1));
  const [calendarView, setCalendarView] = useState('grid');

  const [isNewProcessOpen, setIsNewProcessOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importList, setImportList] = useState<any[]>([]);
  const [importError, setImportError] = useState('');
  const [isNewClientOpen, setIsNewClientOpen] = useState(false);
  const [isNewDeadlineOpen, setIsNewDeadlineOpen] = useState(false);
  const [isNewTemplateOpen, setIsNewTemplateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [selectedVerbasProcId, setSelectedVerbasProcId] = useState('1');

  const [hoveredDeadline, setHoveredDeadline] = useState<any>(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  const [selectedDeadlineModal, setSelectedDeadlineModal] = useState<any>(null);
  const [processedScanKeys, setProcessedScanKeys] = useState<string[]>([]);
  const [processMovements, setProcessMovements] = useState<any[]>([]);
  const [clientMessageDrafts, setClientMessageDrafts] = useState<any[]>([]);

  // --- MÓDULO DE TAREFAS ESTILO BITRIX24 ---
  const [taskDraft, setTaskDraft] = useState('');
  const [taskFilter, setTaskFilter] = useState('Todas');
  const [taskSearch, setTaskSearch] = useState('');
  const [selectedTaskModal, setSelectedTaskModal] = useState<any>(null);
  const [newCheckitemText, setNewCheckitemText] = useState('');
  const [newCommentText, setNewCommentText] = useState('');

  const [tasks, setTasks] = useState<any[]>([
    {
      id: 't1',
      title: 'Revisar publicação e definir providências',
      description: 'Conferir prazo e estratégia processual para réplica.',
      status: 'A fazer',
      priority: 'Alta',
      dueDate: '2026-10-30',
      createdBy: 'Dra. Valeska',
      assignee: 'Dra. Valeska',
      process: '5046388-53.2025.8.08.0048',
      estimatedTime: '2h',
      checklist: [
        { id: 'c1', text: 'Ler publicação no Diário', completed: true },
        { id: 'c2', text: 'Contatar cliente para validar fatos', completed: false }
      ],
      attachments: [],
      comments: [
        { id: 'cm1', author: 'Dra. Valeska', date: '2026-10-28 14:30', text: 'Aguardando documento complementar do cliente.' }
      ]
    },
    {
      id: 't2',
      title: 'Preparar documentos para audiência',
      description: 'Validar comprovantes e relatórios com o cliente.',
      status: 'Em andamento',
      priority: 'Média',
      dueDate: '2026-11-03',
      createdBy: 'Dra. Valeska',
      assignee: 'Dra. Valeska',
      process: '0001083-23.2026.5.17.0008',
      estimatedTime: '4h',
      checklist: [],
      attachments: [],
      comments: []
    },
    {
      id: 't3',
      title: 'Conferir cálculo de verbas',
      description: 'Revisar valores e descontos na planilha trabalhista.',
      status: 'Em revisão',
      priority: 'Alta',
      dueDate: '2026-11-05',
      createdBy: 'Dra. Valeska',
      assignee: 'Secretaria / Apoio',
      process: '0001478-18.2026.5.17.0007',
      estimatedTime: '1h 30m',
      checklist: [],
      attachments: [],
      comments: []
    }
  ]);

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

  const [calcSubTab, setCalcSubTab] = useState('trabalhista');

  const [processes, setProcesses] = useState<any[]>([
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

  const [clients, setClients] = useState<any[]>([
    { id: '1', name: 'Mosaniel Martins da Cruz', type: 'Pessoa Física', document: '123.456.789-00', phone: '27998812233', email: 'mosaniel.cruz@email.com', status: 'Ativo' },
    { id: '2', name: 'Isabela Ferreira Santos', type: 'Pessoa Física', document: '987.654.321-11', phone: '27997724455', email: 'isabela.ferreira@email.com', status: 'Ativo' },
    { id: '3', name: 'Jucimara Carvalho Barreto', type: 'Pessoa Física', document: '456.789.123-22', phone: '31991128899', email: 'jucimara.barreto@email.com', status: 'Ativo' },
    { id: '4', name: 'Estevão dos Santos Pereira', type: 'Pessoa Física', document: '321.654.987-33', phone: '27995541122', email: 'estevao.pereira@email.com', status: 'Ativo' }
  ]);

  const [deadlines, setDeadlines] = useState<any[]>([
    { id: '1', title: 'Manifestação sobre Sentença / Embargos', client: 'Mosaniel Martins da Cruz', process: '5046388-53.2025.8.08.0048', court: 'TJES - 4º JEC Serra', dueDate: '2026-10-28', dueTime: '23:59', type: 'FATAL', status: 'Em Andamento', completed: false },
    { id: '2', title: 'Audiência UNA Presencial TRT17', client: 'Estevão dos Santos Pereira', process: '0001478-18.2026.5.17.0007', court: 'TRT17 - 7ª Vara', dueDate: '2026-10-30', dueTime: '14:00', type: 'NORMAL', status: 'Em Andamento', completed: false },
    { id: '3', title: 'Pedido de Cumprimento de Sentença', client: 'Jucimara Carvalho Barreto', process: '1000797-34.2026.8.13.0543', court: 'TJMG Eproc', dueDate: '2026-11-03', dueTime: '18:00', type: 'FATAL', status: 'Pendente', completed: false }
  ]);

  const [scannedPush, setScannedPush] = useState<any[]>([
    { id: 'p1', date: '2026-10-28', court: 'TJES - Diário Eletrônico', title: 'Intimação para Réplica', process: '5046388-53.2025.8.08.0048', snippet: 'Fica intimada a Dra. Valeska Monteiro para apresentar Réplica no prazo de 15 dias uteis...' },
    { id: 'p2', date: '2026-10-27', court: 'TRT17 - PJe Push', title: 'Designação de Audiência de Conciliação', process: '0001083-23.2026.5.17.0008', snippet: 'Audiência conciliatória designada para o dia 12/11/2026 às 14:00h...' }
  ]);

  const [templates, setTemplates] = useState<any[]>([
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

  // --- PERSISTÊNCIA COMPARTILHADA ---
  const [dataHydrated, setDataHydrated] = useState(false);
  const [sharedOfficeId, setSharedOfficeId] = useState<string | null>(null);
  const [persistenceStatus, setPersistenceStatus] = useState('Carregando dados...');
  const [lastSavedAt, setLastSavedAt] = useState('');
  const localSnapshotRef = useRef<any | null>(null);
  const cloudVersionRef = useRef<string | null>(null);
  const skipNextCloudSaveRef = useRef(false);
  const pendingCloudChangesRef = useRef(false);

  const applyPersistedOfficeData = (saved: any) => {
    if (!saved || typeof saved !== 'object') return;
    if (Array.isArray(saved.processes)) setProcesses(saved.processes);
    if (Array.isArray(saved.clients)) setClients(saved.clients);
    if (Array.isArray(saved.deadlines)) setDeadlines(saved.deadlines);
    if (Array.isArray(saved.scannedPush)) setScannedPush(saved.scannedPush);
    if (Array.isArray(saved.processedScanKeys)) setProcessedScanKeys(saved.processedScanKeys);
    if (Array.isArray(saved.processMovements)) setProcessMovements(saved.processMovements);
    if (Array.isArray(saved.clientMessageDrafts)) setClientMessageDrafts(saved.clientMessageDrafts);
    if (Array.isArray(saved.templates)) {
      setTemplates(saved.templates);
      setSelectedTemplate(saved.templates[0] || null);
    }
    if (Array.isArray(saved.tasks)) setTasks(saved.tasks);
    if (Array.isArray(saved.leads)) setLeads(saved.leads);
    if (Array.isArray(saved.financialEntries)) setFinancialEntries(saved.financialEntries);
    if (Array.isArray(saved.documents)) setDocuments(saved.documents);
    if (saved.officeSettings && typeof saved.officeSettings === 'object') setOfficeSettings(saved.officeSettings);
    if (saved.savedAt) setLastSavedAt(saved.savedAt);
  };

  useEffect(() => {
    let active = true;
    const hydrateLocal = async () => {
      try {
        const saved = await loadSavedOfficeData();
        if (!active) return;
        if (saved) {
          localSnapshotRef.current = saved;
          applyPersistedOfficeData(saved);
        }
        setPersistenceStatus('Dados locais carregados; conectando ao escritório...');
      } catch (error) {
        console.error('Não foi possível carregar os dados locais:', error);
        if (active) setPersistenceStatus('Falha ao carregar dados locais');
      } finally {
        if (active) setDataHydrated(true);
      }
    };
    void hydrateLocal();
    return () => { active = false; };
  }, []);

  const buildOfficePayload = () => ({
    version: 1,
    savedAt: new Date().toISOString(),
    processes,
    clients,
    deadlines,
    scannedPush,
    processedScanKeys,
    processMovements,
    clientMessageDrafts,
    templates,
    tasks,
    leads,
    financialEntries,
    documents,
    officeSettings
  });

  useEffect(() => {
    if (!dataHydrated) return;
    let active = true;
    const timer = window.setTimeout(async () => {
      const payload = buildOfficePayload();
      try {
        await saveOfficeDataLocally(payload);
        if (!active) return;
        if (!session?.user?.id || !sharedOfficeId) {
          setPersistenceStatus('Salvo neste dispositivo · aguardando conexão do escritório');
        }
      } catch (error) {
        console.error('Falha no salvamento local:', error);
        if (active) setPersistenceStatus('Erro ao salvar localmente — não feche o aplicativo');
      }
    }, 150);
    return () => { active = false; window.clearTimeout(timer); };
  }, [dataHydrated, processes, clients, deadlines, scannedPush, processedScanKeys, processMovements, clientMessageDrafts, templates, tasks, leads, financialEntries, documents, officeSettings, session?.user?.id, sharedOfficeId]);

  useEffect(() => {
    const userId = session?.user?.id;
    if (!dataHydrated || !userId) return;
    let active = true;
    const hydrateSharedOffice = async () => {
      setPersistenceStatus('Verificando acesso ao escritório...');
      try {
        const { data: membership, error: membershipError } = await supabase
          .from('office_workspace_members')
          .select('office_id, role')
          .eq('user_id', userId)
          .maybeSingle();
        if (membershipError) throw membershipError;
        if (!membership?.office_id) {
          if (active) setPersistenceStatus('Esta conta ainda não está vinculada ao escritório');
          return;
        }

        const { data: sharedState, error: sharedError } = await supabase
          .from('office_workspace_state')
          .select('payload, saved_at')
          .eq('office_id', membership.office_id)
          .maybeSingle();
        if (sharedError) throw sharedError;
        if (!sharedState?.payload) {
          throw new Error('O espaço compartilhado foi encontrado, mas ainda não contém dados.');
        }
        if (!active) return;

        if (localSnapshotRef.current) {
          await saveRecoverySnapshotIfMissing(localSnapshotRef.current, `vm-pre-shared-backup-${userId}`);
        }

        const parsed = typeof sharedState.payload === 'string' ? JSON.parse(sharedState.payload) : sharedState.payload;
        cloudVersionRef.current = sharedState.saved_at;
        skipNextCloudSaveRef.current = true;
        applyPersistedOfficeData(parsed);
        setSharedOfficeId(membership.office_id);
        if (sharedState.saved_at) setLastSavedAt(sharedState.saved_at);
        setPersistenceStatus('Escritório compartilhado conectado');
      } catch (error) {
        console.error('Não foi possível conectar ao escritório compartilhado:', error);
        if (active) setPersistenceStatus('Falha na conexão compartilhada — dados locais preservados');
      }
    };
    void hydrateSharedOffice();
    return () => { active = false; };
  }, [dataHydrated, session?.user?.id]);

  useEffect(() => {
    if (!dataHydrated || !session?.user?.id || !sharedOfficeId) return;
    if (skipNextCloudSaveRef.current) {
      skipNextCloudSaveRef.current = false;
      return;
    }
    let active = true;
    pendingCloudChangesRef.current = true;
    const timer = window.setTimeout(async () => {
      const payload = buildOfficePayload();
      const expectedVersion = cloudVersionRef.current;
      try {
        if (!expectedVersion) throw new Error('Versão da nuvem não identificada.');
        const { data: updated, error } = await supabase
          .from('office_workspace_state')
          .update({ payload, saved_at: payload.savedAt })
          .eq('office_id', sharedOfficeId)
          .eq('saved_at', expectedVersion)
          .select('saved_at')
          .maybeSingle();
        if (error) throw error;
        if (!updated?.saved_at) {
          const { data: latest, error: latestError } = await supabase
            .from('office_workspace_state')
            .select('payload, saved_at')
            .eq('office_id', sharedOfficeId)
            .maybeSingle();
          if (latestError) throw latestError;
          if (latest?.payload) {
            await saveRecoverySnapshotIfMissing(payload, `vm-conflict-backup-${session.user.id}-${payload.savedAt.replace(/[^0-9]/g, '')}`);
            cloudVersionRef.current = latest.saved_at;
            skipNextCloudSaveRef.current = true;
            applyPersistedOfficeData(typeof latest.payload === 'string' ? JSON.parse(latest.payload) : latest.payload);
            setLastSavedAt(latest.saved_at);
            setPersistenceStatus('Outra administradora salvou primeiro. Sua alteração foi preservada.');
          }
          return;
        }
        if (!active) return;
        cloudVersionRef.current = updated.saved_at;
        setLastSavedAt(updated.saved_at);
        setPersistenceStatus('Salvo na nuvem');
      } catch (error) {
        console.error('Falha ao salvar no escritório compartilhado:', error);
        if (active) setPersistenceStatus('Falha ao salvar na nuvem — alterações locais preservadas');
      } finally {
        pendingCloudChangesRef.current = false;
      }
    }, 700);
    return () => { active = false; window.clearTimeout(timer); };
  }, [dataHydrated, session?.user?.id, sharedOfficeId, processes, clients, deadlines, scannedPush, processedScanKeys, processMovements, clientMessageDrafts, templates, tasks, leads, financialEntries, documents, officeSettings]);

  // --- MÉTODOS DE MANIPULAÇÃO DE TAREFAS ---
  const addTask = (e?: any) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    const title = String(taskDraft || '').trim();
    if (!title) {
      window.alert('Digite o nome da tarefa antes de criar.');
      return;
    }
    const newTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title,
      description: '',
      status: 'A fazer',
      priority: 'Média',
      dueDate: '',
      createdBy: 'Dra. Valeska',
      assignee: 'Dra. Valeska',
      process: '',
      estimatedTime: '',
      checklist: [],
      attachments: [],
      comments: []
    };
    setTasks(prev => [newTask, ...prev]);
    setTaskDraft('');
  };

  const moveTask = (taskId: string, status: string) => {
    setTasks(prev => prev.map(task => task.id === taskId ? { ...task, status } : task));
    if (selectedTaskModal && selectedTaskModal.id === taskId) {
      setSelectedTaskModal((prev: any) => ({ ...prev, status }));
    }
  };

  const saveSelectedTaskModal = () => {
    if (!selectedTaskModal) return;
    setTasks(prev => prev.map(t => t.id === selectedTaskModal.id ? selectedTaskModal : t));
    setSelectedTaskModal(null);
  };

  const addCheckitemToTaskModal = () => {
    if (!newCheckitemText.trim() || !selectedTaskModal) return;
    const item = { id: `item-${Date.now()}`, text: newCheckitemText.trim(), completed: false };
    const updatedChecklist = [...(selectedTaskModal.checklist || []), item];
    const updated = { ...selectedTaskModal, checklist: updatedChecklist };
    setSelectedTaskModal(updated);
    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
    setNewCheckitemText('');
  };

  const toggleCheckitemTaskModal = (itemId: string) => {
    if (!selectedTaskModal) return;
    const updatedChecklist = (selectedTaskModal.checklist || []).map((c: any) =>
      c.id === itemId ? { ...c, completed: !c.completed } : c
    );
    const updated = { ...selectedTaskModal, checklist: updatedChecklist };
    setSelectedTaskModal(updated);
    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
  };

  const removeCheckitemTaskModal = (itemId: string) => {
    if (!selectedTaskModal) return;
    const updatedChecklist = (selectedTaskModal.checklist || []).filter((c: any) => c.id !== itemId);
    const updated = { ...selectedTaskModal, checklist: updatedChecklist };
    setSelectedTaskModal(updated);
    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
  };

  const addCommentToTaskModal = () => {
    if (!newCommentText.trim() || !selectedTaskModal) return;
    const now = new Date();
    const comment = {
      id: `cm-${Date.now()}`,
      author: 'Dra. Valeska',
      date: `${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
      text: newCommentText.trim()
    };
    const updatedComments = [...(selectedTaskModal.comments || []), comment];
    const updated = { ...selectedTaskModal, comments: updatedComments };
    setSelectedTaskModal(updated);
    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
    setNewCommentText('');
  };

  const handleTaskAttachmentFile = (file: File | undefined) => {
    if (!file || !selectedTaskModal) return;
    if (file.size > 1024 * 1024) {
      window.alert('Para manter o armazenamento estável, escolha um arquivo de até 1 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const attachment = {
        id: `att-${Date.now()}`,
        fileName: file.name,
        size: file.size,
        dataUrl: String(reader.result || '')
      };
      const updatedAttachments = [...(selectedTaskModal.attachments || []), attachment];
      const updated = { ...selectedTaskModal, attachments: updatedAttachments };
      setSelectedTaskModal(updated);
      setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
    };
    reader.readAsDataURL(file);
  };

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
    setProcesses(prev => [item, ...prev]);
    setNewProcess({ number: '', client: '', action: '', court: '', value: '', honorarios: '', descontos: '', status: 'Em andamento' });
    setIsNewProcessOpen(false);
  };

  const handleAddClient = (e: any) => {
    e.preventDefault();
    if (!newClient.name) return;
    const item = { id: Date.now().toString(), ...newClient };
    setClients(prev => [item, ...prev]);
    setNewClient({ name: '', type: 'Pessoa Física', document: '', phone: '', email: '', status: 'Ativo' });
    setIsNewClientOpen(false);
  };

  const handleAddDeadline = (e: any) => {
    e.preventDefault();
    if (!newDeadline.title) return;
    const item = { id: Date.now().toString(), ...newDeadline, completed: false, status: 'Em Andamento' };
    setDeadlines(prev => [item, ...prev]);
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

  const handleMouseLeaveItem = () => {
    setHoveredDeadline(null);
  };

  const handleAddTemplate = (e: any) => {
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

  const handleAddLead = (e: any) => {
    e.preventDefault();
    if (!leadDraft.name.trim()) { window.alert('Informe o nome do potencial cliente.'); return; }
    const item = { ...leadDraft, id: `lead-${Date.now()}`, estimatedValue: Number(leadDraft.estimatedValue || 0), createdAt: new Date().toISOString() };
    setLeads(prev => [item, ...prev]);
    setLeadDraft({ name: '', phone: '', email: '', area: 'Família', source: 'Indicação', stage: 'Novo contato', estimatedValue: '', nextAction: '', notes: '' });
    setModuleNotice('Lead cadastrado no funil.');
  };

  const handleAddFinancialEntry = (e: any) => {
    e.preventDefault();
    if (!financialDraft.title.trim() || Number(financialDraft.amount) <= 0) { window.alert('Informe a descrição e um valor maior que zero.'); return; }
    const item = { ...financialDraft, id: `fin-${Date.now()}`, amount: Number(financialDraft.amount || 0), createdAt: new Date().toISOString() };
    setFinancialEntries(prev => [item, ...prev]);
    setFinancialDraft({ title: '', kind: 'Receita', category: 'Honorários', client: '', amount: '', dueDate: '', status: 'Pendente' });
    setModuleNotice('Lançamento financeiro cadastrado.');
  };

  const handleDocumentFile = (file: File | undefined) => {
    if (!file) return;
    if (file.size > 1024 * 1024) { window.alert('Selecione um arquivo de até 1 MB.'); return; }
    const reader = new FileReader();
    reader.onload = () => setDocumentDraft(prev => ({ ...prev, fileName: file.name, dataUrl: String(reader.result || ''), size: file.size }));
    reader.readAsDataURL(file);
  };

  const handleAddDocument = (e: any) => {
    e.preventDefault();
    if (!documentDraft.title.trim() || !documentDraft.fileName || !documentDraft.dataUrl) { window.alert('Informe o título e selecione o arquivo.'); return; }
    const item = { ...documentDraft, id: `doc-${Date.now()}`, createdAt: new Date().toISOString() };
    setDocuments(prev => [item, ...prev]);
    setDocumentDraft({ title: '', client: '', process: '', category: 'Contrato de honorários', fileName: '', dataUrl: '', size: 0 });
    setModuleNotice('Documento salvo.');
  };

  const downloadBackup = () => {
    const backup = { version: 1, exportedAt: new Date().toISOString(), processes, clients, deadlines, scannedPush, templates, tasks, leads, financialEntries, documents, officeSettings };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `backup-advocacia-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  };

  const handleImportBackup = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (Array.isArray(data.processes)) setProcesses(data.processes);
      if (Array.isArray(data.clients)) setClients(data.clients);
      if (Array.isArray(data.deadlines)) setDeadlines(data.deadlines);
      if (Array.isArray(data.templates)) setTemplates(data.templates);
      if (Array.isArray(data.tasks)) setTasks(data.tasks);
      if (Array.isArray(data.leads)) setLeads(data.leads);
      if (Array.isArray(data.financialEntries)) setFinancialEntries(data.financialEntries);
      if (Array.isArray(data.documents)) setDocuments(data.documents);
      if (data.officeSettings) setOfficeSettings(data.officeSettings);
    } catch { window.alert('Não foi possível importar o backup.'); }
    e.target.value = '';
  };

  const onlyDigits = (v: any) => String(v || '').replace(/\D/g, '');

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

  const dashboardToday = new Date();
  dashboardToday.setHours(0, 0, 0, 0);
  const dashboardInSevenDays = new Date(dashboardToday);
  dashboardInSevenDays.setDate(dashboardInSevenDays.getDate() + 7);
  const dashboardSearchTerm = dashboardSearch.trim().toLocaleLowerCase('pt-BR');
  const dashboardActiveDeadlines = deadlines.filter((item) => !item.completed && item.status !== 'Finalizado' && item.dueDate);
  const dashboardNextWeekCount = dashboardActiveDeadlines.filter((item) => {
    const date = new Date(`${item.dueDate}T00:00:00`);
    return date >= dashboardToday && date <= dashboardInSevenDays;
  }).length;
  const dashboardAudiencesThisMonth = deadlines.filter((item) => {
    if (!String(item.title || '').toLocaleLowerCase('pt-BR').includes('audiência') || !item.dueDate) return false;
    const date = new Date(`${item.dueDate}T00:00:00`);
    return date.getMonth() === dashboardToday.getMonth() && date.getFullYear() === dashboardToday.getFullYear();
  }).length;
  const dashboardVisibleDeadlines = [...deadlines]
    .filter((item) => {
      if (!dashboardSearchTerm) return true;
      return [item.title, item.client, item.process, item.court].some((value) => String(value || '').toLocaleLowerCase('pt-BR').includes(dashboardSearchTerm));
    })
    .sort((a, b) => new Date(`${a.dueDate || '2999-12-31'}T00:00:00`).getTime() - new Date(`${b.dueDate || '2999-12-31'}T00:00:00`).getTime())
    .slice(0, 5);
  const dashboardUpcomingAgenda = [...dashboardActiveDeadlines]
    .filter((item) => new Date(`${item.dueDate}T00:00:00`) >= dashboardToday || item.type === 'FATAL')
    .sort((a, b) => new Date(`${a.dueDate}T00:00:00`).getTime() - new Date(`${b.dueDate}T00:00:00`).getTime())
    .slice(0, 3);
  const dashboardChartProcesses = [...processes]
    .sort((a, b) => Number(b.honorarios || 0) - Number(a.honorarios || 0))
    .slice(0, 6);
  const dashboardChartMax = Math.max(1, ...dashboardChartProcesses.map((item) => Number(item.value || item.honorarios || 0)));
  const dashboardAreaData = [
    { label: 'Trabalhista', count: processes.filter((item) => /trabalh|reclama|horas extras/i.test(`${item.action || ''} ${item.court || ''}`)).length },
    { label: 'Cível / Família', count: processes.filter((item) => /c[ií]vel|fam[ií]lia|alimentos|guarda|indeniza|monit[oó]ria|jec/i.test(`${item.action || ''} ${item.court || ''}`)).length },
    { label: 'Outras áreas', count: processes.filter((item) => !/trabalh|reclama|horas extras|c[ií]vel|fam[ií]lia|alimentos|guarda|indeniza|monit[oó]ria|jec/i.test(`${item.action || ''} ${item.court || ''}`)).length }
  ].filter((item) => item.count > 0 || processes.length === 0);
  const dashboardAreaMax = Math.max(1, ...dashboardAreaData.map((item) => item.count));
  const dashboardRecentNotifications = [...scannedPush].slice(0, 3);
  const dashboardDateLabel = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 font-sans" style={{ backgroundColor: PALETTE.fundoPagina, color: PALETTE.textoPrincipal }}>
        <div className="w-full max-w-md p-8 rounded-2xl shadow-xl border space-y-6" style={{ backgroundColor: PALETTE.fundoCartoes, borderColor: PALETTE.linhasBordas }}>
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-2 shadow-inner mb-1" style={{ borderColor: MENU_PALETTE.destaque, backgroundColor: MENU_PALETTE.monograma }}>
              {isResetMode ? <KeyRound size={28} style={{ color: '#FFFFFF' }} /> : <Lock size={28} style={{ color: '#FFFFFF' }} />}
            </div>
            <h1 className="font-serif font-bold text-2xl tracking-wide uppercase" style={{ color: PALETTE.bordoPrincipal }}>
              DRA. VALESKA MONTEIRO
            </h1>
            <p className="text-xs tracking-wider" style={{ color: PALETTE.textoApoio }}>
              {isResetMode ? 'Recuperação de Senha de Acesso' : 'Advocacia & Consultoria Jurídica • Acesso Restrito'}
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDarkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
              className="px-3 py-2 rounded-lg border text-xs font-semibold flex items-center gap-2 hover:brightness-95 transition"
              style={{ backgroundColor: PALETTE.fundoCartoes, borderColor: PALETTE.linhasBordas, color: PALETTE.textoPrincipal }}
            >
              {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
              {isDarkMode ? 'Modo claro' : 'Modo escuro'}
            </button>
          </div>

          <form onSubmit={isResetMode ? handleResetPassword : handleLogin} className="space-y-4">
            {authError && (
              <div className="p-3 text-xs rounded-lg bg-amber-950/80 border border-amber-500 text-amber-200 text-center font-medium">
                {authError}
              </div>
            )}

            {authSuccess && (
              <div className="p-3 text-xs rounded-lg bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-center font-medium">
                {authSuccess}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: PALETTE.textoPrincipal }}>
                E-mail Profissional
              </label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full p-3 rounded-xl border focus:outline-none focus:ring-2 transition placeholder:opacity-60"
                style={{ backgroundColor: PALETTE.fundoCartoes, color: PALETTE.textoPrincipal, borderColor: PALETTE.linhasBordas, outlineColor: PALETTE.bordoPrincipal }}
                required 
              />
            </div>

            {!isResetMode && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold uppercase tracking-wider" style={{ color: PALETTE.textoPrincipal }}>
                    Senha de Acesso
                  </label>
                  <button 
                    type="button" 
                    onClick={() => { setIsResetMode(true); setAuthError(''); setAuthSuccess(''); }}
                    className="text-[11px] underline hover:text-white transition"
                    style={{ color: PALETTE.bordoPrincipal }}
                  >
                    Esqueci minha senha
                  </button>
                </div>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-3 rounded-xl border focus:outline-none focus:ring-2 transition placeholder:opacity-60"
                  style={{ backgroundColor: PALETTE.fundoCartoes, color: PALETTE.textoPrincipal, borderColor: PALETTE.linhasBordas, outlineColor: PALETTE.bordoPrincipal }}
                  required 
                />
              </div>
            )}

            <button 
              type="submit" 
              disabled={loadingAuth}
              className="w-full py-3.5 rounded-xl font-bold text-sm shadow-md transition hover:brightness-110 active:scale-[0.99] mt-2 flex justify-center items-center gap-2"
              style={{ backgroundColor: PALETTE.bordoPrincipal, color: '#FFFFFF' }}
            >
              {loadingAuth ? 'A processar...' : isResetMode ? 'Enviar link de redefinição' : 'Entrar no Sistema'}
            </button>

            {isResetMode && (
              <button 
                type="button" 
                onClick={() => { setIsResetMode(false); setAuthError(''); setAuthSuccess(''); }}
                className="w-full text-center text-xs underline pt-2 block transition hover:opacity-80"
                style={{ color: PALETTE.bordoPrincipal }}
              >
                Voltar para o login
              </button>
            )}
          </form>

          <p className="text-[10px] text-center pt-2 border-t" style={{ borderColor: PALETTE.linhasBordas, color: PALETTE.textoApoio }}>
            Serra / ES • Conexão Criptografada via Supabase
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`app-shell min-h-screen flex flex-col md:flex-row font-sans ${isDarkMode ? 'app-dark' : ''}`} style={{ backgroundColor: PALETTE.fundoPagina, color: PALETTE.textoPrincipal }}>
      <style>{`
        .app-dark .bg-white { background-color: #1E293B !important; }
        .app-dark input, .app-dark textarea, .app-dark select { background-color: #1E293B !important; color: #F9FAFB !important; border-color: #334155 !important; }
        .app-shell:not(.app-dark) .text-amber-900, .app-shell:not(.app-dark) .text-amber-800, .app-shell:not(.app-dark) .text-amber-700, .app-shell:not(.app-dark) .text-red-800, .app-shell:not(.app-dark) .text-red-700 { color: #8B5E1A !important; }
        .app-dark .text-black, .app-dark .text-slate-900, .app-dark .text-slate-800, .app-dark .text-slate-700, .app-dark .text-gray-900, .app-dark .text-gray-800 { color: #F9FAFB !important; }
        .app-dark .text-slate-600, .app-dark .text-slate-500, .app-dark .text-gray-600, .app-dark .text-gray-500 { color: #9CA3AF !important; }
        .app-dark .text-emerald-900, .app-dark .text-emerald-800, .app-dark .text-emerald-700, .app-dark .text-emerald-600 { color: #34D399 !important; }
        .app-dark .text-amber-900, .app-dark .text-amber-800, .app-dark .text-amber-700, .app-dark .text-red-800, .app-dark .text-red-700 { color: #F59E0B !important; }
        .app-dark .border, .app-dark .border-t, .app-dark .border-b, .app-dark .border-r, .app-dark .border-l { border-color: #334155; }
        .app-dark [class~="hover:bg-black/5"]:hover { background-color: rgba(255,255,255,.07) !important; }
      `}</style>

      {hoveredDeadline && (
        <div
          className="fixed z-[9999] w-72 p-3.5 rounded-xl shadow-2xl border text-white space-y-2 pointer-events-none transition-all duration-150"
          style={{
            top: `${hoverPos.y}px`,
            left: `${hoverPos.x}px`,
            backgroundColor: isDarkMode ? '#1E293B' : '#111827',
            borderColor: MENU_PALETTE.linha
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
        </div>
      )}

      {/* SIDEBAR NAVIGATION */}
      <aside
        className={`${isSidebarCollapsed ? 'hidden md:flex md:w-20' : 'flex w-full md:w-64'} border-r flex-shrink-0 flex-col justify-between transition-[width] duration-200 ease-in-out`}
        style={{ backgroundColor: MENU_PALETTE.fundo, borderColor: MENU_PALETTE.linha }}
        aria-label="Menu principal"
      >
        <div>
          <div className={`${isSidebarCollapsed ? 'px-2 pt-3 justify-center' : 'px-3 pt-3 justify-end'} flex`}>
            <button
              type="button"
              onClick={toggleSidebar}
              className="inline-flex items-center justify-center gap-2 rounded-lg border p-2 text-xs transition hover:bg-white/10"
              style={{ color: MENU_PALETTE.destaque, borderColor: MENU_PALETTE.linha }}
            >
              {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              {!isSidebarCollapsed && <span className="hidden md:inline">Recolher menu</span>}
            </button>
          </div>
          <div className={`${isSidebarCollapsed ? 'px-2 py-4' : 'p-6'} text-center border-b transition-all`} style={{ borderColor: MENU_PALETTE.linha }}>
            <div className={`inline-flex items-center justify-center ${isSidebarCollapsed ? 'w-11 h-11' : 'w-16 h-16'} rounded-full border-2 shadow-md mb-2 transition-all`} style={{ borderColor: MENU_PALETTE.destaque, backgroundColor: MENU_PALETTE.monograma }}>
              <span className={`${isSidebarCollapsed ? 'text-base' : 'text-xl'} font-serif font-bold tracking-wider`} style={{ color: MENU_PALETTE.destaque }}>
                VM
              </span>
            </div>
            {!isSidebarCollapsed && (
              <h1 className="font-serif font-bold text-sm tracking-widest uppercase mt-1" style={{ color: MENU_PALETTE.destaque }}>
                DRA. VALESKA MONTEIRO
              </h1>
            )}
          </div>

          <nav className={`${isSidebarCollapsed ? 'p-2' : 'p-3'} space-y-1`} aria-label="Navegação do escritório">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Briefcase },
              { id: 'processes', label: 'Processos', icon: FileText },
              { id: 'agenda', label: 'Prazos e Agenda', icon: CalendarIcon },
              { id: 'tasks', label: 'Tarefas (Bitrix24)', icon: ClipboardList },
              { id: 'crm', label: 'Clientes (CRM)', icon: Users },
              { id: 'leads', label: 'Captação', icon: UserPlus },
              { id: 'finances', label: 'Financeiro', icon: Wallet },
              { id: 'documents', label: 'Documentos', icon: FolderOpen },
              { id: 'workspace', label: 'Modelos e Calculadoras', icon: Copy },
              { id: 'reports', label: 'Relatórios', icon: BarChart3 }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setModuleNotice(''); if (tab.id === 'agenda') setAgendaSubTab('prazos'); if (tab.id === 'workspace') setWorkspaceSubTab('modelos'); }}
                  className={`w-full flex items-center rounded-xl text-xs font-semibold transition ${
                    isSidebarCollapsed ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-3'
                  } ${isActive ? 'shadow-md font-bold' : 'hover:bg-white/10'}`}
                  style={{
                    backgroundColor: isActive ? MENU_PALETTE.ativo : 'transparent',
                    color: MENU_PALETTE.texto
                  }}
                >
                  <Icon size={18} style={{ color: MENU_PALETTE.destaque, flexShrink: 0 }} />
                  {!isSidebarCollapsed && <span>{tab.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        <div className={`${isSidebarCollapsed ? 'p-2' : 'p-4'} border-t text-center text-[10px]`} style={{ borderColor: MENU_PALETTE.linha, color: MENU_PALETTE.destaque }}>
          {!isSidebarCollapsed && <>
            <p className="font-semibold">Serra / ES • OAB/ES</p>
            <p className="mt-0.5 mb-3" style={{ color: MENU_PALETTE.subtitulo }}>Sistema Advocacia v2.5</p>
          </>}
          <button
            type="button"
            onClick={() => { setActiveTab('settings'); setModuleNotice(''); }}
            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-center gap-2'} py-2 px-2 rounded-lg text-xs font-bold mb-2 border transition`}
            style={{ color: MENU_PALETTE.texto, backgroundColor: activeTab === 'settings' ? MENU_PALETTE.ativo : 'transparent', borderColor: MENU_PALETTE.linha }}
          >
            <Settings size={16} /> {!isSidebarCollapsed && <span>Configurações</span>}
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-center gap-2'} py-2 px-2 rounded-lg text-xs font-bold border transition`}
            style={{ color: MENU_PALETTE.destaque, backgroundColor: 'rgba(245,238,233,0.06)', borderColor: MENU_PALETTE.linha }}
          >
            <LogOut size={16} /> {!isSidebarCollapsed && <span>Sair do Sistema</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 min-w-0 flex flex-col transition-[width] duration-200">
        <header className="px-6 py-5 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm" style={{ backgroundColor: MENU_PALETTE.fundo, borderColor: MENU_PALETTE.linha }}>
          <div>
            <h2 className="font-serif font-bold text-lg" style={{ color: '#FFFFFF' }}>
              Advocacia & Consultoria Jurídica
            </h2>
            <p className="text-xs" style={{ color: MENU_PALETTE.subtitulo }}>
              Dra. Valeska Monteiro • Serra / ES
            </p>
            <p className="text-[10px] mt-1 flex items-center gap-1" style={{ color: isDarkMode ? '#9CA3AF' : '#D1D5DB' }}>
              <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: persistenceStatus.includes('Erro') || persistenceStatus.includes('Falha') ? '#F5EEE9' : '#34D399' }} />
              {persistenceStatus}{lastSavedAt ? ` · ${new Date(lastSavedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : ''}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={toggleSidebar}
              className="px-3 py-2.5 rounded-xl border font-bold text-xs flex items-center gap-2 transition hover:brightness-105"
              style={{ backgroundColor: PALETTE.fundoCartoes, borderColor: PALETTE.linhasBordas, color: PALETTE.textoPrincipal }}
            >
              {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              <span className="hidden sm:inline">{isSidebarCollapsed ? 'Expandir menu' : 'Recolher menu'}</span>
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className="px-3 py-2.5 rounded-xl border font-bold text-xs flex items-center gap-2 transition hover:brightness-105"
              style={{ backgroundColor: PALETTE.fundoCartoes, borderColor: PALETTE.linhasBordas, color: PALETTE.textoPrincipal }}
            >
              {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
              {isDarkMode ? 'Modo claro' : 'Modo escuro'}
            </button>
            <button
              onClick={() => setIsNewProcessOpen(true)}
              className="px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md hover:brightness-110 transition"
              style={{ backgroundColor: PALETTE.bordoPrincipal, color: '#FFFFFF' }}
            >
              + Novo Processo
            </button>
          </div>
        </header>

        <div className="p-6 flex-1 overflow-y-auto">
          {activeTab === 'agenda' && (
            <div className="flex flex-wrap gap-2 mb-5 p-1 rounded-xl border w-fit" style={{ backgroundColor: PALETTE.fundoCartoes, borderColor: PALETTE.linhasBordas }}>
              {[{ id: 'prazos', label: 'Prazos e intimações' }, { id: 'agenda', label: 'Agenda' }, { id: 'varredura', label: 'Varredura e sincronização' }].map(item => (
                <button key={item.id} onClick={() => setAgendaSubTab(item.id)} className="px-3 py-2 rounded-lg text-xs font-bold transition" style={{ backgroundColor: agendaSubTab === item.id ? PALETTE.bordoPrincipal : 'transparent', color: agendaSubTab === item.id ? '#FFFFFF' : PALETTE.textoPrincipal }}>
                  {item.label}
                </button>
              ))}
            </div>
          )}
          {activeTab === 'workspace' && (
            <div className="flex flex-wrap gap-2 mb-5 p-1 rounded-xl border w-fit" style={{ backgroundColor: PALETTE.fundoCartoes, borderColor: PALETTE.linhasBordas }}>
              {[{ id: 'modelos', label: 'Modelos de peças' }, { id: 'calculadoras', label: 'Calculadoras jurídicas' }, { id: 'verbas', label: 'Apuração de verbas' }].map(item => (
                <button key={item.id} onClick={() => setWorkspaceSubTab(item.id)} className="px-3 py-2 rounded-lg text-xs font-bold transition" style={{ backgroundColor: workspaceSubTab === item.id ? PALETTE.bordoPrincipal : 'transparent', color: workspaceSubTab === item.id ? '#FFFFFF' : PALETTE.textoPrincipal }}>
                  {item.label}
                </button>
              ))}
            </div>
          )}

          {/* TAB: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-4 md:space-y-5" style={{ color: PALETTE.textoPrincipal }}>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <h3 className="font-serif text-2xl md:text-[28px] leading-tight" style={{ color: PALETTE.textoPrincipal }}>Painel do escritório</h3>
                  <p className="mt-1 text-xs capitalize" style={{ color: PALETTE.textoApoio }}>{dashboardDateLabel}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                  <label className="flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs min-w-0 sm:min-w-[260px]" style={{ backgroundColor: PALETTE.fundoCartoes, borderColor: PALETTE.linhasBordas, color: PALETTE.textoApoio }}>
                    <Search size={14} />
                    <input
                      type="search"
                      value={dashboardSearch}
                      onChange={(e) => setDashboardSearch(e.target.value)}
                      placeholder="Buscar processo, cliente ou prazo"
                      className="w-full min-w-0 bg-transparent outline-none placeholder:opacity-70"
                      style={{ color: PALETTE.textoPrincipal }}
                    />
                    {dashboardSearch && <button type="button" onClick={() => setDashboardSearch('')} className="shrink-0" style={{ color: PALETTE.textoApoio }}><X size={13} /></button>}
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsNewProcessOpen(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:brightness-105"
                    style={{ backgroundColor: PALETTE.bordoPrincipal }}
                  >
                    <Plus size={14} /> Novo processo
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                <div className="rounded-2xl border p-4 min-h-[104px] flex flex-col justify-between" style={{ backgroundColor: PALETTE.fundoCartoes, borderColor: PALETTE.linhasBordas }}>
                  <div className="text-[10px] uppercase tracking-[0.12em] font-semibold" style={{ color: PALETTE.textoApoio }}>Processos ativos</div>
                  <div className="text-3xl font-serif leading-none" style={{ color: PALETTE.textoPrincipal }}>{processes.filter((item) => !/arquivado|encerrado|baixado/i.test(String(item.status || ''))).length}</div>
                  <div className="text-[10px] flex items-center gap-1" style={{ color: PALETTE.valoresReceber }}><Briefcase size={11} /> Carteira do escritório</div>
                </div>
                <div className="rounded-2xl border p-4 min-h-[104px] flex flex-col justify-between" style={{ backgroundColor: PALETTE.caixaTotal, borderColor: PALETTE.bordoPrincipal }}>
                  <div className="text-[10px] uppercase tracking-[0.12em] font-semibold" style={{ color: PALETTE.textoApoio }}>Prazos nos próximos 7 dias</div>
                  <div className="text-3xl font-serif leading-none" style={{ color: PALETTE.textoPrincipal }}>{dashboardNextWeekCount}</div>
                  <div className="text-[10px] font-semibold" style={{ color: PALETTE.descontos }}>{dashboardNextWeekCount ? 'Acompanhe as próximas entregas' : 'Nenhum prazo nos próximos 7 dias'}</div>
                </div>
                <div className="rounded-2xl border p-4 min-h-[104px] flex flex-col justify-between" style={{ backgroundColor: PALETTE.fundoCartoes, borderColor: PALETTE.linhasBordas }}>
                  <div className="text-[10px] uppercase tracking-[0.12em] font-semibold" style={{ color: PALETTE.textoApoio }}>Audiências no mês</div>
                  <div className="text-3xl font-serif leading-none" style={{ color: PALETTE.textoPrincipal }}>{dashboardAudiencesThisMonth}</div>
                  <div className="text-[10px]" style={{ color: PALETTE.textoApoio }}>Compromissos identificados na agenda</div>
                </div>
                <div className="rounded-2xl border p-4 min-h-[104px] flex flex-col justify-between" style={{ backgroundColor: PALETTE.fundoCartoes, borderColor: PALETTE.linhasBordas }}>
                  <div className="text-[10px] uppercase tracking-[0.12em] font-semibold" style={{ color: PALETTE.textoApoio }}>Honorários a receber</div>
                  <div className="text-2xl md:text-[27px] font-serif leading-none" style={{ color: PALETTE.textoPrincipal }}>{financialTotals.honorarios.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}</div>
                  <div className="text-[10px] font-semibold" style={{ color: PALETTE.valoresReceber }}>Total registrado nos processos</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: TAREFAS - QUADRO DINÂMICO BITRIX24 */}
          {activeTab === 'tasks' && (
            <div className="space-y-5">
              <div className="p-6 rounded-2xl border shadow-sm" style={{ backgroundColor: PALETTE.fundoCartoes, borderColor: PALETTE.linhasBordas }}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-serif font-bold text-lg flex items-center gap-2" style={{ color: PALETTE.textoPrincipal }}>
                      <ClipboardList size={22} style={{ color: PALETTE.bordoPrincipal }} />
                      Quadro de Tarefas (Bitrix24)
                    </h3>
                    <p className="text-xs mt-1" style={{ color: PALETTE.textoApoio }}>
                      Gerencie demandas, criadores, responsáveis, checklists, prazos e anexos. Clique no cartão para abrir a edição completa.
                    </p>
                  </div>
                  <form onSubmit={e => { e.preventDefault(); addTask(); }} className="flex gap-2 w-full md:w-auto">
                    <input
                      value={taskDraft}
                      onChange={e => setTaskDraft(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTask(); } }}
                      placeholder="Nome da nova tarefa..."
                      className="flex-1 md:w-64 p-2.5 border rounded-xl text-xs bg-white"
                      style={{ borderColor: PALETTE.linhasBordas }}
                    />
                    <button type="button" onClick={() => addTask()} className="px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1 shadow hover:brightness-110 transition" style={{ backgroundColor: PALETTE.bordoPrincipal }}>
                      <Plus size={14}/> Criar Tarefa
                    </button>
                  </form>
                </div>

                {/* Filtros no topo */}
                <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t" style={{ borderColor: PALETTE.linhasBordas }}>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setTaskFilter('Todas')} className="px-3 py-1.5 rounded-lg text-xs font-bold border transition" style={{ backgroundColor: taskFilter === 'Todas' ? PALETTE.bordoPrincipal : PALETTE.fundoCartoes, color: taskFilter === 'Todas' ? '#fff' : PALETTE.textoPrincipal, borderColor: PALETTE.linhasBordas }}>
                      Todas ({tasks.length})
                    </button>
                    {['Alta', 'Média', 'Baixa'].map(priority => (
                      <button key={priority} onClick={() => setTaskFilter(priority)} className="px-3 py-1.5 rounded-lg text-xs font-bold border transition" style={{ backgroundColor: taskFilter === priority ? PALETTE.bordoPrincipal : PALETTE.fundoCartoes, color: taskFilter === priority ? '#fff' : PALETTE.textoPrincipal, borderColor: PALETTE.linhasBordas }}>
                        {priority} prioridade
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <Search size={14} style={{ color: PALETTE.textoApoio }} />
                    <input
                      type="text"
                      value={taskSearch}
                      onChange={e => setTaskSearch(e.target.value)}
                      placeholder="Buscar por título, responsável ou processo..."
                      className="p-1.5 px-3 border rounded-lg text-xs w-60"
                      style={{ borderColor: PALETTE.linhasBordas }}
                    />
                  </div>
                </div>
              </div>

              {/* Colunas Kanban */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
                {['A fazer', 'Em andamento', 'Em revisão', 'Concluída'].map(status => {
                  const columnTasks = tasks.filter(task => {
                    const matchesStatus = task.status === status;
                    const matchesFilter = taskFilter === 'Todas' || task.priority === taskFilter;
                    const matchesSearch = !taskSearch.trim() ||
                      task.title.toLowerCase().includes(taskSearch.toLowerCase()) ||
                      (task.assignee && task.assignee.toLowerCase().includes(taskSearch.toLowerCase())) ||
                      (task.process && task.process.toLowerCase().includes(taskSearch.toLowerCase()));
                    return matchesStatus && matchesFilter && matchesSearch;
                  });

                  return (
                    <section
                      key={status}
                      onDragOver={e => e.preventDefault()}
                      onDrop={e => {
                        const id = e.dataTransfer.getData('text/plain');
                        if (id) moveTask(id, status);
                      }}
                      className="rounded-2xl border p-3 min-h-[350px]"
                      style={{ backgroundColor: PALETTE.caixaTotal, borderColor: PALETTE.linhasBordas }}
                    >
                      <div className="flex items-center justify-between px-1 pb-3 border-b mb-3" style={{ borderColor: PALETTE.linhasBordas }}>
                        <h4 className="text-xs font-bold uppercase tracking-wide" style={{ color: PALETTE.bordoEscuro }}>{status}</h4>
                        <span className="text-[10px] rounded-full px-2 py-0.5 bg-white font-bold border" style={{ borderColor: PALETTE.linhasBordas }}>
                          {columnTasks.length}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {columnTasks.map(task => {
                          const completedCheck = (task.checklist || []).filter((c: any) => c.completed).length;
                          const totalCheck = (task.checklist || []).length;

                          return (
                            <article
                              key={task.id}
                              draggable
                              onDragStart={e => e.dataTransfer.setData('text/plain', task.id)}
                              onClick={() => setSelectedTaskModal({ ...task })}
                              className="p-3.5 rounded-xl bg-white border shadow-sm cursor-pointer hover:border-amber-400 transition space-y-2.5 relative group"
                              style={{ borderColor: PALETTE.linhasBordas }}
                            >
                              <div className="flex justify-between items-start gap-2">
                                <h5 className="text-xs font-bold leading-relaxed pr-6" style={{ color: PALETTE.textoPrincipal }}>
                                  {task.title}
                                </h5>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm('Excluir esta tarefa?')) {
                                      setTasks(prev => prev.filter(t => t.id !== task.id));
                                    }
                                  }}
                                  title="Excluir tarefa"
                                  className="text-amber-700 opacity-60 hover:opacity-100 p-1"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>

                              {task.description && (
                                <p className="text-[10px] line-clamp-2" style={{ color: PALETTE.textoApoio }}>
                                  {task.description}
                                </p>
                              )}

                              {/* Vínculo com processo */}
                              {task.process && (
                                <div className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 truncate">
                                  Proc: {task.process}
                                </div>
                              )}

                              {/* Indicadores estilo Bitrix24 */}
                              <div className="flex flex-wrap items-center gap-2 text-[9px]" style={{ color: PALETTE.textoApoio }}>
                                {totalCheck > 0 && (
                                  <span className={`flex items-center gap-1 font-semibold ${completedCheck === totalCheck ? 'text-emerald-700' : ''}`}>
                                    <CheckSquare size={11} /> {completedCheck}/{totalCheck}
                                  </span>
                                )}
                                {(task.comments || []).length > 0 && (
                                  <span className="flex items-center gap-1 font-semibold">
                                    <MessageSquare size={11} /> {(task.comments || []).length}
                                  </span>
                                )}
                                {(task.attachments || []).length > 0 && (
                                  <span className="flex items-center gap-1 font-semibold">
                                    <Paperclip size={11} /> {(task.attachments || []).length}
                                  </span>
                                )}
                              </div>

                              {/* Prioridade e Prazos */}
                              <div className="flex flex-wrap items-center justify-between gap-1 pt-1 border-t" style={{ borderColor: PALETTE.linhasBordas }}>
                                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: task.priority === 'Alta' ? '#FBEDD4' : task.priority === 'Média' ? '#F5F1E7' : '#DDF4E9', color: task.priority === 'Alta' ? '#8B5E1A' : task.priority === 'Média' ? '#775B28' : '#24624D' }}>
                                  {task.priority}
                                </span>
                                {task.dueDate && (
                                  <span className="text-[9px] font-semibold flex items-center gap-1 text-slate-600">
                                    <Clock size={10} /> {task.dueDate}
                                  </span>
                                )}
                              </div>

                              {/* Usuários envolvidos */}
                              <div className="flex justify-between items-center text-[9px] pt-1 text-slate-500">
                                <span>Resp: <strong>{task.assignee || 'Dra. Valeska'}</strong></span>
                                <span className="text-[8px] opacity-75">Criador: {task.createdBy || 'Dra. Valeska'}</span>
                              </div>

                              {/* Controles rápidos Inline */}
                              <div className="flex gap-1 pt-1" onClick={e => e.stopPropagation()}>
                                <select
                                  aria-label="Prioridade da tarefa"
                                  value={task.priority}
                                  onChange={e => setTasks(prev => prev.map(t => t.id === task.id ? { ...t, priority: e.target.value } : t))}
                                  className="min-w-0 flex-1 text-[9px] border rounded p-1 bg-white"
                                >
                                  <option>Alta</option>
                                  <option>Média</option>
                                  <option>Baixa</option>
                                </select>
                                <select
                                  aria-label="Mover tarefa"
                                  value={task.status}
                                  onChange={e => moveTask(task.id, e.target.value)}
                                  className="min-w-0 flex-1 text-[9px] border rounded p-1 bg-white font-bold"
                                >
                                  {['A fazer', 'Em andamento', 'Em revisão', 'Concluída'].map(s => <option key={s}>{s}</option>)}
                                </select>
                              </div>
                            </article>
                          );
                        })}
                        {columnTasks.length === 0 && <p className="text-[10px] text-center py-8 opacity-60">Nenhuma tarefa aqui</p>}
                      </div>
                    </section>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* MODAL DETALHADO DE EDIÇÃO DA TAREFA (MODO BITRIX24) */}
      {selectedTaskModal && (
        <div className="fixed inset-0 bg-black/60 z-[10000] flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[92vh] flex flex-col p-6 rounded-2xl bg-white shadow-2xl space-y-4 overflow-hidden">
            {/* Cabeçalho do Modal */}
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2">
                <ClipboardList size={20} style={{ color: PALETTE.bordoPrincipal }} />
                <h3 className="font-serif font-bold text-base" style={{ color: PALETTE.bordoEscuro }}>
                  Detalhes da Tarefa (Bitrix24)
                </h3>
              </div>
              <button onClick={() => setSelectedTaskModal(null)} className="p-1 hover:bg-black/5 rounded"><X size={18} /></button>
            </div>

            {/* Corpo do Modal com rolagem */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
              {/* Título da Tarefa */}
              <div>
                <label className="font-bold block mb-1">Título da Tarefa</label>
                <input
                  type="text"
                  value={selectedTaskModal.title}
                  onChange={e => setSelectedTaskModal({ ...selectedTaskModal, title: e.target.value })}
                  className="w-full p-2.5 border rounded-xl font-bold text-sm"
                />
              </div>

              {/* Responsável, Criador, Status e Prioridade */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl border">
                <div>
                  <label className="font-bold block text-[10px] uppercase text-slate-500 mb-1">Pessoa Responsável</label>
                  <input
                    type="text"
                    value={selectedTaskModal.assignee || 'Dra. Valeska'}
                    onChange={e => setSelectedTaskModal({ ...selectedTaskModal, assignee: e.target.value })}
                    className="w-full p-2 border rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold block text-[10px] uppercase text-slate-500 mb-1">Criado Por (Autor)</label>
                  <input
                    type="text"
                    value={selectedTaskModal.createdBy || 'Dra. Valeska'}
                    onChange={e => setSelectedTaskModal({ ...selectedTaskModal, createdBy: e.target.value })}
                    className="w-full p-2 border rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold block text-[10px] uppercase text-slate-500 mb-1">Status / Coluna</label>
                  <select
                    value={selectedTaskModal.status}
                    onChange={e => setSelectedTaskModal({ ...selectedTaskModal, status: e.target.value })}
                    className="w-full p-2 border rounded-lg bg-white font-bold"
                  >
                    {['A fazer', 'Em andamento', 'Em revisão', 'Concluída'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-bold block text-[10px] uppercase text-slate-500 mb-1">Prioridade</label>
                  <select
                    value={selectedTaskModal.priority}
                    onChange={e => setSelectedTaskModal({ ...selectedTaskModal, priority: e.target.value })}
                    className="w-full p-2 border rounded-lg bg-white"
                  >
                    <option>Alta</option>
                    <option>Média</option>
                    <option>Baixa</option>
                  </select>
                </div>
              </div>

              {/* Vínculo com Processo, Data Limite e Tempo Estimado */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="font-bold block mb-1">Vincular a Processo</label>
                  <select
                    value={selectedTaskModal.process || ''}
                    onChange={e => setSelectedTaskModal({ ...selectedTaskModal, process: e.target.value })}
                    className="w-full p-2 rounded-lg border bg-white"
                  >
                    <option value="">Sem vínculo</option>
                    {processes.map(p => (
                      <option key={p.id} value={p.number}>{p.number} - {p.client}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1">Data Limite / Prazo</label>
                  <input
                    type="date"
                    value={selectedTaskModal.dueDate || ''}
                    onChange={e => setSelectedTaskModal({ ...selectedTaskModal, dueDate: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Tempo Estimado</label>
                  <input
                    type="text"
                    placeholder="Ex: 2h 30m"
                    value={selectedTaskModal.estimatedTime || ''}
                    onChange={e => setSelectedTaskModal({ ...selectedTaskModal, estimatedTime: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>

              {/* Descrição Completa */}
              <div>
                <label className="font-bold block mb-1">Descrição / Instruções da Tarefa</label>
                <textarea
                  rows={3}
                  value={selectedTaskModal.description || ''}
                  onChange={e => setSelectedTaskModal({ ...selectedTaskModal, description: e.target.value })}
                  placeholder="Descreva detalhes, etapas ou orientações para o cumprimento..."
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>

              {/* Checklist / Subtarefas */}
              <div className="p-3.5 border rounded-xl bg-slate-50 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs flex items-center gap-1.5" style={{ color: PALETTE.textoPrincipal }}>
                    <CheckSquare size={14} /> Checklist / Subtarefas
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">
                    {(selectedTaskModal.checklist || []).filter((c: any) => c.completed).length} / {(selectedTaskModal.checklist || []).length} concluídas
                  </span>
                </div>

                <div className="space-y-1">
                  {(selectedTaskModal.checklist || []).map((c: any) => (
                    <div key={c.id} className="flex items-center justify-between gap-2 p-1.5 bg-white rounded border">
                      <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                        <input
                          type="checkbox"
                          checked={c.completed}
                          onChange={() => toggleCheckitemTaskModal(c.id)}
                        />
                        <span className={`text-xs truncate ${c.completed ? 'line-through text-slate-400' : ''}`}>
                          {c.text}
                        </span>
                      </label>
                      <button type="button" onClick={() => removeCheckitemTaskModal(c.id)} className="text-amber-700 hover:text-red-700 p-0.5">
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Adicionar item ao checklist..."
                    value={newCheckitemText}
                    onChange={e => setNewCheckitemText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCheckitemToTaskModal(); } }}
                    className="flex-1 p-2 border rounded-lg bg-white"
                  />
                  <button type="button" onClick={addCheckitemToTaskModal} className="px-3 py-1.5 rounded-lg border font-bold bg-white hover:bg-slate-100">
                    + Adicionar
                  </button>
                </div>
              </div>

              {/* Anexos */}
              <div className="p-3.5 border rounded-xl space-y-2">
                <span className="font-bold text-xs flex items-center gap-1.5" style={{ color: PALETTE.textoPrincipal }}>
                  <Paperclip size={14} /> Anexos e Documentos da Tarefa
                </span>
                <div className="space-y-1">
                  {(selectedTaskModal.attachments || []).map((att: any) => (
                    <div key={att.id} className="flex justify-between items-center p-2 bg-slate-50 border rounded-lg">
                      <span className="text-xs font-mono truncate">{att.fileName} ({Math.max(1, Math.round(att.size / 1024))} KB)</span>
                      <a href={att.dataUrl} download={att.fileName} className="text-xs font-bold text-emerald-700 hover:underline">Baixar</a>
                    </div>
                  ))}
                </div>
                <input
                  type="file"
                  onChange={e => handleTaskAttachmentFile(e.target.files?.[0])}
                  className="w-full text-xs"
                />
              </div>

              {/* Comentários & Histórico */}
              <div className="p-3.5 border rounded-xl space-y-2">
                <span className="font-bold text-xs flex items-center gap-1.5" style={{ color: PALETTE.textoPrincipal }}>
                  <MessageSquare size={14} /> Comentários & Histórico de Alterações
                </span>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {(selectedTaskModal.comments || []).map((cm: any) => (
                    <div key={cm.id} className="p-2.5 rounded-lg bg-slate-50 border space-y-1">
                      <div className="flex justify-between text-[10px] font-bold text-slate-600">
                        <span>{cm.author}</span>
                        <span>{cm.date}</span>
                      </div>
                      <p className="text-xs">{cm.text}</p>
                    </div>
                  ))}
                  {(selectedTaskModal.comments || []).length === 0 && (
                    <p className="text-[10px] italic text-slate-400">Nenhum comentário registrado.</p>
                  )}
                </div>

                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Escrever um comentário..."
                    value={newCommentText}
                    onChange={e => setNewCommentText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCommentToTaskModal(); } }}
                    className="flex-1 p-2 border rounded-lg bg-white"
                  />
                  <button type="button" onClick={addCommentToTaskModal} className="px-3 py-1.5 rounded-lg font-bold text-white" style={{ backgroundColor: PALETTE.bordoPrincipal }}>
                    Comentar
                  </button>
                </div>
              </div>
            </div>

            {/* Rodapé do Modal */}
            <div className="flex justify-between items-center border-t pt-3">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Excluir esta tarefa?')) {
                    setTasks(prev => prev.filter(t => t.id !== selectedTaskModal.id));
                    setSelectedTaskModal(null);
                  }
                }}
                className="px-3 py-2 rounded-lg text-amber-800 font-bold flex items-center gap-1 hover:bg-amber-50"
              >
                <Trash2 size={14} /> Excluir
              </button>

              <div className="flex gap-2">
                <button type="button" onClick={() => setSelectedTaskModal(null)} className="px-4 py-2 rounded-lg border font-bold">
                  Cancelar
                </button>
                <button type="button" onClick={saveSelectedTaskModal} className="px-4 py-2 rounded-lg text-white font-bold shadow" style={{ backgroundColor: PALETTE.bordoPrincipal }}>
                  Salvar Alterações
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
