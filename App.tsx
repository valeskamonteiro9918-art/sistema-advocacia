import React, { useState } from 'react';
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
  Calculator
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

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans" style={{ backgroundColor: PALETTE.fundoPagina, color: PALETTE.textoPrincipal }}>
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

        {/* Footer Info */}
        <div className="p-4 border-t text-center text-[10px]" style={{ borderColor: `${PALETTE.dourado}30`, color: PALETTE.douradoClaro }}>
          <p className="font-semibold">Serra / ES • OAB/ES</p>
          <p className="opacity-60 mt-0.5">Sistema Advocacia v2.5</p>
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

              {/* BLOCK 1:
