import { OracleText } from '../OracleText/OracleText';
import type { LogEntry, OracleTable } from '../../types/datasworn';
import { useI18n } from '../../i18n/context';
import { getOracleIcon } from '../../utils/oracleIcons';

type ResultModalProps = {
  log: LogEntry;
  isOpen: boolean;
  onClose: () => void;
  onOracleClick: (oracleId: string) => void;
  findOracleById: (id: string) => OracleTable | null;
};

export function ResultModal({
  log,
  isOpen,
  onClose,
  onOracleClick,
  findOracleById
}: ResultModalProps) {
  const { t } = useI18n();
  
  if (!isOpen) return null;

  return (
    <div 
      className={`result-modal-overlay active`}
      onClick={onClose}
    >
      <div 
        className="result-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="result-modal-header">
          <h3>{t('modal.result.title')}</h3>
          <button 
            className="result-modal-close"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <div className="result-modal-body">
          <div className="result-modal-entry">
            <div className="result-modal-header-info">
              <span className="result-modal-name">
                {log.oracleId && (
                  <span className="dice-icon">{getOracleIcon(log.oracleId, log.oracleName)}</span>
                )}
                {log.oracleName}
              </span>
              <span className="result-modal-roll">
                <span className="roll-label">{t('log.rolled')}:</span>
                <span className="roll-value">{log.roll}</span>
              </span>
            </div>
            
            <div className="result-modal-result">
              <OracleText 
                text={log.result}
                originalText={log.originalResult}
                onOracleClick={onOracleClick}
                findOracleById={findOracleById}
              />
            </div>

            {log.childRolls && log.childRolls.length > 0 && (
              <div className="result-modal-children">
                {log.childRolls.map((childRoll) => (
                  <div key={childRoll.id} className="result-modal-child">
                    <div className="result-modal-child-header">
                      <span className="result-modal-child-name">
                        {childRoll.oracleId && (
                          <span className="dice-icon">{getOracleIcon(childRoll.oracleId, childRoll.oracleName)}</span>
                        )}
                        {childRoll.oracleName}
                      </span>
                      <span className="result-modal-child-roll">
                        <span className="roll-label">{t('log.rolled')}:</span>
                        <span className="roll-value">{childRoll.roll}</span>
                      </span>
                    </div>
                    <div className="result-modal-child-result">
                      <OracleText 
                        text={childRoll.result}
                        originalText={childRoll.originalResult}
                        onOracleClick={onOracleClick}
                        findOracleById={findOracleById}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

