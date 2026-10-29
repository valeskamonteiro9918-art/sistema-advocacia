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
  Sun,
  Moon
} from 'lucide-react';

const LIGHT_PALETTE = {
  bordoPrincipal: '#800020',
  bordoEscuro: '#581C2B',
  dourado: '#D97706',
  douradoClaro: '#F59E0B',
  fundoPagina: '#F3F4F6',
  fundoCartoes: '#FFFFFF',
  linhasBordas: '#E5E7EB',
  caixaTotal: '#F9FAFB',
  textoPrincipal: '#111827',
  textoApoio: '#6B7280',
  valoresReceber: '#059669',
  descontos: '#D97706'
};

const DARK_PALETTE = {
  bordoPrincipal: '#B83250',
  bordoEscuro: '#3B0E19',
  dourado: '#F59E0B',
  douradoClaro: '#F9FAFB',
  fundoPagina: '#121820',
  fundoCartoes: '#1E293B',
  linhasBordas: '#334155',
  caixaTotal: '#243244',
  textoPrincipal: '#F9FAFB',
  textoApoio: '#9CA3AF',
  valoresReceber: '#34D399',
  descontos: '#F59E0B'
};

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const PALETTE = isDarkMode ? DARK_PALETTE : LIGHT_PALETTE;

  useEffect(() => {
    try {
      setIsDarkMode(window.localStorage.getItem('vm-theme') === 'dark');
    } catch (error) {
      // O sistema continua funcionando mesmo quando o navegador bloqueia localStorage.
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((current) => {
      const next = !current;
      try {
        window.localStorage.setItem('vm-theme', next ? 'dark' : 'light');
      } catch (error) {
        // A preferência vale durante esta sessão mesmo sem armazenamento local.
      }
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
