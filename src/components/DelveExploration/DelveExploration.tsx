import { useState, useEffect } from 'react';
import { useDelveState } from '../../hooks/useDelveState';
import { useCustomDelveData } from '../../hooks/useCustomDelveData';
import { ExpeditionModal } from './ExpeditionModal';
import { ProgressTracker } from './ProgressTracker';
import { ActionPanel } from './ActionPanel';
import { DelveHistory } from './DelveHistory';
import { ResultModal } from '../Modals/ResultModal';
import type { OracleTable, LogEntry, ChildRoll } from '../../types/datasworn';
import { useI18n } from '../../i18n/context';
import { translateOracleName, translateOracleText, translateOracleResult } from '../../i18n/oracleTranslations';
import { getCustomName, getCustomText } from '../../utils/customDelveTranslations';
import { getOracleIcon } from '../../utils/oracleIcons';
import { FaEdit, FaPlus } from 'react-icons/fa';
import { generateLogId } from '../../utils/oracleUtils';
import { getProgressForRank } from '../../utils/delveUtils';

const HISTORY_STORAGE_KEY = 'delveHistory';

type DelveExplorationProps = {
  findOracleById: (id: string) => OracleTable | null;
};

export function DelveExploration({ findOracleById }: DelveExplorationProps) {
  const { state, startExpedition, addProgress, adjustProgress, resetExpedition, updateTheme, updateDomain, updateRank } = useDelveState();
  const { themes, domains } = useCustomDelveData();
  const [history, setHistory] = useState<any[]>(() => {
    // Carregar histórico do localStorage se existir
    try {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Erro ao carregar histórico do Delve:', e);
    }
    return [];
  });
  const [showExpeditionModal, setShowExpeditionModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [pendingChoice, setPendingChoice] = useState<any>(null);
  const [lastResultForModal, setLastResultForModal] = useState<any>(null);
  const [lastShownResultId, setLastShownResultId] = useState<number | null>(() => {
    // Carregar do localStorage se existir
    const saved = localStorage.getItem('delveLastShownResultId');
    return saved !== null ? Number(saved) : null;
  }); // Rastrear qual resultado já foi mostrado
  const [autoShowModal, setAutoShowModal] = useState(() => {
    const saved = localStorage.getItem('delveAutoShowModal');
    return saved !== null ? saved === 'true' : true;
  });
  const { t, language } = useI18n();

  // Salvar preferência de modal automático
  useEffect(() => {
    localStorage.setItem('delveAutoShowModal', String(autoShowModal));
  }, [autoShowModal]);

  // Salvar lastShownResultId no localStorage sempre que mudar
  useEffect(() => {
    if (lastShownResultId !== null) {
      localStorage.setItem('delveLastShownResultId', String(lastShownResultId));
    }
  }, [lastShownResultId]);

  // Não fechar modal quando houver escolha pendente - os botões ficarão dentro do modal

  // Mostrar modal quando há pendingChoice (sempre, independente de autoShowModal)
  // Porque escolhas pendentes precisam ser resolvidas
  useEffect(() => {
    if (pendingChoice && (pendingChoice.choiceType === 'strong_hit' || pendingChoice.choiceType === 'weak_hit_choice')) {
      const logEntry = convertDelveResultToLogEntry(pendingChoice);
      if (logEntry) {
        // Sempre atualizar lastResultForModal e abrir modal quando há escolha pendente
        setLastResultForModal(pendingChoice);
        setShowResultModal(true);
      }
    }
  }, [pendingChoice]);

  // Mostrar modal quando uma escolha for resolvida (pendingChoice foi limpo e há resultado atualizado)
  // Mas só se o modal não estiver já aberto (para evitar reabrir quando o usuário fechar)
  useEffect(() => {
    if (autoShowModal && !pendingChoice && !showResultModal && history.length > 0) {
      const lastResult = history[0];
      // Se o último resultado não requer escolha e não foi mostrado ainda (usar resultId para comparar)
      if (lastResult && !lastResult.requiresChoice && lastResult.resultId && 
          lastResult.resultId !== lastResultForModal?.resultId && 
          lastResult.resultId !== lastShownResultId) {
        const logEntry = convertDelveResultToLogEntry(lastResult);
        if (logEntry) {
          setLastResultForModal(lastResult);
          setShowResultModal(true);
        }
      }
    }
  }, [pendingChoice, history, autoShowModal, lastResultForModal, showResultModal, lastShownResultId]);

  // Salvar histórico no localStorage sempre que mudar
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.warn('Erro ao salvar histórico do Delve:', e);
    }
  }, [history]);

  const handleStart = (themeId: string, domainId: string, rank: any) => {
    startExpedition(themeId, domainId, rank);
    setHistory([]);
  };

  const handleUpdate = (themeId: string, domainId: string, rank: any) => {
    updateTheme(themeId);
    updateDomain(domainId);
    updateRank(rank);
  };

  // Função para converter resultado Delve para LogEntry
  const convertDelveResultToLogEntry = (result: any): LogEntry | null => {
    if (!result) return null;

    const childRolls: ChildRoll[] = [];
    let mainRoll = 0;
    let mainResult = '';
    let mainOracleName = t('delve.action.roll');
    let mainOracleId = 'delve/oracles/moves/delve_the_depths';

    // Tratar casos de rolagem manual (feature ou danger)
    if (result.choiceType === 'manual_feature' && result.feature) {
      mainOracleName = t('delve.action.rollFeature');
      mainRoll = result.featureRoll || 0;
      mainResult = result.feature.text || '';
      mainOracleId = result.feature.source === 'theme' 
        ? `delve/oracles/feature/aspect`
        : result.feature.source === 'domain'
        ? `delve/oracles/feature/focus`
        : 'delve/oracles/feature/aspect';
      // Não adicionar feature como child roll já que é o principal
    } else if (result.choiceType === 'manual_danger' && result.danger) {
      mainOracleName = t('delve.action.rollDanger');
      mainRoll = result.danger.roll || 0;
      mainResult = result.danger.text || '';
      mainOracleId = result.danger.source === 'theme'
        ? `delve/oracles/danger/theme`
        : result.danger.source === 'domain'
        ? `delve/oracles/danger/domain`
        : 'delve/oracles/moves/reveal_a_danger';
      // Não adicionar danger como child roll já que é o principal
    } else if (result.result && result.actionDie > 0) {
      // Se tem resultado da ação (strong hit, weak hit, miss)
      mainRoll = result.actionTotal || (result.actionDie + result.statValue);
      const resultLabel = result.result === 'strong_hit' 
        ? t('delve.result.strongHit')
        : result.result === 'weak_hit'
        ? t('delve.result.weakHit')
        : t('delve.result.miss');
      
      // Se tem resultado da tabela, mostrar junto com o resultado
      if (result.delveTableResult) {
        mainResult = `${resultLabel} - ${result.delveTableResult.text}`;
        mainRoll = result.delveTableRoll || mainRoll;
      } else {
        mainResult = resultLabel;
      }
    } else if (result.delveTableResult) {
      // Se não tem resultado da ação mas tem resultado da tabela, usar como principal
      mainRoll = result.delveTableRoll || 0;
      mainResult = result.delveTableResult.text || '';
      mainOracleId = `delve/oracles/moves/delve_the_depths/${result.selectedStat || 'edge'}`;
    }

    // Adicionar resultado da tabela Delve the Depths como child roll apenas se já não for o principal
    if (result.delveTableResult && result.result && result.actionDie > 0) {
      childRolls.push({
        id: generateLogId(),
        oracleName: t('delve.action.roll'),
        oracleId: `delve/oracles/moves/delve_the_depths/${result.selectedStat || 'edge'}`,
        roll: result.delveTableRoll || 0,
        result: result.delveTableResult.text || '',
        originalResult: result.delveTableResult.originalText
      });
    }

    // Adicionar feature como child roll (apenas se não for manual_feature)
    if (result.feature && result.choiceType !== 'manual_feature') {
      childRolls.push({
        id: generateLogId(),
        oracleName: t('delve.result.feature'),
        oracleId: result.feature.source === 'theme' 
          ? `delve/oracles/feature/aspect`
          : result.feature.source === 'domain'
          ? `delve/oracles/feature/focus`
          : undefined,
        roll: result.featureRoll || 0,
        result: result.feature.text || '',
        originalResult: result.feature.originalText
      });
    }

    // Adicionar danger como child roll (apenas se não for manual_danger)
    if (result.danger && result.choiceType !== 'manual_danger') {
      childRolls.push({
        id: generateLogId(),
        oracleName: t('delve.result.danger'),
        oracleId: result.danger.source === 'theme'
          ? `delve/oracles/danger/theme`
          : result.danger.source === 'domain'
          ? `delve/oracles/danger/domain`
          : undefined,
        roll: result.danger.roll || 0,
        result: result.danger.text || '',
        originalResult: result.danger.originalText
      });
    }

    // Adicionar opportunity como child roll
    if (result.opportunity) {
      childRolls.push({
        id: generateLogId(),
        oracleName: t('delve.result.opportunity'),
        oracleId: undefined,
        roll: 0,
        result: result.opportunity.text || '',
        originalResult: result.opportunity.originalText
      });
    }

    // Se não tem resultado principal mas tem child rolls, usar o primeiro como principal
    if (!mainResult && childRolls.length > 0) {
      const firstChild = childRolls[0];
      mainRoll = firstChild.roll;
      mainResult = firstChild.result;
      mainOracleName = firstChild.oracleName;
      mainOracleId = firstChild.oracleId || '';
      childRolls.shift(); // Remover o primeiro já que virou principal
    }

    if (!mainResult && childRolls.length === 0) {
      return null; // Não há nada para mostrar
    }

    return {
      id: generateLogId(),
      timestamp: Date.now(),
      oracleName: mainOracleName,
      oracleId: mainOracleId,
      roll: mainRoll,
      result: mainResult,
      originalResult: mainResult,
      childRolls: childRolls.length > 0 ? childRolls : undefined
    };
  };

  const handleDelveResult = (result: any) => {
    const isUpdate = result.resultId && result.requiresChoice === false;
    
    setHistory(prev => {
      // Se o resultado tem resultId e requiresChoice, atualizar o registro existente
      if (isUpdate) {
        // Procurar o registro existente com o mesmo resultId
        const existingIndex = prev.findIndex((item: any) => item.resultId === result.resultId);
        if (existingIndex !== -1) {
          // Atualizar o registro existente
          const updated = [...prev];
          updated[existingIndex] = { ...updated[existingIndex], ...result };
          return updated;
        }
      }
      // Caso contrário, adicionar novo registro
      return [result, ...prev];
    });
    if (result.progressAdded) {
      addProgress(result.progressAdded);
    }

    // Mostrar modal se autoShowModal estiver ativo
    // Se requer escolha, mostrar o modal com os botões de escolha dentro
    // Se não requer escolha, mostrar normalmente
    // Também mostrar para resultados manuais (feature/danger) mesmo se autoShowModal estiver desativado
    const isManualResult = result.choiceType === 'manual_feature' || result.choiceType === 'manual_danger';
    if ((autoShowModal || isManualResult) && result.resultId) {
      const logEntry = convertDelveResultToLogEntry(result);
      if (logEntry) {
        // Só atualizar se for um resultado novo ou atualizado
        if (!lastResultForModal || lastResultForModal.resultId !== result.resultId) {
          setLastResultForModal(result);
          // Se o resultado requer escolha, aguardar um pouco para o pendingChoice ser atualizado
          // Se não requer escolha, mostrar imediatamente
          if (result.requiresChoice) {
            // Aguardar um tick para garantir que o pendingChoice foi atualizado pelo ActionPanel
            setTimeout(() => {
              setShowResultModal(true);
            }, 10);
          } else {
            setShowResultModal(true);
          }
        }
      }
    } else if (!autoShowModal && result.requiresChoice) {
      // Se o modal automático está desativado mas há escolha pendente,
      // ainda precisamos mostrar o modal quando o usuário quiser ver
      // Mas não abrir automaticamente
      const logEntry = convertDelveResultToLogEntry(result);
      if (logEntry) {
        if (!lastResultForModal || lastResultForModal.resultId !== result.resultId) {
          setLastResultForModal(result);
          // Não abrir automaticamente se autoShowModal está desativado
        }
      }
    }
  };

  // Funções para lidar com escolhas quando há pendingChoice
  const handleMarkProgress = () => {
    // Usar lastResultForModal se pendingChoice não estiver disponível (pode ter sido limpo)
    const choice = pendingChoice || lastResultForModal;
    if (!choice || !choice.requiresChoice) return;
    const progressAmount = getProgressForRank(state.siteRank);
    let finalProgress = progressAmount;
    if (choice.choiceType === 'weak_hit_choice' && choice.delveTableResult?.text) {
      const tableText = choice.delveTableResult.text;
      if (tableText.includes('Mark progress twice') || tableText.includes('Marque progresso duas vezes')) {
        finalProgress = progressAmount * 2;
      }
    }
    const finalResult = {
      ...choice,
      progressAdded: finalProgress,
      choiceType: 'mark_progress',
      requiresChoice: false
    };
    // Limpar pendingChoice ANTES de processar o resultado
    setPendingChoice(null);
    // Fechar modal antes de processar resultado
    setShowResultModal(false);
    setLastResultForModal(null);
    handleDelveResult(finalResult);
  };

  const handleFindOpportunity = () => {
    // Usar lastResultForModal se pendingChoice não estiver disponível (pode ter sido limpo)
    const choice = pendingChoice || lastResultForModal;
    if (!choice || !choice.requiresChoice) return;
    const opportunityTable = findOracleById('delve/oracles/moves/find_an_opportunity');
    if (opportunityTable && opportunityTable.rows) {
      const roll = Math.floor(Math.random() * 100) + 1;
      const opportunityRow = opportunityTable.rows.find((r: any) => 
        roll >= r.min && roll <= (r.max || r.min)
      );
      if (opportunityRow) {
        const originalText = opportunityRow.text;
        const translatedText = translateOracleResult('delve/oracles/moves/find_an_opportunity', roll, opportunityRow.text, language, opportunityRow.min);
        let progressAdded = 0;
        if (choice.choiceType === 'weak_hit_choice' && choice.delveTableResult?.text) {
          const tableText = choice.delveTableResult.text;
          if (tableText.includes('Do both') || tableText.includes('Faça ambos')) {
            progressAdded = getProgressForRank(state.siteRank);
          }
        }
        const finalResult = {
          ...choice,
          progressAdded: progressAdded,
          choiceType: 'find_opportunity',
          opportunity: { ...opportunityRow, text: translatedText, originalText: originalText, roll: roll },
          requiresChoice: false
        };
        // Limpar pendingChoice ANTES de processar o resultado
        setPendingChoice(null);
        // Atualizar lastResultForModal com o resultado final (incluindo a oportunidade)
        // para que o modal mostre a oportunidade encontrada
        setLastResultForModal(finalResult);
        // NÃO fechar o modal - deixar aberto para mostrar a oportunidade
        handleDelveResult(finalResult);
      }
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  const theme = state.isActive && state.themeId ? (themes as any)[state.themeId] : null;
  const domain = state.isActive && state.domainId ? (domains as any)[state.domainId] : null;

  // Traduzir nomes de tema e domínio (com suporte a traduções inline)
  const themeName = theme ? getCustomName(
    theme as any,
    `delve/site_themes/${state.themeId}`,
    language,
    translateOracleName
  ) : state.themeId;
  const themeText = theme ? getCustomText(
    theme as any,
    `delve/site_themes/${state.themeId}`,
    language,
    translateOracleText
  ) : '';
  const domainName = domain ? getCustomName(
    domain as any,
    `delve/site_domains/${state.domainId}`,
    language,
    translateOracleName
  ) : state.domainId;
  const domainText = domain ? getCustomText(
    domain as any,
    `delve/site_domains/${state.domainId}`,
    language,
    translateOracleText
  ) : '';

  const themeIcon = state.themeId ? getOracleIcon(`delve/site_themes/${state.themeId}`, themeName) : null;
  const domainIcon = state.domainId ? getOracleIcon(`delve/site_domains/${state.domainId}`, domainName) : null;


  return (
    <>
      <ExpeditionModal
        isOpen={showExpeditionModal}
        onClose={() => setShowExpeditionModal(false)}
        onStart={handleStart}
        onUpdate={state.isActive ? handleUpdate : undefined}
        currentThemeId={state.themeId}
        currentDomainId={state.domainId}
        currentRank={state.siteRank}
        isEditing={state.isActive}
      />
      
      <div className="delve-exploration">
        {!state.isActive ? (
          <div className="delve-empty-state">
            <p>{t('delve.empty.message')}</p>
            <button
              className="delve-start-expedition-button"
              onClick={() => setShowExpeditionModal(true)}
            >
              <FaPlus /> {t('delve.setup.start')}
            </button>
          </div>
        ) : (
          <div className="delve-active-expedition">
            <div className="delve-theme-domain-box">
              <div className="delve-theme-domain-header">
                <span className="delve-theme-domain-title">{t('delve.themeDomain.title')}</span>
                <button
                  className="delve-theme-domain-edit"
                  onClick={() => setShowExpeditionModal(true)}
                  title={t('delve.editExpedition')}
                >
                  <FaEdit />
                </button>
              </div>
              <div className="delve-theme-domain-content">
                <div className="delve-theme-domain-item">
                  {themeIcon && <span className="delve-theme-domain-icon" title={themeText}>{themeIcon}</span>}
                  <span className="delve-theme-domain-name">{themeName}</span>
                </div>
                <span className="delve-theme-domain-separator">+</span>
                <div className="delve-theme-domain-item">
                  {domainIcon && <span className="delve-theme-domain-icon" title={domainText}>{domainIcon}</span>}
                  <span className="delve-theme-domain-name">{domainName}</span>
                </div>
              </div>
            </div>

            <ProgressTracker
              progress={state.progress}
              rank={state.siteRank}
              onAdjustProgress={adjustProgress}
            />

            <ActionPanel
              theme={theme}
              domain={domain}
              rank={state.siteRank}
              onResult={handleDelveResult}
              findOracleById={findOracleById}
              state={state}
              onPendingChoiceChange={setPendingChoice}
              showResultModal={showResultModal && !!lastResultForModal && autoShowModal}
            />
          </div>
        )}
      </div>

      {state.isActive && (
        <section className="log-section">
          <DelveHistory
            history={history}
            onClear={handleClearHistory}
            autoShowModal={autoShowModal}
            onToggleAutoShowModal={() => setAutoShowModal(!autoShowModal)}
          />
        </section>
      )}

      <ResultModal
        log={convertDelveResultToLogEntry(lastResultForModal) || {
          id: 0,
          timestamp: Date.now(),
          oracleName: '',
          roll: 0,
          result: ''
        }}
        isOpen={showResultModal && !!lastResultForModal && (autoShowModal || !!pendingChoice)}
        onClose={() => {
          setShowResultModal(false);
          // Marcar este resultado como já mostrado para não reabrir automaticamente
          if (lastResultForModal?.resultId) {
            setLastShownResultId(lastResultForModal.resultId);
          }
          setLastResultForModal(null);
          // Se não há mais pendingChoice, não precisamos fazer nada
          // Se ainda há pendingChoice, ele será limpo quando a escolha for feita no modal
        }}
        onOracleClick={(oracleId: string) => {
          const oracle = findOracleById(oracleId);
          // Não fazemos nada por enquanto, mas podemos adicionar funcionalidade depois
        }}
        findOracleById={findOracleById}
        pendingChoice={pendingChoice}
        onMarkProgress={handleMarkProgress}
        onFindOpportunity={handleFindOpportunity}
        delveResult={lastResultForModal}
      />
    </>
  );
}
