import type { OracleTable } from '../../types/datasworn';
import { useI18n } from '../../i18n/context';
import { translateOracleName } from '../../i18n/oracleTranslations';
import { getOracleIcon } from '../../utils/oracleIcons';

type AskTheOracleProps = {
  tables: OracleTable[];
  onRoll: (name: string, table: OracleTable) => void;
  allGroupsOpen: boolean;
  onToggleAllGroups: () => void;
};

export function AskTheOracle({ tables, onRoll, allGroupsOpen, onToggleAllGroups }: AskTheOracleProps) {
  const { t, language } = useI18n();
  
  if (tables.length === 0) return null;

  return (
    <div className="ask-the-oracle-section">
      <div className="ask-the-oracle-header">
        <h3 className="ask-the-oracle-title">⭐ {t('askTheOracle.title')}</h3>
        <button 
          onClick={onToggleAllGroups}
          className="expand-collapse-btn ask-the-oracle-expand-btn"
          title={allGroupsOpen ? t('buttons.collapse') : t('buttons.expand')}
        >
          {allGroupsOpen ? '▼' : '▶'}
        </button>
      </div>
      <div className="ask-the-oracle-buttons">
        {tables.map((table) => {
          const translatedName = translateOracleName(table._id, table.name, language);
          const icon = getOracleIcon(table._id, translatedName);
          return (
            <button
              key={table._id}
              onClick={() => onRoll(table.name, table)}
              className="ask-the-oracle-btn"
            >
              <span className="dice-icon">{icon}</span>
              <span className="ask-the-oracle-btn-text">{translatedName}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

