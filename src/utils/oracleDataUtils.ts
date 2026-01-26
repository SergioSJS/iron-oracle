import type { OracleTable, OracleCollection } from '../types/datasworn';
import { translateOracleName } from '../i18n/oracleTranslations';
import type { Language } from '../i18n/types';

/**
 * Encontra a coleção "Ask the Oracle" dentro dos oráculos
 */
export function findAskTheOracleCollection(oracles: Record<string, any>): OracleCollection | null {
  const oraclesArray = Object.values(oracles);
  
  // Procurar dentro de "moves"
  const movesOracle = oraclesArray.find((oracle: any) => 
    oracle._id?.includes('moves') || oracle.name === 'Moves'
  );
  
  if (movesOracle && movesOracle.collections?.ask_the_oracle) {
    return movesOracle.collections.ask_the_oracle;
  }
  
  // Se não encontrou, procurar diretamente
  const askTheOracle = oraclesArray.find((oracle: any) => 
    oracle._id?.includes('ask_the_oracle') || oracle.name === 'Ask the Oracle'
  );
  
  return askTheOracle || null;
}

/**
 * Extrai as tabelas roláveis de "Ask the Oracle"
 */
export function extractAskTheOracleTables(collection: OracleCollection | null): OracleTable[] {
  if (!collection || !collection.contents) return [];
  
  return Object.values(collection.contents).filter((item: any) => 
    item.rows && item.rows.length > 0
  ) as OracleTable[];
}

/**
 * Filtra oráculos excluindo apenas "Ask the Oracle"
 * Para o grupo "Moves", remove a sub-coleção ask_the_oracle mas mantém o resto
 */
export function filterOtherOracles(oracles: Record<string, any>): any[] {
  const oraclesArray = Object.values(oracles);
  
  return oraclesArray.map((oracle: any) => {
    // Se for o grupo Moves e tiver ask_the_oracle, criar cópia sem ele
    if ((oracle._id?.includes('moves') || oracle.name === 'Moves') && oracle.collections?.ask_the_oracle) {
      const { ask_the_oracle, ...otherCollections } = oracle.collections;
      return {
        ...oracle,
        collections: Object.keys(otherCollections).length > 0 ? otherCollections : undefined
      };
    }
    return oracle;
  }).filter((oracle: any) => {
    // Excluir ask_the_oracle direto (caso exista como item separado)
    return !(oracle._id?.includes('ask_the_oracle') || oracle.name === 'Ask the Oracle');
  });
}

/**
 * Divide oráculos em duas colunas
 */
export function splitOraclesIntoColumns(oracles: any[]): { left: any[]; right: any[] } {
  const midPoint = Math.ceil(oracles.length / 2);
  return {
    left: oracles.slice(0, midPoint),
    right: oracles.slice(midPoint)
  };
}

/**
 * Busca oráculos recursivamente por nome (original e traduzido)
 */
export function searchOracles(oracles: any[], query: string, language: Language = 'en'): any[] {
  if (!query.trim()) return oracles;
  
  const lowerQuery = query.toLowerCase();
  
  function searchRecursive(item: any): any | null {
    if (!item) return null;
    
    const originalName = item.name?.toLowerCase() || '';
    const translatedName = translateOracleName(item._id, item.name || '', language).toLowerCase();
    const nameMatches = originalName.includes(lowerQuery) || translatedName.includes(lowerQuery);
    
    // Se é uma tabela (tem rows), verificar se o nome bate
    if (item.rows) {
      return nameMatches ? item : null;
    }
    
    // Se é uma coleção, buscar recursivamente
    if (item.contents || item.collections) {
      const contents = item.contents || {};
      const collections = item.collections || {};
      const allItems = { ...contents, ...collections };
      
      const matchedChildren: any = {};
      let hasMatches = false;
      
      for (const [key, child] of Object.entries(allItems)) {
        const result = searchRecursive(child);
        if (result) {
          matchedChildren[key] = result;
          hasMatches = true;
        }
      }
      
      // Se o próprio nome bate ou tem filhos que batem, retornar com todos filhos
      if (nameMatches || hasMatches) {
        return {
          ...item,
          contents: item.contents && Object.keys(matchedChildren).length > 0 ? matchedChildren : item.contents,
          collections: item.collections && Object.keys(matchedChildren).length > 0 ? matchedChildren : item.collections
        };
      }
    }
    
    return null;
  }
  
  return oracles.map(oracle => searchRecursive(oracle)).filter(Boolean);
}

