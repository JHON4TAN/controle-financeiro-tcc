import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, Edit2, ChevronLeft, ChevronRight } from "lucide-react";
import {
  LayoutDashboard,
  ArrowUpCircle,
  ArrowDownCircle,
  Tags,
  Target,
  Plus,
  FileText,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Settings,
  PlusCircle,
  Wallet,
  Calendar,
  Search,
  Bell,
  Utensils,
  DollarSign,
  ShoppingCart,
  Home,
  Bus,
  Gamepad2,
  X,
  Trash2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { authAPI, transacaoAPI, categoriaAPI, metaAPI, notificacaoAPI } from "./services/api";


// Componente responsável pelos cards de resumo financeiro
// Exibe informações como saldo, receitas e despesas
const SummaryCard = ({ title, value, icon: Icon, colorClass, trend }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-xl ${colorClass}`}>
        <Icon size={24} className="text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
      </div>
    </div>
    {trend && (
      <div className={`text-xs font-bold px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
        {trend > 0 ? '▲' : '▼'} {Math.abs(trend)}%
      </div>
    )}
  </div>
);

// Componente exibido quando não existem dados cadastrados
// Utilizado em listas vazias e gráficos sem informações
const EmptyState = ({ icon: Icon, title, description }: any) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="bg-gray-100 p-4 rounded-full mb-4">
      <Icon size={32} className="text-gray-400" />
    </div>
    <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
    <p className="text-gray-500 text-sm">{description}</p>
  </div>
);

// Componente principal da aplicação
function App() {
  // Controla qual aba/tela está ativa no sistema
  const [abaAtiva, setAbaAtiva] = useState('dashboard');
  // Verifica se o usuário está autenticado
  const [logado, setLogado] = useState(false);
  // Controla carregamento inicial da aplicação
  const [carregou, setCarregou] = useState(false);
  // Estados utilizados no formulário de autenticação
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  // Alterna entre modo login e cadastro
  const [modoAuth, setModoAuth] = useState("login");
  // Expressão regular utilizada para validar senha forte
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
  // Armazena foto de perfil enviada pelo usuário
  const [foto, setFoto] = useState<File | null>(null);

  // Controla visualização das senhas nos formulários
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
  const [lembrar, setLembrar] = useState(false);

  const [mostrarSenhaAtual, setMostrarSenhaAtual] = useState(false);

  // Sistema de notificações toast exibidas na interface
  const [toasts, setToasts] = useState<any[]>([]);

  // Função responsável por exibir mensagens temporárias na tela
  const mostrarToast = (mensagem: string, tipo = "success") => {
    const id = Date.now();
    const novoToast = { id, mensagem, tipo };
    setToasts((prev) => [...prev, novoToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Estados responsáveis pelo gerenciamento das metas financeiras
  const [metas, setMetas] = useState<any>({});
  const [metasHistorico, setMetasHistorico] = useState<any[]>([]);
  const [metasAtuais, setMetasAtuais] = useState<any[]>([]);
  const [metaEditando, setMetaEditando] = useState<any | null>(null);

  // Armazena dados do usuário autenticado
  const [nomeUsuario, setNomeUsuario] = useState("Usuário");

  // Estados utilizados na edição do perfil do usuário
  const [nomeEditavel, setNomeEditavel] = useState("");
  const [emailEditavel, setEmailEditavel] = useState("");
  // Controla abertura do modal de exclusão de conta
  const [modalExcluirConta, setModalExcluirConta] = useState(false);
  // Estados utilizados na alteração de senha
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState("");

  // Controla exibição do modal de perfil
  const [modalPerfilOpen, setModalPerfilOpen] = useState(false);



  // ===== CARREGAMENTO DE DADOS DA API =====

  // Função responsável por buscar todos os dados do usuário
  // através da API e atualizar os estados da aplicação
  const carregarDados = async () => {
    try {
      // Realiza múltiplas requisições simultaneamente
      // para otimizar o carregamento do sistema
      const [t, c, m, n] = await Promise.all([
        transacaoAPI.listar(),
        categoriaAPI.listar(),
        metaAPI.listar(),
        notificacaoAPI.listar()
      ]);
      
      // Conversão dos valores de centavos para reais
      // para exibição correta na interface
      setTransacoes(t.map((item: any) => ({ ...item, valor: item.valor / 100 })));
      setCategorias(c);
      setMetasHistorico(m.map((item: any) => ({
        id: `MT-${item.id}`,
        nome: item.descricao,
        mes: `${item.ano}-${item.mes.toString().padStart(2, '0')}`,
        tipo: item.tipo,
        limite: item.valor / 100,
        dataCriacao: item.criado_em,
        dbId: item.id
      })));
      setNotificacoes(n);
      setCarregou(true);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    }
  };

  // Carrega os dados automaticamente após login
  useEffect(() => {
    if (logado) {
      carregarDados();
    }
  }, [logado]);

  // Verifica se existe sessão salva no localStorage
  // mantendo o usuário autenticado
  useEffect(() => {
    const saved = localStorage.getItem("usuarioLogado");
    if (saved) {
      const user = JSON.parse(saved);
      if (user.expira > Date.now()) {
        setLogado(true);
        setNomeUsuario(user.nome || "Usuário");
        setNomeEditavel(user.nome || "");
        setEmailEditavel(user.email || "");
      } else {
        localStorage.removeItem("usuarioLogado");
      }
    }
  }, []);

  // Define saudação dinâmica baseada no horário atual
  const hora = new Date().getHours();
  let saudacao = "Bem-vindo";
  if (hora < 12) saudacao = "Bom dia";
  else if (hora < 18) saudacao = "Boa tarde";
  else saudacao = "Boa noite";

  // Controla abertura do menu de perfil
  const [menuPerfilAberto, setMenuPerfilAberto] = useState(false);
  const [telaPerfil, setTelaPerfil] = useState<string | null>(null);

  // Armazena notificações do usuário
  const [notificacoes, setNotificacoes] = useState<any[]>([]);
  const [abrirNotificacoes, setAbrirNotificacoes] = useState(false);

  // Marca uma notificação como lida
// e atualiza a interface em tempo real
  const marcarComoLida = async (id: number) => {
    try {
      await notificacaoAPI.marcarComoLida(id);
      setNotificacoes(prev =>
        prev.map(n => n.id === id ? { ...n, lida: true } : n)
      );
    } catch (err) {
      mostrarToast("Erro ao marcar notificação", "error");
    }
  };

  const adicionarNotificacao = async () => {
  try {
    const notificacoesAtualizadas = await notificacaoAPI.listar();
    setNotificacoes(notificacoesAtualizadas);
  } catch (err) {
    console.error("Erro ao carregar notificações:", err);
  }
};

// Define imagem de perfil padrão caso usuário não tenha foto
  const [fotoPerfil, setFotoPerfil] = useState(
    localStorage.getItem("fotoPerfil") || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
  );

  // Referência utilizada para controle de menus e modais
  const menuRef = useRef(null);
  // Estados responsáveis pelos modais da aplicação
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  // Estado utilizado no cadastro de categorias
  const [novaCategoria, setNovaCategoria] = useState({
    nome: '',
    tipo: 'despesa',
    cor: '#3b82f6'
  });

  const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] = useState(false);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("");
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  // Lista de transações financeiras cadastradas
  const [transacoes, setTransacoes] = useState<any[]>([]);
  const [transacaoEmEdicao, setTransacaoEmEdicao] = useState<any>(null);

  // Preenche formulário automaticamente ao editar transação
  const editarTransacao = (transacao: any) => {
    setTransacaoEmEdicao(transacao);
    setNovaTransacao({
      descricao: transacao.descricao,
      valor: Math.abs(transacao.valor).toString(),
      data: transacao.data.split('T')[0],
      tipo: transacao.valor > 0 ? 'receita' : 'despesa',
      categoria: transacao.categoriaId.toString()
    });
    setIsModalOpen(true);
  };

  // Remove transação do banco e atualiza interface
  const excluirTransacao = async (id: number) => {
    try {
      await transacaoAPI.deletar(id);
      const novas = transacoes.filter((t) => t.id !== id);
      setTransacoes(novas);
      adicionarNotificacao("Transação excluída");
      mostrarToast("Transação excluída!");
    } catch (err) {
      mostrarToast("Erro ao excluir transação", "error");
    }
  };

  // Configurações personalizáveis do sistema
  const [config, setConfig] = useState({
    darkMode: false,
    notificacoes: true,
    ocultarValores: false,
    tamanhoTexto: 'medio',
    moeda: 'BRL'
  });

  // Exporta todos os dados financeiros do usuário em JSON
  const exportarDados = () => {
  const dados = {
    usuario: {
      nome: nomeUsuario,
      email: emailEditavel,
      moeda: config.moeda,
    },

    transacoes,
    categorias,
    metas: metasHistorico,
    notificacoes,

    exportadoEm: new Date().toISOString(),
  };

  // Criação de arquivo para download dos dados exportados
  const blob = new Blob(
    [JSON.stringify(dados, null, 2)],
    {
      type: "application/json",
    }
  );

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");

  a.href = url;
  a.download = "insight-ledger-backup.json";

  a.click();

  URL.revokeObjectURL(url);

  mostrarToast(
    "Dados exportados com sucesso!",
    "success"
  );
};

// ===== EXCLUSÃO DE CONTA =====

// Remove a conta do usuário do banco de dados
// e encerra a sessão local
const excluirConta = async () => {
  try {
    const usuario = JSON.parse(
      localStorage.getItem("usuarioLogado") || "{}"
    );

    await usuarioAPI.deletar(usuario.id);

    localStorage.removeItem("usuarioLogado");

    mostrarToast(
      "Conta excluída com sucesso",
      "success"
    );

    setTimeout(() => {
      window.location.reload();
    }, 1500);

  } catch (err) {
    mostrarToast(
      "Erro ao excluir conta",
      "error"
    );
  }
};


// ===== FORMATAÇÃO DE NOTIFICAÇÕES =====

// Converte a data da notificação em um texto amigável
// Exemplo: "Há 2 horas", "Ontem às 14:30"
const formatarTempoNotificacao = (dataString: string) => {
  const data = new Date(dataString);
  const agora = new Date();

  const diffMs = agora.getTime() - data.getTime();

  const diffMin = Math.floor(diffMs / 60000);
  const diffHoras = Math.floor(diffMs / 3600000);
  const diffDias = Math.floor(diffMs / 86400000);

  if (diffMin < 1) {
    return "Agora mesmo";
  }

  if (diffMin < 60) {
    return diffMin === 1
      ? "Há 1 minuto"
      : `Há ${diffMin} minutos`;
  }

  if (diffHoras < 24) {
    return diffHoras === 1
      ? "Há 1 hora"
      : `Há ${diffHoras} horas`;
  }

  if (diffDias === 1) {
    return `Ontem às ${data.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Sao_Paulo"
    })}`;
  }

  return data.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "America/Sao_Paulo"
  });
};

  const dicas = [
    "Categorize suas despesas para entender melhor seus gastos.",
    "Evite gastos pequenos diários, eles acumulam no final do mês.",
    "Defina um limite mensal para lazer e entretenimento.",
    "Registre todos os gastos, mesmo os pequenos.",
    "Revise suas despesas toda semana.",
    "Priorize investimentos antes de gastos supérfluos."
  ];

  const hoje = new Date().getDate();
  const dicaDoDia = dicas[hoje % dicas.length];

  // ===== CONFIGURAÇÃO DE TEMA =====

// Alterna automaticamente entre modo claro e escuro
// aplicando a classe "dark" no documento HTML
  useEffect(() => {
    if (config.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [config.darkMode]);

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: config.moeda
    });
  };

  useEffect(() => {
    function handleClickFora(event: any) {
      if (menuRef.current && (menuRef.current as any).contains(event.target)) {
        return;
      }
      setMenuPerfilAberto(false);
    }

    document.addEventListener("mousedown", handleClickFora);
    return () => {
      document.removeEventListener("mousedown", handleClickFora);
    };
  }, []);

  const [novaTransacao, setNovaTransacao] = useState({
    descricao: '',
    valor: '',
    data: new Date().toISOString().split('T')[0],
    tipo: 'despesa',
    categoria: ''
  });

  // ===== GERENCIAMENTO DE TRANSAÇÕES =====

// Salva uma nova transação ou atualiza uma existente
// realizando conversão de valores para centavos
  const handleSalvar = async (e: any) => {
    e.preventDefault();
    const valorNumerico = parseFloat(
      novaTransacao.valor.replace(/\./g, "").replace(",", ".")
    );

    if (!novaTransacao.categoria) {
      mostrarToast("Selecione uma categoria", "error");
      return;
    }

    const valorCentavos = Math.round(valorNumerico * 100);
    const dados = {
      descricao: novaTransacao.descricao,
      categoriaId: parseInt(novaTransacao.categoria),
      data: new Date(novaTransacao.data).toISOString(),
      valor: novaTransacao.tipo === "despesa" ? -valorCentavos : valorCentavos,
      tipo: novaTransacao.tipo
    };

    try {
      if (transacaoEmEdicao) {
        const atualizada = await transacaoAPI.atualizar(transacaoEmEdicao.id, dados);
        setTransacoes(transacoes.map(t => t.id === transacaoEmEdicao.id ? { ...atualizada, valor: atualizada.valor / 100 } : t));
        mostrarToast("Transação atualizada com sucesso!");
      } else {
        const nova = await transacaoAPI.criar(dados);
        setTransacoes([{ ...nova, valor: nova.valor / 100 }, ...transacoes]);
        mostrarToast("Transação adicionada com sucesso!");
        adicionarNotificacao(`Nova ${novaTransacao.tipo}: ${novaTransacao.descricao}`);
      }

      setIsModalOpen(false);
      setTransacaoEmEdicao(null);
      setNovaTransacao({
        descricao: "",
        valor: "",
        data: new Date().toISOString().split("T")[0],
        tipo: "despesa",
        categoria: "",
      });
    } catch (err) {
      mostrarToast("Erro ao salvar transação", "error");
    }
  };

  const formatarValor = (valor: string) => {
    const numero = valor.replace(/\D/g, "");
    return new Intl.NumberFormat("pt-BR").format(Number(numero));
  };

  const [categorias, setCategorias] = useState<any[]>([]);

  const validarCategoriaDuplicada = (nome: string, tipoAtual: string) => {
    return categorias.some(c => c.nome.toLowerCase() === nome.toLowerCase() && c.tipo === tipoAtual);
  };

  const [categoriaEmEdicao, setCategoriaEmEdicao] = useState<any>(null);

  const editarCategoria = (categoria: any) => {
    setCategoriaEmEdicao(categoria);
    setNovaCategoria({
      nome: categoria.nome,
      tipo: categoria.tipo,
      cor: categoria.cor
    });
    setIsCategoryModalOpen(true);
  };

  const excluirCategoria = async (nomeCategoria: string) => {
    const cat = categorias.find(c => c.nome === nomeCategoria);
    if (!cat) return;

    try {
      await categoriaAPI.deletar(cat.id);
      setCategorias(categorias.filter(c => c.id !== cat.id));
      carregarDados(); // Recarregar para atualizar transações que mudaram de categoria
    } catch (err) {
      mostrarToast("Erro ao excluir categoria", "error");
    }
  };

  const totalReceitas = transacoes
    .filter(t => t.valor > 0)
    .reduce((acc, t) => acc + t.valor, 0);

  const totalDespesas = transacoes
    .filter(t => t.valor < 0)
    .reduce((acc, t) => acc + t.valor, 0);

  const saldo = totalReceitas + totalDespesas;

  const [filtros, setFiltros] = useState({
    busca: '',
    categoria: '',
    tipo: '',
    dataInicio: '',
    dataFim: '',
    pagina: 1
  });

  const [itensPorPagina] = useState(10);

  // ===== FILTRO E PAGINAÇÃO =====

// Filtra transações por descrição, categoria,
// tipo e intervalo de datas
  const transacoesFiltradas = transacoes.filter(t => {
    const termoBusca = filtros.busca.toLowerCase();
    const catNome = categorias.find(c => c.id === t.categoriaId)?.nome || "Geral";
    const matchDescricao = t.descricao.toLowerCase().includes(termoBusca);
    const matchCategoriaBusca = catNome.toLowerCase().includes(termoBusca);
    const matchBusca = matchDescricao || matchCategoriaBusca;

    const matchCategoriaFiltro = !filtros.categoria || t.categoriaId.toString() === filtros.categoria;
    const matchTipo = !filtros.tipo || (filtros.tipo === 'receita' ? t.valor > 0 : t.valor < 0);
    const matchDataInicio = !filtros.dataInicio || t.data >= filtros.dataInicio;
    const matchDataFim = !filtros.dataFim || t.data <= filtros.dataFim;

    return matchBusca && matchCategoriaFiltro && matchTipo && matchDataInicio && matchDataFim;
  });

  const totalPaginas = Math.ceil(transacoesFiltradas.length / itensPorPagina);
  const transacoesPaginadas = transacoesFiltradas.slice(
    (filtros.pagina - 1) * itensPorPagina,
    filtros.pagina * itensPorPagina
  );

  // ===== KPIs FINANCEIROS =====

// Calcula receitas, despesas e saldo do mês atual
  const obterKPIsInteligentes = () => {
    const agora = new Date();
    const mesAtual = agora.getMonth();
    const anoAtual = agora.getFullYear();

    const transacoesMes = transacoes.filter(t => {
      const data = new Date(t.data);
      return data.getMonth() === mesAtual && data.getFullYear() === anoAtual;
    });

    const receitasMes = transacoesMes.filter(t => t.valor > 0).reduce((acc, t) => acc + t.valor, 0);
    const despesasMes = transacoesMes.filter(t => t.valor < 0).reduce((acc, t) => acc + Math.abs(t.valor), 0);

    return {
      receitasMes,
      despesasMes,
      saldoMes: receitasMes - despesasMes
    };
  };

  const kpis = obterKPIsInteligentes();

  // ===== GRÁFICO COMPARATIVO =====

// Gera os dados dos últimos 6 meses
// para exibição nos gráficos do dashboard
  const obterComparativoMeses = () => {
    const meses = [];
    const agora = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
      const nomeMes = d.toLocaleString('pt-BR', { month: 'short' });
      const transacoesMes = transacoes.filter(t => {
        const dt = new Date(t.data);
        return dt.getMonth() === d.getMonth() && dt.getFullYear() === d.getFullYear();
      });
      meses.push({
        name: nomeMes,
        receitas: transacoesMes.filter(t => t.valor > 0).reduce((acc, t) => acc + t.valor, 0),
        despesas: transacoesMes.filter(t => t.valor < 0).reduce((acc, t) => acc + Math.abs(t.valor), 0)
      });
    }
    return meses;
  };

  const chartData = obterComparativoMeses();

  const [metaEmEdicao, setMetaEmEdicao] = useState<number | null>(null);
  const [metaMensal, setMetaMensal] = useState({
    nome: '',
    mes: new Date().toISOString().split('T')[0].substring(0, 7),
    tipo: 'limite',
    limite: 0
  });
  const [modalExcluir, setModalExcluir] = useState({ aberto: false, indice: null as number | null });


  // ===== GERENCIAMENTO DE METAS =====

// Cria uma nova meta financeira mensal
  const adicionarMetaMensal = async () => {
    if (!metaMensal.nome || !metaMensal.mes || !metaMensal.limite || metaMensal.limite <= 0) {
      mostrarToast("Preencha todos os campos", "error");
      return;
    }

    const [ano, mes] = metaMensal.mes.split('-').map(Number);
    try {
      console.log(metaMensal.tipo)
      const nova = await metaAPI.criar({
        descricao: metaMensal.nome,
        valor: Math.round(metaMensal.limite * 100),
        mes,
        ano,
        tipo: metaMensal.tipo
      });

      setMetasHistorico([...metasHistorico, {
        id: `MT-${nova.id}`,
        nome: nova.descricao,
        mes: metaMensal.mes,
        tipo: nova.tipo,
        limite: metaMensal.limite,
        dataCriacao: nova.criado_em,
        dbId: nova.id
      }]);

      setMetaMensal({
        nome: '',
        mes: new Date().toISOString().split('T')[0].substring(0, 7),
        tipo: 'despesa',
        limite: 0
      });

      mostrarToast("Meta criada com sucesso!", "success");
    } catch (err) {
      mostrarToast("Erro ao criar meta", "error");
    }
  };

  const editarMeta = (indice: number) => {
    const meta = metasHistorico[indice];
    setMetaMensal({
      nome: meta.nome,
      mes: meta.mes,
      tipo: meta.tipo,
      limite: meta.limite
    });
    setMetaEmEdicao(indice);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const atualizarMetaMensal = () => {
    mostrarToast("Funcionalidade de atualização de meta em breve!", "info");
  };

  const cancelarEdicao = () => {
    setMetaMensal({
      nome: '',
      mes: new Date().toISOString().split('T')[0].substring(0, 7),
      tipo: 'despesa',
      limite: 0
    });
    setMetaEmEdicao(null);
  };

  const confirmarExclusao = async () => {
    if (modalExcluir.indice === null) return;
    const meta = metasHistorico[modalExcluir.indice];
    
    try {
      await metaAPI.deletar(meta.dbId);
      const metasAtualizadas = metasHistorico.filter((_, idx) => idx !== modalExcluir.indice);
      setMetasHistorico(metasAtualizadas);

      if (metaEmEdicao === modalExcluir.indice) cancelarEdicao();
      setModalExcluir({ aberto: false, indice: null });
      mostrarToast("Meta removida", "info");
    } catch (err) {
      mostrarToast("Erro ao excluir meta", "error");
    }
  };

  const [metaSelecionadaIdx, setMetaSelecionadaIdx] = useState<number | null>(null);

  const obterMetaParaExibicao = () => {
    if (metaSelecionadaIdx !== null && metasHistorico[metaSelecionadaIdx]) {
      return metasHistorico[metaSelecionadaIdx];
    }
    const mesAtual = new Date().toISOString().split('T')[0].substring(0, 7);
    const idxAtual = metasHistorico.findIndex(m => m.mes === mesAtual);
    if (idxAtual !== -1) return metasHistorico[idxAtual];
    return metasHistorico.length > 0 ? metasHistorico[metasHistorico.length - 1] : null;
  };

  const handleFotoChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setFotoPerfil(base64);
        localStorage.setItem("fotoPerfil", base64);
      };
      reader.readAsDataURL(file);
    }
  };

  // ===== ATUALIZAÇÃO DE PERFIL =====

// Atualiza os dados do usuário incluindo
// foto de perfil enviada via formulário
  const salvarPerfil = async () => {
  try {
    const usuario = JSON.parse(
      localStorage.getItem("usuarioLogado") || "{}"
    );

    const formData = new FormData();

    formData.append("nome", nomeEditavel);
    formData.append("email", emailEditavel);
    formData.append("senha", novaSenha || usuario.senha);

    if (foto) {
      formData.append("fotoPerfil", foto);
    }

    const response = await fetch(
        `http://localhost:5000/api/usuarios/${usuario.id}`,
        {
          method: "PUT",
          headers: {
            "x-usuario-id": usuario.id.toString(),
          },
          body: formData,
        }
      );

    if (!response.ok) {
      throw new Error("Erro ao atualizar perfil");
    }

    const usuarioAtualizado = await response.json();

    localStorage.setItem(
      "usuarioLogado",
      JSON.stringify(usuarioAtualizado)
    );

    mostrarToast("Perfil atualizado com sucesso!");
    setModalPerfilOpen(false);

  } catch (error) {
    console.error(error);
    mostrarToast("Erro ao atualizar perfil", "error");
  }
};

// ===== TELA DE AUTENTICAÇÃO =====

// Exibe a interface de login, cadastro
// e recuperação de senha quando o usuário não está autenticado
  if (!logado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl p-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800">
                Insight <span className="text-blue-600">Ledger</span>
              </h1>
              <p className="text-gray-500 mt-2">Gestão financeira inteligente</p>
            </div>

{/*// ===== PROCESSAMENTO DE LOGIN E CADASTRO =====

// Realiza autenticação do usuário ou criação de conta
// dependendo do modo selecionado */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();

                if (modoAuth === "login") {
                  try {
                    const user = await authAPI.login({ email, senha });

                    const usuarioLogado = {
                      ...user,
                      expira: Date.now() + (
                        lembrar
                          ? 30 * 24 * 60 * 60 * 1000
                          : 24 * 60 * 60 * 1000
                      )
                    };

                    localStorage.setItem(
                      "usuarioLogado",
                      JSON.stringify(usuarioLogado)
                    );

                    localStorage.setItem(
                      "usuarioId",
                      user.id.toString()
                    );

                    setLogado(true);
                    setNomeUsuario(user.nome);
                    setNomeEditavel(user.nome);
                    setEmailEditavel(user.email);

                    mostrarToast(
                      "Login realizado com sucesso!",
                      "success"
                    );

                  } catch (err: any) {

                    mostrarToast(
                      err.message || "E-mail ou senha inválidos",
                      "error"
                    );
                  }
                }

                // ===== VALIDAÇÃO DE CADASTRO =====

                // Verifica se as senhas coincidem
                if (modoAuth === "cadastro") {
                  if (senha !== confirmarSenha) {
                    mostrarToast("As senhas não coincidem", "error");
                    return;
                  }

                  // Validação de segurança da senha
                  // Exige letras maiúsculas, minúsculas,
                  // números e caracteres especiais
                  if (!regex.test(senha)) {
                    mostrarToast("Senha fraca! Use: 8+ caracteres, 1 maiúscula, 1 minúscula, 1 número, 1 símbolo", "error");
                    return;
                  }

                  try {
                    await authAPI.register({ nome: email.split('@')[0], email, senha });
                    mostrarToast("Conta criada com sucesso! Faça login.", "success");
                    // limpa os campos
                    setEmail("");
                    setSenha("");
                    setConfirmarSenha("");

                    // volta para login
                    setModoAuth("login");
                  } catch (err: any) {
                    mostrarToast(err.message || "Erro ao criar conta", "error");
                  }
                }
              }}
              className="space-y-4 text-left"
            >
              <input
                required
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 rounded-xl p-4 outline-none focus:ring-2 focus:ring-blue-500"
              />

            {/* // ===== CAMPO DE SENHA =====

            // Permite alternar entre visualizar
            // ou ocultar a senha digitada*/}

              {modoAuth !== "recuperar" && (
                <div className="relative">
                  <input
                    required
                    type={mostrarSenha ? "text" : "password"}
                    placeholder="Senha"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="w-full h-14 bg-gray-50 rounded-xl px-4 pr-12 outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute right-3 inset-y-0 flex items-center text-gray-500 hover:text-gray-700"
                  >
                    {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              )}

                {/*// ===== OPÇÕES DE LOGIN =====

                // Mantém a sessão ativa e permite
                // recuperação de senha */}
              {modoAuth === "login" && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={lembrar}
                      onChange={(e) => setLembrar(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">Lembrar de mim</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setModoAuth("recuperar")}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Esqueci minha senha
                  </button>
                </div>
              )}

                {/* // ===== RECUPERAÇÃO DE SENHA =====

                // Simula envio de recuperação de senha
                // para o e-mail informado*/}

              {modoAuth === "recuperar" && (
                <button
                  type="button"
                  onClick={() => {
                  if (!email) {
                    mostrarToast("Digite seu e-mail primeiro!", "error");
                    return;
                  }

                  mostrarToast(
                    "Link de recuperação enviado para o e-mail!",
                    "success"
                  );

                  setModoAuth("login");
                  }}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all active:scale-95"
                >
                  Recuperar senha
                </button>
              )}

                {/*// ===== CONFIRMAÇÃO DE SENHA =====

                // Campo adicional exibido apenas
                // durante o cadastro de usuário */}
              {modoAuth === "cadastro" && (
                <div className="relative">
                  <input
                    required
                    type={mostrarConfirmarSenha ? "text" : "password"}
                    placeholder="Confirmar senha"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    className="w-full h-14 bg-gray-50 rounded-xl px-4 pr-12 outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <button
                    type="button"
                    onClick={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {mostrarConfirmarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              )}

                {/* // ===== BOTÃO PRINCIPAL =====

                // Exibe ações diferentes conforme
                // o modo atual do formulário*/}
              {modoAuth !== "recuperar" && (
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all active:scale-95"
                >
                  {modoAuth === "login" && "Entrar"}
                  {modoAuth === "cadastro" && "Criar conta"}
                </button>
              )}
            </form>
              {/*
              // ===== ALTERNÂNCIA ENTRE LOGIN E CADASTRO =====

              // Permite alternar entre tela de login
              // e criação de conta */}
            <p className="text-sm text-gray-500 mt-6 text-center">
              {modoAuth === "login"
                ? "Não tem conta?"
                : modoAuth === "cadastro"
                ? "Já tem conta?"
                : "Lembrou sua senha?"}

              <button
                onClick={() =>
                  setModoAuth(modoAuth === "login" ? "cadastro" : "login")
                }
                className="text-blue-600 font-semibold ml-1 hover:underline"
              >
                {modoAuth === "login" ? "Criar conta" : "Entrar"}
              </button>
            </p>
          </div>

            {/* // ===== TOASTS / ALERTAS VISUAIS =====

            // Exibe mensagens temporárias de sucesso,
            // erro ou informação ao usuário */}

          <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
            {toasts.map((toast) => (
              <div
                key={toast.id}
                className={`
                min-w-[250px] max-w-xs p-4 rounded-xl shadow-lg text-white flex items-center justify-between gap-3
                animate-[slideIn_.3s_ease]
                ${toast.tipo === "success" ? "bg-green-500" : "bg-red-500"}
              `}
              >
                <div className="flex items-center gap-3">
                  {toast.tipo === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                  <span className="text-sm font-bold">{toast.mensagem}</span>
                </div>
                <button onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}>
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${config.darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Sidebar / Nav */}
      <nav className={`fixed bottom-0 left-0 right-0 md:top-0 md:bottom-0 md:w-24 lg:w-64 ${config.darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"} border-t md:border-r z-50 transition-all duration-500`}>
        <div className="flex md:flex-col h-full p-4 lg:p-6">
          {/* Logo Desktop */}
          <div className="hidden md:flex items-center gap-3 mb-12 px-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <TrendingUp className="text-white" size={24} />
            </div>
            <h1 className={`text-xl font-black tracking-tight lg:block hidden ${config.darkMode ? "text-white" : "text-gray-800"}`}>Insight Ledger</h1>
          </div>

          <div className="flex md:flex-col flex-1 justify-around md:justify-start gap-2 lg:gap-4">
            {[
              { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
              { id: 'transacoes', icon: FileText, label: 'Transações' },
              { id: 'categorias', icon: Tags, label: 'Categorias' },
              { id: 'metas', icon: Target, label: 'Metas' },
              { id: 'configuracoes', icon: Settings, label: 'Ajustes' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setAbaAtiva(item.id)}
                className={`flex flex-col md:flex-row items-center gap-1 lg:gap-4 p-2 lg:p-4 rounded-2xl transition-all duration-300 group ${abaAtiva === item.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-100'
                  : `${config.darkMode ? "text-gray-400 hover:bg-gray-700" : "text-gray-500 hover:bg-blue-50"}`
                  }`}
              >
                <item.icon size={24} className={abaAtiva === item.id ? 'text-white' : 'group-hover:scale-110 transition-transform'} />
                <span className="text-[10px] md:text-sm lg:text-base font-semibold">{item.label}</span>
              </button>
            ))}
          </div>

          <div className="hidden md:mt-auto md:flex flex-col gap-4">
            <div className={`p-4 rounded-2xl ${config.darkMode ? "bg-gray-700" : "bg-blue-50"} lg:block hidden`}>
              <p className="text-xs font-bold mb-1 text-blue-600">
                DICA DO DIA
              </p>

              <p className={`text-xs leading-relaxed ${config.darkMode ? "text-gray-300" : "text-blue-800"}`}>
                {dicaDoDia}
              </p>
            </div>

            <button
              onClick={() => {
                localStorage.removeItem("usuarioLogado");
                setLogado(false);
              }}
              className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${config.darkMode ? "text-gray-400 hover:bg-red-900/20 hover:text-red-400" : "text-gray-500 hover:bg-red-50 hover:text-red-600"}`}
            >
              <ArrowUpCircle className="rotate-90" size={24} />
              <span className="font-semibold lg:block hidden">Sair</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="md:ml-24 lg:ml-64 p-4 md:p-8 lg:p-12 pb-24 md:pb-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-12 gap-6">
          {/* Logo Mobile */}
          <div className="flex md:hidden items-center justify-center gap-2 order-1 md:order-1 w-full">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <TrendingUp className="text-white" size={24} />
            </div>
            <h1 className={`text-lg font-bold ${config.darkMode ? "text-white" : "text-gray-800"}`}>Insight Ledger</h1>
          </div>

          {/* Saudação do usuário */}
          <div className="text-center md:text-left order-2 md:order-1">
            <h2
              onClick={() => setAbaAtiva('dashboard')}
              className={`text-2xl md:text-3xl font-bold cursor-pointer ${config.darkMode ? "text-white" : "text-gray-800"}`}
            >
              {saudacao}, {nomeUsuario}!
            </h2>
            <p className={`${config.darkMode ? "text-gray-400" : "text-gray-500"} mt-1 text-sm md:text-base`}>
              Aqui está o resumo das suas finanças.
            </p>
          </div>

              {/* Área de notificações e perfil */}
          <div className="flex items-center justify-end gap-3 md:gap-4 order-1 md:order-2">
            <div className="relative">
              <button
                onClick={() => setAbrirNotificacoes(!abrirNotificacoes)}
                className={`p-2 rounded-xl relative transition-all ${config.darkMode ? "bg-gray-800 text-gray-400 hover:bg-gray-700" : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-100 shadow-sm"}`}
              >
                <Bell size={20} />
                {notificacoes.some(n => !n.lida) && (
                  <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                )}
              </button>

              {abrirNotificacoes && (
                <div className={`absolute right-0 mt-4 w-72 md:w-80 ${config.darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"} border rounded-3xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300`}>
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <h4 className="font-bold">Notificações</h4>
                    <button onClick={() => setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })))} className="text-xs text-blue-600 font-bold">Limpar todas</button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notificacoes.length === 0 ? (
                      <div className="p-8 text-center text-gray-400 text-sm">Nenhuma notificação</div>
                    ) : (
                      notificacoes.map(n => (
                        <div key={n.id} onClick={() => marcarComoLida(n.id)} className={`p-4 border-b border-gray-50 cursor-pointer transition-colors ${!n.lida ? 'bg-blue-50/50' : ''} hover:bg-gray-50`}>
                          <p className={`text-sm ${!n.lida ? 'font-bold text-gray-800' : 'text-gray-500'}`}>{n.texto}</p>
                          <p className="text-[10px] text-gray-400 mt-1">
                            {formatarTempoNotificacao(n.criadoEm)}
                            </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuPerfilAberto(!menuPerfilAberto)}
                className={`flex items-center gap-2 p-1 pr-2.5 rounded-xl transition-all ${config.darkMode ? "bg-gray-800 hover:bg-gray-700" : "bg-white hover:bg-gray-50 border border-gray-100 shadow-sm"}`}
              >
                <img src={fotoPerfil} alt="Perfil" className="w-8 h-8 rounded-lg object-cover" />
                <div className="text-left hidden sm:block">
                  <p className={`text-sm font-bold ${config.darkMode ? "text-white" : "text-gray-800"}`}>{nomeUsuario}</p>
                  <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Plano Free</p>
                </div>
              </button>

              {menuPerfilAberto && (
                <div className={`absolute right-0 mt-4 w-56 ${config.darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"} border rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300`}>
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setMenuPerfilAberto(false);
                        setModalPerfilOpen(true);
                      }}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all
                    ${config.darkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-600 hover:bg-blue-50"}
                  `}
                    >
                      <span>👤</span>
                      <span className="text-sm font-medium">Meu Perfil</span>
                    </button>

                    {/* EXPORTAR */}
                    <button
                      onClick={exportarDados}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all
                        ${config.darkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-600 hover:bg-blue-50"}
                      `}
                    >
                      <span>📤</span>
                      <span className="text-sm font-medium">Exportar Dados</span>
                    </button>

                    <div className="my-2 border-t border-gray-100"></div>
                    <button
                      onClick={() => {
                        localStorage.removeItem("usuarioLogado");
                        setLogado(false);
                      }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <ArrowUpCircle className="rotate-90" size={18} />
                      <span className="text-sm font-medium">Sair da conta</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

              {/* Dashboard */}
        {abaAtiva === 'dashboard' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">

              {/* Cards resumo financeiro */}
              <SummaryCard
                title="Saldo Total"
                value={config.ocultarValores ? "••••••" : formatarMoeda(saldo)}
                icon={Wallet}
                colorClass="bg-blue-600"
              />
              <SummaryCard
                title="Receitas (Mês)"
                value={config.ocultarValores ? "••••••" : formatarMoeda(kpis.receitasMes)}
                icon={TrendingUp}
                colorClass="bg-green-500"
                trend={12}
              />
              <SummaryCard
                title="Despesas (Mês)"
                value={config.ocultarValores ? "••••••" : formatarMoeda(kpis.despesasMes)}
                icon={TrendingDown}
                colorClass="bg-rose-500"
                trend={-5}
              />
              <SummaryCard
                title="Economia"
                value={config.ocultarValores ? "••••••" : formatarMoeda(kpis.saldoMes)}
                icon={Target}
                colorClass="bg-amber-500"
              />
            </div>

            {/* Gráfico de fluxo de caixa */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              <div className={`lg:col-span-2 ${config.darkMode ? "bg-gray-800" : "bg-white"} p-6 md:p-8 rounded-3xl border ${config.darkMode ? "border-gray-700" : "border-gray-100"} shadow-sm`}>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className={`text-xl font-bold ${config.darkMode ? "text-white" : "text-gray-800"}`}>Fluxo de Caixa</h3>
                    <p className="text-sm text-gray-500">Comparativo de receitas e despesas</p>
                  </div>
                </div>
                <div className="h-[300px] md:h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={config.darkMode ? "#374151" : "#f3f4f6"} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                      <Tooltip
                        cursor={{ fill: config.darkMode ? '#374151' : '#f9fafb' }}
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="receitas" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={30} />
                      <Bar dataKey="despesas" fill="#f43f5e" radius={[6, 6, 0, 0]} barSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Últimas transações */}
              <div className={`flex flex-col gap-6 md:gap-8`}>
                <div className={`${config.darkMode ? "bg-gray-800" : "bg-white"} p-6 md:p-8 rounded-3xl border ${config.darkMode ? "border-gray-700" : "border-gray-100"} shadow-sm`}>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className={`font-bold ${config.darkMode ? "text-white" : "text-gray-800"}`}>Últimas Atividades</h3>
                    <button onClick={() => setAbaAtiva('transacoes')} className="text-xs text-blue-600 font-bold hover:underline">Ver todas</button>
                  </div>
                  <div className="space-y-6">
                    {transacoes.slice(0, 4).map((t) => (
                      <div key={t.id} className="flex items-center justify-between group cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-2xl transition-transform group-hover:scale-110 ${t.valor > 0 ? 'bg-green-100 text-green-600' : 'bg-rose-100 text-rose-600'}`}>
                            {t.valor > 0 ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />}
                          </div>
                          <div>
                            <p className={`text-sm font-bold ${config.darkMode ? "text-gray-200" : "text-gray-800"}`}>{t.descricao}</p>
                            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{categorias.find(c => c.id === t.categoriaId)?.nome || "Geral"}</p>
                          </div>
                        </div>
                        <p className={`text-sm font-bold ${t.valor > 0 ? 'text-green-500' : 'text-rose-500'}`}>
                          {t.valor > 0 ? '+' : ''}{formatarMoeda(t.valor)}
                        </p>
                      </div>
                    ))}
                    {transacoes.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-sm text-gray-400">Nenhuma transação</p>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full bg-blue-600 text-white p-6 rounded-3xl font-bold shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3"
                >
                  <PlusCircle size={24} />
                  Nova Transação
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Aba de transações */}
        {abaAtiva === 'transacoes' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-8">
              <h2 className={`text-2xl font-bold ${config.darkMode ? "text-white" : "text-gray-800"}`}>Histórico de Transações</h2>
            </div>

            <div className={`${config.darkMode ? "bg-gray-800" : "bg-white"} p-4 md:p-6 rounded-2xl border ${config.darkMode ? "border-gray-700" : "border-gray-100"} mb-6`}>
              <h3 className={`font-semibold mb-4 text-sm md:text-base ${config.darkMode ? "text-white" : "text-gray-800"}`}>Filtros</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 md:gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={filtros.busca}
                    onChange={(e) => setFiltros({ ...filtros, busca: e.target.value, pagina: 1 })}
                    className={`w-full pl-10 p-3 rounded-xl border text-sm ${config.darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-200"}`}
                  />
                </div>
                <select
                  value={filtros.categoria}
                  onChange={(e) => setFiltros({ ...filtros, categoria: e.target.value, pagina: 1 })}
                  className={`p-3 rounded-xl border text-sm ${config.darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-200"}`}
                >
                  <option value="">Todas Categorias</option>
                  {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
                <select
                  value={filtros.tipo}
                  onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value, pagina: 1 })}
                  className={`p-3 rounded-xl border text-sm ${config.darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-200"}`}
                >
                  <option value="">Todos Tipos</option>
                  <option value="receita">Receitas</option>
                  <option value="despesa">Despesas</option>
                </select>
                <input
                  type="date"
                  value={filtros.dataInicio}
                  onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value, pagina: 1 })}
                  className={`p-3 rounded-xl border text-sm ${config.darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-200"}`}
                />
                <input
                  type="date"
                  value={filtros.dataFim}
                  onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value, pagina: 1 })}
                  className={`p-3 rounded-xl border text-sm ${config.darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-200"}`}
                />
              </div>
            </div>

            <div className={`${config.darkMode ? "bg-gray-800" : "bg-white"} rounded-3xl border ${config.darkMode ? "border-gray-700" : "border-gray-100"} shadow-sm overflow-hidden`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className={`text-[10px] uppercase font-black tracking-widest ${config.darkMode ? "bg-gray-700/50 text-gray-400" : "bg-gray-50 text-gray-500"}`}>
                      <th className="p-6">Descrição</th>
                      <th className="p-6">Categoria</th>
                      <th className="p-6">Data</th>
                      <th className="p-6 text-right">Valor</th>
                      <th className="p-6 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                    {transacoesPaginadas.map((t) => (
                      <tr key={t.id} className={`group transition-colors ${config.darkMode ? "hover:bg-gray-700/30" : "hover:bg-blue-50/30"}`}>
                        <td className="p-6">
                          <p className={`font-bold ${config.darkMode ? "text-gray-200" : "text-gray-800"}`}>{t.descricao}</p>
                        </td>
                        <td className="p-6">
                          <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${config.darkMode ? "bg-gray-700 text-gray-300" : "bg-blue-50 text-blue-600"}`}>
                            {categorias.find(c => c.id === t.categoriaId)?.nome || "Geral"}
                          </span>
                        </td>
                        <td className="p-6 text-sm text-gray-500">
                          {new Date(t.data).toLocaleDateString('pt-BR')}
                        </td>
                        <td className={`p-6 text-right font-black ${t.valor > 0 ? 'text-green-500' : 'text-rose-500'}`}>
                          {formatarMoeda(t.valor)}
                        </td>
                        <td className="p-6">
                          <div className="flex justify-center gap-2">
                            <button onClick={() => editarTransacao(t)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-xl transition"><Edit2 size={18} /></button>
                            <button onClick={() => excluirTransacao(t.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-xl transition"><Trash2 size={18} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {transacoesFiltradas.length === 0 && (
                <div className="p-20 text-center">
                  <EmptyState icon={Search} title="Nenhuma transação encontrada" description="Tente ajustar seus filtros de busca." />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Aba de metas */}
        {abaAtiva === 'metas' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="space-y-8">
                <div className={`${config.darkMode ? "bg-gray-800" : "bg-white"} p-8 rounded-3xl border ${config.darkMode ? "border-gray-700" : "border-gray-100"} shadow-sm`}>
                  <h3 className={`text-xl font-bold mb-6 ${config.darkMode ? "text-white" : "text-gray-800"}`}>
                    {metaEmEdicao !== null ? 'Editar Meta' : 'Nova Meta'}

                    {/* Formulário de metas */}
                  </h3>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase ml-1">Nome da Meta</label>
                      <input
                        type="text"
                        placeholder="Ex: Reserva de Emergência"
                        value={metaMensal.nome}
                        onChange={(e) => setMetaMensal({ ...metaMensal, nome: e.target.value })}
                        className={`w-full p-4 rounded-2xl border transition-all ${config.darkMode ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500" : "bg-gray-50 border-gray-200 focus:border-blue-500 focus:bg-white"}`}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase ml-1">Mês</label>
                        <input
                          type="month"
                          value={metaMensal.mes}
                          onChange={(e) => setMetaMensal({ ...metaMensal, mes: e.target.value })}
                          className={`w-full p-4 rounded-2xl border transition-all ${config.darkMode ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500" : "bg-gray-50 border-gray-200 focus:border-blue-500 focus:bg-white"}`}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase ml-1">Tipo</label>
                        <select
                          value={metaMensal.tipo}
                          onChange={(e) => setMetaMensal({ ...metaMensal, tipo: e.target.value as any })}
                          className={`w-full p-4 rounded-2xl border transition-all ${config.darkMode ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500" : "bg-gray-50 border-gray-200 focus:border-blue-500 focus:bg-white"}`}
                        >
                          <option value="limite">Gasto</option>
                          <option value="economia">Economia</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase mb-2 block ml-1">Valor Limite</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">R$</span>
                        <input
                          type="number"
                          placeholder="0,00"
                          value={metaMensal.limite || ''}
                          onChange={(e) => setMetaMensal({ ...metaMensal, limite: parseFloat(e.target.value) })}
                          className={`w-full pl-12 p-4 rounded-2xl border transition-all ${config.darkMode ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500" : "bg-gray-50 border-gray-200 focus:border-blue-500 focus:bg-white"}`}
                        />
                      </div>
                    </div>
                    <button
                      onClick={metaEmEdicao !== null ? atualizarMetaMensal : adicionarMetaMensal}
                      className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      {metaEmEdicao !== null ? 'Atualizar Meta' : 'Salvar Meta'}
                    </button>
                    {metaEmEdicao !== null && (
                      <button onClick={cancelarEdicao} className="w-full bg-gray-100 text-gray-500 py-4 rounded-2xl font-bold hover:bg-gray-200 transition-all">Cancelar</button>
                    )}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-8">
                {obterMetaParaExibicao() ? (
                  <div className={`${config.darkMode ? "bg-gray-800" : "bg-white"} p-8 rounded-3xl border ${config.darkMode ? "border-gray-700" : "border-gray-100"} shadow-sm relative overflow-hidden`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4 relative z-10">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-[10px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-md">{obterMetaParaExibicao().id}</span>
                          <h3 className={`text-xl font-bold ${config.darkMode ? "text-white" : "text-gray-800"}`}>{obterMetaParaExibicao().nome}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            className={`text-xs font-bold py-1 px-2 rounded-lg border cursor-pointer transition-all ${config.darkMode ? "bg-gray-700 border-gray-600 text-blue-400 hover:border-blue-500" : "bg-gray-50 border-gray-200 text-blue-600 hover:border-blue-400"}`}
                            value={metaSelecionadaIdx !== null ? metaSelecionadaIdx : (metasHistorico.findIndex(m => m.mes === new Date().toISOString().split('T')[0].substring(0, 7)))}
                            onChange={(e) => setMetaSelecionadaIdx(e.target.value === "" ? null : parseInt(e.target.value))}
                          >
                            <option value="">Mês Atual (Auto)</option>
                            {metasHistorico.map((m, i) => (
                              <option key={i} value={i}>{m.nome} ({m.mes})</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className={`px-4 py-2 rounded-xl font-bold text-sm self-start ${obterMetaParaExibicao().tipo === 'limite' ? 'bg-rose-100 text-rose-600' : 'bg-green-100 text-green-600'}`}>
                        {obterMetaParaExibicao().tipo === 'limite' ? 'Limite de Gastos' : 'Meta de Economia'}
                      </div>
                    </div>

                    {(() => {
                      const meta = obterMetaParaExibicao();
                      const transacoesPeriodo = transacoes.filter(t => t.data.startsWith(meta.mes));
                      let totalPeriodo = 0;

                      if (meta.tipo === "limite") {
                        totalPeriodo = transacoesPeriodo
                          .filter(t => t.tipo === "despesa")
                          .reduce((acc, t) => acc + Math.abs(t.valor), 0);
                      } else {
                        const receitas = transacoesPeriodo
                          .filter(t => t.tipo === "receita")
                          .reduce((acc, t) => acc + Math.abs(t.valor), 0);

                        const despesas = transacoesPeriodo
                          .filter(t => t.tipo === "despesa")
                          .reduce((acc, t) => acc + Math.abs(t.valor), 0);

                        totalPeriodo = receitas - despesas;
                      }
                      const porcentagem = Math.min((totalPeriodo / meta.limite) * 100, 100);
                      const corProgresso = meta.tipo === 'limite' ? (porcentagem > 90 ? 'bg-rose-500' : (porcentagem > 70 ? 'bg-amber-500' : 'bg-blue-600')) : (porcentagem === 100 ? 'bg-green-500' : 'bg-blue-600');

                      {/* Progresso da meta atual */}
                      return (
                        <div className="space-y-8 relative z-10">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-1">
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Progresso Atual</p>
                              <h4 className={`text-4xl font-black ${config.darkMode ? "text-white" : "text-gray-800"}`}>{formatarMoeda(totalPeriodo)}</h4>
                            </div>
                            <div className="md:text-right space-y-1">
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Meta Definida</p>
                              <p className={`text-2xl font-bold ${config.darkMode ? "text-gray-300" : "text-gray-700"}`}>{formatarMoeda(meta.limite)}</p>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div className="w-full h-5 bg-gray-100 rounded-2xl overflow-hidden p-1">
                              <div className={`h-full rounded-xl transition-all duration-1000 ease-out shadow-sm ${corProgresso}`} style={{ width: `${porcentagem}%` }}></div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className={`text-lg font-black ${porcentagem > 90 ? 'text-rose-500' : 'text-blue-600'}`}>{porcentagem.toFixed(1)}%</span>
                              <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Concluído</span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <div className={`${config.darkMode ? "bg-gray-800" : "bg-white"} p-16 rounded-3xl border border-dashed ${config.darkMode ? "border-gray-700" : "border-gray-200"} text-center`}>
                    <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Target className="text-blue-600" size={40} />
                    </div>
                    <h4 className={`text-xl font-bold mb-2 ${config.darkMode ? "text-white" : "text-gray-800"}`}>Nenhuma meta selecionada</h4>
                  </div>
                )}

                {/* Histórico de metas */}
                <div className={`${config.darkMode ? "bg-gray-800" : "bg-white"} p-8 rounded-3xl border ${config.darkMode ? "border-gray-700" : "border-gray-100"} shadow-sm`}>
                  <h3 className={`text-xl font-bold mb-8 ${config.darkMode ? "text-white" : "text-gray-800"}`}>Histórico</h3>
                  <div className="overflow-x-auto">
                    {metasHistorico.length > 0 ? (
                      <table className="w-full text-left border-separate border-spacing-y-3">
                        <thead>
                          <tr className="text-[10px] uppercase text-gray-400 font-black tracking-widest">
                            <th className="px-4 pb-2">ID / Nome</th>
                            <th className="px-4 pb-2">Mês</th>
                            <th className="px-4 pb-2 text-right">Limite</th>
                            <th className="px-4 pb-2 text-center">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {metasHistorico.map((meta, idx) => (
                            <tr key={idx} className={`group transition-all ${config.darkMode ? "hover:bg-gray-700/50" : "hover:bg-gray-50"}`}>
                              <td className="px-4 py-4 rounded-l-2xl">
                                <div className="flex flex-col">
                                  <span className="text-[9px] font-black text-blue-500 uppercase">{meta.id}</span>
                                  <span className={`font-bold ${config.darkMode ? "text-gray-300" : "text-gray-700"}`}>{meta.nome}</span>
                                </div>
                              </td>
                              <td className={`px-4 py-4 font-medium ${config.darkMode ? "text-gray-400" : "text-gray-500"}`}>{meta.mes}</td>
                              <td className={`px-4 py-4 text-right font-black ${config.darkMode ? "text-gray-300" : "text-gray-700"}`}>{formatarMoeda(meta.limite)}</td>
                              <td className="px-4 py-4 rounded-r-2xl text-center">
                                <div className="flex justify-center gap-1">
                                  <button onClick={() => editarMeta(idx)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-xl transition"><Edit2 size={16} /></button>
                                  <button onClick={() => setModalExcluir({ aberto: true, indice: idx })} className="p-2 text-red-600 hover:bg-red-100 rounded-xl transition"><Trash2 size={16} /></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="text-center text-gray-400 py-10">Nenhuma meta registrada.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

                    {/* Modal de confirmação para excluir metas */}
            {modalExcluir.aberto && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4">
                <div className={`${config.darkMode ? "bg-gray-800" : "bg-white"} w-full max-w-sm rounded-3xl p-8 shadow-2xl`}>
                  <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Trash2 className="text-red-600" size={30} />
                  </div>
                  <h3 className={`text-xl font-bold text-center mb-2 ${config.darkMode ? "text-white" : "text-gray-800"}`}>Excluir Meta?</h3>
                  <p className="text-gray-500 text-center text-sm mb-8">
                    Tem certeza que deseja excluir a meta <span className="font-bold text-red-500">"{metasHistorico[modalExcluir.indice!]?.nome}"</span>? Esta ação não pode ser desfeita.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setModalExcluir({ aberto: false, indice: null })}
                      className="flex-1 py-4 rounded-2xl font-bold bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={confirmarExclusao}
                      className="flex-1 py-4 rounded-2xl font-bold bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-200 transition-all"
                    >
                      Sim, Excluir
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Aba de gerenciamento de categorias */}
        {abaAtiva === 'categorias' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-8">
              <h2 className={`text-2xl font-bold ${config.darkMode ? "text-white" : "text-gray-800"}`}>Gerenciar Categorias</h2>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsDeleteCategoryModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-600 font-bold text-sm hover:bg-red-100 transition-all"
                >
                  <Trash2 size={18} />
                  Excluir
                </button>
                <button
                  onClick={() => {
                    setCategoriaEmEdicao(null);
                    setNovaCategoria({ nome: '', tipo: 'despesa', cor: '#3b82f6' });
                    setIsCategoryModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                >
                  <Plus size={18} />
                  Nova Categoria
                </button>
              </div>
            </div>

                  {/* Cards das categorias cadastradas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {categorias.map((cat) => (
                <div
                  key={cat.id}
                  className={`${config.darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"} p-6 rounded-3xl border shadow-sm hover:shadow-md transition-all group relative`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: cat.cor }}>
                      <Tags size={24} />
                    </div>
                    <button
                      onClick={() => editarCategoria(cat)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Edit2 size={18} />
                    </button>
                  </div>
                  <h4 className={`font-bold text-lg ${config.darkMode ? "text-white" : "text-gray-800"}`}>{cat.nome}</h4>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">{cat.tipo}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Aba de configurações do sistema */}
        {abaAtiva === 'configuracoes' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
          
          <h2
            className={`text-2xl font-bold mb-8 ${
              config.darkMode ? "text-white" : "text-gray-800"
            }`}
          >
            Configurações do Sistema
          </h2>

          <div className="space-y-6">

            {/* PREFERÊNCIAS */}
            <section
              className={`${
                config.darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-100"
              } p-8 rounded-3xl border shadow-sm`}
            >
              <h3
                className={`text-lg font-bold mb-6 flex items-center gap-2 ${
                  config.darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                <Settings size={20} className="text-blue-600" />
                Preferências de Exibição
              </h3>

              <div className="space-y-6">

                {/* DARK MODE */}
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className={`font-bold ${
                        config.darkMode ? "text-gray-200" : "text-gray-800"
                      }`}
                    >
                      Modo Escuro
                    </p>

                    <p className="text-sm text-gray-500">
                      Ajusta a interface para ambientes com pouca luz
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      setConfig({
                        ...config,
                        darkMode: !config.darkMode,
                      })
                    }
                    className={`w-14 h-7 rounded-full transition-all relative ${
                      config.darkMode ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-sm ${
                        config.darkMode ? "left-8" : "left-1"
                      }`}
                    />
                  </button>
                </div>

                {/* OCULTAR VALORES */}
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className={`font-bold ${
                        config.darkMode ? "text-gray-200" : "text-gray-800"
                      }`}
                    >
                      Ocultar Valores
                    </p>

                    <p className="text-sm text-gray-500">
                      Privacidade ao usar em locais públicos
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      setConfig({
                        ...config,
                        ocultarValores: !config.ocultarValores,
                      })
                    }
                    className={`w-14 h-7 rounded-full transition-all relative ${
                      config.ocultarValores ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-sm ${
                        config.ocultarValores ? "left-8" : "left-1"
                      }`}
                    />
                  </button>
                </div>

              </div>
            </section>

            {/* SEGURANÇA */}
            <section
              className={`${
                config.darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-100"
              } p-8 rounded-3xl border shadow-sm`}
            >
              <h3
                className={`text-lg font-bold mb-6 flex items-center gap-2 ${
                  config.darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                🔒 Segurança da Conta
              </h3>

              <div className="flex items-center justify-between">
                <div>
                  <p
                    className={`font-bold ${
                      config.darkMode ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    Excluir Conta
                  </p>

                  <p className="text-sm text-gray-500">
                    Essa ação remove permanentemente sua conta e todos os dados.
                  </p>
                </div>

                <button
                  onClick={excluirConta}
                  className="px-5 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition"
                >
                  Excluir
                </button>
              </div>
            </section>

          </div>
        </div>
      )}
      </main>

      {/* MODAIS */}
      {/* Modal de criação/edição de transações */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
          <div className={`${config.darkMode ? "bg-gray-800" : "bg-white"} w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300`}>
            <div className="flex justify-between items-center mb-8">
              <h3 className={`text-2xl font-bold ${config.darkMode ? "text-white" : "text-gray-800"}`}>
                {transacaoEmEdicao ? 'Editar Transação' : 'Nova Transação'}
              </h3>
              <button onClick={() => { setIsModalOpen(false); setTransacaoEmEdicao(null); }} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={24} /></button>
            </div>
            {/* Formulário da transação */}
            <form onSubmit={handleSalvar} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Descrição</label>
                <input
                  type="text"
                  placeholder="Ex: Aluguel, Salário..."
                  required
                  value={novaTransacao.descricao}
                  onChange={(e) => setNovaTransacao({ ...novaTransacao, descricao: e.target.value })}
                  className={`w-full p-4 rounded-2xl border transition-all ${config.darkMode ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500" : "bg-gray-50 border-gray-200 focus:border-blue-500 focus:bg-white"}`}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Valor</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">R$</span>
                    <input
                      type="text"
                      placeholder="0,00"
                      required
                      value={novaTransacao.valor}
                      onChange={(e) => setNovaTransacao({ ...novaTransacao, valor: formatarValor(e.target.value) })}
                      className={`w-full pl-12 p-4 rounded-2xl border transition-all ${config.darkMode ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500" : "bg-gray-50 border-gray-200 focus:border-blue-500 focus:bg-white"}`}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Tipo</label>
                  <select
                    value={novaTransacao.tipo}
                    onChange={(e) => setNovaTransacao({ ...novaTransacao, tipo: e.target.value })}
                    className={`w-full p-4 rounded-2xl border transition-all ${config.darkMode ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500" : "bg-gray-50 border-gray-200 focus:border-blue-500 focus:bg-white"}`}
                  >
                    <option value="despesa">Despesa</option>
                    <option value="receita">Receita</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Categoria</label>
                <select
                  required
                  value={novaTransacao.categoria}
                  onChange={(e) => setNovaTransacao({ ...novaTransacao, categoria: e.target.value })}
                  className={`w-full p-4 rounded-2xl border transition-all ${config.darkMode ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500" : "bg-gray-50 border-gray-200 focus:border-blue-500 focus:bg-white"}`}
                >
                  <option value="">Selecione uma categoria</option>
                  {categorias.filter(c => c.tipo === novaTransacao.tipo).map(c => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Data</label>
                <input
                  type="date"
                  required
                  value={novaTransacao.data}
                  onChange={(e) => setNovaTransacao({ ...novaTransacao, data: e.target.value })}
                  className={`w-full p-4 rounded-2xl border transition-all ${config.darkMode ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500" : "bg-gray-50 border-gray-200 focus:border-blue-500 focus:bg-white"}`}
                />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95">
                {transacaoEmEdicao ? 'Atualizar Transação' : 'Salvar Transação'}
              </button>
            </form>
          </div>
        </div>
      )}


      {/* Modal de criação/edição de categorias */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
          <div className={`${config.darkMode ? "bg-gray-800" : "bg-white"} w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300`}>
            <div className="flex justify-between items-center mb-8">
              <h3 className={`text-2xl font-bold ${config.darkMode ? "text-white" : "text-gray-800"}`}>
                {categoriaEmEdicao ? 'Editar Categoria' : 'Nova Categoria'}
              </h3>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (validarCategoriaDuplicada(novaCategoria.nome, novaCategoria.tipo) && !categoriaEmEdicao) {
                mostrarToast("Esta categoria já existe!", "error");
                return;
              }
              try {
                if (categoriaEmEdicao) {
                  const atualizada = await categoriaAPI.atualizar(categoriaEmEdicao.id, novaCategoria);
                  setCategorias(categorias.map(c => c.id === categoriaEmEdicao.id ? atualizada : c));
                  mostrarToast("Categoria atualizada!");
                } else {
                  const nova = await categoriaAPI.criar(novaCategoria);
                  setCategorias([...categorias, nova]);
                  mostrarToast("Categoria criada!");
                }
                setIsCategoryModalOpen(false);
              } catch (err) {
                mostrarToast("Erro ao salvar categoria", "error");
              }
            }} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Nome</label>
                <input
                  type="text"
                  placeholder="Ex: Alimentação, Lazer..."
                  required
                  value={novaCategoria.nome}
                  onChange={(e) => setNovaCategoria({ ...novaCategoria, nome: e.target.value })}
                  className={`w-full p-4 rounded-2xl border transition-all ${config.darkMode ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500" : "bg-gray-50 border-gray-200 focus:border-blue-500 focus:bg-white"}`}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Tipo</label>
                <select
                  value={novaCategoria.tipo}
                  onChange={(e) => setNovaCategoria({ ...novaCategoria, tipo: e.target.value as any })}
                  className={`w-full p-4 rounded-2xl border transition-all ${config.darkMode ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500" : "bg-gray-50 border-gray-200 focus:border-blue-500 focus:bg-white"}`}
                >
                  <option value="despesa">Despesa</option>
                  <option value="receita">Receita</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Cor</label>
                <input
                  type="color"
                  value={novaCategoria.cor}
                  onChange={(e) => setNovaCategoria({ ...novaCategoria, cor: e.target.value })}
                  className="w-full h-14 rounded-2xl cursor-pointer p-1 bg-transparent"
                />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95">
                {categoriaEmEdicao ? 'Atualizar Categoria' : 'Criar Categoria'}
              </button>
            </form>
          </div>
        </div>
      )}


      {/* Modal para exclusão de categorias */}
      {isDeleteCategoryModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
          <div className={`${config.darkMode ? "bg-gray-800" : "bg-white"} rounded-3xl w-full max-w-sm p-8 shadow-2xl animate-in zoom-in-95 duration-300`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-2xl font-bold ${config.darkMode ? "text-white" : "text-gray-800"}`}>Excluir Categoria</h2>
              <button onClick={() => setIsDeleteCategoryModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <div className="space-y-4">
              <select
                value={categoriaSelecionada}
                onChange={(e) => setCategoriaSelecionada(e.target.value)}
                className={`w-full p-3 rounded-xl ${config.darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-200"} border`}
              >
                <option value="">Selecione uma categoria</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.nome}>{cat.nome}</option>
                ))}
              </select>
              <button
                disabled={!categoriaSelecionada || confirmandoExclusao}
                onClick={() => {
                  setConfirmandoExclusao(true);
                  setTimeout(() => {
                    excluirCategoria(categoriaSelecionada);
                    setConfirmandoExclusao(false);
                    setIsDeleteCategoryModalOpen(false);
                    setCategoriaSelecionada("");
                    mostrarToast("Categoria excluída com sucesso");
                  }, 1000);
                }}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
              >
                {confirmandoExclusao ? "Excluindo..." : "Confirmar Exclusão"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de perfil do usuário */}
      {modalPerfilOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
          <div className={`w-full max-w-md p-8 rounded-3xl shadow-2xl transform animate-in zoom-in-95 duration-300 ${config.darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"}`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Meu Perfil</h2>
              <button onClick={() => setModalPerfilOpen(false)} className="text-gray-400 hover:text-red-500 transition">✕</button>
            </div>
            <div className="flex flex-col items-center mb-6">
              <img src={fotoPerfil} className="w-20 h-20 rounded-full border-4 border-blue-500 shadow-md mb-3" />
              <label className="text-sm text-blue-600 font-semibold cursor-pointer hover:underline">
                Alterar foto
                <input type="file" className="hidden" onChange={handleFotoChange} />
              </label>
            </div>
            <div className="space-y-4">

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-500">
                  Nome
                </label>

                <input
                  type="text"
                  value={nomeEditavel}
                  onChange={(e) => setNomeEditavel(e.target.value)}
                  placeholder="Seu nome"
                  className={`w-full p-4 rounded-2xl border transition-all outline-none ${
                    config.darkMode
                      ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500"
                      : "bg-gray-50 border-gray-200 text-gray-800 focus:border-blue-500"
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-500">
                  E-mail
                </label>

                <input
                  type="email"
                  value={emailEditavel}
                  onChange={(e) => setEmailEditavel(e.target.value)}
                  placeholder="Seu e-mail"
                  className={`w-full p-4 rounded-2xl border transition-all outline-none ${
                    config.darkMode
                      ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500"
                      : "bg-gray-50 border-gray-200 text-gray-800 focus:border-blue-500"
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-500">
                  Nova senha
                </label>

                <input
                  type="password"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="Digite uma nova senha"
                  className={`w-full p-4 rounded-2xl border transition-all outline-none ${
                    config.darkMode
                      ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500"
                      : "bg-gray-50 border-gray-200 text-gray-800 focus:border-blue-500"
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-500">
                  Confirmar senha
                </label>

                <input
                  type="password"
                  value={confirmarNovaSenha}
                  onChange={(e) => setConfirmarNovaSenha(e.target.value)}
                  placeholder="Confirme sua senha"
                  className={`w-full p-4 rounded-2xl border transition-all outline-none ${
                    config.darkMode
                      ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500"
                      : "bg-gray-50 border-gray-200 text-gray-800 focus:border-blue-500"
                  }`}
                />
              </div>

            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModalPerfilOpen(false)} className="flex-1 py-3 rounded-xl bg-gray-200 hover:bg-gray-300 transition font-semibold text-gray-800">Cancelar</button>
              <button onClick={salvarPerfil} className="flex-1 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition font-bold shadow-lg">Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmação para excluir conta */}
      {modalExcluirConta && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
        <div
          className={`
            w-full max-w-md p-8 rounded-3xl shadow-2xl
            animate-in zoom-in-95 duration-300
            ${config.darkMode
              ? "bg-gray-800 text-white"
              : "bg-white text-gray-800"}
          `}
        >
          <div className="text-center">
            <div className="text-5xl mb-4">⚠️</div>

            <h2 className="text-2xl font-bold mb-2">
              Excluir Conta
            </h2>

            <p className="text-gray-500 mb-8">
              Tem certeza? Essa ação não poderá ser desfeita.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setModalExcluirConta(false)}
                className="
                  flex-1 py-3 rounded-xl
                  bg-gray-200 hover:bg-gray-300
                  text-gray-800 font-semibold
                  transition-all
                "
              >
                Cancelar
              </button>

              <button
                onClick={async () => {
                  await excluirConta();
                  setModalExcluirConta(false);
                }}
                className="
                  flex-1 py-3 rounded-xl
                  bg-red-500 hover:bg-red-600
                  text-white font-bold
                  transition-all active:scale-95
                "
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

      {/* Sistema global de notificações (Toasts) */}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`min-w-[250px] max-w-xs p-4 rounded-xl shadow-lg text-white flex items-center justify-between gap-3 animate-in slide-in-from-right-4 ${toast.tipo === "success" ? "bg-green-500" : "bg-red-500"}`}
          >
            <div className="flex items-center gap-3">
              {toast.tipo === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              <span className="text-sm font-bold">{toast.mensagem}</span>
            </div>
            <button onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}>
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
