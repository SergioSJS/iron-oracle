# Dados Customizados do Delve

Este diretório contém a estrutura para adicionar novos Site Themes e Site Domains customizados ao sistema de exploração do Delve.

## 📁 Estrutura de Diretórios

```
src/data/
├── customThemes/          # Arquivos JSON de themes customizados
│   ├── example-mystical.json
│   └── ...
├── customDomains/         # Arquivos JSON de domains customizados
│   ├── example-floating-island.json
│   └── ...
└── templates/             # Templates e documentação
    ├── theme-template.json
    ├── domain-template.json
    └── README.md
```

## 🚀 Como Adicionar um Novo Theme

1. **Crie o arquivo JSON** em `customThemes/`:
   ```bash
   cp templates/theme-template.json customThemes/meu_theme.json
   ```

2. **Preencha os campos**:
   - `id`: ID único (snake_case, ex: `mystical`, `cursed_ruins`)
   - `name`: Nome em inglês (obrigatório)
   - `name_pt`: Nome em português (opcional - se não fornecer, será usado o sistema de tradução existente)
   - `text`: Descrição em inglês (obrigatório)
   - `text_pt`: Descrição em português (opcional)
   - `features`: Array de features (ranges **1-20**)
     - Cada feature pode ter `text_pt` opcional
   - `dangers`: Array de dangers (ranges **1-15**)
     - Cada danger pode ter `text_pt` opcional

3. **Traduções**: 
   - **Traduções inline (recomendado)**: Adicione `name_pt`, `text_pt` e `text_pt` em cada feature/danger diretamente no JSON
   - **Traduções externas (fallback)**: Se não fornecer traduções inline, o sistema tentará usar traduções em `delveFeatures.ts` ou `ironsworn.ts`
   - **Prioridade**: Tradução inline > Sistema de tradução > Texto original em inglês

4. **Reinicie o servidor de desenvolvimento** - Os arquivos serão carregados automaticamente!

## 🚀 Como Adicionar um Novo Domain

1. **Crie o arquivo JSON** em `customDomains/`:
   ```bash
   cp templates/domain-template.json customDomains/meu_domain.json
   ```

2. **Preencha os campos**:
   - `id`: ID único (snake_case, ex: `floating_island`, `crystal_cavern`)
   - `name`: Nome em inglês (obrigatório)
   - `name_pt`: Nome em português (opcional)
   - `text`: Descrição em inglês (obrigatório)
   - `text_pt`: Descrição em português (opcional)
   - `features`: Array de features (ranges **21-100**)
     - Cada feature pode ter `text_pt` opcional
   - `dangers`: Array de dangers (ranges **16-30**)
     - Cada danger pode ter `text_pt` opcional

3. **Traduções**: 
   - **Traduções inline (recomendado)**: Adicione `name_pt`, `text_pt` e `text_pt` em cada feature/danger diretamente no JSON
   - **Traduções externas (fallback)**: Se não fornecer traduções inline, o sistema tentará usar traduções em `delveFeatures.ts` ou `ironsworn.ts`
   - **Prioridade**: Tradução inline > Sistema de tradução > Texto original em inglês

4. **Reinicie o servidor de desenvolvimento**

## 📊 Estrutura de Ranges

### Themes
- **Features**: 1-20 (usado quando rolagem de feature cai entre 1-20)
- **Dangers**: 1-15 (usado quando rolagem de danger cai entre 1-15)

### Domains
- **Features**: 21-100 (usado quando rolagem de feature cai entre 21-100)
- **Dangers**: 16-30 (usado quando rolagem de danger cai entre 16-30)

## ⚠️ Regras Importantes

1. **Ranges devem cobrir completamente o intervalo** (sem gaps)
2. **Cada range deve ser único** (não sobrepor)
3. **IDs devem seguir snake_case** (ex: `my_custom_theme`, não `my-custom-theme`)
4. **Traduções**: 
   - **Recomendado**: Use campos `name_pt`, `text_pt` e `text_pt` em features/dangers diretamente no JSON
   - **Fallback**: Se não fornecer traduções inline, o sistema tentará usar `delveFeatures.ts` ou `ironsworn.ts`
   - **Prioridade**: Tradução inline > Sistema de tradução > Texto original
5. **Campos opcionais**: Todos os campos `_pt` são opcionais - se não fornecer, o sistema usará o texto em inglês ou tentará tradução externa

## 🔍 Como Funciona

O hook `useCustomDelveData` em `src/hooks/useCustomDelveData.ts`:
1. Carrega automaticamente todos os arquivos JSON de `customThemes/` e `customDomains/`
2. Mescla com os dados originais do Delve (do pacote `@datasworn/ironsworn-classic-delve`)
3. Retorna os dados mesclados prontos para uso

Os componentes `DelveExploration` e `SiteSetup` usam este hook para obter a lista completa de themes e domains disponíveis.

## 📝 Exemplos

Veja os arquivos de exemplo:
- `customThemes/example-mystical.json` - Exemplo de theme customizado
- `customDomains/example-floating-island.json` - Exemplo de domain customizado

## 🐛 Troubleshooting

- **Theme/Domain não aparece**: Verifique se o arquivo JSON está em `customThemes/` ou `customDomains/` e se tem a extensão `.json`
- **Traduções não funcionam**: Verifique se adicionou as traduções em `ironsworn.ts` e `delveFeatures.ts`
- **Erros de validação**: Verifique se os ranges estão corretos (1-20 para theme features, 21-100 para domain features, etc.)

## 📌 Formato dos Arquivos

**Você pode usar dois formatos:**

### Opção 1: Um arquivo por carta (recomendado para poucas cartas)
- Cada Theme = 1 arquivo JSON em `customThemes/`
- Cada Domain = 1 arquivo JSON em `customDomains/`
- **Vantagem**: Organização clara, fácil encontrar e editar cada carta

### Opção 2: Lista de cartas em um arquivo (recomendado para muitas cartas)
- Múltiplos Themes = 1 arquivo JSON com array em `customThemes/`
- Múltiplos Domains = 1 arquivo JSON com array em `customDomains/`
- **Vantagem**: Mais prático para adicionar várias cartas de uma vez

**Exemplos:**
- `customThemes/mystical.json` - arquivo único com um theme
- `customThemes/my-themes.json` - arquivo com array `[{...}, {...}]` contendo vários themes

**O sistema suporta ambos os formatos automaticamente!**

**Processo simples:**
1. **Arquivo único**: Copiar `templates/theme-template.json` → `customThemes/meu_theme.json`
2. **Lista**: Copiar `templates/themes-list-template.json` → `customThemes/minhas-cartas.json`
3. Editar o arquivo com seus dados
4. Adicionar traduções inline (opcional)
5. Pronto - aparece automaticamente na aplicação!

---

📖 **English version**: See `README.en.md`
