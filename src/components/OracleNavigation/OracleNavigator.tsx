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
  isFavorite?: (oracleId: string) => boolean;
  toggleFavorite?: (oracleId: string) => void;
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
  
  // Verificar se é o grupo "Nomes" do Ironsworn
  const isIronswornNames = gameMode === 'ironsworn' && 
    (data._id === 'classic/oracles/name' || data._id === 'classic/collections/oracles/name');
  
  // Verificar se é um subgrupo de nomes do Ironsworn
  const isIronswornNameSubgroup = gameMode === 'ironsworn' && 
    data._id && 
    typeof data._id === 'string' &&
    (data._id === 'classic/collections/oracles/name/ironlander' || 
     data._id === 'classic/collections/oracles/name/other');
  
  // Estado de aberto/fechado
  const storageKey = `oracleGroupExpanded-${data._id}`;
  const [isOpen, setIsOpen] = useState(() => {
    // Quando o componente é recriado (key muda), usa defaultOpen diretamente
    // O localStorage só é verificado se não foi limpo pelo toggle global
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved !== null) {
        return saved === 'true';
      }
    } catch {
      // Se houver erro ao acessar localStorage, continuar
    }
    // Se não há valor salvo, usa defaultOpen (que vem do estado global)
    return defaultOpen;
  });
  
  const detailsRef = useRef<HTMLDetailsElement>(null);

  // Sincronizar o elemento details com o estado
  useEffect(() => {
    if (detailsRef.current) {
      detailsRef.current.open = isOpen;
    }
  }, [isOpen]);

  // Handler para toggle do details
  const handleDetailsToggle = (e: React.SyntheticEvent<HTMLDetailsElement>) => {
    const target = e.currentTarget;
    if (target.open !== isOpen) {
      setIsOpen(target.open);
      try {
        localStorage.setItem(storageKey, String(target.open));
      } catch {
        // Ignorar erros de localStorage
      }
    }
  };

  // Handler para click no summary
  const handleSummaryClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const newState = !isOpen;
    setIsOpen(newState);
    if (detailsRef.current) {
      detailsRef.current.open = newState;
    }
    try {
      localStorage.setItem(storageKey, String(newState));
    } catch {
      // Ignorar erros de localStorage
    }
  };

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
    
    if ('rows' in item && item.rows && item.rows.length > 0) {
      tables.push(item as OracleTable);
    }
    
    if ('contents' in item && item.contents) {
      Object.values(item.contents).forEach((subItem) => {
        tables.push(...collectAllTables(subItem));
      });
    }
    
    if ('collections' in item && item.collections) {
      Object.values(item.collections).forEach((subItem) => {
        tables.push(...collectAllTables(subItem));
      });
    }
    
    return tables;
  };

  // Para subgrupos de nomes do Ironsworn, renderizar tabelas diretamente
  if (isIronswornNameSubgroup) {
    const allTables = collectAllTables(data);
    
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

  // Para o grupo "Nomes" do Ironsworn, coletar todas as tabelas
  if (isIronswornNames) {
    const allTables: OracleTable[] = [];
    
    if (hasContents && data.contents) {
      Object.values(data.contents).forEach((subGroup) => {
        allTables.push(...collectAllTables(subGroup));
      });
    }
    
    if (hasCollections && data.collections) {
      Object.values(data.collections).forEach((subGroup) => {
        allTables.push(...collectAllTables(subGroup));
      });
    }

    return (
      <div className="oracle-category" style={{ marginLeft: `${level * 4}px` }}>
        <details 
          ref={detailsRef}
          open={isOpen} 
          className="oracle-details"
          data-level={level}
          onToggle={handleDetailsToggle}
        >
          <summary onClick={handleSummaryClick} className="oracle-summary">
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
        onToggle={handleDetailsToggle}
      >
        <summary onClick={handleSummaryClick} className="oracle-summary">
          <span className="category-icon">{isOpen ? <FaChevronDown /> : <FaChevronRight />}</span>
          <span className="category-icon-oracle">{getOracleIcon(data._id, translatedName)}</span>
          <span className="category-name">{translatedName}</span>
        </summary>
        
        {isOpen && (
          <div className="oracle-children">
            {/* Renderizar contents se existir */}
            {hasContents && data.contents && !isIronswornNames && 
              Object.values(data.contents).map((item, index) => (
                <OracleNavigator
                  key={item._id || index}
                  data={item}
                  level={level + 1}
                  rollOracle={rollOracle}
                  findOracleById={findOracleById}
                  defaultOpen={defaultOpen}
                  hasRegionStructure={hasRegionStructure}
                  selectedRegion={selectedRegion}
                  gameMode={gameMode}
                />
              ))
            }
            
            {/* Renderizar collections se existir */}
            {hasCollections && data.collections && Object.values(data.collections).map((item, index) => (
              <OracleNavigator
                key={item._id || index}
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
                    key={oracle._id}
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
