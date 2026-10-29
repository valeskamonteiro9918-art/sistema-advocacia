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
  
  // States para Formulários e Modais
  const [isNewProcessOpen, setIsNewProcessOpen] = useState(false);
  const [isNewClientOpen, setIsNewClientOpen] = useState(false);
  const [isNewDeadlineOpen, setIsNewDeadlineOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // Filters & State Variables
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [selectedVerbasProcId, setSelectedVerbasProcId] = useState('1');
  const [calcSubTab, setCalcSubTab] = useState('trabalhista');

  // Main Data
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
    { id: '1', name: 'Mosaniel Martins da Cruz', type: 'Pessoa Física', document: '123.456.789-00', phone: '27998812233', email: 'mosaniel.cruz@email.com', status: 'Ativo' },
    { id: '2', name: 'Isabela Ferreira Santos', type: 'Pessoa Física', document: '987.654.321-11', phone: '27997724455', email: 'isabela.ferreira@email.com', status: 'Ativo' },
    { id: '3', name: 'Jucimara Carvalho Barreto', type: 'Pessoa Física', document: '456.789.123-22', phone: '31991128899', email: 'jucimara.barreto@email.com', status: 'Ativo' },
    { id: '4', name: 'Estevão dos Santos Pereira', type: 'Pessoa Física', document: '321.654.987-33', phone: '27995541122', email: 'estevao.pereira@email.com', status: 'Ativo' }
  ]);

  const [deadlines, setDeadlines] = useState([
    { id: '1', title: 'Manifestação sobre Sentença / Embargos', client: 'Mosaniel Martins da Cruz', process: '5046388-53.2025.8.08.0048', court: 'TJES - 4º JEC Serra', dueDate: '2026-10-28', dueTime: '23:59', type: 'FATAL', status: 'Em Andamento' },
    { id: '2', title: 'Audiência UNA Presencial TRT17', client: 'Estevão dos Santos Pereira', process: '0001478-18.2026.5.17.0007', court: 'TRT17 - 7ª Vara', dueDate: '2026-10-30', dueTime: '14:00', type: 'NORMAL', status: 'Em Andamento' },
    { id: '3', title: 'Pedido de Cumprimento de Sentença', client: 'Jucimara Carvalho Barreto', process: '1000797-34.2026.8.13.0543', court: 'TJMG Eproc', dueDate: '2026-11-03', dueTime: '18:00', type: 'FATAL', status: 'Pendente' }
  ]);

  const [scannedPush, setScannedPush] = useState([
    { id: 'p1', date: '2026-10-28', court: 'TJES - Diário Eletrônico', title: 'Intimação para Réplica', process: '5046388-53.2025.8.08.0048', snippet: 'Fica intimada a Dra. Valeska Monteiro para apresentar Réplica no prazo de 15 dias úteis...' },
    { id: 'p2', date: '2026-10-27', court: 'TRT17 - PJe Push', title: 'Designação de Audiência de Conciliação', process: '0001083-23.2026.5.17.0008', snippet: 'Audiência conciliatória designada para o dia 12/11/2026 às 14:00h...' }
  ]);

  const [templates, setTemplates] = useState([
    { id: '1', category: 'Cível / JEC', title: 'Embargos de Declaração contra Sentença', description: 'Peça para sanar omissão, contradição ou obscuridade em sentença com pedido de efeito modificativo.', content: 'EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO...' },
    { id: '2', category: 'Cível / Execução', title: 'Requerimento de Cumprimento de Sentença', description: 'Petição inicial de cumprimento definitivo de sentença com memória discriminada de cálculo.', content: 'EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A)...' }
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]);
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

  const handleRunScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const newIntimacao = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        court: 'TJES - Capixaba Push',
        title: 'Nova Publicação Disponibilizada',
        process: '5046388-53.2025.8.08.0048',
        snippet: 'Publicação no Diário da Justiça referente a prazo...'
      };
      setScannedPush([newIntimacao, ...scannedPush]);
      setIsScanning(false);
    }, 1200);
  };

  const handleMoveScanToAgenda = (item) => {
    const agendaItem = {
      id: Date.now().toString(),
      title: item.title,
      client: 'Cliente Vinculado',
      process: item.process,
      court: item.court,
      dueDate: '2026-11-05',
      dueTime: '23:59',
      type: 'FATAL',
      status: 'Pendente'
    };
    setDeadlines([...deadlines, agendaItem]);
    setScannedPush(scannedPush.filter((s) => s.id !== item.id));
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans" style={{ backgroundColor: PALETTE.fundoPagina, color: PALETTE.textoPrincipal }}>
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 border-r flex-shrink-0 flex flex-col justify-between" style={{ backgroundColor: PALETTE.bordoEscuro, borderColor: PALETTE.bordoPrincipal }}>
