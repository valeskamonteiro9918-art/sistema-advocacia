import React, { useMemo, useState } from 'react';

// Passo a passo de como usar o sistema. Texto simples, em ordem, com botão para abrir a tela certa.

type Guia = { id: string; grupo: string; titulo: string; quando: string; passos: string[]; dica?: string; ir?: { tab: string; rotulo: string } };

const GUIAS: Guia[] = [
  { id: 'comecar', grupo: 'Primeiros passos', titulo: 'Entrar e escolher quem está usando', quando: 'Todo dia, ao abrir o sistema.',
    passos: ['Entre com seu e-mail e senha.', 'Se aparecer "Quem está usando?", escolha Dra. Valeska ou Dra. Dayane. Assim o "Meu painel" mostra só o que é seu.', 'Para trocar de pessoa, clique em "trocar", ao lado de "Entrou como", no Dashboard.', 'Quando atualizar a página, o sistema continua na mesma tela. O Dashboard só abre sozinho no primeiro acesso.'],
    dica: 'No celular, o menu abre pelo botão ☰ no topo, e fecha sozinho quando você escolhe uma tela.' },
  { id: 'mapa', grupo: 'Primeiros passos', titulo: 'Para que serve cada menu', quando: 'Se você não sabe onde fica algo.',
    passos: ['Dashboard: resumo do dia (Meu painel) e números do escritório (Painel do escritório).', 'Processos: lista de todos os processos, separados por área.', 'Prazos e Agenda: prazos, calendário e intimações que chegam pelo Gmail.', 'Tarefas: quadro com o que precisa ser feito.', 'Clientes: clientes ativos e quem está em captação (contatos novos).', 'Financeiro: o que entrou, o que falta receber e o que foi pago.', 'Documentos: modelos de petição e arquivos do escritório.', 'Calculadoras: calculadora trabalhista e gasto mensal da criança.'] },

  { id: 'novo-contato', grupo: 'Clientes e processos', titulo: 'Anotar um contato novo (captação)', quando: 'Alguém chamou no WhatsApp ou Instagram pedindo informação.',
    passos: ['Abra Clientes e clique na aba "Em captação".', 'Clique em "Novo contato".', 'Preencha nome, telefone e de onde veio. O resto é opcional.', 'Salve. O contato aparece na lista, na fase "Novo contato".', 'Conforme a conversa andar, mude a fase: Em conversa, Consulta agendada, Proposta enviada, Contratado ou Perdido.'],
    dica: 'Se a pessoa desistir, marque "Perdido" e escolha o motivo. Isso ajuda a ver, depois, por que se perdem contatos.', ir: { tab: 'crm', rotulo: 'Abrir Clientes' } },
  { id: 'contratou', grupo: 'Clientes e processos', titulo: 'Quando o contato fecha contrato', quando: 'A pessoa aceitou a proposta.',
    passos: ['Em Clientes, aba "Em captação", ache o contato.', 'Clique em "Contratou: abrir caso". O botão aparece nas fases "Consulta agendada" e "Proposta enviada".', 'Confirme. O sistema cria o cliente, as parcelas de honorários e a tarefa de abertura do caso.', 'Abre a tela do financeiro do cliente. Confira o valor e as datas.'] },
  { id: 'cliente', grupo: 'Clientes e processos', titulo: 'Cadastrar um cliente direto', quando: 'Cliente que já vem contratado, sem passar pela captação.',
    passos: ['Abra Clientes, aba "Clientes ativos".', 'Clique em "Cadastrar Cliente".', 'Preencha nome, CPF/CNPJ e telefone. O telefone é o que o botão de WhatsApp usa.', 'Salve. Para corrigir depois, clique no lápis do cliente.'],
    dica: 'Escreva o nome completo, igual ao documento. Assim o sistema liga o cliente aos processos e ao financeiro sem duplicar.', ir: { tab: 'crm', rotulo: 'Abrir Clientes' } },
  { id: 'processo', grupo: 'Clientes e processos', titulo: 'Cadastrar um processo', quando: 'Processo novo no escritório.',
    passos: ['Abra Processos e clique em "Adicionar Processo".', 'Digite o número do processo e o nome do cliente (a lista sugere os já cadastrados).', 'Escolha a área clicando num botão: Trabalhista, Família, Cível ou Outras áreas.', 'Preencha a ação e a vara ou tribunal. Valores e responsável são opcionais.', 'Salve. Para mudar algo depois, clique no lápis ao lado do número.'],
    dica: 'Para ver só uma área, use os botões no topo da lista (Trabalhista, Família, Cível...).', ir: { tab: 'processes', rotulo: 'Abrir Processos' } },
  { id: 'andamentos', grupo: 'Clientes e processos', titulo: 'Acompanhar as movimentações', quando: 'Para saber se o processo andou.',
    passos: ['Em Processos, clique em "Verificar movimentações" para o sistema consultar os processos.', 'O aviso azul no topo mostra quantos processos estão sem verificação recente.', 'Dentro de cada processo, "Abrir processo" mostra as movimentações registradas.', 'Para trazer processos que chegaram por e-mail, use "Importar do Gmail".'] },

  { id: 'prazo', grupo: 'Prazos e tarefas', titulo: 'Cadastrar um prazo ou audiência', quando: 'Prazo, audiência ou compromisso com data.',
    passos: ['No Dashboard, clique em "+ Cadastrar prazo ou compromisso".', 'Preencha o título, o cliente, a data e o tipo.', 'Salve. Ele aparece em Prazos e Agenda, no calendário e no seu "Meu painel".', 'Quando cumprir, clique no prazo para abri-lo e mude a situação para Concluído. Ele sai da lista de pendentes e vai para "Cumpridos".'],
    dica: 'Em Prazos e Agenda há três abas: Prazos (lista por urgência), Agenda (calendário) e Intimações do Gmail.', ir: { tab: 'agenda', rotulo: 'Abrir Prazos e Agenda' } },
  { id: 'feriados', grupo: 'Prazos e tarefas', titulo: 'Cadastrar feriado da comarca', quando: 'Feriado municipal ou suspensão do tribunal que muda a contagem do prazo.',
    passos: ['Abra Configurações e vá em "Feriados e suspensões por comarca".', 'Escolha onde vale: só uma comarca (cidade), o estado todo ou o país todo.', 'Escolha o estado e escreva a comarca, igual ao que está no processo.', 'Informe a data (e "Até", se for mais de um dia) e o nome. Marque "Repete todo ano" se for feriado fixo.', 'Clique em "Cadastrar feriado". Só os prazos dos processos daquela comarca passam a usar a data.'],
    dica: 'Em cada processo, confira o Estado e a Comarca (lápis do processo). Se deixar em "Automático", o sistema lê pelo tribunal, como TJES ou TRT17.', ir: { tab: 'settings', rotulo: 'Abrir Configurações' } },
  { id: 'intimacoes', grupo: 'Prazos e tarefas', titulo: 'Intimações que chegam pelo Gmail', quando: 'Quando o tribunal manda aviso por e-mail.',
    passos: ['Abra Prazos e Agenda e clique na aba "Intimações do Gmail".', 'Veja as pendentes. O número entre parênteses é quantas faltam tratar.', 'Leia cada uma. Se já resolveu, marque como lida. Se tiver data a cumprir, envie para a agenda, e ela vira prazo.'], ir: { tab: 'agenda', rotulo: 'Abrir Prazos e Agenda' } },
  { id: 'tarefa', grupo: 'Prazos e tarefas', titulo: 'Criar uma tarefa', quando: 'Algo para fazer que não é prazo de processo.',
    passos: ['Abra Tarefas.', 'Digite o nome da tarefa e clique em "Criar Tarefa".', 'Clique no cartão para abrir a edição completa: responsável, prazo, checklist e anexos.', 'Mude de coluna conforme avança: A fazer, Em andamento, Em revisão e Concluída.'], ir: { tab: 'tasks', rotulo: 'Abrir Tarefas' } },

  { id: 'parcelas', grupo: 'Dinheiro', titulo: 'Combinar honorários com um cliente (entrada e parcelas)', quando: 'Cliente contratou e vai pagar em parcelas.',
    passos: ['Abra Clientes e clique em "Financeiro" no cartão do cliente. (Ou, em Financeiro, "Plano de pagamento de um cliente".)', 'Informe o valor total, o valor da entrada, o número de parcelas e a data do primeiro vencimento.', 'Confira a prévia e crie o plano. O sistema gera os lançamentos: "Entrada" e "Parcela 1/5", "Parcela 2/5"...', 'Cada parcela fica como pendente até você marcar que recebeu.'],
    dica: 'Sempre o mesmo padrão: entrada mais parcelas. Nada de digitar uma por uma.', ir: { tab: 'crm', rotulo: 'Abrir Clientes' } },
  { id: 'recebi', grupo: 'Dinheiro', titulo: 'Marcar que recebi uma parcela', quando: 'O cliente pagou.',
    passos: ['Abra o Financeiro do cliente (botão "Financeiro" no cartão dele).', 'Na parcela paga, clique em "Recebi".', 'Errou? Clique em "Desfazer" e ela volta a pendente.', 'Os quadros do topo se atualizam: Contratado, Já recebi, Falta receber e Vencido.'], ir: { tab: 'crm', rotulo: 'Abrir Clientes' } },
  { id: 'cobrar', grupo: 'Dinheiro', titulo: 'Cobrar quem está em atraso', quando: 'Cliente com parcela vencida.',
    passos: ['Abra Financeiro, aba "Resumo".', 'Veja "Quem me deve" com o total de cada cliente e quanto está vencido.', 'Clique em "Copiar cobrança" e cole no WhatsApp.', 'Ou abra o cliente e use "Mensagem" para escolher o texto de parcela.'], ir: { tab: 'finances', rotulo: 'Abrir Financeiro' } },
  { id: 'lancamento', grupo: 'Dinheiro', titulo: 'Registrar uma entrada ou saída avulsa', quando: 'Custas, despesa do escritório, consulta paga, reembolso.',
    passos: ['Abra Financeiro, aba "Lançamentos".', 'Clique em "+ Registrar entrada" ou "+ Registrar saída".', 'Em "O que é", escolha na lista. Se for parcela, informe qual e o total (ex.: 2 de 5).', 'Informe o cliente (se houver), o valor e o vencimento.', 'Marque "Já recebi" ou "Já paguei" se o dinheiro já movimentou. Salve.'],
    dica: '"Honorários avulsos (sem processo)" serve para honorário que não está ligado a nenhum processo.', ir: { tab: 'finances', rotulo: 'Abrir Financeiro' } },
  { id: 'fin-relatorios', grupo: 'Dinheiro', titulo: 'Ver relatórios do financeiro', quando: 'Fechamento do mês e visão geral.',
    passos: ['Abra Financeiro e clique na aba "Relatórios".', 'Veja o fluxo de caixa e o rendimento por cliente.', 'Em "Mais ferramentas" ficam honorários, custas e alvarás.', 'Os números gerais do escritório ficam no Dashboard, aba "Painel do escritório".'], ir: { tab: 'finances', rotulo: 'Abrir Financeiro' } },

  { id: 'whatsapp', grupo: 'Mensagens', titulo: 'Mandar mensagem pronta pelo WhatsApp', quando: 'Atualizar o cliente ou responder um contato.',
    passos: ['Abra o cliente (em Clientes) ou o contato (em captação) e clique em "Mensagem".', 'Escolha o modelo: atualização do processo, consulta, boas-vindas, parcela, encerramento ou mensagem em branco.', 'A prévia aparece ao lado e pode ser editada.', 'Troque o que estiver entre [colchetes]. O sistema avisa se esquecer algum.', 'Clique para abrir o WhatsApp no número cadastrado, ou em "Copiar".'],
    dica: 'Se o cliente não tem telefone cadastrado, o botão do WhatsApp não funciona. Cadastre o telefone no lápis do cliente.', ir: { tab: 'crm', rotulo: 'Abrir Clientes' } },

  { id: 'modelos', grupo: 'Documentos', titulo: 'Usar um modelo de petição', quando: 'Montar petição, procuração, contrato.',
    passos: ['Abra Documentos, aba "Modelos de peças".', 'Clique no botão "Área" e escolha a área (Trabalhista, Família...). A lista mostra os modelos dela.', 'Clique no modelo para ver o texto.', 'Use "Baixar Word (.docx)" ou "Copiar Peça".', 'Troque o que estiver entre [colchetes] pelos dados do cliente.', 'Para criar o seu, clique em "Novo Modelo". Para ajustar um existente, "Editar".'], ir: { tab: 'documents', rotulo: 'Abrir Documentos' } },
  { id: 'arquivos', grupo: 'Documentos', titulo: 'Guardar um arquivo do escritório', quando: 'Contrato assinado, documento do cliente.',
    passos: ['Abra Documentos e clique na aba "Arquivos do escritório".', 'Escreva o título, escolha o tipo, o cliente e o processo.', 'Escolha o arquivo (até 1 MB) e clique em "Salvar documento".'],
    dica: 'Os arquivos ficam guardados só neste aparelho. Para algo importante, guarde também no Drive do escritório.', ir: { tab: 'documents', rotulo: 'Abrir Documentos' } },
  { id: 'calc', grupo: 'Documentos', titulo: 'Usar as calculadoras', quando: 'Estimar verbas trabalhistas ou gasto mensal da criança.',
    passos: ['Abra o menu Calculadoras.', 'Escolha "Calculadora Trabalhista" ou "Gasto Mensal da Criança".', 'Responda as perguntas. O resumo à direita atualiza em tempo real.', 'Use "Novo cálculo" para começar de novo.'], ir: { tab: 'workspace', rotulo: 'Abrir Calculadoras' } },

  { id: 'padronizar', grupo: 'Organização', titulo: 'Arrumar nomes duplicados e letras', quando: 'Um cliente aparece com dois nomes ou o texto está todo em maiúsculas.',
    passos: ['Abra Configurações e vá em "Padronizar nomes e letras".', 'Clique em "Verificar".', 'Confira a lista. Tudo vem marcado, e você desmarca o que não quiser mudar.', 'Clique em "Aplicar marcados".'],
    dica: 'Ele também junta nomes pelo primeiro nome quando só existe um cliente com aquele nome, e deixa os títulos dos lançamentos no padrão "Parcela 1/5 · Cliente".', ir: { tab: 'settings', rotulo: 'Abrir Configurações' } },
  { id: 'backup', grupo: 'Organização', titulo: 'Fazer cópia de segurança (backup)', quando: 'Uma vez por semana, e antes de mudanças grandes.',
    passos: ['Abra Configurações e role até "Backup e restauração".', 'Clique em "Exportar backup". Um arquivo é baixado.', 'Guarde esse arquivo no Drive ou em outro lugar seguro.', 'Para restaurar, use "Importar backup" e escolha o arquivo.'],
    dica: 'O arquivo tem dados de clientes. Não mande por e-mail ou grupo.', ir: { tab: 'settings', rotulo: 'Abrir Configurações' } },
  { id: 'equipe', grupo: 'Organização', titulo: 'Dividir o trabalho com a Dra. Dayane', quando: 'Processos e tarefas de cada uma.',
    passos: ['Em cada processo, tarefa ou prazo, escolha o responsável: Dra. Valeska, Dra. Dayane ou Ambas.', 'No Dashboard, "Meu painel" mostra só o que é seu (e o que é de "Ambas").', '"Painel do escritório" mostra o resumo das duas.', 'Os e-mails de cada uma ficam em Configurações, em "Equipe". É por eles que o sistema sabe quem entrou.'], ir: { tab: 'dashboard', rotulo: 'Abrir Dashboard' } }
];

type Props = { PALETTE: any; onGo: (tab: string) => void };

export default function Tutorial({ PALETTE, onGo }: Props) {
  const [q, setQ] = useState('');
  const [aberto, setAberto] = useState<string | null>('comecar');
  const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const lista = useMemo(() => {
    const t = norm(q.trim());
    return GUIAS.filter(g => !t || norm(`${g.titulo} ${g.quando} ${g.passos.join(' ')} ${g.dica || ''}`).includes(t));
  }, [q]);
  const grupos = useMemo(() => [...new Set(lista.map(g => g.grupo))], [lista]);

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h3 className="font-serif font-bold text-xl" style={{ color: PALETTE.textoPrincipal }}>Como usar o sistema</h3>
        <p className="text-xs mt-1" style={{ color: PALETTE.textoApoio }}>Passo a passo das tarefas do dia a dia. Clique no que você quer fazer.</p>
      </div>
      <input type="search" aria-label="Buscar no tutorial" value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar: parcela, prazo, backup, WhatsApp..." className="w-full p-3 border rounded-xl text-xs" style={{ backgroundColor: PALETTE.fundoCartoes, borderColor: PALETTE.linhasBordas, color: PALETTE.textoPrincipal }} />
      {lista.length === 0 && <p className="text-xs py-6 text-center" style={{ color: PALETTE.textoApoio }}>Nada encontrado. Tente outra palavra.</p>}
      {grupos.map(grupo => (
        <section key={grupo} className="space-y-2">
          <h4 className="text-[11px] font-bold uppercase tracking-wider" style={{ color: PALETTE.bordoPrincipal }}>{grupo}</h4>
          {lista.filter(g => g.grupo === grupo).map(g => {
            const on = aberto === g.id || q.trim() !== '';
            return (
              <article key={g.id} className="rounded-2xl border" style={{ backgroundColor: PALETTE.fundoCartoes, borderColor: PALETTE.linhasBordas }}>
                <button type="button" onClick={() => setAberto(aberto === g.id ? null : g.id)} aria-expanded={on} className="w-full flex items-center justify-between gap-3 p-4 text-left">
                  <span>
                    <span className="block text-sm font-bold" style={{ color: PALETTE.textoPrincipal }}>{g.titulo}</span>
                    <span className="block text-[11px] mt-0.5" style={{ color: PALETTE.textoApoio }}>{g.quando}</span>
                  </span>
                  <span aria-hidden="true" style={{ color: PALETTE.bordoPrincipal }}>{on ? '▴' : '▾'}</span>
                </button>
                {on && (
                  <div className="px-4 pb-4 space-y-3">
                    <ol className="space-y-2">
                      {g.passos.map((p, i) => (
                        <li key={i} className="flex gap-3 text-xs" style={{ color: PALETTE.textoPrincipal }}>
                          <span className="shrink-0 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-white" style={{ backgroundColor: PALETTE.bordoPrincipal }}>{i + 1}</span>
                          <span className="pt-0.5">{p}</span>
                        </li>
                      ))}
                    </ol>
                    {g.dica && <p className="text-[11px] p-3 rounded-lg" style={{ backgroundColor: PALETTE.fundoPagina, color: PALETTE.textoApoio }}><b>Dica:</b> {g.dica}</p>}
                    {g.ir && <button type="button" onClick={() => onGo(g.ir!.tab)} className="px-4 py-2 rounded-lg text-xs font-bold text-white" style={{ backgroundColor: PALETTE.bordoPrincipal }}>{g.ir.rotulo}</button>}
                  </div>
                )}
              </article>
            );
          })}
        </section>
      ))}
    </div>
  );
}
