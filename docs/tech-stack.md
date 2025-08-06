# Stack Técnica - Twala Insights

## 🛠️ Tecnologias Escolhidas

### Frontend
- **Next.js 14** - Framework React com App Router
- **React 18** - Biblioteca de interface
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS utilitário

### UI/UX
- **Headless UI** - Componentes acessíveis
- **Heroicons** - Ícones SVG
- **Recharts** - Gráficos e visualizações
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas

### Desenvolvimento
- **ESLint** - Linting de código
- **Prettier** - Formatação de código
- **Jest** - Framework de testes
- **Testing Library** - Testes de componentes

## 🎨 Design System

### Cores
- **Primary**: Azul (#0ea5e9) - Ações principais
- **Secondary**: Cinza (#64748b) - Textos e elementos secundários
- **Success**: Verde (#22c55e) - Sucessos e ganhos
- **Warning**: Amarelo (#f59e0b) - Avisos
- **Error**: Vermelho (#ef4444) - Erros e perdas

### Tipografia
- **Fonte**: Inter (Google Fonts)
- **Hierarquia**: xs, sm, base, lg, xl, 2xl, 3xl, 4xl, 5xl, 6xl

### Componentes
- **Botões**: btn-primary, btn-secondary
- **Cards**: card
- **Inputs**: input-field
- **Sombras**: soft, medium, strong

## 📁 Estrutura de Pastas

```
src/
├── app/           # App Router (Next.js 14)
├── components/    # Componentes reutilizáveis
├── lib/          # Bibliotecas e configurações
├── types/        # Definições TypeScript
├── utils/        # Funções utilitárias
├── hooks/        # Custom hooks
└── styles/       # Estilos adicionais
```

## 🚀 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run start        # Servidor de produção

# Qualidade de Código
npm run lint         # Verificar linting
npm run type-check   # Verificar tipos TypeScript

# Testes
npm run test         # Executar testes
npm run test:watch   # Testes em modo watch
npm run test:coverage # Testes com cobertura
```

## 🔧 Configurações

### TypeScript
- Strict mode habilitado
- Path mapping configurado
- Compatível com Next.js

### ESLint
- Next.js core web vitals
- TypeScript recomendado
- Regras customizadas

### Prettier
- Integração com Tailwind CSS
- Configuração consistente

### Jest
- Configuração para Next.js
- Testing Library integrado
- Cobertura de 70%

## 📱 Responsividade

- **Mobile First** - Design mobile-first
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Grid System**: Flexbox e CSS Grid

## ♿ Acessibilidade

- **Headless UI** - Componentes acessíveis
- **ARIA labels** - Labels semânticos
- **Keyboard navigation** - Navegação por teclado
- **Color contrast** - Contraste adequado

## 🔒 Segurança

- **TypeScript** - Prevenção de erros
- **ESLint** - Boas práticas
- **Next.js** - Segurança integrada
- **HTTPS** - Conexões seguras

## 📊 Performance

- **Next.js** - Otimizações automáticas
- **Image optimization** - Otimização de imagens
- **Code splitting** - Divisão de código
- **Lazy loading** - Carregamento sob demanda 