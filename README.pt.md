# Iron Oracle

Uma aplicação web para rolar tabelas de oráculos dos jogos de RPG de mesa **Ironsworn** e **Ironsworn: Starforged**. Este Progressive Web App (PWA) fornece uma interface intuitiva para acessar e rolar centenas de tabelas de oráculos, com suporte completo para traduções em português e inglês.

[🇺🇸 Read in English / Leia em Inglês](README.md)

## Funcionalidades

- 🎲 **Tabelas de Oráculos Completas**: Acesse todas as tabelas de oráculos de Ironsworn e Starforged
- 🌍 **Suporte Bilíngue**: Traduções completas em português e inglês para interface e resultados dos oráculos
- 🎨 **Temas Dinâmicos**: Temas visuais que mudam baseado no modo de jogo selecionado
  - **Ironsworn**: Tema de fantasia sombria com fonte Metamorphous
  - **Starforged**: Tema espacial com fonte Orbitron
- 🌓 **Modo Claro/Escuro**: Alternar entre temas claro e escuro
- 📱 **Progressive Web App**: Instalável em dispositivos móveis e desktop
- 💾 **Configurações Persistentes**: Todas as preferências (tema, idioma, modo de jogo, região) são salvas automaticamente
- 🔄 **Sub-rolagens Automáticas**: Rola automaticamente tabelas vinculadas quando resultados referenciam outros oráculos
- 📜 **Histórico de Rolagens**: Acompanhe todas as suas rolagens com um log detalhado
- 🎯 **Suporte a Regiões**: Para Starforged, selecione entre as regiões Terminus, Outlands e Expanse

## Agradecimentos

Este projeto utiliza dados do repositório [Datasworn](https://github.com/rsek/datasworn/), que fornece as regras dos jogos Ironsworn e Ironsworn: Starforged em formato JSON. Agradecimentos especiais a rsek e todos os contribuidores do projeto Datasworn por tornar isso possível.

Os pacotes Datasworn utilizados:
- `@datasworn/core`: Tipagens TypeScript e schema JSON principais
- `@datasworn/ironsworn-classic`: Dados JSON do livro de regras original do Ironsworn
- `@datasworn/starforged`: Dados JSON do Ironsworn: Starforged

## Instalação 

### Pré-requisitos

- Node.js (v18 ou superior recomendado)
- npm ou yarn

### Passos

1. Clone o repositório:
```bash
git clone <url-do-repositório>
cd iron-oracle
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

4. Abra seu navegador e acesse `http://localhost:5173`

## Build para Produção

### Build Padrão

Para construir a aplicação para produção:

```bash
npm run build
```

Os arquivos compilados estarão no diretório `dist`.

### Build para GitHub Pages

Para construir a aplicação para deploy no GitHub Pages:

1. Atualize o caminho `base` no `vite.config.ts` para corresponder ao nome do seu repositório (se estiver fazendo deploy em um subdiretório):
```typescript
export default defineConfig({
  base: '/iron-oracle/', // Substitua pelo nome do seu repositório
  plugins: [react()],
})
```

2. Construa a aplicação:
```bash
npm run build
```

3. A pasta `dist` conterá todos os arquivos estáticos prontos para o GitHub Pages.

4. Para fazer deploy no GitHub Pages:
   - Envie o conteúdo da pasta `dist` para o branch `gh-pages`, ou
   - Use GitHub Actions para fazer deploy automaticamente no push (veja exemplo `.github/workflows/deploy.yml` abaixo)

## Estrutura do Projeto

```
iron-oracle/
├── public/                 # Assets estáticos
│   ├── favicon.svg        # Favicon da aplicação
│   ├── manifest.json      # Arquivo manifest do PWA
│   └── 404.html           # Redirecionamento 404 para roteamento SPA no GitHub Pages
├── src/
│   ├── components/        # Componentes React
│   │   ├── AskTheOracle/  # Componente de acesso rápido "Pergunte ao Oráculo"
│   │   ├── Header/        # Cabeçalho da aplicação com controles
│   │   ├── Modals/        # Diálogos modais (Resultado, Log)
│   │   ├── OracleNavigation/ # Componente de navegação recursiva de oráculos
│   │   ├── OracleText/    # Componente de texto com suporte a tooltip
│   │   └── RollLog/       # Componente de histórico de rolagens
│   ├── hooks/             # Hooks React customizados
│   │   ├── useGameData.ts # Gerenciamento de dados do jogo e lógica de rolagem
│   │   └── useScreenSize.ts # Detecção responsiva de tamanho de tela
│   ├── i18n/              # Internacionalização
│   │   ├── context.tsx     # Provider de contexto i18n
│   │   ├── translations/  # Traduções de texto da UI (en, pt)
│   │   ├── oracleTranslations/ # Traduções de tabelas de oráculos
│   │   │   ├── ironsworn.ts   # Traduções de oráculos do Ironsworn
│   │   │   ├── starforged.ts  # Traduções de oráculos do Starforged
│   │   │   └── types.ts       # Definições de tipos de tradução
│   │   └── types.ts       # Definições de tipos i18n
│   ├── styles/            # Módulos CSS
│   │   ├── base.css       # Estilos base e variáveis de tema
│   │   ├── header.css     # Estilos do componente header
│   │   ├── oracle.css     # Estilos de navegação de oráculos
│   │   ├── roll-log.css   # Estilos do log de rolagens
│   │   ├── modals.css     # Estilos de modais
│   │   └── tooltip.css    # Estilos de tooltip
│   ├── types/             # Definições de tipos TypeScript
│   │   └── datasworn.ts   # Tipos de estrutura de dados Datasworn
│   ├── utils/             # Funções utilitárias
│   │   ├── oracleDataUtils.ts # Utilitários de processamento de dados de oráculos
│   │   ├── oracleIcons.tsx    # Mapeamento de ícones para oráculos
│   │   └── oracleUtils.ts     # Utilitários de rolagem e parsing de oráculos
│   ├── App.tsx             # Componente principal da aplicação
│   └── main.tsx            # Ponto de entrada da aplicação
├── index.html              # Template HTML
├── vite.config.ts          # Configuração do Vite
└── package.json            # Dependências e scripts do projeto
```

## Arquivos Principais Explicados

### `src/App.tsx`
Componente principal da aplicação que orquestra todos os outros componentes. Gerencia estado global (tema, modais, logs) e coordena entre Header, OracleNavigation, AskTheOracle e RollLog.

### `src/hooks/useGameData.ts`
Hook principal que gerencia:
- Seleção de modo de jogo (Ironsworn/Starforged)
- Lógica de rolagem de oráculos com sub-rolagens automáticas
- Gerenciamento de histórico de rolagens
- Seleção de região para Starforged
- Persistência no LocalStorage para configurações do jogo

### `src/components/OracleNavigation/OracleNavigator.tsx`
Componente recursivo que renderiza a estrutura hierárquica de oráculos. Trata:
- Renderização de tabelas roláveis como botões
- Renderização de categorias/coleções como seções colapsáveis
- Tratamento especial para tabelas de nomes do Ironsworn
- Filtragem de oráculos baseada em região para Starforged

### `src/i18n/oracleTranslations/`
Contém traduções em português para todas as tabelas de oráculos. As traduções são modularizadas por jogo:
- `ironsworn.ts`: Todas as traduções de oráculos do Ironsworn
- `starforged.ts`: Todas as traduções de oráculos do Starforged

### `src/utils/oracleUtils.ts`
Funções utilitárias para:
- Encontrar resultados de rolagem baseados em valores de dados
- Extrair referências de oráculos do texto de resultado
- Lidar com estruturas de tabela específicas de região
- Gerar IDs únicos de log

### `src/utils/oracleIcons.tsx`
Mapeia IDs de oráculos para ícones apropriados de `react-icons`. Fornece consistência visual e ajuda usuários a identificar rapidamente tipos de oráculos.

## Desenvolvimento

### Scripts Disponíveis

- `npm run dev`: Inicia servidor de desenvolvimento com hot module replacement
- `npm run build`: Constrói para produção
- `npm run preview`: Visualiza build de produção localmente
- `npm run lint`: Executa ESLint para verificar qualidade do código

### Adicionando Novas Traduções

1. Adicione traduções de texto da UI em `src/i18n/translations/[lang].ts`
2. Adicione traduções de oráculos em `src/i18n/oracleTranslations/[game].ts`
3. Atualize `TRANSLATION_STATUS.md` para acompanhar o progresso

## Deploy no GitHub Pages

### Deploy Manual

1. Construa a aplicação:
```bash
npm run build
```

2. Copie o conteúdo da pasta `dist` para a raiz do seu branch `gh-pages`, ou use uma ferramenta como `gh-pages`:
```bash
npm install --save-dev gh-pages
```

Adicione ao `package.json`:
```json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

Então execute:
```bash
npm run deploy
```

### Deploy Automatizado com GitHub Actions

Um arquivo de workflow do GitHub Actions já está incluído em `.github/workflows/deploy.yml`. Este workflow:
- Constrói automaticamente a aplicação em cada push para `main`
- Faz deploy no GitHub Pages usando as GitHub Actions oficiais
- Requer que o GitHub Pages esteja habilitado nas configurações do seu repositório

**Para habilitar o GitHub Pages:**
1. Vá para Configurações do repositório → Pages
2. Em "Source", selecione "GitHub Actions"
3. O workflow fará deploy automaticamente no próximo push para `main`

**Nota:** O arquivo de workflow usa as GitHub Actions mais recentes para deploy no Pages. Certifique-se de que seu repositório tenha o Pages habilitado com a fonte "GitHub Actions" selecionada.

### Notas Importantes para GitHub Pages

1. **Caminho Base**: Se seu repositório não estiver na raiz do seu site GitHub Pages, atualize o `base` no `vite.config.ts`:
```typescript
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/seu-nome-de-repo/' : '/',
  plugins: [react()],
})
```

2. **Tratamento de 404**: GitHub Pages não suporta roteamento client-side por padrão. Este projeto inclui um arquivo `404.html` na pasta `public` que redireciona automaticamente para `index.html` para roteamento client-side. O arquivo é automaticamente copiado para `dist` durante o build. Para habilitá-lo no GitHub Pages:
   - Vá para Configurações do repositório → Pages
   - Em "Custom 404", selecione "Use a custom 404 page"
   - O arquivo `404.html` será usado automaticamente

3. **HTTPS**: GitHub Pages serve sobre HTTPS, que é necessário para recursos de PWA como service workers.

## Licença

Este projeto utiliza dados do Datasworn, que está licenciado sob:
- Conteúdo do pacote core: Licença MIT
- Conteúdo textual e de imagens: CC-BY-4.0 ou CC-BY-NC-4.0

Veja o [repositório Datasworn](https://github.com/rsek/datasworn/) para detalhes completos de licenciamento.

## Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para enviar um Pull Request.

## Suporte

Para questões relacionadas a:
- **Esta aplicação**: Abra uma issue neste repositório
- **Dados do Datasworn**: Visite o [repositório Datasworn](https://github.com/rsek/datasworn/)

## Nota Importante

**Conteúdo Gerado por IA**: A maior parte do código e traduções neste projeto foram gerados com a assistência de IA. Embora todo esforço tenha sido feito para garantir precisão e funcionalidade, podem existir bugs, erros de tradução ou comportamentos inesperados.

Se você encontrar problemas, comportamentos estranhos ou erros:
- Por favor, abra uma issue neste repositório com uma descrição detalhada
- Ou entre em contato diretamente com o autor do repositório

Seu feedback e relatórios de bugs são muito apreciados e ajudam a melhorar o projeto!

---

Feito com ❤️ para a comunidade de Ironsworn e Starforged

