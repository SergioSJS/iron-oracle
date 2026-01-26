# Changelog

Todas as mudanças notáveis neste projeto serão documentadas aqui.

## [2.0.0] - 2026-01-26

### ✨ Novos Recursos

#### Busca de Oráculos
- **Busca com suporte a traduções**: Encontre oráculos pesquisando em Português ou Inglês
- **Interface integrada**: Botão de busca no cabeçalho com barra expansível
- **Navegação rápida**: Clique nos resultados para navegar diretamente ao oráculo

#### Copiar Resultados
- **Copiar para área de transferência**: Botão de cópia nos resultados das rolagens
- **Feedback visual**: Ícone de confirmação após copiar
- **Formato limpo**: Texto formatado com timestamp e detalhes do oráculo

#### Exportar Histórico
- **Exportar como Markdown**: Baixe todo o histórico de rolagens em formato .md
- **Organização por data**: Histórico organizado com timestamps
- **Nome de arquivo automático**: Arquivo nomeado com data e hora da exportação

#### Atalhos de Teclado
- **Teclas 1-5**: Acesso rápido aos 5 oráculos mais usados (Ask the Oracle)
- **Indicadores visuais**: Números exibidos nos botões para facilitar o uso
- **Produtividade**: Role dados sem tirar as mãos do teclado

#### Atalhos para Oráculos
- **Botão de atalhos dedicado**: Novo botão no cabeçalho para oráculos frequentes
- **Geração rápida**: Action+Theme, Planetas, Naves, Câmaras dos Precursores, etc.
- **Multi-rolagem**: Rola automaticamente todos os sub-oráculos de uma vez
- **Traduções completas**: Nomes dos atalhos traduzidos para PT/EN

### 🎨 Melhorias de Interface

#### Temas Aprimorados
- **Botões com tema**: Todos os botões respeitam os temas Ironsworn/Starforged × Dark/Light
- **Busca temática**: Botão de busca e barra com cores específicas para cada tema
- **Consistência visual**: Gradientes e cores harmonizadas em toda a aplicação

#### Navegação
- **Botão Expandir/Recolher corrigido**: Agora funciona para todos os oráculos, não apenas atalhos
- **Limpeza de cache**: localStorage limpo de estados órfãos ao alternar temas
- **Chaves dinâmicas**: Sistema robusto para persistência de estado de expansão

#### Rodapé
- **Atribuição Datasworn**: Créditos aos dados originais
- **Link GitHub**: Acesso ao repositório do projeto
- **Design discreto**: Rodapé elegante sem poluir a interface

### 🌍 Traduções

#### Completude em Português
- **11 novas traduções**: Todos os assentamentos de planetas traduzidos
- **Planetas cobertos**: Desert, Furnace, Grave, Ice, Jovian, Jungle, Ocean, Rocky, Shattered, Tainted, Vital
- **Busca em PT/EN**: Sistema de busca funciona em ambos os idiomas

#### Novos Textos
- Traduções para: busca, copiar, exportar, favoritos, atalhos de teclado
- Interface 100% bilíngue

### 🐛 Correções

- **TypeScript**: Removidos imports não utilizados e parâmetros desnecessários
- **Build**: Processo de build otimizado e sem erros
- **Tema**: Botão de busca agora respeita corretamente todos os temas

### 🎯 Mudanças Técnicas

- Novo hook: `useCopyToClipboard`
- Novo hook: `useKeyboardShortcuts`
- Nova utilidade: `searchOracles` com suporte a traduções
- Novas funções: `formatLogAsText`, `formatLogsAsMarkdown`
- Tipo atualizado: `LogEntry` agora inclui `timestamp`

---

## [1.0.0] - 2025

### Lançamento Inicial

- Oracle interativo para Ironsworn e Starforged
- Sistema de temas (4 variações)
- Histórico de rolagens
- Navegação por categorias
- Suporte bilíngue PT/EN
- Interface responsiva
- Integração com dados @datasworn
