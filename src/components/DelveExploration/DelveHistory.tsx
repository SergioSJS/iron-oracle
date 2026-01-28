import { useI18n } from '../../i18n/context';
import { OracleText } from '../OracleText/OracleText';
import { FaBook, FaTrash, FaFileExport } from 'react-icons/fa';

type DelveHistoryProps = {
  history: any[];
  onClear?: () => void;
  autoShowModal?: boolean;
  onToggleAutoShowModal?: () => void;
};

export function DelveHistory({ history, onClear, autoShowModal = false, onToggleAutoShowModal }: DelveHistoryProps) {
  const { t } = useI18n();

  const getResultLabel = (result: string | null | undefined): string => {
    if (!result) return '';
    if (result === 'strong_hit') return t('delve.result.strongHit');
    if (result === 'weak_hit') return t('delve.result.weakHit');
    return t('delve.result.miss');
  };

  const handleExport = () => {
    // Converter histórico do Delve para formato de log padrão para exportação
    const markdown = history.map((result, index) => {
      const lines: string[] = [];
      lines.push(`## Roll #${history.length - index}`);
      
      if (result.result && result.actionDie > 0) {
        lines.push(`**${getResultLabel(result.result)}**`);
        lines.push(`Roll: ${result.actionDie} + ${result.statValue} = ${result.actionTotal} vs ${result.challengeDice[0]} and ${result.challengeDice[1]}`);
      }
      
      if (result.delveTableResult) {
        lines.push(`**${t('delve.action.roll')} (${result.delveTableRoll})**: ${result.delveTableResult.text}`);
      }
      
      if (result.feature) {
        lines.push(`**Feature**: ${result.feature.text}`);
        if (result.featureRoll) {
          lines.push(`  - Roll: ${result.featureRoll} (${result.feature.source})`);
        }
      }
      
      if (result.danger) {
        lines.push(`**Danger**: ${result.danger.text}`);
        if (result.danger.roll) {
          lines.push(`  - Roll: ${result.danger.roll} (${result.danger.source})`);
        }
      }
      
      if (result.opportunity) {
        lines.push(`**Opportunity**: ${result.opportunity.text}`);
      }
      
      if (result.progressAdded > 0) {
        lines.push(`**Progress Added**: +${result.progressAdded}`);
      }
      
      return lines.join('\n');
    }).join('\n\n');
    
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `delve-history-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="roll-log-container">
      <div className="roll-log-title-bar">
        <h3 className="roll-log-title">
          <span className="icon"><FaBook /></span> {t('delve.history.title')}
        </h3>
        <div className="roll-log-controls">
          {onToggleAutoShowModal && (
            <label className="roll-log-auto-modal-switch">
              <input
                type="checkbox"
                checked={autoShowModal}
                onChange={onToggleAutoShowModal}
              />
              <span className="switch-label">{t('log.autoModal')}</span>
            </label>
          )}
          {history.length > 0 && (
            <button 
              onClick={handleExport}
              className="export-log-btn"
              title={t('export.history')}
            >
              <FaFileExport />
            </button>
          )}
          {onClear && history.length > 0 && (
            <button 
              onClick={onClear}
              className="clear-log-btn"
              title={t('log.clear')}
            >
              <FaTrash />
            </button>
          )}
        </div>
      </div>
      
      {history.length === 0 ? (
        <div className="roll-log-empty">
          <p>{t('delve.history.empty')}</p>
        </div>
      ) : (
        <div className="roll-log-entries">
          {history.map((result, index) => {
            // Determinar classe de resultado para colorir a borda
            let resultClass = '';
            if (result.result && result.actionDie > 0) {
              if (result.result === 'strong_hit') {
                resultClass = 'roll-log-entry-strong-hit';
              } else if (result.result === 'weak_hit') {
                resultClass = 'roll-log-entry-weak-hit';
              } else if (result.result === 'miss') {
                resultClass = 'roll-log-entry-miss';
              }
            }
            
            return (
            <div key={index} className={`roll-log-entry ${resultClass}`}>
              {/* Header com resultado da ação */}
              {result.choiceType !== 'manual_feature' && result.result && result.actionDie > 0 && (
                <div className="roll-log-header">
                  <span className="roll-log-name">
                    {getResultLabel(result.result)}
                  </span>
                  <span className="roll-log-roll">
                    <span className="roll-label">{t('log.rolled')}:</span>
                    <span className="roll-value" title="D6">{result.actionDie}</span>
                    <span style={{ margin: '0 2px', opacity: 0.6 }}>+</span>
                    <span className="roll-value">{result.statValue}</span>
                    <span style={{ margin: '0 2px', opacity: 0.6 }}>VS</span>
                    {(() => {
                      const total = result.actionDie + result.statValue;
                      const die0Success = total > result.challengeDice[0];
                      const die1Success = total > result.challengeDice[1];
                      return (
                        <>
                          <span 
                            className={`roll-value roll-value-challenge ${die0Success ? 'roll-value-success' : 'roll-value-fail'}`}
                            title="D10"
                          >
                            {result.challengeDice[0]}
                          </span>
                          <span 
                            className={`roll-value roll-value-challenge ${die1Success ? 'roll-value-success' : 'roll-value-fail'}`}
                            title="D10"
                          >
                            {result.challengeDice[1]}
                          </span>
                        </>
                      );
                    })()}
                  </span>
                </div>
              )}

              {/* Resultado da tabela Delve the Depths */}
              {result.delveTableRoll && result.delveTableResult && (
                <div className="roll-log-result">
                  <strong>{t('delve.action.roll')} ({result.delveTableRoll}): </strong>
                  <OracleText 
                    text={result.delveTableResult.text}
                    originalText={result.delveTableResult.originalText}
                  />
                </div>
              )}

              {/* Feature - só mostrar se não for rolagem manual (para evitar duplicação) */}
              {result.feature && result.choiceType !== 'manual_feature' && (
                <div className="roll-log-children">
                  <div className="roll-log-child-simple">
                    <span className="roll-log-child-header">
                      <span className="roll-log-child-name-simple">
                        {t('delve.result.feature')}
                      </span>
                      {result.featureRoll && (
                        <span className="roll-log-child-roll-simple">
                          <span className="roll-value">{result.featureRoll}</span>
                        </span>
                      )}
                    </span>
                    <span className="roll-log-child-result-simple">
                      <OracleText 
                        text={result.feature.text}
                        originalText={result.feature.originalText}
                      />
                      {result.featureRoll && (
                        <span style={{ fontSize: '11px', opacity: 0.7, marginLeft: '8px' }}>
                          ({result.feature.source === 'theme' ? t('delve.source.theme') : result.feature.source === 'domain' ? t('delve.source.domain') : t('delve.source.generic')})
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              )}

              {/* Manual Feature Roll - mostrar apenas quando for rolagem manual */}
              {result.choiceType === 'manual_feature' && result.feature && (
                <div className="roll-log-children">
                  <div className="roll-log-child-simple">
                    <span className="roll-log-child-header">
                      <span className="roll-log-child-name-simple">
                        {t('delve.result.feature')}
                      </span>
                      {result.featureRoll && (
                        <span className="roll-log-child-roll-simple">
                          <span className="roll-value">{result.featureRoll}</span>
                        </span>
                      )}
                    </span>
                    <span className="roll-log-child-result-simple">
                      <OracleText 
                        text={result.feature.text}
                        originalText={result.feature.originalText}
                      />
                      {result.featureRoll && (
                        <span style={{ fontSize: '11px', opacity: 0.7, marginLeft: '8px' }}>
                          ({result.feature.source === 'theme' ? t('delve.source.theme') : result.feature.source === 'domain' ? t('delve.source.domain') : t('delve.source.generic')})
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              )}

              {/* Danger */}
              {result.danger && (
                <div className="roll-log-children">
                  <div className="roll-log-child-simple">
                    <span className="roll-log-child-header">
                      <span className="roll-log-child-name-simple">
                        {t('delve.result.danger')}
                      </span>
                      {result.danger.roll && (
                        <span className="roll-log-child-roll-simple">
                          <span className="roll-value">{result.danger.roll}</span>
                        </span>
                      )}
                    </span>
                    <span className="roll-log-child-result-simple">
                      <OracleText 
                        text={result.danger.text}
                        originalText={result.danger.originalText}
                      />
                      {result.danger.roll && (result.danger.source === 'theme' || result.danger.source === 'domain') && (
                        <span style={{ fontSize: '11px', opacity: 0.7, marginLeft: '8px' }}>
                          ({result.danger.source === 'theme' ? t('delve.source.theme') : t('delve.source.domain')})
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              )}

              {/* Opportunity */}
              {result.opportunity && (
                <div className="roll-log-children">
                  <div className="roll-log-child-simple">
                    <span className="roll-log-child-header">
                      <span className="roll-log-child-name-simple">
                        {t('delve.result.opportunity')}
                      </span>
                      {result.opportunity.roll && (
                        <span className="roll-log-child-roll-simple">
                          <span className="roll-value">{result.opportunity.roll}</span>
                        </span>
                      )}
                    </span>
                    <span className="roll-log-child-result-simple">
                      <OracleText 
                        text={result.opportunity.text}
                        originalText={result.opportunity.originalText}
                      />
                    </span>
                  </div>
                </div>
              )}

              {/* Progress Added */}
              {result.progressAdded > 0 && (
                <div style={{ marginTop: '8px', fontSize: '13px', opacity: 0.8 }}>
                  <strong>+{result.progressAdded}</strong> {t('delve.result.progressAdded')}
                </div>
              )}
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
