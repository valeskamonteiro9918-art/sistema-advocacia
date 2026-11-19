// Modelos padrão do escritório. Foram criados a partir dos documentos do dia a dia
// (procuração, declaração de hipossuficiência e contrato de honorários) com os dados
// dos clientes substituídos por campos [ENTRE COLCHETES] para preenchimento.
// Revise sempre o conteúdo antes de protocolar ou enviar para assinatura.

export type OfficeTemplate = { id: string; category: string; title: string; description: string; content: string };

export const TEMPLATE_CATEGORIES = ['Documentos do dia a dia', 'Trabalhista', 'Família', 'Cível / JEC', 'Cível / Execução'];

const PROCURACAO = `PROCURAÇÃO

OUTORGANTE: [NOME COMPLETO], [nacionalidade], [estado civil], [profissão], inscrito(a) no CPF n.º [CPF], residente e domiciliado(a) à [ENDEREÇO COMPLETO], CEP [CEP], [CIDADE]/[UF], endereço eletrônico [E-MAIL].

OUTORGADO: VALESKA MONTEIRO DA CRUZ, brasileira, solteira, advogada, inscrita na OAB/ES sob o n.º 41.715, com endereço eletrônico valeskamonteiro.adv@gmail.com.

PODERES: O(A) Outorgante confere ao(à) Outorgado(a) amplos poderes "AD JUDICIA ET EXTRA", para atuar em seu nome, incluindo a representação perante órgãos da administração pública direta ou indireta, em qualquer instância ou tribunal, e para a prática de atos administrativos, judiciais e extrajudiciais, com base no art. 5º, § 2º da Lei n.º 8.906/1994 (Estatuto da OAB) e no art. 105 do Código de Processo Civil, com a finalidade de:

1. Atuar judicialmente, em qualquer juízo, instância ou tribunal, propondo, contestando, recorrendo e praticando todos os atos necessários, incluindo firmar compromissos, acordos, confessar, transigir, desistir, renunciar e dar quitação (art. 105, CPC);

2. Levantar quantias ou valores através de alvará judicial, assinar documentos e representar perante a administração pública e demais órgãos, sem necessidade de ratificação posterior;

3. Receber citações, intimações e notificações em nome do(a) Outorgante, inclusive para fins de dar quitação (art. 105, CPC);

4. Substabelecer poderes, total ou parcialmente, com ou sem reserva de poderes, aos advogados que entender necessários, para o cumprimento deste mandato.

FINALIDADE: A presente procuração destina-se ao ajuizamento de ação judicial e à defesa dos interesses do(a) Outorgante, abrangendo todas as fases do processo, até a decisão final e seu cumprimento, bem como a adoção das medidas administrativas pertinentes.

VALIDADE: Este instrumento de procuração tem validade imediata e vigorará até que o(a) Outorgante manifeste sua revogação por escrito, sem prejuízo dos atos já praticados pelo(a) Outorgado(a).

Serra/ES, [DATA].

____________________________________
[NOME COMPLETO DO OUTORGANTE]

Dra. Valeska Monteiro, OAB/ES 41.715
(27) 99752-5314 | contato@valeskamonteiro.adv.br`;

const HIPOSSUFICIENCIA = `DECLARAÇÃO DE HIPOSSUFICIÊNCIA

Eu, [NOME COMPLETO], [nacionalidade], [estado civil], [profissão], inscrito(a) no CPF n.º [CPF], residente e domiciliado(a) à [ENDEREÇO COMPLETO], CEP [CEP], [CIDADE]/[UF], endereço eletrônico [E-MAIL], venho declarar para os devidos fins, sob as penas da lei, que não possuo condições financeiras de arcar com as custas processuais e demais despesas do processo, sem comprometer o meu sustento e o de minha família, necessitando, portanto, da gratuidade da justiça, nos termos do art. 98 e seguintes do Código de Processo Civil.

Declaro, ainda, que as informações prestadas são verdadeiras, estando ciente das responsabilidades legais em caso de falsidade.

Serra/ES, [DATA].

____________________________________
[NOME COMPLETO DO DECLARANTE]

Dra. Valeska Monteiro, OAB/ES 41.715
(27) 99752-5314 | contato@valeskamonteiro.adv.br`;

const CONTRATO = `CONTRATO DE PRESTAÇÃO DE SERVIÇOS ADVOCATÍCIOS

Nos termos do art. 22 e seguintes da Lei n.º 8.906/94 (Estatuto da OAB) e dos arts. 48 a 51 do Código de Ética e Disciplina da OAB.

QUALIFICAÇÃO DAS PARTES

CONTRATANTE: [NOME COMPLETO], [nacionalidade], [estado civil], [profissão], inscrito(a) no CPF n.º [CPF], residente e domiciliado(a) à [ENDEREÇO COMPLETO], CEP [CEP], [CIDADE]/[UF], endereço eletrônico [E-MAIL].

CONTRATADA: VALESKA MONTEIRO DA CRUZ, brasileira, solteira, advogada, inscrita na OAB/ES sob o n.º 41.715, com endereço eletrônico valeskamonteiro.adv@gmail.com.

As partes acima qualificadas têm entre si, justo e contratado, o presente instrumento de prestação de serviços advocatícios, que se regerá pelas cláusulas e condições a seguir, em conformidade com o Código Civil, o Estatuto da Advocacia e o Código de Ética e Disciplina da OAB.

CLÁUSULA PRIMEIRA — DO OBJETO

1.1. O presente contrato tem por objeto a prestação de serviços advocatícios pela CONTRATADA à CONTRATANTE, consistentes em:

a) [DESCREVER O CASO, A AÇÃO OU O NÚMERO DO PROCESSO];

b) Elaboração e revisão de peças processuais, recursos e demais manifestações inerentes ao caso;

c) Representação em audiências e diligências;

d) Negociação de acordos e representação em mediação ou conciliação;

e) Acompanhamento processual e gestão de prazos.

1.2. Os serviços contratados não abrangem outras demandas, ações, recursos ou incidentes que não estejam expressamente previstos neste instrumento, salvo aditamento escrito e assinado por ambas as partes.

CLÁUSULA SEGUNDA — DOS HONORÁRIOS ADVOCATÍCIOS

2.1. HONORÁRIOS FIXOS. Pelos serviços ora contratados, a CONTRATANTE pagará à CONTRATADA o valor total de R$ [VALOR] ([valor por extenso]), da seguinte forma:

a) R$ [VALOR DA ENTRADA] a título de entrada, no ato da assinatura;

b) O saldo de R$ [SALDO] será pago em [NÚMERO] parcelas mensais de R$ [VALOR DA PARCELA], com vencimento todo dia [DIA] de cada mês, iniciando-se em [DATA DO PRIMEIRO VENCIMENTO].

2.2. HONORÁRIOS DE ÊXITO (quando houver). A CONTRATANTE pagará à CONTRATADA o percentual de [PERCENTUAL]% sobre o valor econômico efetivamente obtido, considerando-se como tal todo bem, quantia ou vantagem patrimonial que venha a integrar o patrimônio da CONTRATANTE por decisão judicial, acordo ou sentença. Os honorários de êxito serão devidos no momento do efetivo recebimento dos valores ou da formalização da partilha.

2.3. O pagamento deverá ser realizado, preferencialmente, mediante PIX ou transferência bancária para conta indicada pela CONTRATADA, devendo o comprovante ser enviado ao endereço eletrônico da CONTRATADA no prazo de 24 (vinte e quatro) horas.

2.4. O inadimplemento de qualquer parcela por prazo superior a 10 (dez) dias do vencimento sujeita a CONTRATANTE a multa de 2% (dois por cento) sobre o valor devido, juros de mora de 1% (um por cento) ao mês e correção monetária pelo IPCA/IBGE.

2.5. Persistindo a inadimplência por prazo superior a 30 (trinta) dias, a CONTRATANTE será notificada por escrito, com prazo de 10 (dez) dias para regularização, podendo a CONTRATADA suspender a prestação dos serviços, mediante comunicação ao juízo se necessário, nos termos do art. 7.º, VIII, do Estatuto da OAB, rescindir o contrato e executar o presente instrumento como título executivo extrajudicial (art. 784, III, do CPC).

2.6. Os honorários de sucumbência pertencem à CONTRATADA, nos termos do art. 23 da Lei n.º 8.906/94, sem prejuízo dos honorários ajustados neste contrato.

CLÁUSULA TERCEIRA — DAS OBRIGAÇÕES DA CONTRATADA

3.1. A CONTRATADA compromete-se a prestar os serviços com zelo, diligência e observância aos preceitos éticos e legais, mantendo a CONTRATANTE informada sobre o andamento do caso.

3.2. A CONTRATADA não garante resultado favorável, considerando a natureza das lides judiciais e extrajudiciais, e assume obrigação de meio.

CLÁUSULA QUARTA — DAS OBRIGAÇÕES DA CONTRATANTE

4.1. A CONTRATANTE obriga-se a fornecer todas as informações e documentos necessários à boa execução dos serviços e a comparecer aos atos para os quais for convocada.

4.2. A CONTRATANTE compromete-se a pagar pontualmente os honorários ajustados.

4.3. As custas processuais, taxas, diligências, perícias, certidões e demais despesas necessárias serão de responsabilidade da CONTRATANTE. Caso sejam adiantadas pela CONTRATADA, deverão ser reembolsadas mediante apresentação de comprovante.

CLÁUSULA QUINTA — DA RESCISÃO

5.1. O contrato poderá ser rescindido por qualquer das partes mediante comunicação prévia por escrito, com antecedência mínima de 30 (trinta) dias.

5.2. Em qualquer hipótese de rescisão, serão devidos à CONTRATADA os honorários proporcionais ao trabalho efetivamente realizado até a data da rescisão.

CLÁUSULA SEXTA — DA PROTEÇÃO DE DADOS

6.1. A CONTRATANTE autoriza o tratamento de seus dados pessoais pela CONTRATADA exclusivamente para a execução deste contrato, nos termos da Lei n.º 13.709/2018 (LGPD).

CLÁUSULA SÉTIMA — DISPOSIÇÕES GERAIS

7.1. Este contrato obriga as partes, seus herdeiros e sucessores a qualquer título.

7.2. As partes elegem o foro da Comarca de Serra/ES para dirimir quaisquer dúvidas oriundas deste contrato.

E, por estarem justas e contratadas, as partes assinam o presente instrumento.

Serra/ES, [DATA].

____________________________________
[NOME COMPLETO DA CONTRATANTE]

____________________________________
Valeska Monteiro da Cruz, OAB/ES 41.715`;

const TRAB_INICIAL = `EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DA [NÚMERO] VARA DO TRABALHO DE [CIDADE]/ES

[NOME COMPLETO DO RECLAMANTE], [nacionalidade], [estado civil], [profissão], inscrito(a) no CPF n.º [CPF], portador(a) da CTPS n.º [NÚMERO/SÉRIE], residente e domiciliado(a) à [ENDEREÇO COMPLETO], endereço eletrônico [E-MAIL], por sua advogada infra-assinada (procuração anexa), vem, respeitosamente, propor a presente

RECLAMAÇÃO TRABALHISTA
pelo rito [ORDINÁRIO / SUMARÍSSIMO]

em face de [NOME DA RECLAMADA], pessoa jurídica de direito privado, inscrita no CNPJ sob o n.º [CNPJ], com sede à [ENDEREÇO], pelos fatos e fundamentos a seguir.

I. DO CONTRATO DE TRABALHO

O(A) Reclamante foi admitido(a) em [DATA DE ADMISSÃO], para exercer a função de [FUNÇÃO], com remuneração de R$ [SALÁRIO], tendo sido dispensado(a) [sem justa causa / por pedido de demissão / outra forma] em [DATA DE SAÍDA]. A jornada contratada era de [JORNADA].

II. DA GRATUIDADE DA JUSTIÇA

O(A) Reclamante declara, nos termos do art. 790, §§ 3º e 4º, da CLT, não ter condições de arcar com as custas do processo sem prejuízo do próprio sustento e de sua família, requerendo a concessão da justiça gratuita. Declaração anexa.

III. DOS FATOS E DO DIREITO

[NARRAR OS FATOS DE FORMA CRONOLÓGICA E OBJETIVA. Para cada pedido, indicar os fatos que o sustentam e o fundamento legal.]

a) Das verbas rescisórias: [DESCREVER]
b) Das horas extras e reflexos: [DESCREVER]
c) Do FGTS e da multa de 40%: [DESCREVER]
d) Do dano moral: [DESCREVER, SE HOUVER]

IV. DOS PEDIDOS

Ante o exposto, requer:

a) a concessão dos benefícios da justiça gratuita;
b) a notificação da Reclamada para comparecer à audiência e apresentar defesa, sob pena de revelia e confissão;
c) a condenação da Reclamada ao pagamento de: [LISTAR CADA PEDIDO COM O VALOR ESTIMADO, conforme art. 840, §1º, da CLT];
d) a condenação da Reclamada ao pagamento de honorários de sucumbência (art. 791-A da CLT);
e) a produção de todos os meios de prova em direito admitidos.

Dá à causa o valor de R$ [VALOR DA CAUSA].

Termos em que pede deferimento.
Serra/ES, [DATA].

Dra. Valeska Monteiro
OAB/ES 41.715`;

const FAMILIA_ALIMENTOS = `EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO DA VARA DE FAMÍLIA DA COMARCA DE [CIDADE]/ES

[NOME DO(A) MENOR], [data de nascimento], representado(a) por sua genitora [NOME DA REPRESENTANTE], [nacionalidade], [estado civil], [profissão], inscrita no CPF n.º [CPF], residente e domiciliada à [ENDEREÇO COMPLETO], por sua advogada infra-assinada (procuração anexa), vem, respeitosamente, propor a presente

AÇÃO DE ALIMENTOS (com pedido de alimentos provisórios)

em face de [NOME DO ALIMENTANTE], [nacionalidade], [estado civil], [profissão], inscrito no CPF n.º [CPF], residente e domiciliado à [ENDEREÇO COMPLETO], com fundamento nos arts. 1.694 e seguintes do Código Civil, na Lei n.º 5.478/68 e nos arts. 693 e seguintes do CPC, pelos fatos e fundamentos a seguir.

I. DA GRATUIDADE DA JUSTIÇA

A parte autora não possui condições de arcar com as custas processuais sem prejuízo do seu sustento (art. 98 do CPC). Declaração anexa.

II. DOS FATOS

[NARRAR: filiação, guarda de fato, rotina e necessidades da criança, situação financeira de cada genitor, tentativas de acordo.]

III. DO DIREITO

O dever de sustento decorre do poder familiar (arts. 1.566, IV, e 1.634, I, do CC e art. 229 da Constituição Federal). Os alimentos devem observar o binômio necessidade e possibilidade, conforme o art. 1.694, §1º, do Código Civil. As despesas mensais do(a) menor somam R$ [VALOR], conforme planilha anexa, e o Requerido [DESCREVER POSSIBILIDADE: emprego, renda, bens].

IV. DOS ALIMENTOS PROVISÓRIOS

Presentes a prova do parentesco e a urgência, requer a fixação de alimentos provisórios em [PERCENTUAL]% dos rendimentos líquidos do Requerido (ou R$ [VALOR]), com desconto em folha e depósito em conta de titularidade da representante, nos termos do art. 4º da Lei n.º 5.478/68.

V. DOS PEDIDOS

a) a concessão da gratuidade da justiça;
b) a fixação dos alimentos provisórios nos termos acima;
c) a citação do Requerido para comparecer à audiência de conciliação e apresentar defesa;
d) a intimação do Ministério Público;
e) a procedência do pedido, com a fixação definitiva dos alimentos em [PERCENTUAL]% dos rendimentos líquidos do Requerido (ou R$ [VALOR]), com vencimento todo dia [DIA];
f) a condenação do Requerido ao pagamento das custas e dos honorários advocatícios.

Dá à causa o valor de R$ [12 x VALOR MENSAL PRETENDIDO].

Termos em que pede deferimento.
Serra/ES, [DATA].

Dra. Valeska Monteiro
OAB/ES 41.715`;

const FAMILIA_DIVORCIO = `EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO DA VARA DE FAMÍLIA DA COMARCA DE [CIDADE]/ES

[NOME DO(A) REQUERENTE], [nacionalidade], [profissão], inscrito(a) no CPF n.º [CPF], residente e domiciliado(a) à [ENDEREÇO], por sua advogada infra-assinada (procuração anexa), vem, respeitosamente, propor a presente

AÇÃO DE DIVÓRCIO [LITIGIOSO / CONSENSUAL]
com pedido de [GUARDA, ALIMENTOS E PARTILHA, SE HOUVER]

em face de [NOME DO(A) REQUERIDO(A)], [nacionalidade], [profissão], inscrito(a) no CPF n.º [CPF], residente e domiciliado(a) à [ENDEREÇO], com fundamento no art. 226, §6º, da Constituição Federal e nos arts. 693 e seguintes do CPC.

I. DOS FATOS

As partes casaram-se em [DATA], sob o regime de [REGIME DE BENS], e estão separadas de fato desde [DATA]. [Da união nasceram [NÚMERO] filho(s): NOMES E IDADES / Não há filhos menores ou incapazes.]

II. DO DIREITO

O divórcio é direito potestativo, dispensando qualquer prazo ou discussão de culpa, conforme a Emenda Constitucional n.º 66/2010.

III. DA GUARDA E DA CONVIVÊNCIA (se houver filhos)

[PROPOR GUARDA COMPARTILHADA, LAR DE REFERÊNCIA E REGIME DE CONVIVÊNCIA. Justificar com base no art. 1.584 do CC.]

IV. DOS ALIMENTOS (se houver)

[PROPOR VALOR/PERCENTUAL, JUSTIFICANDO NECESSIDADE E POSSIBILIDADE. Art. 1.694 do CC.]

V. DA PARTILHA DE BENS (se houver)

[LISTAR OS BENS COM VALORES ESTIMADOS E A PROPOSTA DE DIVISÃO CONFORME O REGIME DE BENS.]

VI. DO NOME

[A Requerente deseja / não deseja voltar a utilizar o nome de solteira.]

VII. DOS PEDIDOS

a) a gratuidade da justiça, se cabível;
b) a citação do(a) Requerido(a);
c) a intimação do Ministério Público, havendo menores;
d) a decretação do divórcio, com expedição de mandado de averbação;
e) [guarda, alimentos e partilha, conforme itens acima];
f) a condenação do(a) Requerido(a) às custas e honorários.

Dá à causa o valor de R$ [VALOR].

Termos em que pede deferimento.
Serra/ES, [DATA].

Dra. Valeska Monteiro
OAB/ES 41.715`;

const JEC_INICIAL = `EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO DO JUIZADO ESPECIAL CÍVEL DA COMARCA DE [CIDADE]/ES

[NOME COMPLETO DO(A) AUTOR(A)], [nacionalidade], [estado civil], [profissão], inscrito(a) no CPF n.º [CPF], residente e domiciliado(a) à [ENDEREÇO COMPLETO], endereço eletrônico [E-MAIL], por sua advogada infra-assinada (procuração anexa), vem, respeitosamente, propor a presente

AÇÃO DE [INDENIZAÇÃO POR DANOS MORAIS E MATERIAIS / OBRIGAÇÃO DE FAZER / REPETIÇÃO DE INDÉBITO]

em face de [NOME DA RÉ], pessoa jurídica de direito privado, inscrita no CNPJ sob o n.º [CNPJ], com sede à [ENDEREÇO], com fundamento na Lei n.º 9.099/95 e no Código de Defesa do Consumidor (Lei n.º 8.078/90), pelos fatos e fundamentos a seguir.

I. DA COMPETÊNCIA E DA OPÇÃO PELO RITO

A causa é de menor complexidade e não excede 40 salários mínimos (art. 3º, I, da Lei n.º 9.099/95), sendo o foro competente o do domicílio do(a) Autor(a) / do local do fato (art. 4º). A parte declara não ter promovido a mesma ação em outro juízo.

II. DOS FATOS

[NARRAR DE FORMA CRONOLÓGICA: contratação, problema, tentativas de solução (protocolos, e-mails, prints), prejuízos sofridos.]

III. DO DIREITO

A relação é de consumo, aplicando-se a responsabilidade objetiva do fornecedor pelos defeitos na prestação do serviço (art. 14 do CDC) e a inversão do ônus da prova, diante da hipossuficiência técnica do consumidor (art. 6º, VIII, do CDC).

[DESENVOLVER: falha na prestação do serviço, dano material (art. 927 do CC e art. 42, parágrafo único, do CDC, se houver cobrança indevida) e dano moral.]

IV. DA TUTELA DE URGÊNCIA (se houver)

[DESCREVER PROBABILIDADE DO DIREITO E PERIGO DE DANO (art. 300 do CPC).]

V. DOS PEDIDOS

a) a citação da Ré para comparecer à audiência de conciliação e apresentar defesa, sob pena de revelia;
b) a inversão do ônus da prova;
c) a condenação da Ré ao pagamento de R$ [VALOR] a título de danos materiais [com correção monetária e juros desde o evento danoso];
d) a condenação da Ré ao pagamento de R$ [VALOR] a título de danos morais;
e) [OUTROS PEDIDOS: obrigação de fazer, restituição em dobro etc.];
f) a produção de todos os meios de prova admitidos.

Dá à causa o valor de R$ [VALOR].

Termos em que pede deferimento.
Serra/ES, [DATA].

Dra. Valeska Monteiro
OAB/ES 41.715`;

export const DEFAULT_TEMPLATES: OfficeTemplate[] = [
  { id: 'default-procuracao', category: 'Documentos do dia a dia', title: 'Procuração (ad judicia et extra)', description: 'Procuração geral com poderes para o foro, levantamento de alvará e substabelecimento.', content: PROCURACAO },
  { id: 'default-hipossuficiencia', category: 'Documentos do dia a dia', title: 'Declaração de Hipossuficiência', description: 'Declaração para pedido de gratuidade da justiça (art. 98 do CPC).', content: HIPOSSUFICIENCIA },
  { id: 'default-contrato-honorarios', category: 'Documentos do dia a dia', title: 'Contrato de Honorários Advocatícios', description: 'Contrato com honorários fixos e de êxito, mora, rescisão, custas e LGPD.', content: CONTRATO },
  { id: 'default-trabalhista-inicial', category: 'Trabalhista', title: 'Reclamação Trabalhista (petição inicial)', description: 'Estrutura da inicial com justiça gratuita e pedidos liquidados (art. 840, §1º, da CLT).', content: TRAB_INICIAL },
  { id: 'default-familia-alimentos', category: 'Família', title: 'Ação de Alimentos com pedido provisório', description: 'Inicial de alimentos para filho menor, com alimentos provisórios (Lei 5.478/68).', content: FAMILIA_ALIMENTOS },
  { id: 'default-familia-divorcio', category: 'Família', title: 'Ação de Divórcio', description: 'Inicial de divórcio com guarda, alimentos e partilha opcionais.', content: FAMILIA_DIVORCIO },
  { id: 'default-jec-inicial', category: 'Cível / JEC', title: 'Petição inicial no Juizado Especial Cível', description: 'Inicial consumerista (Lei 9.099/95 e CDC) com danos materiais e morais.', content: JEC_INICIAL }
];

const REMOVED_KEY = 'vm-removed-default-templates';
export function removedDefaultIds(): string[] {
  try { return JSON.parse(localStorage.getItem(REMOVED_KEY) || '[]'); } catch { return []; }
}
export function rememberRemovedDefault(id: string) {
  if (!id.startsWith('default-')) return;
  try { localStorage.setItem(REMOVED_KEY, JSON.stringify([...new Set([...removedDefaultIds(), id])])); } catch { /* sem armazenamento */ }
}
// Junta os modelos padrão aos modelos já salvos (sem duplicar e sem trazer de volta os que ela excluiu).
export function mergeDefaultTemplates(saved: OfficeTemplate[]): OfficeTemplate[] {
  const ids = new Set(saved.map(t => t.id));
  const removed = new Set(removedDefaultIds());
  return [...saved, ...DEFAULT_TEMPLATES.filter(d => !ids.has(d.id) && !removed.has(d.id))];
}
