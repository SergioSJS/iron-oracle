import { useEffect } from 'react';
import { OracleText } from '../OracleText/OracleText';
import type { LogEntry, OracleTable } from '../../types/datasworn';
import { useI18n } from '../../i18n/context';
import { getOracleIcon } from '../../utils/oracleIcons';
import { formatLogAsText } from '../../utils/logUtils';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { FaTimes, FaCopy, FaCheck } from 'react-icons/fa';

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
  const { copied, copyToClipboard } = useCopyToClipboard();
  
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);
  
  if (!isOpen) return null;

  const isShortcut = log.roll === 0 && !log.result && log.childRolls && log.childRolls.length > 0;

  const handleCopy = () => {
    const text = formatLogAsText(log);
    copyToClipboard(text);
  };

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
          <div className="result-modal-actions">
            <button 
              className={`result-modal-copy ${copied ? 'copied' : ''}`}
              onClick={handleCopy}
              title={t('copy.button')}
            >
              {copied ? <FaCheck /> : <FaCopy />}
              {copied ? t('copy.success') : t('copy.button')}
            </button>
            <button 
              className="result-modal-close"
              onClick={onClose}
            >
              <FaTimes />
            </button>
          </div>
        </div>
        <div className="result-modal-body">
          <div className="result-modal-entry">
            {!isShortcut && (
              <>
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
              </>
            )}

            {isShortcut && (
              <div className="result-modal-shortcut-title">
                {log.oracleName}
              </div>
            )}

            {log.childRolls && log.childRolls.length > 0 && (
              <div className={`result-modal-children ${isShortcut ? 'result-modal-children-shortcut' : ''}`}>
                {isShortcut ? (
                  // Para atalhos, mostrar inline compacto
                  log.childRolls.map((childRoll) => (
                    <div key={childRoll.id} className="result-modal-child-simple">
                      <span className="result-modal-child-header-simple">
                        <span className="result-modal-child-icon">
                          {childRoll.oracleId && (
                            <span className="dice-icon">{getOracleIcon(childRoll.oracleId, childRoll.oracleName)}</span>
                          )}
                        </span>
                        <span className="result-modal-child-name-simple">{childRoll.oracleName}</span>
                        <span className="result-modal-child-roll-simple">
                          <span className="roll-value">{childRoll.roll}</span>
                        </span>
                      </span>
                      <span className="result-modal-child-result-simple">
                        <OracleText 
                          text={childRoll.result}
                          originalText={childRoll.originalResult}
                          onOracleClick={onOracleClick}
                          findOracleById={findOracleById}
                        />
                      </span>
                      
                      {/* Renderizar childRolls aninhados */}
                      {childRoll.childRolls && childRoll.childRolls.length > 0 && (
                        <div className="result-modal-nested-children">
                          {childRoll.childRolls.map((nestedRoll) => (
                            <div key={nestedRoll.id} className="result-modal-child-nested">
                              <span className="result-modal-child-header-simple">
                                <span className="result-modal-child-icon">
                                  {nestedRoll.oracleId && (
                                    <span className="dice-icon">{getOracleIcon(nestedRoll.oracleId, nestedRoll.oracleName)}</span>
                                  )}
                                </span>
                                <span className="result-modal-child-name-simple">{nestedRoll.oracleName}</span>
                                <span className="result-modal-child-roll-simple">
                                  <span className="roll-value">{nestedRoll.roll}</span>
                                </span>
                              </span>
                              <span className="result-modal-child-result-simple">
                                <OracleText 
                                  text={nestedRoll.result}
                                  originalText={nestedRoll.originalResult}
                                  onOracleClick={onOracleClick}
                                  findOracleById={findOracleById}
                                />
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  // Para rolagens normais, mostrar como cards
                  log.childRolls.map((childRoll) => (
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
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

