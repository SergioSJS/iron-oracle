import { useState, useEffect, useRef } from 'react';
import type { OracleTable, OracleCollection, StarforgedRegion } from '../../types/datasworn';
import { useI18n } from '../../i18n/context';
import { translateOracleName } from '../../i18n/oracleTranslations';
import { getOracleIcon } from '../../utils/oracleIcons';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';

type OracleNavigatorProps = {
  data: OracleTable | OracleCollection;
  level?: number;
  rollOracle: (name: string, table: OracleTable, parentLogId?: number, region?: StarforgedRegion) => void;
  findOracleById: (id: string) => OracleTable | null;
  defaultOpen?: boolean;
  hasRegionStructure?: (data: OracleTable | OracleCollection) => boolean;
  selectedRegion?: StarforgedRegion;
  gameMode?: 'starforged' | 'ironsworn';
};

export function OracleNavigator({ 
  data, 
  level = 0, 
  rollOracle, 
  findOracleById, 
  defaultOpen = false,
  hasRegionStructure,
  selectedRegion = 'terminus',
  gameMode = 'starforged'
}: OracleNavigatorProps) {
  const { language } = useI18n();
  const translatedName = translateOracleName(data._id, data.name, language);
  
  // Verificar PRIMEIRO se é o grupo "Nomes" do Ironsworn - deve ser feito ANTES de tudo
  // O ID correto é classic/collections/oracles/name, não classic/oracles/name!
  const isIronswornNames = gameMode === 'ironsworn' && 
    (data._id === 'classic/oracles/name' || data._id === 'classic/collections/oracles/name');
  
  // Verificar PRIMEIRO se é um subgrupo de nomes do Ironsworn - deve ser feito ANTES de tudo
  // Subgrupos são collections que contêm tabelas: ironlander, other
  // NÃO são subgrupos: elf (é tabela direta), tabelas individuais (a, b, giants, varou, trolls)
  const isIronswornNameSubgroup = gameMode === 'ironsworn' && 
    data._id && 
    typeof data._id === 'string' &&
    (data._id === 'classic/collections/oracles/name/ironlander' || 
     data._id === 'classic/collections/oracles/name/other');
  
  // DEBUG LOGS
  if (gameMode === 'ironsworn' && data._id && typeof data._id === 'string' && data._id.includes('name')) {
    console.log('🔍 OracleNavigator:', {
      id: data._id,
      name: data.name,
      translatedName,
      isIronswornNames,
      isIronswornNameSubgroup,
      hasRows: 'rows' in data && data.rows && data.rows.length > 0,
      hasContents: 'contents' in data && data.contents && Object.keys(data.contents || {}).length > 0,
      level
    });
  }
  
  // Carregar estado inicial do LocalStorage (sempre priorizar localStorage)
  // O localStorage tem prioridade absoluta sobre defaultOpen
  const storageKey = `oracleGroupExpanded-${data._id}`;
  const [isOpen, setIsOpen] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      console.log(`🔍 [OracleNavigator] Inicializando ${data._id}:`, {
        storageKey,
        saved,
        defaultOpen,
        level,
        willUseSaved: saved !== null,
        finalValue: saved !== null ? saved === 'true' : (defaultOpen || level < 1)
      });
      if (saved !== null) {
        // Se há valor salvo, usar ele (ignorar defaultOpen)
        return saved === 'true';
      }
    } catch (e) {
      // Se houver erro ao acessar localStorage, continuar
      console.warn('Erro ao acessar localStorage:', e);
    }
    // Se não há estado salvo, usar defaultOpen ou nível
    return defaultOpen || level < 1;
  });
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const skipNextToggle = useRef(false);
  const justSavedFromClick = useRef(false);
  const prevDefaultOpen = useRef<boolean | undefined>(undefined);

  // Sincronizar o elemento details com o estado inicial na montagem
  useEffect(() => {
    if (detailsRef.current) {
      console.log(`🔧 [OracleNavigator] Sincronizando details na montagem ${data._id}:`, {
        isOpen,
        detailsOpen: detailsRef.current.open,
        willSetTo: isOpen
      });
      // Marcar para ignorar o próximo onToggle (que será disparado pela mudança do open)
      skipNextToggle.current = true;
      detailsRef.current.open = isOpen;
      // Resetar a flag após um pequeno delay
      setTimeout(() => {
        skipNextToggle.current = false;
      }, 100);
    }
  }, []); // Apenas na montagem inicial

  // Atualizar quando defaultOpen mudar externamente (botão expandir/colapsar todos)
  // Mas apenas se não for a montagem inicial
  useEffect(() => {
    // Na primeira montagem, apenas salvar o defaultOpen atual e não fazer nada
    if (prevDefaultOpen.current === undefined) {
      prevDefaultOpen.current = defaultOpen;
      console.log(`🚫 [OracleNavigator] Primeira montagem ${data._id}, ignorando defaultOpen`);
      return;
    }

    // Só atualizar se defaultOpen realmente mudou
    if (prevDefaultOpen.current === defaultOpen) {
      return;
    }

    prevDefaultOpen.current = defaultOpen;

    // Quando defaultOpen muda (ex: botão expandir/colapsar todos), atualizar
    const shouldBeOpen = defaultOpen || level < 1;
    console.log(`🌐 [OracleNavigator] defaultOpen mudou ${data._id}:`, {
      defaultOpen,
      level,
      shouldBeOpen,
      currentIsOpen: isOpen
    });
    setIsOpen(shouldBeOpen);
    if (detailsRef.current) {
      skipNextToggle.current = true;
      detailsRef.current.open = shouldBeOpen;
      setTimeout(() => {
        skipNextToggle.current = false;
      }, 100);
    }
    // Salvar no LocalStorage quando mudado pelo botão global
    localStorage.setItem(storageKey, String(shouldBeOpen));
  }, [defaultOpen, level, storageKey]);

  // Se tem rows, é uma tabela rolável
  if ('rows' in data && data.rows && data.rows.length > 0) {
    const icon = getOracleIcon(data._id, translatedName);
    return (
      <div className="oracle-item" style={{ marginLeft: `${level * 4}px` }}>
        <button
          onClick={() => rollOracle(data.name, data as OracleTable)}
          className="oracle-roll-btn"
        >
          <span className="dice-icon">{icon}</span>
          <span className="oracle-name">{translatedName}</span>
        </button>
      </div>
    );
  }

  // Verificar se tem estrutura de região (terminus/outlands/expanse)
  const isRegionBased = hasRegionStructure && hasRegionStructure(data) && gameMode === 'starforged';
  
  // Se tem estrutura de região, mostrar botão de rolar que usa a região selecionada
  // NÃO mostrar os filhos (terminus/outlands/expanse) como opções separadas
  if (isRegionBased && data.contents) {
    const icon = getOracleIcon(data._id, translatedName);
    return (
      <div className="oracle-item" style={{ marginLeft: `${level * 4}px` }}>
        <button
          onClick={() => rollOracle(data.name, data as OracleTable, undefined, selectedRegion)}
          className="oracle-roll-btn"
          title={`Rolar usando região: ${selectedRegion}`}
        >
          <span className="dice-icon">{icon}</span>
          <span className="oracle-name">{translatedName}</span>
          <span className="region-badge">{selectedRegion}</span>
        </button>
      </div>
    );
  }

  // Função auxiliar para coletar todas as tabelas recursivamente
  const collectAllTables = (item: OracleTable | OracleCollection): OracleTable[] => {
    const tables: OracleTable[] = [];
    
    // Se é uma tabela rolável, adicionar
    if ('rows' in item && item.rows && item.rows.length > 0) {
      tables.push(item as OracleTable);
    }
    
    // Se tem contents, processar recursivamente
    if ('contents' in item && item.contents) {
      Object.values(item.contents).forEach((subItem) => {
        tables.push(...collectAllTables(subItem));
      });
    }
    
    // Se tem collections, processar recursivamente
    if ('collections' in item && item.collections) {
      Object.values(item.collections).forEach((subItem) => {
        tables.push(...collectAllTables(subItem));
      });
    }
    
    return tables;
  };


  // Para subgrupos de nomes do Ironsworn, renderizar tabelas diretamente sem criar categoria
  // VERIFICAR ANTES de processar contents/collections
  if (isIronswornNameSubgroup) {
    // Coletar todas as tabelas recursivamente deste subgrupo
    const allTables = collectAllTables(data);
    
    // Renderizar apenas as tabelas, sem criar categoria - SEMPRE retornar aqui
    return (
      <>
        {allTables.map((table, index) => {
          const tableTranslatedName = translateOracleName(table._id, table.name, language);
          const tableIcon = getOracleIcon(table._id, tableTranslatedName);
          return (
            <div key={table._id || index} className="oracle-item" style={{ marginLeft: `${level * 4}px` }}>
              <button
                onClick={() => rollOracle(table.name, table)}
                className="oracle-roll-btn"
              >
                <span className="dice-icon">{tableIcon}</span>
                <span className="oracle-name">{tableTranslatedName}</span>
              </button>
            </div>
          );
        })}
      </>
    );
  }

  // Se tem contents, collections ou oracles, é uma categoria/coleção
  const hasContents = 'contents' in data && data.contents && Object.keys(data.contents).length > 0;
  const hasCollections = 'collections' in data && data.collections && Object.keys(data.collections).length > 0;
  const hasOracles = 'oracles' in data && data.oracles && data.oracles.length > 0;

  if (!hasContents && !hasCollections && !hasOracles) {
    return null;
  }

  // Para o grupo "Nomes" do Ironsworn, SEMPRE coletar todas as tabelas e renderizar diretamente
  // NUNCA renderizar os subgrupos recursivamente
  if (isIronswornNames) {
    console.log('✅ PROCESSANDO GRUPO NOMES - coletando tabelas de subgrupos');
    // Coletar todas as tabelas recursivamente de todos os subgrupos
    const allTables: OracleTable[] = [];
    
    // Processar contents (ex: elf)
    if (hasContents && data.contents) {
      Object.values(data.contents).forEach((subGroup) => {
        console.log('  📦 Processando subgrupo (contents):', (subGroup as any)._id, (subGroup as any).name);
        const tables = collectAllTables(subGroup);
        console.log('  📊 Encontradas', tables.length, 'tabelas neste subgrupo');
        allTables.push(...tables);
      });
    }
    
    // Processar collections (ex: ironlander, other)
    if (hasCollections && data.collections) {
      Object.values(data.collections).forEach((subGroup) => {
        console.log('  📦 Processando subgrupo (collections):', (subGroup as any)._id, (subGroup as any).name);
        const tables = collectAllTables(subGroup);
        console.log('  📊 Encontradas', tables.length, 'tabelas neste subgrupo');
        allTables.push(...tables);
      });
    }
    
    console.log('✅ TOTAL de tabelas coletadas:', allTables.length);

    // Renderizar o grupo "Nomes" com todas as tabelas diretamente
    // SEMPRE retornar aqui, mesmo se não houver tabelas, para evitar renderizar subgrupos
    return (
      <div className="oracle-category" style={{ marginLeft: `${level * 4}px` }}>
        <details 
          ref={detailsRef}
          open={isOpen} 
          className="oracle-details"
          data-level={level}
        onToggle={(e) => {
          // Ignorar se for a montagem inicial ou mudança programática
          if (skipNextToggle.current) {
            console.log(`⏭️ [OracleNavigator] Ignorando onToggle ${data._id} (mudança programática)`);
            return;
          }
          
          // Ignorar se já salvamos do onClick
          if (justSavedFromClick.current) {
            console.log(`⏭️ [OracleNavigator] Ignorando onToggle ${data._id} (já salvo do onClick)`);
            return;
          }
          
          const target = e.currentTarget;
          // Só processar se o estado realmente mudou
          if (target.open === isOpen) {
            console.log(`⏭️ [OracleNavigator] Ignorando onToggle ${data._id} (estado não mudou)`);
            return;
          }
          
          console.log(`🔄 [OracleNavigator] onToggle ${data._id}:`, {
            oldState: isOpen,
            newState: target.open,
            storageKey
          });
          setIsOpen(target.open);
          // Salvar no LocalStorage quando mudar (apenas se não foi do onClick)
          try {
            localStorage.setItem(storageKey, String(target.open));
            console.log(`💾 [OracleNavigator] Salvo no localStorage ${storageKey}:`, target.open);
          } catch (e) {
            console.error(`❌ [OracleNavigator] Erro ao salvar no localStorage:`, e);
          }
        }}
        >
          <summary
            onClick={(e) => {
              e.preventDefault();
              const newState = !isOpen;
              setIsOpen(newState);
              if (detailsRef.current) {
                detailsRef.current.open = newState;
              }
            }}
            className="oracle-summary"
          >
            <span className="category-icon">{isOpen ? <FaChevronDown /> : <FaChevronRight />}</span>
            <span className="category-icon-oracle">{getOracleIcon(data._id, translatedName)}</span>
            <span className="category-name">{translatedName}</span>
          </summary>
          
          {isOpen && (
            <div className="oracle-children">
              {allTables.map((table, index) => {
                const tableTranslatedName = translateOracleName(table._id, table.name, language);
                const tableIcon = getOracleIcon(table._id, tableTranslatedName);
                return (
                  <div key={table._id || index} className="oracle-item" style={{ marginLeft: `${(level + 1) * 4}px` }}>
                    <button
                      onClick={() => rollOracle(table.name, table)}
                      className="oracle-roll-btn"
                    >
                      <span className="dice-icon">{tableIcon}</span>
                      <span className="oracle-name">{tableTranslatedName}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </details>
      </div>
    );
  }


  return (
    <div className="oracle-category" style={{ marginLeft: `${level * 4}px` }}>
      <details 
        ref={detailsRef}
        open={isOpen} 
        className="oracle-details"
        data-level={level}
        onToggle={(e) => {
          // Sincronizar estado quando o usuário clica diretamente no details
          const target = e.currentTarget;
          console.log(`🔄 [OracleNavigator] onToggle ${data._id}:`, {
            oldState: isOpen,
            newState: target.open,
            storageKey
          });
          setIsOpen(target.open);
          // Salvar no LocalStorage quando mudar
          try {
            localStorage.setItem(storageKey, String(target.open));
            console.log(`💾 [OracleNavigator] Salvo no localStorage ${storageKey}:`, target.open);
          } catch (e) {
            console.error(`❌ [OracleNavigator] Erro ao salvar no localStorage:`, e);
          }
        }}
      >
          <summary
            onClick={(e) => {
              e.preventDefault();
              const newState = !isOpen;
              console.log(`🖱️ [OracleNavigator] Click no summary ${data._id}:`, {
                oldState: isOpen,
                newState,
                storageKey
              });
              setIsOpen(newState);
              // Forçar o details a abrir/fechar
              if (detailsRef.current) {
                detailsRef.current.open = newState;
              }
              // Marcar que já salvamos do click, para o onToggle não salvar novamente
              justSavedFromClick.current = true;
              // Salvar no LocalStorage quando mudar manualmente
              try {
                localStorage.setItem(storageKey, String(newState));
                console.log(`💾 [OracleNavigator] Salvo no localStorage ${storageKey}:`, newState);
              } catch (e) {
                console.error(`❌ [OracleNavigator] Erro ao salvar no localStorage:`, e);
              }
              // Resetar a flag após um pequeno delay
              setTimeout(() => {
                justSavedFromClick.current = false;
              }, 100);
            }}
            className="oracle-summary"
          >
          <span className="category-icon">{isOpen ? <FaChevronDown /> : <FaChevronRight />}</span>
          <span className="category-icon-oracle">{getOracleIcon(data._id, translatedName)}</span>
          <span className="category-name">{translatedName}</span>
        </summary>
        
        {isOpen && (
          <div className="oracle-children">
            {/* Renderizar contents se existir */}
            {hasContents && data.contents && !isIronswornNames && (() => {
              console.log('⚠️ RENDERIZANDO CONTENTS - ID:', data._id, 'isIronswornNames:', isIronswornNames);
              return Object.values(data.contents).map((item, index) => {
                console.log('  🔄 Renderizando item:', (item as any)._id, (item as any).name);
                return (
                  <OracleNavigator
                    key={`${item._id || index}-${defaultOpen}`}
                    data={item}
                    level={level + 1}
                    rollOracle={rollOracle}
                    findOracleById={findOracleById}
                    defaultOpen={defaultOpen}
                    hasRegionStructure={hasRegionStructure}
                    selectedRegion={selectedRegion}
                    gameMode={gameMode}
                  />
                );
              });
            })()}
            
            {/* Renderizar collections se existir */}
            {hasCollections && data.collections && Object.values(data.collections).map((item, index) => (
              <OracleNavigator
                key={`${item._id || index}-${defaultOpen}`}
                data={item}
                level={level + 1}
                rollOracle={rollOracle}
                findOracleById={findOracleById}
                defaultOpen={defaultOpen}
                hasRegionStructure={hasRegionStructure}
                selectedRegion={selectedRegion}
                gameMode={gameMode}
              />
            ))}
            
            {/* Renderizar oracles referenciados se existir */}
            {hasOracles && data.oracles && data.oracles.map((oracleId) => {
              const oracle = findOracleById(oracleId);
              if (oracle) {
                return (
                  <OracleNavigator
                    key={`${oracle._id}-${defaultOpen}`}
                    data={oracle}
                    level={level + 1}
                    rollOracle={rollOracle}
                    findOracleById={findOracleById}
                    defaultOpen={defaultOpen}
                    hasRegionStructure={hasRegionStructure}
                    selectedRegion={selectedRegion}
                    gameMode={gameMode}
                  />
                );
              }
              return null;
            })}
          </div>
        )}
      </details>
    </div>
  );
}
