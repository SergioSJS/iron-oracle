import type { OracleTable, OracleCollection } from '../types/datasworn';

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
 * Filtra oráculos excluindo "Ask the Oracle" e "Moves" (se contém ask_the_oracle)
 */
export function filterOtherOracles(oracles: Record<string, any>): any[] {
  const oraclesArray = Object.values(oracles);
  
  // Encontrar moves que contém ask_the_oracle
  const movesOracle = oraclesArray.find((oracle: any) => 
    (oracle._id?.includes('moves') || oracle.name === 'Moves') &&
    oracle.collections?.ask_the_oracle
  );
  
  return oraclesArray.filter((oracle: any) => {
    // Excluir moves se ele contém ask_the_oracle
    if (movesOracle && oracle._id === movesOracle._id) {
      return false;
    }
    // Excluir ask_the_oracle direto
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

