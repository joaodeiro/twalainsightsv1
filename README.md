# 🚀 Twala Insights v0

> Plataforma para simplificar o mundo dos investimentos no mercado angolano

## 🎯 Sobre o Projeto

O **Twala Insights** é uma plataforma que visa "roubar" usuários do mercado de apostas (gambling), mostrando que investir é uma alternativa mais inteligente e sustentável para o crescimento financeiro no mercado angolano.

### 🎯 Hipótese Prioritária
> "Acreditamos que o Aumento Nº de clientes será alcançado se Investidor comum obtiver Visualização dinâmica da carteira com monitorização da carteira de investimentos."

## 🛠️ Stack Técnica

- **Frontend**: Next.js 14 + React 18 + TypeScript
- **Styling**: Tailwind CSS + Headless UI
- **Gráficos**: Recharts
- **Formulários**: React Hook Form + Zod
- **Testes**: Jest + Testing Library

## 📁 Estrutura do Projeto

```
twalainsightsv0/
├── 📚 docs/                    # Documentação completa
│   ├── project-context.md      # Contexto do projeto
│   ├── story-map-mvp.md        # User stories do MVP
│   ├── demandas-template.md    # Template de gestão
│   ├── tech-stack.md           # Stack técnica
│   └── getting-started.md      # Guia de início
├── 💻 src/                     # Código fonte
│   ├── app/                    # Next.js App Router
│   ├── components/             # Componentes reutilizáveis
│   ├── types/                  # Tipos TypeScript
│   ├── lib/                    # Bibliotecas
│   ├── utils/                  # Utilitários
│   ├── hooks/                  # Custom hooks
│   └── styles/                 # Estilos
├── 🧪 tests/                   # Testes
├── 🌐 public/                  # Arquivos públicos
└── 📖 README.md                # Este arquivo
```

## ⚡ Início Rápido

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp env.example .env.local
# Editar .env.local com suas credenciais do Supabase

# Executar em desenvolvimento
npm run dev

# Acessar
open http://localhost:3000
```

## 🚀 Deploy

### Vercel (Recomendado)

1. **Conectar ao GitHub:**
   ```bash
   # Fazer push para o GitHub
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy no Vercel:**
   - Acesse [vercel.com](https://vercel.com)
   - Conecte sua conta GitHub
   - Importe o repositório
   - Configure as variáveis de ambiente:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Deploy automático!

### Variáveis de Ambiente Necessárias

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

## 📋 Primeira Release - Sprint 1 (Fundação - Gestão Básica)

### ✅ Concluído
- [x] Setup do projeto
- [x] Estrutura de pastas
- [x] Configurações técnicas
- [x] Página inicial
- [x] Tipos TypeScript atualizados

### 🔄 Em Andamento
- [ ] **US004** - Editar cadastro de ativo
- [ ] **US009** - Visualizar Stock/Carteira
- [ ] **US010** - Exportar Stock/Carteira

### ✅ Concluídas
- [x] **US001** - Cadastrar contas de custódia
- [x] **US002** - Cadastrar ativos comprados
- [x] **US003** - Cadastrar ativos vendidos

## 🎨 Design System

- **Cores**: Primary (azul), Secondary (cinza), Success (verde), Warning (amarelo), Error (vermelho)
- **Tipografia**: Inter (Google Fonts)
- **Componentes**: Botões, Cards, Inputs padronizados
- **Responsividade**: Mobile-first

## 📊 Métricas de Sucesso (F4P)

| Propósito | Critério | Métrica | Meta |
|-----------|----------|---------|------|
| Gerenciar Carteira | Facilidade de Registro | Tempo para cadastrar ativo | < 2 min |
| | Visibilidade | Frequência de acesso à carteira | > 5 sessões/semana |
| | Controle | Taxa de edição de transações | < 10% |
| Acompanhar Performance | Clareza dos Indicadores | Tempo para entender performance | < 30s |
| | Qualidade do Relatório | Taxa de exportação de relatórios | > 20% dos usuários |
| Explorar Mercado | Disponibilidade de Informações | Taxa de sucesso na busca | > 95% |
| | Relevância dos Insights | Taxa de cliques em insights | > 15% |
| | Eficácia dos Alertas | Taxa de resposta a alertas | > 30% |

## 🚀 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run start        # Servidor de produção

# Qualidade
npm run lint         # Verificar código
npm run type-check   # Verificar tipos

# Testes
npm run test         # Executar testes
npm run test:watch   # Testes em modo watch
npm run test:coverage # Testes com cobertura
```

## 📚 Documentação

- **[Contexto do Projeto](docs/project-context.md)** - Informações completas
- **[Story Map MVP](docs/story-map-mvp.md)** - User stories organizadas
- **[Template de Demandas](docs/demandas-template.md)** - Gestão de tarefas
- **[Stack Técnica](docs/tech-stack.md)** - Tecnologias e configurações
- **[Guia de Início](docs/getting-started.md)** - Como começar

## 🤝 Como Contribuir

1. Escolha uma User Story do `docs/story-map-mvp.md`
2. Use o template em `docs/demandas-template.md`
3. Siga as convenções de código
4. Escreva testes
5. Faça code review

## 📈 Status do Projeto

- **Fase**: Primeira Release (18 User Stories)
- **Status**: Setup inicial concluído
- **Próximo**: Sprint 1 - Gestão básica de ativos e carteira

---

**🎉 Pronto para começar o desenvolvimento!** 