# Escopo da Tela de Performance da Carteira - Twala Insights

A tela de performance da carteira é o hub central onde o usuário poderá visualizar o desempenho de seus investimentos de forma consolidada e detalhada. Esta feature é crucial para atender ao propósito de "consolidar minhas informações de várias corretoras para saber minha real performance" e "acompanhar performance" conforme definido no MVP.

## 1. Itens Essenciais do Dashboard de Performance

O dashboard deve fornecer uma visão geral e imediata da saúde financeira da carteira do usuário, com os seguintes itens:

### 1.1. Saldo Total Atual da Carteira

*   **Descrição:** O valor total consolidado de todos os ativos que o usuário possui em suas contas de custódia. Este valor deve ser atualizado com base na cotação de mercado mais recente dos ativos.
*   **Cálculo:** Soma do (quantidade * cotação atual) de todos os ativos em todas as contas de custódia do usuário.
*   **Visualização:** Número grande e proeminente, com a moeda (AOA).

### 1.2. Rentabilidade Total da Carteira

*   **Descrição:** O ganho ou perda percentual e monetário da carteira desde o início do investimento ou de um período selecionado. É um indicador chave do sucesso do investimento.
*   **Cálculo:**
    *   **Rentabilidade Monetária:** `Saldo Total Atual - Custo Total Investido`
    *   **Rentabilidade Percentual:** `(Rentabilidade Monetária / Custo Total Investido) * 100`
    *   `Custo Total Investido`: Soma do (quantidade * custo médio) de todos os ativos, considerando todas as operações de compra e taxas.
*   **Visualização:** Número percentual e valor monetário, com indicação visual (seta para cima/verde para lucro, seta para baixo/vermelho para prejuízo).

### 1.3. Gráfico de Evolução da Carteira

*   **Descrição:** Um gráfico de linha que mostra a variação do valor total da carteira ao longo do tempo. Permite ao usuário visualizar tendências e o impacto de suas decisões.
*   **Dados:** Pontos de dados diários (ou semanais/mensais, dependendo da granularidade) do valor total da carteira.
*   **Visualização:** Gráfico de linha interativo, com opções de filtro de período (ex: 1D, 7D, 1M, 3M, 6M, 1A, YTD, Tudo).

### 1.4. Distribuição da Carteira por Ativo/Setor

*   **Descrição:** Um gráfico de pizza ou de barras que mostra a proporção de cada ativo ou setor no valor total da carteira. Ajuda o usuário a entender sua diversificação.
*   **Dados:** Valor de mercado de cada ativo/setor em relação ao saldo total da carteira.
*   **Visualização:** Gráfico de pizza ou barras, com legendas claras e percentuais.

### 1.5. Lista de Ativos em Carteira (Posições Atuais)

*   **Descrição:** Uma tabela ou lista detalhada de todos os ativos que o usuário possui, com informações chave para cada um.
*   **Colunas/Informações por Ativo:**
    *   **Ativo (Ticker/Nome):** Identificação do ativo.
    *   **Quantidade:** Número de unidades possuídas.
    *   **Preço Médio:** Custo médio ponderado de aquisição do ativo.
    *   **Cotação Atual:** Preço de mercado atual do ativo.
    *   **Valor Atual:** `Quantidade * Cotação Atual`.
    *   **Rentabilidade (Dia):** Variação percentual e monetária do ativo no dia atual.
    *   **Rentabilidade (Total):** Variação percentual e monetária do ativo desde a compra (baseado no preço médio).
*   **Visualização:** Tabela paginada/rolável, com possibilidade de ordenação por coluna.

---

Continuarei detalhando informações de suporte e interações da tela de performance na próxima seção.



## 2. Informações de Suporte e Interações da Tela de Performance

Para tornar a tela de performance da carteira mais útil e interativa, as seguintes funcionalidades e elementos de suporte devem ser considerados:

### 2.1. Seleção de Conta de Custódia

*   **Descrição:** Um seletor (dropdown) que permite ao usuário alternar entre suas diferentes contas de custódia. Ao selecionar uma conta, o dashboard e a lista de ativos devem ser atualizados para refletir apenas os dados daquela conta. Uma opção "Todas as Contas" deve estar disponível para a visão consolidada.
*   **Localização:** Geralmente no topo da tela, próximo ao título da carteira.

### 2.2. Filtros e Períodos do Gráfico de Evolução

*   **Descrição:** Botões ou um seletor de período para o gráfico de evolução da carteira (ex: 1D, 7D, 1M, 3M, 6M, 1A, YTD, Tudo). Ao selecionar um período, o gráfico deve ser atualizado dinamicamente.
*   **Interação:** Hover no gráfico para exibir o valor da carteira em datas específicas.

### 2.3. Ações Rápidas / Botões de Ação

*   **Descrição:** Botões de fácil acesso para as ações mais comuns relacionadas à gestão da carteira, que podem levar o usuário para outras telas ou abrir modais.
*   **Exemplos:**
    *   **"Registrar Operação"**: Leva para o formulário de registro de compra/venda.
    *   **"Adicionar Ativo"**: Pode ser um atalho para registrar uma nova compra.
    *   **"Ver Histórico de Transações"**: Leva para a tela de histórico de operações.
*   **Localização:** Em destaque no dashboard, ou como parte de um menu de ações.

### 2.4. Detalhes do Ativo (Link para Tela de Detalhes)

*   **Descrição:** Ao clicar em um ativo na "Lista de Ativos em Carteira", o usuário deve ser redirecionado para uma tela de detalhes do ativo. Esta tela pode conter informações mais aprofundadas sobre o ativo, seu histórico de cotações, notícias relevantes, etc.
*   **Informações na Tela de Detalhes (MVP):**
    *   Gráfico de cotação histórica do ativo.
    *   Informações fundamentais básicas (Setor, P/L, Dividend Yield - conforme dados da BODIVA).
    *   Histórico de operações do usuário para aquele ativo específico.

### 2.5. Atualização de Dados (Manual/Automática)

*   **Descrição:** Indicação da última atualização dos dados de cotação. Pode haver um botão para "Atualizar Agora" para que o usuário possa forçar a atualização, caso deseje.
*   **Frequência:** As cotações devem ser atualizadas automaticamente em intervalos regulares (ex: a cada 15-30 minutos durante o horário de pregão, ou uma vez ao dia após o fechamento).

### 2.6. Mensagens e Alertas

*   **Descrição:** Espaço para exibir mensagens importantes ao usuário, como alertas sobre ativos que atingiram um determinado preço, ou notificações sobre eventos corporativos relevantes para os ativos em sua carteira.
*   **Exemplos:**
    *   "Seu ativo X subiu Y% hoje!"
    *   "Dividendo de Z$ de Ativo W creditado em sua conta."

---

Continuarei gerando o documento completo de escopo da tela de performance da carteira na próxima seção.



## 3. Considerações Finais e Próximos Passos

A tela de performance da carteira é a vitrine do Twala Insights para o usuário, consolidando todas as informações de seus investimentos de forma clara e intuitiva. O escopo detalhado acima visa fornecer uma base sólida para o desenvolvimento do MVP, garantindo que os elementos mais críticos para a visualização da performance sejam implementados.

**Pontos Chave para o Desenvolvimento:**

*   **Priorização:** Focar nos itens essenciais do dashboard e na lista de ativos para o MVP, garantindo a funcionalidade principal de visualização da performance.
*   **Usabilidade:** A interface deve ser limpa, intuitiva e fácil de navegar, mesmo para usuários com pouca experiência em investimentos.
*   **Precisão dos Dados:** A integração com a lógica de cálculo de custo médio e lucro/prejuízo é fundamental para a credibilidade da tela.
*   **Performance:** A tela deve carregar rapidamente, mesmo com um grande volume de dados, para garantir uma boa experiência do usuário.

**Próximos Passos Sugeridos:**

1.  **Design de UI/UX:** Com base neste escopo, iniciar o processo de design das telas, criando wireframes e mockups.
2.  **Validação com Usuários:** Realizar testes de usabilidade com usuários reais para coletar feedback e refinar o design e as funcionalidades.
3.  **Desenvolvimento Iterativo:** Implementar a tela de forma iterativa, começando pelos elementos mais críticos do MVP e adicionando funcionalidades progressivamente.

Este documento serve como um guia para a equipe de produto e desenvolvimento, garantindo um entendimento comum sobre o que será construído para a tela de performance da carteira.

---

**Autor:** Manus AI
**Data:** 01 de Agosto de 2025


