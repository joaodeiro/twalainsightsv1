# Lógica de Cálculo e Modelagem de Dados para Operações de Ativos - Twala Insights

Este documento detalha a modelagem de dados e a lógica de cálculo para as operações de compra e venda de ativos no sistema Twala Insights. O objetivo é garantir a precisão, integridade e rastreabilidade das informações do portfólio do usuário, permitindo cálculos de performance confiáveis e análises detalhadas.

## 1. Definição de Entidades e Atributos Essenciais

Para gerenciar as operações de compra e venda de ativos e o portfólio do usuário, as seguintes entidades são consideradas fundamentais:

### 1.1. Entidade `Usuario`

Representa o usuário final do sistema Twala Insights. É a entidade central à qual todas as contas de custódia e operações estarão vinculadas.

| Atributo         | Tipo de Dados | Descrição                                        | Observações                                    |
| :--------------- | :------------ | :----------------------------------------------- | :--------------------------------------------- |
| `id_usuario`     | UUID/INT      | Identificador único do usuário.                  | Chave primária.                                |
| `nome`           | TEXTO         | Nome completo do usuário.                        |                                                |
| `email`          | TEXTO         | Endereço de e-mail do usuário.                   | Único, usado para login.                       |
| `data_cadastro`  | DATA/HORA     | Data e hora do registro do usuário no sistema.   |                                                |

### 1.2. Entidade `ContaCustodia`

Representa uma conta de investimento que o usuário possui em uma corretora ou instituição financeira. Permite ao usuário organizar seus ativos por instituição.

| Atributo               | Tipo de Dados | Descrição                                                    | Observações                                                                 |
| :--------------------- | :------------ | :----------------------------------------------------------- | :-------------------------------------------------------------------------- |
| `id_conta_custodia`    | UUID/INT      | Identificador único da conta de custódia.                    | Chave primária.                                                             |
| `id_usuario`           | UUID/INT      | Chave estrangeira para a entidade `Usuario`.                 | Vincula a conta de custódia ao usuário.                                     |
| `nome_corretora`       | TEXTO         | Nome da corretora ou instituição financeira.                 | Ex: "Banco X", "Corretora Y".                                             |
| `apelido_conta`        | TEXTO         | Nome amigável/apelido dado pelo usuário para a conta.        | Ex: "Minha Conta Principal", "Investimentos Filha".                       |
| `numero_conta`         | TEXTO         | Número da conta ou código de cliente na corretora.           | Ajuda a diferenciar contas na mesma corretora.                              |
| `tipo_conta`           | TEXTO         | Tipo de conta (ex: "Corretagem", "Previdência").           | Opcional no MVP, mas recomendado para categorização futura.                 |
| `moeda_base`           | TEXTO         | Moeda principal da conta (ex: "AOA", "USD").               | Opcional no MVP, mas importante para multi-moeda.                           |
| `data_cadastro`        | DATA/HORA     | Data e hora do cadastro da conta de custódia no sistema.     |                                                                             |

### 1.3. Entidade `Ativo`

Representa um ativo financeiro negociável (ex: ação, fundo, título). Esta entidade pode ser pré-populada com dados da BODIVA ou outras fontes de mercado.

| Atributo         | Tipo de Dados | Descrição                                        | Observações                                    |
| :--------------- | :------------ | :----------------------------------------------- | :--------------------------------------------- |
| `id_ativo`       | UUID/INT      | Identificador único do ativo.                    | Chave primária.                                |
| `ticker`         | TEXTO         | Símbolo de negociação do ativo (ex: "BFA", "BAI"). | Único.                                         |
| `nome_completo`  | TEXTO         | Nome completo do ativo (ex: "Banco de Fomento Angola"). |                                                |
| `setor`          | TEXTO         | Setor de atuação do ativo (ex: "Bancos", "Mineração"). |                                                |
| `moeda_negociacao` | TEXTO         | Moeda em que o ativo é negociado (ex: "AOA").    |                                                |

### 1.4. Entidade `Operacao`

Representa uma transação de compra ou venda de um ativo. Esta é a entidade central para o registro do histórico do portfólio.

| Atributo               | Tipo de Dados | Descrição                                                    | Observações                                                                 |
| :--------------------- | :------------ | :----------------------------------------------------------- | :-------------------------------------------------------------------------- |
| `id_operacao`          | UUID/INT      | Identificador único da operação.                             | Chave primária.                                                             |
| `id_conta_custodia`    | UUID/INT      | Chave estrangeira para a entidade `ContaCustodia`.           | Vincula a operação a uma conta específica.                                  |
| `id_ativo`             | UUID/INT      | Chave estrangeira para a entidade `Ativo`.                   | Vincula a operação ao ativo negociado.                                      |
| `tipo_operacao`        | ENUM          | Tipo da operação: `COMPRA` ou `VENDA`.                       |                                                                             |
| `data_operacao`        | DATA/HORA     | Data e hora em que a operação foi realizada.                 |                                                                             |
| `quantidade`           | DECIMAL       | Quantidade de unidades do ativo negociadas.                  | Deve ser um número positivo.                                                |
| `preco_unitario`       | DECIMAL       | Preço por unidade do ativo no momento da operação.           |                                                                             |
| `custos_taxas`         | DECIMAL       | Custos e taxas associados à operação (ex: corretagem).       | Opcional no MVP, mas importante para cálculo de custo médio real.           |
| `valor_total_operacao` | DECIMAL       | Valor total da operação (quantidade * preco_unitario + custos_taxas). | Calculado.                                                                  |

### 1.5. Entidade `Portafolio` (ou `PosicaoAtivo`)

Representa a posição atual do usuário em um determinado ativo dentro de uma conta de custódia. Esta entidade será atualizada a cada operação de compra ou venda e é crucial para os cálculos de performance.

| Atributo               | Tipo de Dados | Descrição                                                    | Observações                                                                 |
| :--------------------- | :------------ | :----------------------------------------------------------- | :-------------------------------------------------------------------------- |
| `id_posicao`           | UUID/INT      | Identificador único da posição.                              | Chave primária.                                                             |
| `id_conta_custodia`    | UUID/INT      | Chave estrangeira para a entidade `ContaCustodia`.           |                                                                             |
| `id_ativo`             | UUID/INT      | Chave estrangeira para a entidade `Ativo`.                   |                                                                             |
| `quantidade_total`     | DECIMAL       | Quantidade total do ativo que o usuário possui.              | Atualizada a cada compra/venda.                                             |
| `custo_medio`          | DECIMAL       | Custo médio ponderado do ativo.                              | Crucial para cálculo de lucro/prejuízo.                                     |
| `data_ultima_atualizacao` | DATA/HORA     | Data e hora da última atualização desta posição.             |                                                                             |

---

Continuarei detalhando a lógica de cálculo para compra e venda na próxima seção.



## 2. Detalhamento da Lógica de Cálculo para Compra e Venda

As operações de compra e venda de ativos impactam diretamente a posição do usuário em um ativo e são a base para o cálculo de métricas de performance como custo médio e lucro/prejuízo. A seguir, detalhamos a lógica para cada tipo de operação.

### 2.1. Lógica para Operação de `COMPRA`

Quando um usuário registra uma operação de compra, o sistema deve atualizar a posição do ativo no portfólio (`Portafolio` ou `PosicaoAtivo`) ou criar uma nova posição, caso o ativo não exista na carteira do usuário para aquela conta de custódia.

**Cálculo do Custo Total da Operação:**

`Custo Total da Compra = (Quantidade Comprada * Preço Unitário de Compra) + Custos/Taxas da Compra`

**Atualização da Posição do Ativo (`Portafolio` / `PosicaoAtivo`):**

1.  **Verificar Posição Existente:** O sistema deve verificar se já existe uma entrada para o `id_ativo` e `id_conta_custodia` na tabela `Portafolio`.

2.  **Se Posição Existente:**
    *   **Atualização da `quantidade_total`:**
        `Nova Quantidade Total = Quantidade Atual + Quantidade Comprada`
    *   **Atualização do `custo_medio` (Custo Médio Ponderado):**
        O custo médio ponderado é recalculado para refletir o novo custo total da posição.
        `Custo Total Atual = Quantidade Atual * Custo Médio Atual`
        `Novo Custo Total da Posição = Custo Total Atual + Custo Total da Compra`
        `Novo Custo Médio = Novo Custo Total da Posição / Nova Quantidade Total`

3.  **Se Nova Posição (Ativo não existia na carteira para esta conta de custódia):**
    *   Uma nova entrada é criada na tabela `Portafolio`.
    *   `quantidade_total = Quantidade Comprada`
    *   `custo_medio = Preço Unitário de Compra` (ou `Custo Total da Compra / Quantidade Comprada` se considerarmos os custos/taxas diretamente no custo médio inicial).

**Exemplo de Compra:**

*   **Cenário 1: Primeira Compra do Ativo 'BFA'**
    *   Usuário compra 10 ações de BFA a AOA 18.000,00 cada, com AOA 100,00 de taxas.
    *   `Custo Total da Compra = (10 * 18.000) + 100 = 180.000 + 100 = AOA 180.100,00`
    *   **`Portafolio`:**
        *   `quantidade_total = 10`
        *   `custo_medio = 180.100 / 10 = AOA 18.010,00`

*   **Cenário 2: Segunda Compra do Ativo 'BFA'**
    *   Usuário já possui 10 ações de BFA com custo médio de AOA 18.010,00.
    *   Usuário compra mais 5 ações de BFA a AOA 18.500,00 cada, com AOA 50,00 de taxas.
    *   `Custo Total da Nova Compra = (5 * 18.500) + 50 = 92.500 + 50 = AOA 92.550,00`
    *   `Custo Total Atual da Posição = 10 * 18.010 = AOA 180.100,00`
    *   `Nova Quantidade Total = 10 + 5 = 15`
    *   `Novo Custo Total da Posição = 180.100 + 92.550 = AOA 272.650,00`
    *   `Novo Custo Médio = 272.650 / 15 = AOA 18.176,67`

### 2.2. Lógica para Operação de `VENDA`

Quando um usuário registra uma operação de venda, o sistema deve atualizar a posição do ativo no portfólio e calcular o lucro ou prejuízo realizado sobre as unidades vendidas. É crucial que a venda seja baseada no custo médio ponderado do ativo.

**Validação Pré-Venda:**

*   O sistema deve garantir que a `quantidade` a ser vendida não seja maior que a `quantidade_total` disponível na posição do ativo (`Portafolio`).

**Cálculo do Valor Total da Venda:**

`Valor Total da Venda = (Quantidade Vendida * Preço Unitário de Venda) - Custos/Taxas da Venda`

**Cálculo do Lucro/Prejuízo Realizado:**

`Custo das Unidades Vendidas = Quantidade Vendida * Custo Médio Atual do Ativo`

`Lucro/Prejuízo Realizado = Valor Total da Venda - Custo das Unidades Vendidas`

**Atualização da Posição do Ativo (`Portafolio` / `PosicaoAtivo`):**

1.  **Atualização da `quantidade_total`:**
    `Nova Quantidade Total = Quantidade Atual - Quantidade Vendida`

2.  **Atualização do `custo_medio`:**
    *   O `custo_medio` **não se altera** em uma operação de venda, a menos que a `Nova Quantidade Total` se torne zero (ou seja, o ativo foi totalmente vendido).
    *   Se `Nova Quantidade Total = 0`, a posição do ativo pode ser removida da tabela `Portafolio` ou marcada como inativa.

**Exemplo de Venda:**

*   **Cenário: Venda Parcial do Ativo 'BFA'**
    *   Usuário possui 15 ações de BFA com custo médio de AOA 18.176,67.
    *   Usuário vende 5 ações de BFA a AOA 19.000,00 cada, com AOA 60,00 de taxas.
    *   `Valor Total da Venda = (5 * 19.000) - 60 = 95.000 - 60 = AOA 94.940,00`
    *   `Custo das Unidades Vendidas = 5 * 18.176,67 = AOA 90.883,35`
    *   `Lucro/Prejuízo Realizado = 94.940,00 - 90.883,35 = AOA 4.056,65 (Lucro)`
    *   **`Portafolio`:**
        *   `Nova Quantidade Total = 15 - 5 = 10`
        *   `custo_medio` permanece AOA 18.176,67 (para as 10 ações restantes).

*   **Cenário: Venda Total do Ativo 'BFA'**
    *   Usuário possui 10 ações de BFA com custo médio de AOA 18.176,67.
    *   Usuário vende 10 ações de BFA a AOA 19.500,00 cada, com AOA 80,00 de taxas.
    *   `Valor Total da Venda = (10 * 19.500) - 80 = 195.000 - 80 = AOA 194.920,00`
    *   `Custo das Unidades Vendidas = 10 * 18.176,67 = AOA 181.766,70`
    *   `Lucro/Prejuízo Realizado = 194.920,00 - 181.766,70 = AOA 13.153,30 (Lucro)`
    *   **`Portafolio`:**
        *   `Nova Quantidade Total = 10 - 10 = 0`
        *   A posição de BFA pode ser removida ou marcada como inativa.

---

Continuarei detalhando cenários adicionais e o impacto na modelagem na próxima seção.



## 3. Cenários Adicionais e Impacto na Modelagem

Além das operações básicas de compra e venda, existem cenários que podem impactar a modelagem de dados e a lógica de cálculo, especialmente para garantir a precisão do portfólio e a capacidade de auditoria.

### 3.1. Proventos (Dividendos, Juros sobre Capital Próprio, Bonificações)

Proventos são eventos que aumentam o valor ou a quantidade de ativos do usuário sem uma operação de compra explícita. Eles são cruciais para o cálculo do retorno total do investimento.

**Impacto na Modelagem:**

*   **Nova Entidade `Provento`:** Para registrar os detalhes de cada provento recebido.

    | Atributo               | Tipo de Dados | Descrição                                                    | Observações                                                                 |
    | :--------------------- | :------------ | :----------------------------------------------------------- | :-------------------------------------------------------------------------- |
    | `id_provento`          | UUID/INT      | Identificador único do provento.                             | Chave primária.                                                             |
    | `id_conta_custodia`    | UUID/INT      | Chave estrangeira para `ContaCustodia`.                      |                                                                             |
    | `id_ativo`             | UUID/INT      | Chave estrangeira para `Ativo` (ativo que gerou o provento). |                                                                             |
    | `tipo_provento`        | ENUM          | Tipo: `DIVIDENDO`, `JCP`, `BONIFICACAO`, `RENDIMENTO_FUNDO`. |                                                                             |
    | `data_pagamento`       | DATA          | Data em que o provento foi pago/creditado.                   |                                                                             |
    | `valor_por_unidade`    | DECIMAL       | Valor do provento por unidade do ativo (se aplicável).       | Ex: R$ 0,50 por ação.                                                       |
    | `quantidade_afetada`   | DECIMAL       | Quantidade de unidades do ativo que geraram o provento.      |                                                                             |
    | `valor_total`          | DECIMAL       | Valor total do provento recebido.                            | Calculado: `valor_por_unidade * quantidade_afetada` (ou direto para bonificação). |
    | `quantidade_bonificada` | DECIMAL       | Quantidade de novas ações/cotas recebidas (para bonificação).| Apenas para `BONIFICACAO`.                                                  |

**Lógica de Cálculo:**

*   **Dividendos/JCP/Rendimentos:** O `valor_total` do provento é registrado e deve ser considerado no cálculo do retorno total do portfólio. Não afeta o custo médio do ativo.
*   **Bonificações:** A `quantidade_bonificada` é adicionada à `quantidade_total` do ativo na tabela `Portafolio`. O `custo_medio` do ativo deve ser recalculado para refletir o aumento da quantidade sem custo adicional, diluindo o custo médio existente.
    `Novo Custo Médio = (Custo Médio Atual * Quantidade Atual) / (Quantidade Atual + Quantidade Bonificada)`

### 3.2. Desdobramentos (Splits) e Agrupamentos (Inplits)

Desdobramentos e agrupamentos alteram a quantidade de ações e o preço unitário de um ativo, mas não o valor total da posição do usuário. São eventos corporativos que precisam ser ajustados para manter a precisão histórica.

**Impacto na Modelagem:**

*   **Nova Entidade `EventoCorporativo`:** Para registrar esses eventos e seus fatores de ajuste.

    | Atributo               | Tipo de Dados | Descrição                                                    | Observações                                                                 |
    | :--------------------- | :------------ | :----------------------------------------------------------- | :-------------------------------------------------------------------------- |
    | `id_evento`            | UUID/INT      | Identificador único do evento.                               | Chave primária.                                                             |
    | `id_ativo`             | UUID/INT      | Chave estrangeira para `Ativo`.                              |                                                                             |
    | `tipo_evento`          | ENUM          | Tipo: `DESDOBRAMENTO` (Split) ou `AGRUPAMENTO` (Inplit).     |                                                                             |
    | `data_evento`          | DATA          | Data em que o evento ocorreu.                                |                                                                             |
    | `fator_ajuste_quantidade` | DECIMAL       | Fator pelo qual a quantidade deve ser multiplicada.          | Ex: 2 para um split de 1:2.                                                 |
    | `fator_ajuste_preco`   | DECIMAL       | Fator pelo qual o preço deve ser dividido.                   | Ex: 2 para um split de 1:2.                                                 |

**Lógica de Cálculo:**

*   **Desdobramento (Split):** Se um ativo sofre um split de 1:N (uma ação vira N ações), a `quantidade_total` do ativo na `Portafolio` é multiplicada por N, e o `custo_medio` é dividido por N. O valor total da posição (`quantidade_total * custo_medio`) permanece o mesmo.
    `Nova Quantidade Total = Quantidade Atual * Fator de Ajuste`
    `Novo Custo Médio = Custo Médio Atual / Fator de Ajuste`
*   **Agrupamento (Inplit):** Se um ativo sofre um inplit de N:1 (N ações viram 1 ação), a `quantidade_total` do ativo na `Portafolio` é dividida por N, e o `custo_medio` é multiplicado por N. O valor total da posição permanece o mesmo.
    `Nova Quantidade Total = Quantidade Atual / Fator de Ajuste`
    `Novo Custo Médio = Custo Médio Atual * Fator de Ajuste`

### 3.3. Transferências de Ativos (Entre Contas de Custódia)

Permite ao usuário mover ativos de uma conta de custódia para outra dentro do sistema, sem que haja uma compra ou venda real.

**Impacto na Modelagem:**

*   **Nova Entidade `Transferencia`:** Para registrar essas movimentações.

    | Atributo               | Tipo de Dados | Descrição                                                    | Observações                                                                 |
    | :--------------------- | :------------ | :----------------------------------------------------------- | :-------------------------------------------------------------------------- |
    | `id_transferencia`     | UUID/INT      | Identificador único da transferência.                        | Chave primária.                                                             |
    | `id_conta_origem`      | UUID/INT      | Chave estrangeira para `ContaCustodia` (origem).             |                                                                             |
    | `id_conta_destino`     | UUID/INT      | Chave estrangeira para `ContaCustodia` (destino).            |                                                                             |
    | `id_ativo`             | UUID/INT      | Chave estrangeira para `Ativo`.                              |                                                                             |
    | `quantidade`           | DECIMAL       | Quantidade de unidades transferidas.                         |                                                                             |
    | `data_transferencia`   | DATA/HORA     | Data e hora da transferência.                                |                                                                             |
    | `custo_medio_transferido` | DECIMAL       | Custo médio do ativo na conta de origem no momento da transferência. | Importante para manter a precisão do custo médio na conta de destino.      |

**Lógica de Cálculo:**

*   **Conta de Origem:** A `quantidade_total` do ativo é reduzida. O `custo_medio` da posição remanescente não se altera (a menos que a quantidade se torne zero).
*   **Conta de Destino:** A `quantidade_total` do ativo é aumentada. O `custo_medio` da posição na conta de destino é recalculado de forma ponderada, incorporando o `custo_medio_transferido`.

### 3.4. Ajustes Manuais (Correções)

Permite que o usuário ou administrador faça ajustes manuais em quantidades ou custos médios para corrigir erros ou refletir situações não cobertas por operações padrão.

**Impacto na Modelagem:**

*   **Nova Entidade `AjusteManual`:** Para registrar e auditar esses ajustes.

    | Atributo               | Tipo de Dados | Descrição                                                    | Observações                                                                 |
    | :--------------------- | :------------ | :----------------------------------------------------------- | :-------------------------------------------------------------------------- |
    | `id_ajuste`            | UUID/INT      | Identificador único do ajuste.                               | Chave primária.                                                             |
    | `id_posicao`           | UUID/INT      | Chave estrangeira para `Portafolio` (posição ajustada).      |                                                                             |
    | `tipo_ajuste`          | ENUM          | Tipo: `QUANTIDADE`, `CUSTO_MEDIO`.                           |                                                                             |
    | `valor_anterior`       | DECIMAL       | Valor da quantidade/custo médio antes do ajuste.             |                                                                             |
    | `valor_novo`           | DECIMAL       | Valor da quantidade/custo médio após o ajuste.               |                                                                             |
    | `data_ajuste`          | DATA/HORA     | Data e hora do ajuste.                                       |                                                                             |
    | `motivo_ajuste`        | TEXTO         | Descrição do motivo do ajuste.                               |                                                                             |

**Lógica de Cálculo:**

*   Ajustes manuais sobrescrevem diretamente os valores de `quantidade_total` ou `custo_medio` na tabela `Portafolio`. É crucial que esses ajustes sejam auditáveis e que o motivo seja registrado.

---

Continuarei gerando o documento completo de modelagem e lógica de cálculo na próxima seção.



## 4. Considerações Finais e Próximos Passos

A modelagem de dados e a lógica de cálculo detalhadas neste documento são a espinha dorsal para a funcionalidade de gestão de portfólio do Twala Insights. A correta implementação dessas definições garantirá:

*   **Precisão:** Cálculos de custo médio, lucro/prejuízo e performance serão confiáveis.
*   **Integridade:** Os dados do portfólio do usuário serão consistentes e refletirão a realidade de suas operações.
*   **Rastreabilidade:** Todas as operações e eventos corporativos serão registrados, permitindo auditoria e análise histórica.
*   **Escalabilidade:** A estrutura proposta permite a adição de novas funcionalidades (como relatórios mais complexos, análises de risco, etc.) sem a necessidade de grandes reestruturações.

É fundamental que a equipe de desenvolvimento utilize este documento como referência primária durante a implementação. Testes rigorosos devem ser realizados para validar cada lógica de cálculo e a integridade dos dados em diferentes cenários.

**Próximos Passos Sugeridos:**

1.  **Revisão Técnica:** Uma revisão detalhada deste documento pela equipe de desenvolvimento e arquitetura de dados para validação e possíveis refinamentos.
2.  **Definição de APIs:** Com base na modelagem, iniciar a definição das APIs para registro de operações, consulta de portfólio e histórico.
3.  **Desenvolvimento de Testes:** Criar casos de teste abrangentes que cubram todas as lógicas de cálculo e cenários de borda.

Este documento serve como um guia sólido para a construção de um sistema robusto e confiável para o Twala Insights.

---

**Autor:** Manus AI
**Data:** 01 de Agosto de 2025


