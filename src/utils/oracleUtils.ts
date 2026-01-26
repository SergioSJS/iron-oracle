import type { OracleTable, OracleCollection, OracleRow, StarforgedRegion } from '../types/datasworn';

/**
 * Encontra o resultado de uma rolagem baseado no valor rolado
 */
export function findRollResult(roll: number, rows: OracleRow[]): OracleRow | undefined {
  return rows.find((r: OracleRow) => {
    // Se max for null, undefined, ou igual a min, trata como valor único
    if (r.max === null || r.max === undefined) {
      return roll === r.min;
    }
    
    // Se min e max são iguais, também é valor único
    if (r.min === r.max) {
      return roll === r.min;
    }
    
    // Caso padrão: intervalo min-max (inclusivo)
    return roll >= r.min && roll <= r.max;
  });
}

/**
 * Verifica se um oráculo tem estrutura de região (terminus/outlands/expanse)
 */
export function hasRegionStructure(data: OracleTable | OracleCollection): boolean {
  if (!data.contents || typeof data.contents !== 'object') return false;
  
  const contentsKeys = Object.keys(data.contents);
  const hasTerminus = contentsKeys.includes('terminus');
  const hasOutlands = contentsKeys.includes('outlands');
  const hasExpanse = contentsKeys.includes('expanse');
  
  return hasTerminus && hasOutlands && hasExpanse;
}

/**
 * Obtém a tabela baseada na região selecionada
 */
export function getTableForRegion(
  data: OracleTable | OracleCollection, 
  region: StarforgedRegion
): OracleTable | null {
  if (!hasRegionStructure(data) || !data.contents) return null;
  
  const regionTable = data.contents[region];
  if (regionTable && 'rows' in regionTable && regionTable.rows && regionTable.rows.length > 0) {
    return regionTable as OracleTable;
  }
  
  return null;
}

/**
 * Extrai links markdown do formato [text](id:path) de um texto
 */
export function extractOracleLinks(text: string): string[] {
  const linkRegex = /\[([^\]]+)\]\(id:([^)]+)\)/g;
  const links: string[] = [];
  let match;
  
  while ((match = linkRegex.exec(text)) !== null) {
    links.push(match[2]);
  }
  
  return links;
}

/**
 * Expande coleções conhecidas em seus sub-oráculos roleaveis
 * Por exemplo: starforged/collections/oracles/vaults -> vários oráculos de vault
 */
export function expandCollectionToOracles(collectionId: string): string[] {
  // Mapeamento de coleções conhecidas para seus oráculos iniciais
  const collectionExpansions: Record<string, string[]> = {
    'starforged/collections/oracles/vaults': [
      'starforged/oracles/vaults/location',
      'starforged/oracles/vaults/scale',
      'starforged/oracles/vaults/form',
      'starforged/oracles/vaults/shape',
      'starforged/oracles/vaults/material',
      'starforged/oracles/vaults/outer_first_look'
    ],
    // Adicionar outras coleções conforme necessário
  };

  return collectionExpansions[collectionId] || [];
}

/**
 * Extrai todas as referências de oráculos de uma linha de resultado
 */
export function extractOracleReferences(row: OracleRow): string[] {
  const explicitOracles = row.oracles || [];
  const oracleRolls = row.oracle_rolls?.map((r: any) => r.oracle) || [];
  const textLinks = extractOracleLinks(row.text);
  
  // Combinar todas as referências
  const allReferences = [...new Set([...explicitOracles, ...textLinks, ...oracleRolls])];
  
  // Expandir coleções conhecidas
  const expandedReferences: string[] = [];
  for (const ref of allReferences) {
    const expansion = expandCollectionToOracles(ref);
    if (expansion.length > 0) {
      // É uma coleção - adicionar todos os sub-oráculos
      expandedReferences.push(...expansion);
    } else {
      // Não é uma coleção (ou não conhecida) - adicionar como está
      expandedReferences.push(ref);
    }
  }
  
  return [...new Set(expandedReferences)];
}

/**
 * Remove links markdown do formato [text](id:path) de um texto
 * Substitui pelo texto do link quando autoRolled=true, ou mantém o link clicável quando false
 */
export function cleanOracleLinks(text: string, autoRolled: boolean = true): string {
  if (!autoRolled) return text;
  
  // Remove os links markdown, mantendo apenas o texto
  const linkRegex = /\[([^\]]+)\]\(id:([^)]+)\)/g;
  return text.replace(linkRegex, '$1');
}

/**
 * Gera um ID único para logs
 */
export function generateLogId(): number {
  return Date.now();
}

