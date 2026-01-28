import { useState, useEffect } from 'react';
import starforgedData from '@datasworn/starforged/json/starforged.json';
import ironswornData from '@datasworn/ironsworn-classic/json/classic.json';
import delveData from '@datasworn/ironsworn-classic-delve/json/delve.json';
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
import { 
  type ShortcutDefinition,
  findOracleByPartialId,
  selectRandomOracle,
  getAllIronswornNameTables,
  getAllIronswornSettlementNameTables
} from '../utils/oracleShortcuts';

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

  // Função para mesclar dados de expansão (Delve) com dados base (Ironsworn Classic)
  const mergeExpansionData = (base: any, expansion: any): any => {
    if (!expansion || !base) return base;
    
    // Criar uma cópia profunda do base
    const merged = JSON.parse(JSON.stringify(base));
    
    // Mesclar oráculos recursivamente
    if (expansion.oracles && merged.oracles) {
      const mergeOracles = (baseOracles: any, expOracles: any) => {
        for (const key in expOracles) {
          if (baseOracles[key]) {
            // Se já existe, mesclar recursivamente
            if (expOracles[key].contents && baseOracles[key].contents) {
              mergeOracles(baseOracles[key].contents, expOracles[key].contents);
            }
            if (expOracles[key].collections && baseOracles[key].collections) {
              mergeOracles(baseOracles[key].collections, expOracles[key].collections);
            }
            // Se tem contents no expansion mas não no base, adicionar
            if (expOracles[key].contents && !baseOracles[key].contents) {
              baseOracles[key].contents = expOracles[key].contents;
            }
            // Se tem collections no expansion mas não no base, adicionar
            if (expOracles[key].collections && !baseOracles[key].collections) {
              baseOracles[key].collections = expOracles[key].collections;
            }
          } else {
            // Se não existe, adicionar
            baseOracles[key] = expOracles[key];
          }
        }
      };
      mergeOracles(merged.oracles, expansion.oracles);
    } else if (expansion.oracles) {
      // Se base não tem oracles mas expansion tem, adicionar
      merged.oracles = expansion.oracles;
    }
    
    // Mesclar moves se existir
    if (expansion.moves && merged.moves) {
      const mergeMoves = (baseMoves: any, expMoves: any) => {
        for (const key in expMoves) {
          if (baseMoves[key] && expMoves[key].contents && baseMoves[key].contents) {
            mergeMoves(baseMoves[key].contents, expMoves[key].contents);
          } else if (!baseMoves[key]) {
            baseMoves[key] = expMoves[key];
          }
        }
      };
      mergeMoves(merged.moves, expansion.moves);
    } else if (expansion.moves) {
      merged.moves = expansion.moves;
    }
    
    return merged;
  };

  // Mesclar dados do Delve com Ironsworn Classic quando estiver em modo Ironsworn
  const baseIronswornData = gameMode === 'ironsworn' ? mergeExpansionData(ironswornData, delveData) : ironswornData;
  const currentRuleset = gameMode === 'starforged' ? starforgedData : baseIronswornData;

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
      // Criar o child roll com o resultado
      const translatedOracleName = translateOracleName(tableToUse._id, finalOracleName, language);
      
      const childRoll: ChildRoll = {
        id: generateLogId() + Math.random(),
        oracleName: translatedOracleName,
        oracleId: tableToUse._id,
        roll: roll,
        result: resultText,
        originalResult: originalResultText
      };

      // Adicionar ao log pai
      setLogs((prev) => prev.map((log) => {
        if (log.id === parentLogId) {
          return {
            ...log,
            childRolls: [...(log.childRolls || []), childRoll]
          };
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
      childRolls: [],
      timestamp: Date.now()
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

  // Função para rolar múltiplos oráculos de um atalho
  const rollMultipleOracles = (shortcut: ShortcutDefinition, region?: StarforgedRegion) => {
    const logId = generateLogId();
    const childRolls: ChildRoll[] = [];
    let planetClass: string | null = null; // Para rastrear a classe do planeta

    // Primeira passada: identificar a classe do planeta se necessário
    const needsPlanetClass = shortcut.rolls.some(r => {
      const id = Array.isArray(r.oracleId) ? r.oracleId[0] : r.oracleId;
      return typeof id === 'string' && (id.includes('/planets/desert/') || id.includes('/planets/class'));
    });

    if (needsPlanetClass) {
      // Encontrar e rolar a classe de planeta primeiro
      const classTable = findOracleById('starforged/oracles/planets/class') || 
                        findOracleByPartialId(currentRuleset, 'starforged/oracles/planets/class', findOracleById);
      if (classTable && classTable.rows && classTable.rows.length > 0) {
        const maxRoll = getTableMaxRoll(classTable.rows);
        const roll = Math.floor(Math.random() * maxRoll) + 1;
        const row = findRollResult(roll, classTable.rows);
        if (row) {
          const originalResultText = row.text || t('result.notFound');
          const resultText = translateOracleResult(classTable._id, roll, originalResultText, language, row.min);
          const translatedOracleName = translateOracleName(classTable._id, classTable.name, language);
          
          // Adicionar ao log
          childRolls.push({
            id: generateLogId() + Math.random(),
            oracleName: translatedOracleName,
            oracleId: classTable._id,
            roll: roll,
            result: resultText,
            originalResult: originalResultText
          });
          
          // Processar referências automaticamente (ainda não temos logId, será processado depois)
          
          // Extrair a classe do texto ou do ID da linha
          if (row.text) {
            const classMatch = row.text.toLowerCase().match(/(desert|furnace|grave|ice|jovian|jungle|ocean|rocky|shattered|tainted|vital)/);
            if (classMatch) {
              planetClass = classMatch[1];
            }
          }
          // Tentar pelo ID se disponível
          const rowId = (row as any).oracle;
          if (!planetClass && rowId && typeof rowId === 'string') {
            const idMatch = rowId.match(/planets\/(desert|furnace|grave|ice|jovian|jungle|ocean|rocky|shattered|tainted|vital)/);
            if (idMatch) {
              planetClass = idMatch[1];
            }
          }
        }
      }
    }

    // Segunda passada: processar todas as rolagens
    for (const shortcutRoll of shortcut.rolls) {
      // Verificar condição se existir
      if (shortcutRoll.condition && !shortcutRoll.condition(region)) {
        continue;
      }

      // Se já processamos a classe de planeta na primeira passada, pular se for a classe
      const oracleId = Array.isArray(shortcutRoll.oracleId) ? shortcutRoll.oracleId[0] : shortcutRoll.oracleId;
      if (needsPlanetClass && typeof oracleId === 'string' && oracleId.includes('/planets/class')) {
        continue; // Já foi processada na primeira passada
      }

      let table: OracleTable | null = null;
      let oracleName = '';
      let oracleIdToUse = shortcutRoll.oracleId;

      // Se é array, selecionar aleatoriamente
      if (Array.isArray(oracleIdToUse)) {
        // Caso especial: nomes de personagens do Ironsworn
        if (oracleIdToUse.some(id => id.includes('/name/') && !id.includes('settlement'))) {
          const nameTables = getAllIronswornNameTables(currentRuleset);
          if (nameTables.length > 0) {
            table = nameTables[Math.floor(Math.random() * nameTables.length)];
            oracleName = table.name;
          }
        } else if (oracleIdToUse.some(id => id.includes('settlement/name') || id.includes('settlement/quick_name'))) {
          // Caso especial: nomes de assentamentos do Ironsworn
          const settlementNameTables = getAllIronswornSettlementNameTables(currentRuleset);
          if (settlementNameTables.length > 0) {
            table = settlementNameTables[Math.floor(Math.random() * settlementNameTables.length)];
            oracleName = table.name;
          }
        } else if (oracleIdToUse.some(id => id.includes('/planets/') && id.includes('/name'))) {
          // Nomes de planetas - usar a classe se disponível
          if (planetClass) {
            const planetNameId = `starforged/oracles/planets/${planetClass}/name`;
            table = findOracleById(planetNameId) || findOracleByPartialId(currentRuleset, planetNameId, findOracleById);
            if (table) oracleName = table.name;
          } else {
            // Se não tem classe ainda, selecionar aleatoriamente
            table = selectRandomOracle(currentRuleset, oracleIdToUse, findOracleById);
            if (table) oracleName = table.name;
          }
        } else if (oracleIdToUse.some(id => id.includes('/characters/name/'))) {
          // Nomes de personagens do Starforged - selecionar aleatoriamente
          table = selectRandomOracle(currentRuleset, oracleIdToUse, findOracleById);
          if (table) oracleName = table.name;
        } else {
          table = selectRandomOracle(currentRuleset, oracleIdToUse, findOracleById);
          if (table) oracleName = table.name;
        }
      } else {
        // Ajustar ID se temos classe de planeta e o ID usa desert como placeholder
        if (planetClass && typeof oracleIdToUse === 'string' && oracleIdToUse.includes('/planets/desert/')) {
          oracleIdToUse = oracleIdToUse.replace('/planets/desert/', `/planets/${planetClass}/`);
          
          // Se é settlements e temos região, usar o ID específico da região
          if (oracleIdToUse.includes('/settlements') && region) {
            oracleIdToUse = `${oracleIdToUse}/${region}`;
          }
        }
        
        // Ajustar population para usar a região correta
        if (region && typeof oracleIdToUse === 'string' && oracleIdToUse.includes('/settlements/population/terminus')) {
          oracleIdToUse = oracleIdToUse.replace('/settlements/population/terminus', `/settlements/population/${region}`);
        }
        
        // Buscar por ID completo primeiro, depois por parcial
        table = findOracleById(oracleIdToUse);
        if (!table) {
          table = findOracleByPartialId(currentRuleset, oracleIdToUse, findOracleById);
        }
        
        if (table) {
          oracleName = table.name;
          
          // Se tem estrutura de região e região foi especificada, usar tabela da região
          // (mas só se não já usamos o ID específico da região)
          if (region && hasRegionStructure(table) && !oracleIdToUse.includes(`/${region}`)) {
            const regionTable = getTableForRegion(table, region);
            if (regionTable) {
              table = regionTable;
              oracleName = `${oracleName} (${region.charAt(0).toUpperCase() + region.slice(1)})`;
            }
          }
        }
      }

      if (!table || !table.rows || table.rows.length === 0) {
        continue;
      }

      // Rolar o número de vezes especificado (padrão: 1)
      const count = shortcutRoll.count || 1;
      for (let i = 0; i < count; i++) {
        const maxRoll = getTableMaxRoll(table.rows);
        const roll = Math.floor(Math.random() * maxRoll) + 1;
        const row = findRollResult(roll, table.rows);
        const originalResultText = row ? row.text : t('result.notFound');
        const resultText = translateOracleResult(table._id, roll, originalResultText, language, row?.min);
        const translatedOracleName = translateOracleName(table._id, oracleName, language);

        // Processar referências imediatamente e criar childRolls aninhados
        const nestedChildRolls: ChildRoll[] = [];
        if (row) {
          const references = extractOracleReferences(row);
          for (const refOracleId of references) {
            const referencedOracle = findOracleById(refOracleId);
            if (referencedOracle && referencedOracle.rows && referencedOracle.rows.length > 0) {
              const refMaxRoll = getTableMaxRoll(referencedOracle.rows);
              const refRoll = Math.floor(Math.random() * refMaxRoll) + 1;
              const refRow = findRollResult(refRoll, referencedOracle.rows);
              const refOriginalText = refRow ? refRow.text : t('result.notFound');
              const refResultText = translateOracleResult(referencedOracle._id, refRoll, refOriginalText, language, refRow?.min);
              const refTranslatedName = translateOracleName(referencedOracle._id, referencedOracle.name, language);
              
              nestedChildRolls.push({
                id: generateLogId() + Math.random(),
                oracleName: refTranslatedName,
                oracleId: referencedOracle._id,
                roll: refRoll,
                result: refResultText,
                originalResult: refOriginalText
              });
            }
          }
        }

        childRolls.push({
          id: generateLogId() + Math.random(),
          oracleName: translatedOracleName,
          oracleId: table._id,
          roll: roll,
          result: resultText,
          originalResult: originalResultText,
          childRolls: nestedChildRolls.length > 0 ? nestedChildRolls : undefined
        });
      }
    }

    // Se é um planeta e a classe é vital, adicionar diversity e biomes
    if (needsPlanetClass && planetClass === 'vital') {
      const diversityTable = findOracleById('starforged/oracles/planets/vital/diversity') || 
                            findOracleByPartialId(currentRuleset, 'starforged/oracles/planets/vital/diversity', findOracleById);
      if (diversityTable && diversityTable.rows && diversityTable.rows.length > 0) {
        const maxRoll = getTableMaxRoll(diversityTable.rows);
        const roll = Math.floor(Math.random() * maxRoll) + 1;
        const row = findRollResult(roll, diversityTable.rows);
        const originalResultText = row ? row.text : t('result.notFound');
        const resultText = translateOracleResult(diversityTable._id, roll, originalResultText, language, row?.min);
        const translatedOracleName = translateOracleName(diversityTable._id, diversityTable.name, language);

        // Processar referências inline
        const nestedChildRolls: ChildRoll[] = [];
        if (row) {
          const references = extractOracleReferences(row);
          for (const refOracleId of references) {
            const referencedOracle = findOracleById(refOracleId);
            if (referencedOracle && referencedOracle.rows && referencedOracle.rows.length > 0) {
              const refMaxRoll = getTableMaxRoll(referencedOracle.rows);
              const refRoll = Math.floor(Math.random() * refMaxRoll) + 1;
              const refRow = findRollResult(refRoll, referencedOracle.rows);
              const refOriginalText = refRow ? refRow.text : t('result.notFound');
              const refResultText = translateOracleResult(referencedOracle._id, refRoll, refOriginalText, language, refRow?.min);
              const refTranslatedName = translateOracleName(referencedOracle._id, referencedOracle.name, language);
              
              nestedChildRolls.push({
                id: generateLogId() + Math.random(),
                oracleName: refTranslatedName,
                oracleId: referencedOracle._id,
                roll: refRoll,
                result: refResultText,
                originalResult: refOriginalText
              });
            }
          }
        }

        childRolls.push({
          id: generateLogId() + Math.random(),
          oracleName: translatedOracleName,
          oracleId: diversityTable._id,
          roll: roll,
          result: resultText,
          originalResult: originalResultText,
          childRolls: nestedChildRolls.length > 0 ? nestedChildRolls : undefined
        });
      }

      const biomesTable = findOracleById('starforged/oracles/planets/vital/biomes') || 
                         findOracleByPartialId(currentRuleset, 'starforged/oracles/planets/vital/biomes', findOracleById);
      if (biomesTable && biomesTable.rows && biomesTable.rows.length > 0) {
        const maxRoll = getTableMaxRoll(biomesTable.rows);
        const roll = Math.floor(Math.random() * maxRoll) + 1;
        const row = findRollResult(roll, biomesTable.rows);
        const originalResultText = row ? row.text : t('result.notFound');
        const resultText = translateOracleResult(biomesTable._id, roll, originalResultText, language, row?.min);
        const translatedOracleName = translateOracleName(biomesTable._id, biomesTable.name, language);

        // Processar referências inline
        const nestedChildRolls: ChildRoll[] = [];
        if (row) {
          const references = extractOracleReferences(row);
          for (const refOracleId of references) {
            const referencedOracle = findOracleById(refOracleId);
            if (referencedOracle && referencedOracle.rows && referencedOracle.rows.length > 0) {
              const refMaxRoll = getTableMaxRoll(referencedOracle.rows);
              const refRoll = Math.floor(Math.random() * refMaxRoll) + 1;
              const refRow = findRollResult(refRoll, referencedOracle.rows);
              const refOriginalText = refRow ? refRow.text : t('result.notFound');
              const refResultText = translateOracleResult(referencedOracle._id, refRoll, refOriginalText, language, refRow?.min);
              const refTranslatedName = translateOracleName(referencedOracle._id, referencedOracle.name, language);
              
              nestedChildRolls.push({
                id: generateLogId() + Math.random(),
                oracleName: refTranslatedName,
                oracleId: referencedOracle._id,
                roll: refRoll,
                result: refResultText,
                originalResult: refOriginalText
              });
            }
          }
        }

        childRolls.push({
          id: generateLogId() + Math.random(),
          oracleName: translatedOracleName,
          oracleId: biomesTable._id,
          roll: roll,
          result: resultText,
          originalResult: originalResultText,
          childRolls: nestedChildRolls.length > 0 ? nestedChildRolls : undefined
        });
      }
    }

    // Criar entrada principal no log
    const translatedShortcutName = t(shortcut.nameKey) || shortcut.name;
    const mainLog: LogEntry = {
      id: logId,
      oracleName: translatedShortcutName,
      oracleId: '',
      roll: 0,
      result: '',
      originalResult: '',
      childRolls: childRolls,
      timestamp: Date.now()
    };

    setLogs((prev) => [mainLog, ...prev]);
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
    setSelectedRegion,
    rollMultipleOracles
  };
}
