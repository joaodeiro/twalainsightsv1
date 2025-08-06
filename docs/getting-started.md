# 🚀 Guia de Início Rápido - Twala Insights

## 📋 Pré-requisitos

- **Node.js** 18+ 
- **npm** 9+
- **Git**

## ⚡ Início Rápido

### 1. Clone e Instale
```bash
git clone [URL_DO_REPOSITORIO]
cd twalainsightsv0
npm install
```

### 2. Execute o Projeto
```bash
npm run dev
```

Acesse: http://localhost:3000

### 3. Scripts Disponíveis

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
```

## 📁 Estrutura do Projeto

```
twalainsightsv0/
├── docs/           # 📚 Documentação
│   ├── project-context.md    # Contexto completo
│   ├── story-map-mvp.md      # User stories do MVP
│   ├── demandas-template.md  # Template de gestão
│   ├── tech-stack.md         # Stack técnica
│   └── getting-started.md    # Este arquivo
├── src/            # 💻 Código fonte
│   ├── app/        # Next.js App Router
│   ├── components/ # Componentes reutilizáveis
│   ├── lib/        # Bibliotecas
│   ├── types/      # Tipos TypeScript
│   ├── utils/      # Utilitários
│   ├── hooks/      # Custom hooks
│   └── styles/     # Estilos
├── tests/          # 🧪 Testes
├── public/         # 🌐 Arquivos públicos
└── README.md       # 📖 Documentação principal
```

## 🎯 Próximos Passos

### Sprint 1 - Fundação
1. **Autenticação** (US022, US025)
   - Criar conta
   - Fazer login
2. **Busca de Ativos** (US017, US018)
   - Campo de busca
   - Visualização de cotações

### Como Contribuir
1. Escolha uma User Story do `docs/story-map-mvp.md`
2. Use o template em `docs/demandas-template.md`
3. Siga as convenções de código
4. Escreva testes
5. Faça code review

## 🔧 Configurações Importantes

### Variáveis de Ambiente
Crie um arquivo `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_BODIVA_API_URL=https://api.bodiva.ao
```

### Editor (VS Code)
Extensões recomendadas:
- TypeScript
- Tailwind CSS IntelliSense
- ESLint
- Prettier

## 📊 Métricas de Qualidade

- **Code Coverage**: 70% mínimo
- **Linting**: 0 erros
- **TypeScript**: 0 erros
- **Performance**: Lighthouse 90+

## 🆘 Suporte

- **Documentação**: Pasta `docs/`
- **Issues**: [Link para issues]
- **Slack**: [Canal do projeto]

---

**🎉 Pronto para começar!** 