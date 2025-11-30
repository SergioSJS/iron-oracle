import { useState, useEffect } from 'react';
import starforgedData from '@datasworn/starforged/json/starforged.json';
import ironswornData from '@datasworn/ironsworn-classic/json/classic.json';
import type { 
  OracleTable, 
  OracleRow, 
  ChildRoll, 
  LogEntry, 
  StarforgedRegion,
  GameMode
} from '../types/datasworn';
import { 
  findRollResult, 
  hasRegionStructure, 
  getTableForRegion, 
  extractOracleReferences,
  generateLogId
} from '../utils/oracleUtils';
import { useI18n } from '../i18n/context';
import { translateOracleName, translateOracleResult } from '../i18n/oracleTranslations';

export function useGameData() {
  // Carregar configurações do localStorage
  const [gameMode, setGameModeState] = useState<GameMode>(() => {
    const saved = localStorage.getItem('gameMode');
    return (saved === 'ironsworn' || saved === 'starforged') ? saved : 'starforged';
  });
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedRegion, setSelectedRegionState] = useState<StarforgedRegion>(() => {
    const saved = localStorage.getItem('selectedRegion');
    return (saved === 'terminus' || saved === 'outlands' || saved === 'expanse') ? saved : 'terminus';
  });
  const { language, t } = useI18n();

  // Salvar gameMode no localStorage quando mudar
  useEffect(() => {
    localStorage.setItem('gameMode', gameMode);
  }, [gameMode]);

  // Salvar selectedRegion no localStorage quando mudar
  useEffect(() => {
    localStorage.setItem('selectedRegion', selectedRegion);
  }, [selectedRegion]);

  // Wrapper para setGameMode que também salva no localStorage
  const setGameMode = (mode: GameMode) => {
    setGameModeState(mode);
  };

  // Wrapper para setSelectedRegion que também salva no localStorage
  const setSelectedRegion = (region: StarforgedRegion) => {
    setSelectedRegionState(region);
  };

  const currentRuleset = gameMode === 'starforged' ? starforgedData : ironswornData;

  // Função auxiliar para calcular o range máximo de uma tabela
  const getTableMaxRoll = (rows: OracleRow[]): number => {
    if (!rows || rows.length === 0) return 100;
    
    // Encontrar o maior valor max ou min nas rows
    let maxValue = 0;
    for (const row of rows) {
      const rowMax = row.max !== null && row.max !== undefined ? row.max : row.min;
      if (rowMax > maxValue) {
        maxValue = rowMax;
      }
    }
    
    // Se o máximo encontrado for menor que 100, usar esse valor
    // Caso contrário, usar 100 (padrão para tabelas d100)
    return maxValue < 100 ? maxValue : 100;
  };

  // Função auxiliar para rolar um oráculo e retornar o resultado
  const rollSingleOracle = (oracleName: string, table: OracleTable): ChildRoll | null => {
    if (!table.rows || table.rows.length === 0) {
      return null;
    }

    // Calcular o range máximo da tabela
    const maxRoll = getTableMaxRoll(table.rows);
    const roll = Math.floor(Math.random() * maxRoll) + 1;
    const row = findRollResult(roll, table.rows);
    const originalResultText = row ? row.text : t('result.notFound');
    const resultText = translateOracleResult(table._id, roll, originalResultText, language, row?.min);
    const translatedOracleName = translateOracleName(table._id, oracleName, language);

    return {
      id: generateLogId() + Math.random(),
      oracleName: translatedOracleName,
      oracleId: table._id,
      roll: roll,
      result: resultText,
      originalResult: originalResultText
    };
  };

  // Função de rolar o oráculo - versão melhorada
  const rollOracle = (oracleName: string, table: OracleTable, parentLogId?: number, region?: StarforgedRegion) => {
    // Se uma região foi especificada e a tabela tem estrutura de região, usar a tabela da região
    let tableToUse = table;
    let finalOracleName = oracleName;
    if (region && hasRegionStructure(table)) {
      const regionTable = getTableForRegion(table, region);
      if (regionTable) {
        tableToUse = regionTable;
        finalOracleName = `${oracleName} (${region.charAt(0).toUpperCase() + region.slice(1)})`;
      }
    }
    
    if (!tableToUse.rows || tableToUse.rows.length === 0) {
      return;
    }

    // Calcular o range máximo da tabela
    const maxRoll = getTableMaxRoll(tableToUse.rows);
    const roll = Math.floor(Math.random() * maxRoll) + 1;
    const row = findRollResult(roll, tableToUse.rows);
    const originalResultText = row ? row.text : t('result.notFound');
    const resultText = translateOracleResult(tableToUse._id, roll, originalResultText, language, row?.min);
    
    // Extrair todas as referências de oráculos
    const allExtraRolls = row ? extractOracleReferences(row) : [];

    // Se é uma rolagem filha (tem parentLogId), adicionar ao log pai
    if (parentLogId) {
      setLogs((prev) => prev.map((log) => {
        if (log.id === parentLogId) {
          const childRoll = rollSingleOracle(finalOracleName, tableToUse);
          if (childRoll) {
            return {
              ...log,
              childRolls: [...(log.childRolls || []), { ...childRoll, oracleId: tableToUse._id }]
            };
          }
        }
        return log;
      }));
      
      // Se essa rolagem filha também tem referências, rolar recursivamente
      if (allExtraRolls.length > 0) {
        setTimeout(() => {
          allExtraRolls.forEach((oracleId) => {
            const referencedOracle = findOracleById(oracleId);
            if (referencedOracle) {
              rollOracle(referencedOracle.name, referencedOracle, parentLogId);
            }
          });
        }, 100);
      }
      return;
    }

    // É uma rolagem principal - criar novo log
    const logId = generateLogId();
    const translatedOracleName = translateOracleName(tableToUse._id, finalOracleName, language);
    const newLog: LogEntry = {
      id: logId,
      oracleName: translatedOracleName,
      oracleId: tableToUse._id,
      roll: roll,
      result: resultText,
      originalResult: originalResultText,
      // Não mostrar botões extras se vamos rolar automaticamente
      extraRolls: undefined,
      childRolls: []
    };

    setLogs((prev) => [newLog, ...prev]);
    
    // Rolagem automática para oráculos referenciados
    if (allExtraRolls.length > 0) {
      setTimeout(() => {
        allExtraRolls.forEach((oracleId) => {
          const referencedOracle = findOracleById(oracleId);
          if (referencedOracle) {
            rollOracle(referencedOracle.name, referencedOracle, logId);
          }
        });
      }, 200);
    }
  };

  // Função para encontrar um oráculo por ID (busca recursiva em toda a árvore)
  const findOracleById = (oracleId: string): OracleTable | null => {
    const findInObject = (obj: any, id: string): OracleTable | null => {
      if (!obj || typeof obj !== 'object') return null;

      // Se encontrou o ID
      if (obj._id === id) {
        // Se tem rows, é uma tabela rolável - retorna ela
        if (obj.rows && Array.isArray(obj.rows) && obj.rows.length > 0) {
          return obj;
        }
      }
      
      // Buscar em contents (estrutura aninhada)
      if (obj.contents && typeof obj.contents === 'object') {
        for (const key in obj.contents) {
          const found = findInObject(obj.contents[key], id);
          if (found) return found;
        }
      }
      
      // Buscar em collections (estrutura aninhada alternativa)
      if (obj.collections && typeof obj.collections === 'object') {
        for (const key in obj.collections) {
          const found = findInObject(obj.collections[key], id);
          if (found) return found;
        }
      }
      
      return null;
    };

    // Buscar em oracles (nível raiz)
    if (currentRuleset.oracles && typeof currentRuleset.oracles === 'object') {
      const oracles = currentRuleset.oracles as Record<string, any>;
      for (const key in oracles) {
        const found = findInObject(oracles[key], oracleId);
        if (found) return found;
      }
    }

    return null;
  };

  // Função para coletar TODAS as tabelas recursivamente (para debug/verificação)
  const getAllTables = (): OracleTable[] => {
    const tables: OracleTable[] = [];
    
    const collectFromObject = (obj: any) => {
      if (!obj || typeof obj !== 'object') return;
      
      // Se tem rows, é uma tabela rolável
      if (obj.rows && Array.isArray(obj.rows) && obj.rows.length > 0) {
        tables.push(obj as OracleTable);
      }
      
      // Buscar em contents
      if (obj.contents && typeof obj.contents === 'object') {
        for (const key in obj.contents) {
          collectFromObject(obj.contents[key]);
        }
      }
      
      // Buscar em collections
      if (obj.collections && typeof obj.collections === 'object') {
        for (const key in obj.collections) {
          collectFromObject(obj.collections[key]);
        }
      }
    };
    
    if (currentRuleset.oracles && typeof currentRuleset.oracles === 'object') {
      const oracles = currentRuleset.oracles as Record<string, any>;
      for (const key in oracles) {
        collectFromObject(oracles[key]);
      }
    }
    
    return tables;
  };

  return {
    gameMode,
    setGameMode,
    logs,
    setLogs,
    currentRuleset,
    rollOracle,
    findOracleById,
    getAllTables,
    selectedRegion,
    setSelectedRegion
  };
}
