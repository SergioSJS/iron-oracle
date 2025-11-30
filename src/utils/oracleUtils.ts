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
 * Extrai todas as referências de oráculos de uma linha de resultado
 */
export function extractOracleReferences(row: OracleRow): string[] {
  const explicitOracles = row.oracles || [];
  const oracleRolls = row.oracle_rolls?.map((r: any) => r.oracle) || [];
  const textLinks = extractOracleLinks(row.text);
  
  return [...new Set([...explicitOracles, ...textLinks, ...oracleRolls])];
}

/**
 * Gera um ID único para logs
 */
export function generateLogId(): number {
  return Date.now();
}

