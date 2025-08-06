# Resumo do Projeto Twala Insights

Este documento compila todas as informações relevantes sobre o projeto Twala Insights, com base nas discussões e materiais fornecidos, para auxiliar na criação de um protótipo para validação da hipótese inicial.

## 1. Contexto Geral do Projeto

*   **Cliente:** Nani Invest
*   **Projeto:** Twala Insights
*   **Objetivo Principal:** Criar uma plataforma para o mercado angolano que simplifique o mundo dos investimentos, tornando-o acessível e menos intimidante. O objetivo é "roubar" usuários do mercado de apostas (gambling), mostrando que investir é uma alternativa mais inteligente e sustentável para o crescimento financeiro.
*   **Referência Principal:** stockanalysis.com (80% do que se deseja construir, com foco nos dados e realidade de Angola).

## 2. Kickoff e Metodologia de Trabalho

### 2.1. Pontos Chave da Reunião de Kickoff

*   **Ferramentas de Gestão:** Uso do Jira para gestão de demandas e entregas de funcionalidades. Slack para comunicação e acesso a gravações de reuniões.
*   **Abordagem Iterativa:** Flexibilidade para ajustar escopo, definições e funcionalidades a cada semana/quinzena/dia, respondendo ao contexto de forma dinâmica e baseada em feedback.
*   **Status Report:** Relatório quinzenal/semanal para acompanhamento de consumo de horas e funcionalidades, gerido pelo gestor de projeto (LEN).
*   **Gravação de Reuniões:** Todas as reuniões são gravadas e documentadas para acesso futuro.

### 2.2. Fases do Projeto (Upstream/Downstream)

O processo de desenvolvimento é dividido em duas fases:

*   **Upstream (Definição):** Momento de definição de escopo da demanda, design, validação visual e de experiência/jornada. O objetivo é remover a incerteza antes da implementação.
*   **Downstream (Implementação):** Momento em que o time de desenvolvimento implementa a funcionalidade. A incerteza é majoritariamente eliminada para evitar desperdício de recursos.

## 3. Lean Product Canvas (Informações extraídas da imagem e discussões)

### 3.1. Problema de Negócio (Caixa 1)

*   **Problema Principal:** Ausência de ferramentas de análise do mercado financeiro angolano que obriga os investidores a usar métodos manuais, dificultando a tomada de decisão e fazendo a empresa perder potenciais clientes.
*   **Contexto Adicional:** Dificuldade de investidores em Angola de acompanharem facilmente o desempenho dos seus investimentos em um só lugar, devido à limitação dos homebrokers (90% dos homebrokers não oferecem ferramentas tradicionais), o que traz a perda de receita potencial e de novos clientes para a empresa.

### 3.2. Resultados de Negócio (Caixa 2)

Como saberemos se o problema está sendo resolvido:

*   Aumento do Nº de clientes / Usuários
*   Aumento do Nº de visitantes no web app
*   Aumento Volume de facturação

### 3.3. Usuários e Clientes (Caixa 3)

Foco inicial:

*   **Gestor de Portfólio**
*   **Investidor comum:** Pessoas que trabalham e desejam potencializar suas receitas com o mercado financeiro.

### 3.4. User Outcomes & Benefits (JTBD) (Caixa 4)

Resultados e Benefícios para o Usuário (Jobs To Be Done):

*   Taxa de sucesso Info -> Tomada de decisão
*   DAU/MAU/WAU Carteira de investimentos [Investidor]
*   Frequência de aportes [Investidor]
*   DAU/MAU/WAU Carteira de investimentos [Gestor Portfólio]

### 3.5. Ideias de Soluções (Caixa 5)

O que podemos criar para resolver o problema de negócio e atender às necessidades dos clientes:

*   Monitoramento da carteira de investimentos
*   Visualização e extração das informações históricas do mercado financeiro
*   Visualização / Acompanhamento de insights do mercado financeiro [artigos + insights]
*   Simulação de investimentos
*   Jornada de onboarding guiado na plataforma
*   Gestão de portfólio de investimentos financeiros
*   Análise de perfil de investidor

### 3.6. Hipóteses (Caixa 6)

Formato: "Acreditamos que [resultado de negócio] será alcançado se [usuário] obtiver [benefício] com [funcionalidade]"

*   Acreditamos que o Aumento Nº de clientes será alcançado se Investidor comum obtiver Visualização dinâmica da carteira com monitorização da carteira de investimentos.
*   Acreditamos que o Aumento Nº de visitantes no web app será alcançado se Gestor/Investidor comum obtiver Tomadas de decisões de investimento mais informadas com visualização dinâmica das informações históricas do mercado financeiro.
*   Acreditamos que o Aumento Nº de visitantes no web app será alcançado se Investidor comum obtiver Tomadas de decisões de investimento mais informadas com simulação de investimentos.
*   Acreditamos que o Aumento Nº de visitantes no web app e Aumento do Volume de facturação será alcançado se Investidor comum e Gestor de Portfólio obtiver Acompanhamento de insights do mercado financeiro.
*   Acreditamos que o Aumento Volume de facturação será alcançado se Gestor de Portfólio obtiver Acompanhamento da carteira de investimentos em tempo real com a gestão de portfólio de investimentos financeiros.
*   Acreditamos que o Aumento Nº de visitantes será alcançado se Investidor comum obtiver Visualização dinâmica da carteira de investimento com a análise de perfil de investidor.
*   Acreditamos que o Aumento Volume de facturação e Nº de clientes será alcançado se Gestor de Portfólio/Investidor comum obtiverem Visibilidade e Gestão da carteira de investimentos com o Sistema web/app.

### 3.7. Qual a coisa mais importante para respondermos primeiro? (Caixa 7)

*   **Hipótese Prioritária (HPC):** Acreditamos que o Aumento Nº de clientes será alcançado se Investidor comum obtiver Visualização dinâmica da carteira com monitorização da carteira de investimentos.

### 3.8. Qual é o menor esforço necessário para aprendermos a próxima coisa mais importante? (Caixa 8)

*   Registrar Operações
*   Acompanhar Performance
*   Consultar Mercado (gestão da performance)

## 4. Fit for Purpose (F4P) e Métricas

O F4P foca em como o produto cumpre seu propósito na vida do cliente, medindo o comportamento do usuário. As métricas são definidas para cada propósito do cliente.

### 4.1. Propósitos do Cliente e Critérios de Adequação

| Propósito do Cliente (Por que ele usa o Twala?) | Como o Cliente Avalia o Sucesso? (Critérios de Adequação) |
| :--- | :--- |
| **"Quero parar de perder dinheiro com apostas e começar a investir de forma mais inteligente."** | - **Facilidade de Começar:** O quão rápido e fácil é criar uma conta e fazer meu primeiro registro? <br> - **Clareza da Informação:** Eu entendo o que estou vendo? As informações me dão confiança? <br> - **Percepção de Controle:** Eu sinto que tenho uma visão clara e organizada dos meus investimentos? |
| **"Quero consolidar minhas informações de várias corretoras para saber minha real performance."** | - **Abrangência:** Consigo registrar todos os tipos de ativos que possuo? <br> - **Velocidade para Registrar:** Quanto tempo levo para adicionar uma nova compra ou venda? <br> - **Qualidade do Insight:** O saldo e o gráfico de evolução refletem minha realidade de forma útil? |
| **"Preciso de dados rápidos e confiáveis do mercado angolano (BODIVA) para tomar decisões."** | - **Disponibilidade:** A informação de cotação está lá quando eu preciso? <br> - **Confiabilidade:** Os dados parecem corretos e atualizados? <br> - **Velocidade de Acesso:** Em quantos cliques eu encontro a cotação de um ativo? |

### 4.2. Métricas de Fitness (Exemplos para o MVP)

| Propósito do Cliente | Critério de Adequação | Métrica de Fitness (O que vamos medir) | Meta Inicial (Exemplo para o MVP) |
| :--- | :--- | :--- | :--- |
| **Começar a Investir** | Facilidade de Começar | **Tempo de Onboarding:** Tempo médio entre o clique em "Criar Conta" e o registro da primeira operação. | < 5 minutos |
| | Clareza da Informação | **Taxa de Abandono no Onboarding:** % de usuários que criam conta mas não registram nenhuma operação na primeira semana. | < 30% |
| | Percepção de Controle | **Taxa de Retorno (D1/D7):** % de novos usuários que retornam ao app no dia seguinte (D1) e em 7 dias (D7). | D1 > 40%, D7 > 20% |
| **Consolidar e Acompanhar** | Velocidade para Registrar | **Tempo para Registrar Operação:** Tempo médio que um usuário logado leva para adicionar uma compra/venda. | < 60 segundos |
| | Qualidade do Insight | **Frequência de Acesso ao Dashboard:** Número médio de sessões por usuário ativo por semana. | > 3 sessões/semana |
| **Consultar o Mercado** | Disponibilidade/Velocidade | **Taxa de Sucesso da Busca de Ativos:** % de buscas que retornam um resultado relevante. | > 98% |
| | Confiabilidade | **Relatórios de Dados Incorretos:** Número de feedbacks de usuários apontando dados errados (via um botão "Sugerir correção"). | < 5 por mês |

## 5. Event Storming (Foco no MVP para Novembro de 2025)

O Event Storming foi gerado com foco nos itens "Transações e Ativos", "Performance e Análise" e "Screeners e Insights".

### 5.1. Features do MVP (Novembro de 2025)

*   **Gerenciar Conta:**
    *   Criar conta
    *   Fazer login
*   **Registrar Operações:**
    *   Adicionar entrada (compra) de ativo
    *   Registrar retirada (venda) de ativo
    *   Visualizar histórico de operações
*   **Acompanhar Performance:**
    *   Visualizar saldo atual
    *   Visualizar evolução da carteira
*   **Consultar Mercado:**
    *   Pesquisar cotações de ativos (parte aberta, sem login)
*   **Receber Notificações:**
    *   Receber notificações push (ex.: confirmação de operação)
*   **Explorar Insights:**
    *   Visualizar insights de mercado (básico)

### 5.2. Estrutura Visual do Event Storming (Resumo dos Fluxos)

**Legenda:**
*   🟨 **Ator:** Quem faz a ação.
*   🟦 **Comando:** A ação do usuário.
*   🟧 **Evento de Domínio:** O resultado/fato que ocorreu.
*   🟩 **View/Read Model:** A tela que o usuário vê.
*   🟪 **Política/Automação:** Uma reação automática do sistema.

#### **Fluxo 1: Acesso e Criação de Conta**

🟨 **Visitante** ➡️ 🟩 `Página com Cotações` ➡️ 🟦 `Clica em Criar Conta` ➡️ 🟩 `Formulário de Cadastro` ➡️ 🟦 `Submete Cadastro` ➡️ 🟧 **Conta Criada** ➡️ 🟪 **Notificação de Boas-Vindas Enviada**

#### **Fluxo 2: Login e Visualização da Carteira**

🟨 **Usuário** ➡️ 🟩 `Página de Login` ➡️ 🟦 `Faz Login` ➡️ 🟧 **Login Realizado com Sucesso** ➡️ 🟩 `Dashboard com Saldo Atual e Gráfico de Evolução`

#### **Fluxo 3: Registro de Operações (Compra e Venda)**

*   **Compra:**
    🟨 **Usuário** ➡️ 🟩 `Dashboard` ➡️ 🟦 `Adiciona Entrada de Ativo` ➡️ 🟩 `Formulário de Compra de Ativo` ➡️ 🟦 `Registra Compra` ➡️ 🟧 **Operação de Compra Registrada** ➡️ 🟪 **Notificação Push de Confirmação**

*   **Venda:**
    🟨 **Usuário** ➡️ 🟩 `Dashboard` ➡️ 🟦 `Registra Retirada de Ativo` ➡️ 🟩 `Formulário de Venda de Ativo` ➡️ 🟦 `Registra Venda` ➡️ 🟧 **Operação de Venda Registrada** ➡️ 🟪 **Notificação Push de Confirmação**

#### **Fluxo 4: Visualização do Histórico e Performance**

🟨 **Usuário** ➡️ 🟩 `Dashboard` ➡️ 🟦 `Visualiza Histórico` ➡️ 🟩 `Tela de Histórico de Operações`

*(O Dashboard já cobre "Visualizar saldo atual" e "Visualizar evolução da carteira")*

#### **Fluxo 5: Consulta de Mercado e Insights (Sem Login)**

🟨 **Visitante/Usuário** ➡️ 🟩 `Página Inicial/Pública` ➡️ 🟦 `Pesquisa por um Ativo` ➡️ 🟩 `Página de Detalhes do Ativo com Cotação`

🟨 **Visitante/Usuário** ➡️ 🟩 `Página de Insights` ➡️ 🟧 **Insights de Mercado Visualizados**

## 6. Story Mapping (Demandas para o MVP)

O Story Mapping detalha as tarefas de implementação (User Stories) para cada passo da jornada do usuário, focando nos épicos "Gerenciar Portfólio", "Acompanhar Performance" e "Explorar Mercado".

### 6.1. Épico 1: Gerenciar Portfólio (Baseado em "Transações e Ativos")

*   **Objetivo do Usuário:** "Eu quero registrar minhas operações de compra e venda para que minha carteira fique sempre atualizada."

| Passos da Jornada (Features) | Demandas (User Stories) para o MVP |
| :--- | :--- |
| **1.1. Adicionar Ativo (Compra)** | - Como usuário, quero buscar por um ativo da BODIVA pelo seu código (ticker) para selecioná-lo.<br>- Como usuário, quero preencher um formulário com a data, quantidade e preço de uma compra.<br>- Como usuário, quero ver uma confirmação visual após registrar a compra.<br>- Como sistema, devo validar os campos do formulário (ex: data não pode ser no futuro). |
| **1.2. Registrar Ativo (Venda)** | - Como usuário, quero selecionar um ativo que já possuo na minha carteira para vender.<br>- Como usuário, quero preencher um formulário com a data, quantidade e preço de uma venda.<br>- Como sistema, devo validar se o usuário tem saldo suficiente do ativo para vender.<br>- Como usuário, quero ver uma confirmação visual após registrar a venda. |
| **1.3. Visualizar Histórico** | - Como usuário, quero acessar uma tela que lista todas as minhas transações (compras e vendas).<br>- Como usuário, quero ver os detalhes de cada transação (ativo, data, quantidade, preço).<br>- Como usuário, quero poder corrigir uma transação que registrei com erro. |

### 6.2. Épico 2: Acompanhar Performance (Baseado em "Performance e Análise")

*   **Objetivo do Usuário:** "Eu quero ver o desempenho da minha carteira de forma simples e visual para saber se estou ganhando ou perdendo dinheiro."

| Passos da Jornada (Features) | Demandas (User Stories) para o MVP |
| :--- | :--- |
| **2.1. Ver Posição Consolidada** | - Como usuário, ao fazer login, quero ver o valor total atualizado da minha carteira (saldo).<br>- Como usuário, quero ver a rentabilidade total da minha carteira (em % e em valor monetário).<br>- Como usuário, quero ver uma lista dos ativos que possuo, com sua quantidade e valor atual. |
| **2.2. Analisar Evolução** | - Como usuário, quero ver um gráfico que mostra a evolução do valor da minha carteira ao longo do tempo.<br>- Como usuário, quero poder filtrar o período do gráfico (ex: 7 dias, 1 mês, 1 ano). |

### 6.3. Épico 3: Explorar Mercado (Baseado em "Screeners e Insights")

*   **Objetivo do Usuário:** "Eu quero consultar informações e cotações dos ativos para me ajudar a decidir o que comprar ou vender."

| Passos da Jornada (Features) | Demandas (User Stories) para o MVP |
| :--- | :--- |
| **3.1. Buscar Cotação de Ativo** | - Como visitante (sem login), quero ter um campo de busca para pesquisar ativos.<br>- Como visitante, ao buscar, quero ver a cotação atual, a variação do dia e um mini-gráfico do ativo. |
| **3.2. Ver Detalhes do Ativo** | - Como visitante, ao clicar em um ativo, quero ver uma página com seus fundamentos básicos (ex: setor, P/L, etc. - *definir quais são os essenciais para o MVP*). |
| **3.3. Usar Screener Básico** | - Como visitante, quero acessar uma tela de "Screener" onde posso aplicar filtros básicos (ex: "ativos que mais subiram hoje", "ativos que mais caíram hoje").<br>- Como sistema, devo exibir uma lista de ativos que correspondem ao filtro selecionado. |

## 7. Hipótese Inicial para Validação (Protótipo)

Com base no Lean Product Canvas (Caixa 7), a hipótese prioritária para validação é:

**"Acreditamos que o Aumento Nº de clientes será alcançado se Investidor comum obtiver Visualização dinâmica da carteira com monitorização da carteira de investimentos."**

O protótipo deve focar em validar essa hipótese, provavelmente através de um fluxo que permita ao usuário comum registrar suas operações e visualizar a carteira de forma dinâmica, conforme as features do MVP relacionadas a "Registrar Operações" e "Acompanhar Performance".

---



## 8. Transcrição do Kickoff (Pontos Relevantes)

### 8.1. Apresentação do Projeto e Expectativas

*   **Nelson Nani Mafila:** Co-fundador da Nani Invest.
*   **Jordano Gonzatto:** Membro da equipe do projeto.
*   **João Deiró:** Membro da equipe do projeto.
*   **Objetivo da Reunião:** Entender as expectativas, contexto, ideias do cliente, o que já foi pensado e o que precisa ser investigado.
*   **Sucesso do Projeto:** Definido por métricas e feedback, não apenas por entrega de funcionalidades.

### 8.2. Metodologia e Ferramentas

*   **Gestão de Demandas:** Uso do Jira para gestão interna das demandas, que são quebradas em pequenas entregas de funcionalidade e valor para o usuário.
*   **Abordagem Iterativa:** Possibilidade de ajustar o escopo, definições e funcionalidades a cada semana/quinzena/dia, respondendo ao contexto de forma dinâmica e viva. Processo baseado em feedback.
*   **Status Report:** Relatório quinzenal/semanal para acompanhamento de consumo de horas e funcionalidades, gerido pelo gestor de projeto (LEN).
*   **Gravação de Reuniões:** Todas as reuniões são gravadas e documentadas para acesso futuro. Canal no Slack para comunicação e acesso às gravações.

### 8.3. Lean Product Canvas (Discussão no Kickoff)

*   **Problema de Negócio:** Qual o problema mais importante a ser resolvido agora?
*   **Resultados de Negócio:** Como saber se o problema está sendo resolvido (métricas de produto, sistema, projeto)? Ex: Aumentar receita, reduzir custos, etc.
*   **Pessoas Envolvidas:** Quem são os usuários/clientes (personas) e quais as métricas para eles? Ex: Taxa de sucesso em tarefas, tempo para finalizar tarefas.
*   **Retornos e Benefícios para o Usuário:** Principais ganhos para o usuário.
*   **Ideias de Soluções:** Esboço de soluções (Caixa 5 do Canvas), que pode ser iterado e ajustado.
*   **Hipóteses:** Formulação de hipóteses (Caixa 6 do Canvas) que conectam resultados de negócio, usuários, benefícios e funcionalidades. As hipóteses são priorizadas para definir o primeiro grande marco a ser validado.
*   **Menor Esforço para Validação:** Definir a forma mais enxuta, econômica, rápida e ágil para validar ou invalidar a hipótese prioritária.

### 8.4. Event Storming e Story Mapping (Discussão no Kickoff)

*   **Event Storming:** Dá uma noção geral do primeiro marco de entrega de funcionalidade.
*   **Story Mapping:** Quebra o grande assunto (definido pelo Event Storming) em detalhes, criando demandas para desenvolvimento.
*   **Fluxo de Desenvolvimento:** Após o Story Mapping, as demandas entram no fluxo de desenvolvimento, uma por vez.

### 8.5. Upstream e Downstream (Discussão no Kickoff)

*   **Upstream:** Etapa de definição de escopo, design e validação visual/experiência. O objetivo é remover a incerteza antes da implementação para evitar desperdício de dinheiro no desenvolvimento.
*   **Downstream:** Etapa de implementação pelo time de desenvolvimento.

## 9. Análise dos Documentos PDF (TwalaInsights-Discovery)

Os documentos PDF (TwalaInsights-Discovery.pdf, TwalaInsights-Discovery(1).pdf, TwalaInsights-Discovery(2).pdf, TwalaInsights-Discovery(3).pdf, TwalaInsights-Discovery(4).pdf) contêm diversos elementos visuais e textuais que foram parcialmente extraídos e interpretados. O conteúdo é composto por:

*   **Eventos de Domínio:** Post-its laranjas representando fatos que ocorrem no sistema (ex: "Utilizador registou-se", "Activo vendido", "Cupões foram recebidos").
*   **Comandos:** Ações que levam a um evento (ex: "Criar Conta", "Registrar Compra").
*   **Views/Read Models:** Telas ou informações que o usuário vê (ex: "Formulário de Criação de Conta", "Dashboard").
*   **Políticas/Automações:** Reações automáticas do sistema (ex: "Enviar notificação de boas-vindas").
*   **Contextos Delimitados:** Agrupamentos de eventos e comandos em áreas como "Onboarding e Autenticação", "Transações e Ativos", "Screeners e Insights", "Performance e Análise", "Gestão de Investidores", "Acesso Inicial e Landing Page", "Segurança e Administração".

### 9.1. Conteúdo Específico de TwalaInsights-Discovery.pdf (Página 1)

*   **Descrição de Ativos:** Gráficos de performance, sites de notícias financeiras, emails personalizados, cenários de compra e venda simulados, descrição completa de cada ativo cotado em Bolsa, fundamentos de vários ativos cotados em Bolsa.
*   **Dashboard:** Página inicial acessada, Newsletter enviada.
*   **Indicadores de Mercado:** Indicadores de desempenho do portfólio visualizados, inscrição de serviços do Twala enviado.
*   **Integração de Contas:** Contas de custódias cadastradas, históricos de transações funcionando, balanço patrimonial acedido, dividendos recebidos, juros corridos e do exercício calculados.
*   **Alertas e Automações:** Alertas de mercado personalizados, Stock portfolio de performance calculado, exportação de dados em PDF ou Excel realizada, automações feitas.
*   **Outros Eventos:** Utilizador desautenticado, ativo vendido, ganhos na alienação de ativos registados, novos ativos NI da operação implementado, dados estatísticos de rankings apresentados, processo de validação de condições implementado, página de mercado visualizada, simulador financeiro acedido, dividendos ajustados ao tempo, investidores demonstraram responsividade, serviços adaptados, formulário de validação de condições implementado, políticas e termos implementados.

### 9.2. Conteúdo Específico de TwalaInsights-Discovery(2).pdf (Página 1)

*   **Contextos:** Onboarding e Autenticação, Transações e Ativos, Screeners e Insights, Performance e Análise, Gestão de Investidores (por Gestores), Acesso Inicial e Landing Page (sem autenticação), Segurança e Administração.
*   **Eventos e Comandos Detalhados por Contexto:**
    *   **Onboarding e Autenticação:** Utilizador registou-se, Utilizador autenticou-se, Utilizador desautenticou-se, Utilizador alterou password, Utilizador redefiniu password, Utilizador ativou 2FA, Utilizador desativou 2FA, Utilizador aceitou termos e condições.
    *   **Transações e Ativos:** Ativo comprado, Ativo vendido, Operação de compra registada, Operação de venda registada, Histórico de transações acedido, Ativos registados em bolsa, Ativos registados manualmente.
    *   **Screeners e Insights:** Insights de mercado visualizados, Screeners de mercado visualizados, Alertas de mercado recebidos, Notícias de mercado lidas.
    *   **Performance e Análise:** Performance da carteira visualizada, Gráficos de performance visualizados, Rentabilidade da carteira visualizada, Comparativo de carteira visualizado, Variação de ativos visualizada.
    *   **Gestão de Investidores (por Gestores):** Investidor registado, Investidor autenticado, Investidor desautenticado, Investidor alterou password, Investidor redefiniu password, Investidor ativou 2FA, Investidor desativou 2FA, Investidor aceitou termos e condições.
    *   **Acesso Inicial e Landing Page:** Visitante acedeu à landpage, Visitante subscreveu à newsletter, Visitante visualizou insights de mercado sem autenticação, Visitante visualizou screeners de mercado sem autenticação.
    *   **Segurança e Administração:** Permissões atribuídas, Permissões revogadas, Utilizador bloqueado, Utilizador desbloqueado, Utilizador eliminado, Utilizador editado, Utilizador criado, Utilizador atualizado.

### 9.3. Conteúdo Específico de TwalaInsights-Discovery(3).pdf (Página 1)

*   **Fluxo de Onboarding e Autenticação:** Detalha a jornada do visitante e usuário, incluindo criação de conta, login, visualização de cotações, e ações como aceitar termos, alterar/redefinir senha, ativar/desativar 2FA.
*   **Fluxo de Transações e Ativos:** Abrange o registro de operações de compra e venda, visualização do histórico e gestão de ativos.
*   **Fluxo de Performance e Análise:** Mostra a visualização de performance da carteira, gráficos e rentabilidade.
*   **Fluxo de Screeners e Insights:** Detalha a visualização de insights e screeners de mercado.
*   **Fluxo de Notificações:** Recebimento de alertas de mercado.

### 9.4. Conteúdo Específico de TwalaInsights-Discovery(4).pdf (Página 1)

*   **Fluxo de Subscrição:** Visitante subscreve à newsletter.
*   **Fluxo de Pagamento:** Processo de pagamento.
*   **Fluxo de Gestão de Investidores:** Gestor registra/autentica/desautentica investidor.
*   **Fluxo de Administração:** Atribuição/revogação de permissões, bloqueio/desbloqueio/eliminação/edição/criação/atualização de usuários.
*   **Fluxo de Simulação:** Simulação de compras e vendas.
*   **Fluxo de Exportação:** Exportação de dados (PDF/Excel).
*   **Fluxo de Perfil:** Visualização e atualização do perfil do usuário.

## 10. Hipótese Inicial para Validação (Protótipo)

Com base no Lean Product Canvas (Caixa 7), a hipótese prioritária para validação é:

**"Acreditamos que o Aumento Nº de clientes será alcançado se Investidor comum obtiver Visualização dinâmica da carteira com monitorização da carteira de investimentos."**

O protótipo deve focar em validar essa hipótese, provavelmente através de um fluxo que permita ao usuário comum registrar suas operações e visualizar a carteira de forma dinâmica, conforme as features do MVP relacionadas a "Registrar Operações" e "Acompanhar Performance".

---



### 8.6. Contexto da Nani Invest (da transcrição do kickoff)

*   **Problema de Negócio (visão Nani Invest):** Dificuldade dos investidores em Angola de acompanharem facilmente o desempenho dos seus investimentos em um só lugar, devido à limitação dos homebrokers (90% dos homebrokers não oferecem ferramentas tradicionais), o que traz a perda de receita potencial e de novos clientes para a empresa.
*   **Visão:** Criar uma plataforma para o mercado angolano que simplifique o mundo dos investimentos, tornando-o acessível e menos intimidante. O objetivo é "roubar" usuários do mercado de apostas (gambling), mostrando que investir é uma alternativa mais inteligente e sustentável para o crescimento financeiro.
*   **Expectativa:** Entender o que é sucesso para o projeto, o que já se tem de expectativa, o que já se tem de certeza e o que precisa de ajuda para responder.

---

