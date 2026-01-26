import type { LogEntry, OracleTable } from '../../types/datasworn';
import { OracleText } from '../OracleText/OracleText';
import { useI18n } from '../../i18n/context';
import { getOracleIcon } from '../../utils/oracleIcons';
import { formatLogsAsMarkdown } from '../../utils/logUtils';
import { FaBook, FaTrash, FaFileExport } from 'react-icons/fa';

type RollLogProps = {
  logs: LogEntry[];
  onRollAgain: (oracleId: string) => void;
  findOracleById: (id: string) => OracleTable | null;
  onClearLog?: () => void;
  autoShowModal?: boolean;
  onToggleAutoShowModal?: () => void;
};

export function RollLog({ logs, onRollAgain, findOracleById, onClearLog, autoShowModal = false, onToggleAutoShowModal }: RollLogProps) {
  const { t } = useI18n();
  
  const handleOracleClick = (oracleId: string) => {
    const oracle = findOracleById(oracleId);
    if (oracle) {
      onRollAgain(oracleId);
    }
  };

  const handleExport = () => {
    const markdown = formatLogsAsMarkdown(logs);
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `oracle-rolls-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="roll-log-container">
      <div className="roll-log-title-bar">
        <h3 className="roll-log-title">
          <span className="icon"><FaBook /></span> {t('log.title')}
        </h3>
        <div className="roll-log-controls">
          {onToggleAutoShowModal && (
            <label className="roll-log-auto-modal-switch">
              <input
                type="checkbox"
                checked={autoShowModal}
                onChange={onToggleAutoShowModal}
              />
              <span className="switch-label">{t('log.autoModal') || 'Modal automático'}</span>
            </label>
          )}
          {logs.length > 0 && (
            <button 
              onClick={handleExport}
              className="export-log-btn"
              title={t('export.history')}
            >
              <FaFileExport />
            </button>
          )}
          {onClearLog && (
            <button 
              onClick={onClearLog}
              className="clear-log-btn"
              title={t('log.clear')}
            >
              <FaTrash />
            </button>
          )}
        </div>
      </div>
      
      {logs.length === 0 && (
        <div className="roll-log-empty">
          <p>{t('log.empty')}</p>
          <p className="hint">{t('log.empty.hint')}</p>
        </div>
      )}
      
      <div className="roll-log-entries">
        {logs.map(log => {
          const isShortcut = log.roll === 0 && !log.result && log.childRolls && log.childRolls.length > 0;
          
          return (
            <div key={log.id} className="roll-log-entry">
              {!isShortcut && (
                <>
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
                </>
              )}

              {/* Rolagens filhas (automáticas) */}
              {log.childRolls && log.childRolls.length > 0 && (
                <div className={`roll-log-children ${isShortcut ? 'roll-log-children-shortcut' : ''}`}>
                  {isShortcut && (
                    <div className="roll-log-shortcut-title">
                      {log.oracleName}
                    </div>
                  )}
                  {log.childRolls.map((childRoll) => (
                    <div key={childRoll.id} className="roll-log-child-simple">
                      <span className="roll-log-child-header">
                        <span className="roll-log-child-icon">
                          {childRoll.oracleId && getOracleIcon(childRoll.oracleId, childRoll.oracleName)}
                        </span>
                        <span className="roll-log-child-name-simple">{childRoll.oracleName}</span>
                        <span className="roll-log-child-roll-simple">
                          <span className="roll-value">{childRoll.roll}</span>
                        </span>
                      </span>
                      <span className="roll-log-child-result-simple">
                        <OracleText 
                          text={childRoll.result}
                          originalText={childRoll.originalResult}
                          onOracleClick={handleOracleClick}
                          findOracleById={findOracleById}
                        />
                      </span>
                      
                      {/* Renderizar childRolls aninhados com indentação */}
                      {childRoll.childRolls && childRoll.childRolls.length > 0 && (
                        <div className="roll-log-nested-children">
                          {childRoll.childRolls.map((nestedRoll) => (
                            <div key={nestedRoll.id} className="roll-log-child-nested">
                              <span className="roll-log-child-header">
                                <span className="roll-log-child-icon">
                                  {nestedRoll.oracleId && getOracleIcon(nestedRoll.oracleId, nestedRoll.oracleName)}
                                </span>
                                <span className="roll-log-child-name-simple">{nestedRoll.oracleName}</span>
                                <span className="roll-log-child-roll-simple">
                                  <span className="roll-value">{nestedRoll.roll}</span>
                                </span>
                              </span>
                              <span className="roll-log-child-result-simple">
                                <OracleText 
                                  text={nestedRoll.result}
                                  originalText={nestedRoll.originalResult}
                                  onOracleClick={handleOracleClick}
                                  findOracleById={findOracleById}
                                />
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
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
          );
        })}
      </div>
    </div>
  );
}

