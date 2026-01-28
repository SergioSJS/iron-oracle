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
  pendingChoice?: any;
  onMarkProgress?: () => void;
  onFindOpportunity?: () => void;
  delveResult?: any; // Resultado original do Delve para exibição customizada
}; 

export function ResultModal({
  log,
  isOpen,
  onClose,
  onOracleClick,
  findOracleById,
  pendingChoice,
  onMarkProgress,
  onFindOpportunity,
  delveResult
}: ResultModalProps) {
  const { t } = useI18n();
  const { copied, copyToClipboard } = useCopyToClipboard();
  
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose, isOpen]);
  
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
            {delveResult ? (
              // Visualização customizada para resultados Delve (igual ao histórico)
              <>
                {/* Header com resultado da ação */}
                {delveResult.choiceType !== 'manual_feature' && delveResult.result && delveResult.actionDie > 0 && (
                  <div className="result-modal-delve-header">
                    <span className="result-modal-delve-name">
                      {delveResult.result === 'strong_hit' 
                        ? t('delve.result.strongHit')
                        : delveResult.result === 'weak_hit'
                        ? t('delve.result.weakHit')
                        : t('delve.result.miss')}
                    </span>
                    <span className="result-modal-delve-roll">
                      <span className="roll-label">{t('log.rolled')}:</span>
                      <span className="roll-value" title="D6">{delveResult.actionDie}</span>
                      <span style={{ margin: '0 2px', opacity: 0.6 }}>+</span>
                      <span className="roll-value">{delveResult.statValue}</span>
                      <span style={{ margin: '0 2px', opacity: 0.6 }}>VS</span>
                      {(() => {
                        const total = delveResult.actionDie + delveResult.statValue;
                        const die0Success = total > delveResult.challengeDice[0];
                        const die1Success = total > delveResult.challengeDice[1];
                        return (
                          <>
                            <span 
                              className={`roll-value roll-value-challenge ${die0Success ? 'roll-value-success' : 'roll-value-fail'}`}
                              title="D10"
                            >
                              {delveResult.challengeDice[0]}
                            </span>
                            <span 
                              className={`roll-value roll-value-challenge ${die1Success ? 'roll-value-success' : 'roll-value-fail'}`}
                              title="D10"
                            >
                              {delveResult.challengeDice[1]}
                            </span>
                          </>
                        );
                      })()}
                    </span>
                  </div>
                )}

                {/* Resultado da tabela Delve the Depths */}
                {delveResult.delveTableRoll && delveResult.delveTableResult && (
                  <div className="result-modal-delve-table-result">
                    <strong>{t('delve.action.roll')} ({delveResult.delveTableRoll}): </strong>
                    <OracleText 
                      text={delveResult.delveTableResult.text}
                      originalText={delveResult.delveTableResult.originalText}
                      onOracleClick={onOracleClick}
                      findOracleById={findOracleById}
                    />
                  </div>
                )}

                {/* Feature */}
                {delveResult.feature && delveResult.choiceType !== 'manual_feature' && (
                  <div className="result-modal-delve-children">
                    <div className="result-modal-delve-child-simple">
                      <span className="result-modal-delve-child-header">
                        <span className="result-modal-delve-child-name">
                          {t('delve.result.feature')}
                        </span>
                        {delveResult.featureRoll && (
                          <span className="result-modal-delve-child-roll">
                            <span className="roll-value">{delveResult.featureRoll}</span>
                          </span>
                        )}
                      </span>
                      <span className="result-modal-delve-child-result">
                        <OracleText 
                          text={delveResult.feature.text}
                          originalText={delveResult.feature.originalText}
                          onOracleClick={onOracleClick}
                          findOracleById={findOracleById}
                        />
                        {delveResult.featureRoll && (
                          <span style={{ fontSize: '11px', opacity: 0.7, marginLeft: '8px' }}>
                            ({delveResult.feature.source === 'theme' ? t('delve.source.theme') : delveResult.feature.source === 'domain' ? t('delve.source.domain') : t('delve.source.generic')})
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                )}

                {/* Manual Feature Roll */}
                {delveResult.choiceType === 'manual_feature' && delveResult.feature && (
                  <div className="result-modal-delve-children">
                    <div className="result-modal-delve-child-simple">
                      <span className="result-modal-delve-child-header">
                        <span className="result-modal-delve-child-name">
                          {t('delve.result.feature')}
                        </span>
                        {delveResult.featureRoll && (
                          <span className="result-modal-delve-child-roll">
                            <span className="roll-value">{delveResult.featureRoll}</span>
                          </span>
                        )}
                      </span>
                      <span className="result-modal-delve-child-result">
                        <OracleText 
                          text={delveResult.feature.text}
                          originalText={delveResult.feature.originalText}
                          onOracleClick={onOracleClick}
                          findOracleById={findOracleById}
                        />
                        {delveResult.featureRoll && (
                          <span style={{ fontSize: '11px', opacity: 0.7, marginLeft: '8px' }}>
                            ({delveResult.feature.source === 'theme' ? t('delve.source.theme') : delveResult.feature.source === 'domain' ? t('delve.source.domain') : t('delve.source.generic')})
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                )}

                {/* Danger */}
                {delveResult.danger && (
                  <div className="result-modal-delve-children">
                    <div className="result-modal-delve-child-simple">
                      <span className="result-modal-delve-child-header">
                        <span className="result-modal-delve-child-name">
                          {t('delve.result.danger')}
                        </span>
                        {delveResult.danger.roll && (
                          <span className="result-modal-delve-child-roll">
                            <span className="roll-value">{delveResult.danger.roll}</span>
                          </span>
                        )}
                      </span>
                      <span className="result-modal-delve-child-result">
                        <OracleText 
                          text={delveResult.danger.text}
                          originalText={delveResult.danger.originalText}
                          onOracleClick={onOracleClick}
                          findOracleById={findOracleById}
                        />
                        {delveResult.danger.roll && (
                          <span style={{ fontSize: '11px', opacity: 0.7, marginLeft: '8px' }}>
                            ({delveResult.danger.source === 'theme' ? t('delve.source.theme') : delveResult.danger.source === 'domain' ? t('delve.source.domain') : t('delve.source.generic')})
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                )}

                {/* Opportunity */}
                {delveResult.opportunity && (
                  <div className="result-modal-delve-children">
                    <div className="result-modal-delve-child-simple">
                      <span className="result-modal-delve-child-header">
                        <span className="result-modal-delve-child-name">
                          {t('delve.result.opportunity')}
                        </span>
                        {delveResult.opportunity.roll && (
                          <span className="result-modal-delve-child-roll">
                            <span className="roll-value">{delveResult.opportunity.roll}</span>
                          </span>
                        )}
                      </span>
                      <span className="result-modal-delve-child-result">
                        <OracleText 
                          text={delveResult.opportunity.text}
                          originalText={delveResult.opportunity.originalText}
                          onOracleClick={onOracleClick}
                          findOracleById={findOracleById}
                        />
                      </span>
                    </div>
                  </div>
                )}
              </>
            ) : !isShortcut ? (
              // Visualização padrão para outros tipos de log
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
            ) : null}

            {isShortcut && !delveResult && (
              <div className="result-modal-shortcut-title">
                {log.oracleName}
              </div>
            )}

            {/* Só mostrar childRolls se NÃO for resultado Delve (para evitar duplicação) */}
            {!delveResult && log.childRolls && log.childRolls.length > 0 && (
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
          
          {pendingChoice && (pendingChoice.choiceType === 'strong_hit' || pendingChoice.choiceType === 'weak_hit_choice') && (
            <div className="result-modal-choice-panel">
              <p className="result-modal-choice-text">
                {t('delve.action.chooseOption')}
              </p>
              <div className="result-modal-choice-buttons">
                <button
                  className="result-modal-choice-button"
                  onClick={() => {
                    if (onMarkProgress) {
                      onMarkProgress();
                      onClose();
                    }
                  }}
                  disabled={!onMarkProgress}
                >
                  {t('delve.action.markProgress')}
                </button>
                <button
                  className="result-modal-choice-button"
                  onClick={() => {
                    if (onFindOpportunity) {
                      onFindOpportunity();
                      // NÃO fechar o modal - ele será atualizado com a oportunidade
                    }
                  }}
                  disabled={!onFindOpportunity}
                >
                  {t('delve.action.findOpportunity')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

