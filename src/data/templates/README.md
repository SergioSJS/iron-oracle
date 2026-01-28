# Templates para Custom Themes e Domains

Este diretório contém templates JSON para facilitar a criação de novos Site Themes e Site Domains customizados.

## Como Usar

### 1. Criar um novo Theme

1. Copie `theme-template.json` para `../customThemes/seu_theme_id.json`
2. Preencha os campos:
   - `id`: ID único (snake_case, ex: `mystical`, `cursed_ruins`)
   - `name`: Nome em inglês (obrigatório)
   - `name_pt`: Nome em português (opcional)
   - `text`: Descrição em inglês (obrigatório)
   - `text_pt`: Descrição em português (opcional)
   - `features`: Array de features (ranges 1-20)
     - Cada feature pode ter `text_pt` opcional
   - `dangers`: Array de dangers (ranges 1-15)
     - Cada danger pode ter `text_pt` opcional

3. **Traduções**: 
   - **Recomendado**: Adicione `name_pt`, `text_pt` e `text_pt` em cada feature/danger diretamente no JSON
   - **Fallback**: Se não fornecer traduções inline, o sistema tentará usar traduções em `delveFeatures.ts` ou `ironsworn.ts`

### 2. Criar um novo Domain

1. Copie `domain-template.json` para `../customDomains/seu_domain_id.json`
2. Preencha os campos:
   - `id`: ID único (snake_case, ex: `floating_island`, `crystal_cavern`)
   - `name`: Nome em inglês (obrigatório)
   - `name_pt`: Nome em português (opcional)
   - `text`: Descrição em inglês (obrigatório)
   - `text_pt`: Descrição em português (opcional)
   - `features`: Array de features (ranges 21-100)
     - Cada feature pode ter `text_pt` opcional
   - `dangers`: Array de dangers (ranges 16-30)
     - Cada danger pode ter `text_pt` opcional

3. **Traduções**: 
   - **Recomendado**: Adicione `name_pt`, `text_pt` e `text_pt` em cada feature/danger diretamente no JSON
   - **Fallback**: Se não fornecer traduções inline, o sistema tentará usar traduções em `delveFeatures.ts` ou `ironsworn.ts`

## Estrutura de Ranges

### Themes
- **Features**: 1-20 (usado quando rolagem de feature cai entre 1-20)
- **Dangers**: 1-15 (usado quando rolagem de danger cai entre 1-15)

### Domains
- **Features**: 21-100 (usado quando rolagem de feature cai entre 21-100)
- **Dangers**: 16-30 (usado quando rolagem de danger cai entre 16-30)

## Exemplo Completo

Veja os arquivos de exemplo:
- `../customThemes/example-mystical.json` - Exemplo completo de theme
- `../customDomains/example-floating-island.json` - Exemplo completo de domain

## Formatos Disponíveis

### Arquivo Único
- `theme-template.json` - Template para um theme individual
- `domain-template.json` - Template para um domain individual

### Lista de Cartas
- `themes-list-template.json` - Template para múltiplos themes em um arquivo (array)
- `domains-list-template.json` - Template para múltiplos domains em um arquivo (array)

**Use o formato que preferir!** O sistema suporta ambos automaticamente.

Os templates são arquivos JSON simples e práticos - basta copiar, renomear e preencher com seus dados!

## Notas Importantes

- Os ranges devem cobrir completamente o intervalo (sem gaps)
- Cada range deve ser único (não sobrepor)
- **Traduções inline**: Use campos `name_pt`, `text_pt` e `text_pt` diretamente no JSON (recomendado)
- **Fallback**: Se não fornecer traduções inline, o sistema tentará usar `delveFeatures.ts` ou `ironsworn.ts`
- **Prioridade**: Tradução inline > Sistema de tradução > Texto original
- Todos os campos `_pt` são opcionais
