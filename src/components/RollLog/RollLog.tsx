import type { LogEntry, OracleTable } from '../../types/datasworn';
import { OracleText } from '../OracleText/OracleText';
import { useI18n } from '../../i18n/context';
import { getOracleIcon } from '../../utils/oracleIcons';

type RollLogProps = {
  logs: LogEntry[];
  onRollAgain: (oracleId: string) => void;
  findOracleById: (id: string) => OracleTable | null;
  onClearLog?: () => void;
};

export function RollLog({ logs, onRollAgain, findOracleById, onClearLog }: RollLogProps) {
  const { t } = useI18n();
  
  const handleOracleClick = (oracleId: string) => {
    const oracle = findOracleById(oracleId);
    if (oracle) {
      onRollAgain(oracleId);
    }
  };

  return (
    <div className="roll-log-container">
      <div className="roll-log-title-bar">
        <h3 className="roll-log-title">
          <span className="icon">📜</span> {t('log.title')}
        </h3>
        {onClearLog && (
          <button 
            onClick={onClearLog}
            className="clear-log-btn"
            title={t('log.clear')}
          >
            🗑️
          </button>
        )}
      </div>
      
      {logs.length === 0 && (
        <div className="roll-log-empty">
          <p>{t('log.empty')}</p>
          <p className="hint">{t('log.empty.hint')}</p>
        </div>
      )}
      
      <div className="roll-log-entries">
        {logs.map(log => (
          <div key={log.id} className="roll-log-entry">
            <div className="roll-log-header">
              <span className="roll-log-name">
                {log.oracleId && (
                  <span className="dice-icon">{getOracleIcon(log.oracleId, log.oracleName)}</span>
                )}
                {log.oracleName}
              </span>
              <span className="roll-log-roll">
                <span className="roll-label">{t('log.rolled')}:</span>
                <span className="roll-value">{log.roll}</span>
              </span>
            </div>
            
            <div className="roll-log-result">
              <OracleText 
                text={log.result}
                originalText={log.originalResult}
                onOracleClick={handleOracleClick}
                findOracleById={findOracleById}
              />
            </div>

            {/* Rolagens filhas (automáticas) */}
            {log.childRolls && log.childRolls.length > 0 && (
              <div className="roll-log-children">
                {log.childRolls.map((childRoll) => (
                  <div key={childRoll.id} className="roll-log-child">
                    <div className="roll-log-child-header">
                      <span className="roll-log-child-name">
                        {childRoll.oracleId && (
                          <span className="dice-icon">{getOracleIcon(childRoll.oracleId, childRoll.oracleName)}</span>
                        )}
                        {childRoll.oracleName}
                      </span>
                      <span className="roll-log-child-roll">
                        <span className="roll-label">{t('log.rolled')}:</span>
                        <span className="roll-value">{childRoll.roll}</span>
                      </span>
                    </div>
                    <div className="roll-log-child-result">
                      <OracleText 
                        text={childRoll.result}
                        originalText={childRoll.originalResult}
                        onOracleClick={handleOracleClick}
                        findOracleById={findOracleById}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Botões para rolagens extras (quando não foram roladas automaticamente) */}
            {log.extraRolls && log.extraRolls.length > 0 && (
              <div className="roll-log-extras">
                {log.extraRolls.map((oracleId) => {
                  const oracle = findOracleById(oracleId);
                  const oracleName = oracle?.name || oracleId.split('/').pop() || 'Oracle';
                  return (
                    <button
                      key={oracleId}
                      onClick={() => handleOracleClick(oracleId)}
                      className="roll-log-extra-btn"
                    >
                      🎲 {oracleName}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

