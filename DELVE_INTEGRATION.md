# Integração do Ironsworn: Delve

Este documento descreve a integração do conteúdo do **Ironsworn: Delve** ao Iron Oracle.

## 📦 Pacote Adicionado

- **Pacote NPM**: `@datasworn/ironsworn-classic-delve@^0.0.10`
- **Arquivo de dados**: `@datasworn/ironsworn-classic-delve/json/delve.json`

## ✅ Implementações Realizadas

### 1. Dependência Adicionada

**Arquivo**: `package.json`
- Adicionado `@datasworn/ironsworn-classic-delve` às dependências

### 2. Importação e Mesclagem de Dados

**Arquivo**: `src/hooks/useGameData.ts`

#### Mudanças:
- Importado `delveData` do pacote `@datasworn/ironsworn-classic-delve`
- Criada função `mergeExpansionData()` para mesclar dados de expansão com dados base
- Os dados do Delve são automaticamente mesclados com os dados do Ironsworn Classic quando o modo de jogo é `ironsworn`

#### Funcionamento:
```typescript
// Os dados do Delve são mesclados automaticamente com Ironsworn Classic
const baseIronswornData = gameMode === 'ironsworn' 
  ? mergeExpansionData(ironswornData, delveData) 
  : ironswornData;
```

A função de mesclagem:
- Mescla recursivamente os oráculos do Delve com os do Ironsworn Classic
- Preserva os dados existentes do Ironsworn Classic
- Adiciona novos oráculos do Delve
- Mescla `contents` e `collections` recursivamente
- Também mescla `moves` se existirem

### 3. Configuração de Build

**Arquivo**: `vite.config.ts`

#### Mudanças:
- Adicionado chunk separado para os dados do Delve: `'datasworn-delve'`
- Isso otimiza o carregamento, separando os dados do Delve em seu próprio chunk

### 4. Traduções Adicionadas

**Arquivo**: `src/i18n/oracleTranslations/ironsworn.ts`

#### Oráculos Traduzidos:

##### Character (Personagem)
- ✅ `delve/oracles/character/activity` - **50 resultados traduzidos**
- ✅ `delve/oracles/character/disposition` - **12 resultados traduzidos**

##### Combat Event (Evento de Combate)
- ✅ `delve/oracles/combat_event/method` - **50 resultados traduzidos**
- ✅ `delve/oracles/combat_event/target` - **50 resultados traduzidos**

##### Feature (Característica)
- ✅ `delve/oracles/feature/aspect` - **50 resultados traduzidos**
- ✅ `delve/oracles/feature/focus` - **50 resultados traduzidos**

##### Monstrosity (Monstruosidade)
- ✅ `delve/oracles/monstrosity/size` - **6 resultados traduzidos**
- ✅ `delve/oracles/monstrosity/primary_form` - **20 resultados traduzidos**
- ✅ `delve/oracles/monstrosity/characteristics` - **30 resultados traduzidos**
- ✅ `delve/oracles/monstrosity/abilities` - **35 resultados traduzidos**

##### Moves (Movimentos)
- ✅ `delve/oracles/moves/find_an_opportunity` - **10 resultados traduzidos**
- ✅ `delve/oracles/moves/reveal_a_danger` - **12 resultados traduzidos**
- ✅ `delve/oracles/moves/reveal_a_danger_alt` - **10 resultados traduzidos**
- ✅ `delve/oracles/moves/advance_a_threat` - **3 resultados traduzidos**
- ✅ `delve/oracles/moves/delve_the_depths/edge` - **5 resultados traduzidos**
- ✅ `delve/oracles/moves/delve_the_depths/shadow` - **5 resultados traduzidos**
- ✅ `delve/oracles/moves/delve_the_depths/wits` - **5 resultados traduzidos**

##### Site Name (Nome do Site)
- ✅ `delve/oracles/site_name/description` - **50 resultados traduzidos**
- ✅ `delve/oracles/site_name/detail` - **50 resultados traduzidos**
- ✅ `delve/oracles/site_name/place/barrow` - **6 resultados traduzidos**
- ✅ `delve/oracles/site_name/place/cavern` - **10 resultados traduzidos**
- ✅ `delve/oracles/site_name/place/frozen_cavern` - **10 resultados traduzidos**
- ✅ `delve/oracles/site_name/place/icereach` - **6 resultados traduzidos**
- ✅ `delve/oracles/site_name/place/mine` - **6 resultados traduzidos**
- ✅ `delve/oracles/site_name/place/pass` - **10 resultados traduzidos**
- ✅ `delve/oracles/site_name/place/ruin` - **10 resultados traduzidos**
- ✅ `delve/oracles/site_name/place/sea_cave` - **6 resultados traduzidos**
- ✅ `delve/oracles/site_name/place/shadowfen` - **10 resultados traduzidos**
- ✅ `delve/oracles/site_name/place/stronghold` - **10 resultados traduzidos**
- ✅ `delve/oracles/site_name/place/tanglewood` - **8 resultados traduzidos**
- ✅ `delve/oracles/site_name/place/underkeep` - **10 resultados traduzidos**
- 🟡 `delve/oracles/site_name/format` - Apenas nome traduzido (tabela de templates)
- 🟡 `delve/oracles/site_name/namesake` - Apenas nome traduzido (nomes próprios)

##### Site Nature (Natureza do Site)
- 🟡 `delve/oracles/site_nature/theme` - Apenas nome traduzido (referências a temas)
- 🟡 `delve/oracles/site_nature/domain` - Apenas nome traduzido (referências a domínios)

##### Threat (Ameaça)
- ✅ `delve/oracles/threat/burgeoning_conflict` - **10 resultados traduzidos**
- ✅ `delve/oracles/threat/cursed_site` - **10 resultados traduzidos**
- ✅ `delve/oracles/threat/environmental_calamity` - **10 resultados traduzidos**
- ✅ `delve/oracles/threat/malignant_plague` - **10 resultados traduzidos**
- ✅ `delve/oracles/threat/rampaging_creature` - **10 resultados traduzidos**
- ✅ `delve/oracles/threat/ravaging_horde` - **10 resultados traduzidos**
- ✅ `delve/oracles/threat/scheming_leader` - **10 resultados traduzidos**
- ✅ `delve/oracles/threat/power_hungry_mystic` - **10 resultados traduzidos**
- ✅ `delve/oracles/threat/zealous_cult` - **10 resultados traduzidos**
- 🟡 `delve/oracles/threat/category` - Apenas nome traduzido (referências a outras ameaças)

##### Trap (Armadilha)
- ✅ `delve/oracles/trap/trap` - **25 resultados traduzidos**
- ✅ `delve/oracles/trap/component` - **25 resultados traduzidos**

### 5. Status de Tradução Atualizado

**Arquivo**: `TRANSLATION_STATUS.md`

#### Estatísticas do Delve:
- **Total de oráculos principais**: ~30+
- **Completamente traduzidos**: ~25 (83%)
- **Apenas nome traduzido**: ~5 (17%)
- **Não traduzidos**: 0 (0%)

## 📊 Resumo das Traduções

### Traduções Completas (Nome + Resultados)
- **Character**: Activity, Disposition
- **Combat Event**: Method, Target
- **Feature**: Aspect, Focus
- **Monstrosity**: Size, Primary Form, Characteristics, Abilities
- **Moves**: Find an Opportunity, Reveal a Danger (2 versões), Advance a Threat, Delve the Depths (3 stats)
- **Site Name**: Description, Detail, Place (12 sub-tabelas)
- **Threat**: 9 tipos de ameaças (Burgeoning Conflict, Cursed Site, Environmental Calamity, Malignant Plague, Rampaging Creature, Ravaging Horde, Scheming Leader, Power-Hungry Mystic, Zealous Cult)
- **Trap**: Event, Component

### Traduções Parciais (Apenas Nome)
- `delve/oracles/site_name/format` - Tabela de templates (não traduzir)
- `delve/oracles/site_name/namesake` - Nomes próprios (não traduzir)
- `delve/oracles/site_nature/theme` - Referências a temas (não traduzir)
- `delve/oracles/site_nature/domain` - Referências a domínios (não traduzir)
- `delve/oracles/threat/category` - Referências a outras ameaças (não traduzir)

### Site Domains (Domínios de Site)
- ✅ **12 Domains traduzidos** (nomes e descrições):
  - Barrow, Caverna, Caverna Congelada, Território Gelado, Mina, Passo, Ruína, Caverna Marinha, Pântano Sombrio, Fortaleza, Bosque Emaranhado, Subterrâneo
- 🟡 Features e Dangers de cada Domain (arrays - podem ser traduzidos no futuro se necessário)

### Site Themes (Temas de Site)
- ✅ **8 Themes traduzidos** (nomes e descrições):
  - Antigo, Corrompido, Fortificado, Sagrado, Assombrado, Infestado, Devastado, Selvagem
- 🟡 Features e Dangers de cada Theme (arrays - podem ser traduzidos no futuro se necessário)

## 🔧 Funcionalidades Implementadas

### 1. Mesclagem Automática
Os dados do Delve são automaticamente mesclados com os dados do Ironsworn Classic quando o modo de jogo é `ironsworn`. Isso significa que:
- Todos os oráculos do Delve ficam disponíveis junto com os do Ironsworn Classic
- Não é necessário selecionar uma opção separada para "ativar" o Delve
- Os oráculos do Delve aparecem na navegação junto com os do Ironsworn Classic

### 2. Suporte a Referências Cruzadas
O sistema já existente de referências cruzadas funciona com os oráculos do Delve:
- Oráculos do Delve podem referenciar oráculos do Classic (ex: `classic/oracles/...`)
- Oráculos do Classic podem referenciar oráculos do Delve (ex: `delve/oracles/...`)
- Rolagens automáticas funcionam corretamente

### 3. Traduções Integradas
- Todas as traduções seguem o mesmo padrão do Ironsworn Classic
- Nomes de oráculos são traduzidos
- Resultados das tabelas são traduzidos
- Links markdown são preservados e funcionam corretamente

## 🎯 Como Usar

### Para Usuários
1. Selecione o modo de jogo "Ironsworn" no seletor
2. Os oráculos do Delve aparecerão automaticamente na navegação
3. Procure por categorias como:
   - **Character (Delve)** - Atividade, Disposição
   - **Combat Event** - Método, Alvo
   - **Feature** - Aspecto, Foco
   - **Monstrosity** - Tamanho, Forma Primária, Características, Habilidades
   - **Moves (Delve)** - Encontrar uma Oportunidade, Revelar um Perigo, etc.
   - **Site Name** - Descrição, Detalhe, Lugar
   - **Threat** - Vários tipos de ameaças
   - **Trap** - Evento, Componente

### Para Desenvolvedores
Os dados do Delve estão disponíveis através do hook `useGameData()`:
```typescript
const { currentRuleset, findOracleById } = useGameData();
// currentRuleset já contém os dados mesclados do Delve quando gameMode === 'ironsworn'
```

## 📝 Notas Técnicas

### Estrutura de IDs
Todos os IDs do Delve seguem o padrão `delve/...`:
- Oráculos: `delve/oracles/...`
- Moves: `delve/moves/...`
- NPCs: `delve/npcs/...`
- Rarities: `delve/rarities/...`
- Sites: `delve/delve_sites/...`
- Domains: `delve/site_domains/...`
- Themes: `delve/site_themes/...`

### Compatibilidade
- O Delve é totalmente compatível com o Ironsworn Classic
- Referências cruzadas funcionam em ambas as direções
- O sistema de mesclagem preserva todos os dados existentes

### Performance
- Os dados do Delve são carregados apenas quando necessário (modo Ironsworn)
- O chunk separado permite carregamento otimizado
- A mesclagem é feita uma vez na inicialização

## 🎯 Atalhos Criados

Foram criados **6 atalhos** para facilitar o uso do Delve:

1. **Monstrosidade Completa** 🦎
   - Rola: Tamanho, Forma Primária, Características e Habilidades
   - Ideal para criar criaturas/monstros rapidamente

2. **Característica Completa** 👁️
   - Rola: Aspecto e Foco
   - Ideal para descrever características de locais

3. **Personagem do Delve** 👤
   - Rola: Atividade e Disposição
   - Ideal para criar NPCs encontrados em sites

4. **Evento de Combate** ⚔️
   - Rola: Método e Alvo
   - Ideal para gerar eventos de combate dinâmicos

5. **Nome do Site** 🏛️
   - Rola: Descrição, Detalhe e Lugar (aleatório)
   - Ideal para gerar nomes de sites do Delve

6. **Armadilha** 🎯
   - Rola: Evento e Componente
   - Ideal para criar armadilhas rapidamente

Todos os atalhos estão disponíveis automaticamente quando o modo de jogo é "Ironsworn".

## 🚀 Próximos Passos (Opcional)

### Funcionalidades Futuras Potenciais
1. ✅ **Atalhos Específicos do Delve**: ✅ **CONCLUÍDO** - 6 atalhos criados
2. ✅ **Ícones Visuais**: ✅ **CONCLUÍDO** - Ícones adicionados para todos os atalhos
3. **Filtros**: Permitir filtrar apenas conteúdo do Delve ou Classic
4. **Sites Pré-definidos**: Adicionar interface para explorar os 20 sites pré-definidos do Delve
5. **Rarities**: Adicionar interface para explorar as raridades do Delve

## ✅ Checklist de Implementação

- [x] Adicionar pacote ao `package.json`
- [x] Importar dados do Delve
- [x] Criar função de mesclagem
- [x] Integrar mesclagem no `useGameData`
- [x] Adicionar chunk no `vite.config.ts`
- [x] Adicionar traduções dos oráculos principais
- [x] Adicionar traduções dos oráculos de Site Name
- [x] Adicionar traduções dos oráculos de Threat
- [x] Adicionar traduções dos oráculos de Trap
- [x] Adicionar traduções dos oráculos de Moves
- [x] Criar atalhos para o Delve (Monstrosidade, Feature, Personagem, etc.)
- [x] Adicionar ícones para os novos atalhos
- [x] Adicionar traduções dos nomes dos atalhos
- [x] Atualizar `TRANSLATION_STATUS.md`
- [x] Criar documentação de integração

## 📚 Referências

- **Documentação do Conteúdo**: Ver `DELVE_CONTENT.md` para lista completa de conteúdo disponível
- **Repositório Datasworn**: https://github.com/rsek/datasworn
- **Ironsworn: Delve**: https://ironswornrpg.com

---

**Data de Integração**: 27 de Janeiro de 2026
**Versão do Pacote**: 0.0.10
**Status**: ✅ **Integração Completa**
