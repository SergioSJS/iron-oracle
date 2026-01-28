import { useState, useEffect } from 'react';
import type { DelveStat, SiteRank } from '../../types/delve';
import {
  rollDelveAction,
  getProgressForRank,
  getCombinedFeature,
  getCombinedDanger
} from '../../utils/delveUtils';
// delveData não é usado diretamente aqui, mas mantido para referência futura
import type { OracleTable } from '../../types/datasworn';
import { useI18n } from '../../i18n/context';
import { translateOracleResult } from '../../i18n/oracleTranslations';
import { findRollResult, cleanOracleLinks } from '../../utils/oracleUtils';
import { delveDangerTranslations } from '../../i18n/oracleTranslations/delveFeatures';
import { getCustomFeatureDangerText } from '../../utils/customDelveTranslations';
import { FaPlus, FaMinus, FaDice, FaEye, FaSkull } from 'react-icons/fa';

type ActionPanelProps = {
  theme: any;
  domain: any;
  rank: SiteRank;
  onResult: (result: any) => void;
  findOracleById: (id: string) => OracleTable | null;
  state?: { isActive: boolean };
  onPendingChoiceChange?: (choice: any) => void;
  showResultModal?: boolean; // Para esconder botões quando modal está aberto
};

export function ActionPanel({ theme, domain, rank, onResult, findOracleById, state, onPendingChoiceChange, showResultModal }: ActionPanelProps) {
  const { t, language } = useI18n();
  const [selectedStat, setSelectedStat] = useState<DelveStat>('edge');
  const [statValue, setStatValue] = useState(2);

  const [pendingChoice, setPendingChoice] = useState<any>(null);

  // Notificar mudanças no pendingChoice
  useEffect(() => {
    if (onPendingChoiceChange) {
      onPendingChoiceChange(pendingChoice);
    }
  }, [pendingChoice, onPendingChoiceChange]);

  // Função auxiliar para rolar Aspect + Focus
  const rollAspectAndFocus = () => {
    const aspectTable = findOracleById('delve/oracles/feature/aspect');
    const focusTable = findOracleById('delve/oracles/feature/focus');
    if (aspectTable && focusTable) {
      const aspectRoll = Math.floor(Math.random() * 100) + 1;
      const focusRoll = Math.floor(Math.random() * 100) + 1;
      const aspect = aspectTable.rows?.find((r: any) => 
        aspectRoll >= r.min && aspectRoll <= (r.max || r.min)
      );
      const focus = focusTable.rows?.find((r: any) => 
        focusRoll >= r.min && focusRoll <= (r.max || r.min)
      );
      if (aspect && focus) {
        const aspectText = translateOracleResult('delve/oracles/feature/aspect', aspectRoll, aspect.text, language, aspect.min);
        const focusText = translateOracleResult('delve/oracles/feature/focus', focusRoll, focus.text, language, focus.min);
        return { aspect: { ...aspect, text: aspectText }, focus: { ...focus, text: focusText } };
      }
    }
    return null;
  };

  const handleDelveTheDepths = () => {
    const actionRoll = rollDelveAction(statValue);
    const resultId = Date.now(); // ID único para identificar este resultado
    const result: any = {
      ...actionRoll,
      progressAdded: 0,
      resultId: resultId // ID para identificar quando precisar atualizar
    };

    if (actionRoll.result === 'strong_hit') {
      // Strong Hit: Escolher entre Mark Progress ou Find an Opportunity
      // Primeiro, enviar a rolagem para o histórico
      result.requiresChoice = true;
      result.choiceType = 'strong_hit';
      onResult(result); // Enviar primeiro para aparecer no chat
      setPendingChoice({ ...result, resultId }); // Incluir ID no pendingChoice
    } else if (actionRoll.result === 'weak_hit') {
      // Weak Hit: Rola na tabela de Delve the Depths para o atributo selecionado
      const delveTableId = `delve/oracles/moves/delve_the_depths/${selectedStat}`;
      const delveTable = findOracleById(delveTableId);
      let delveTableRoll = 0;
      let delveTableResult: any = null;
      
      if (delveTable && delveTable.rows) {
        const maxRoll = Math.max(...delveTable.rows.map((r: any) => r.max || r.min));
        delveTableRoll = Math.floor(Math.random() * maxRoll) + 1;
        delveTableResult = findRollResult(delveTableRoll, delveTable.rows);
        if (delveTableResult) {
          const originalText = delveTableResult.text;
          const translatedText = translateOracleResult(delveTableId, delveTableRoll, originalText, language, delveTableResult.min);
          // Limpar links markdown para exibição mais limpa
          const cleanedText = cleanOracleLinks(translatedText, true);
          
          // PRIMEIRO: Verificar se precisa de escolha ANTES de processar outras ações
          // Verificar tanto no texto original quanto no traduzido/limpo
          const originalLower = originalText.toLowerCase();
          const cleanedLower = cleanedText.toLowerCase();
          let needsChoice = false;
          
          if (originalLower.includes('choose one') || originalLower.includes('escolha um') ||
              cleanedLower.includes('choose one') || cleanedLower.includes('escolha um')) {
            needsChoice = true;
          }
          
          // Se precisa de escolha, configurar e retornar ANTES de marcar progresso
          if (needsChoice) {
            const resultId = Date.now();
            result.resultId = resultId;
            result.requiresChoice = true;
            result.choiceType = 'weak_hit_choice';
            result.progressAdded = 0; // Não marcar progresso automaticamente quando há escolha
            result.delveTableRoll = delveTableRoll;
            result.delveTableResult = { 
              ...delveTableResult, 
              text: cleanedText,
              originalText: originalText
            };
            onResult(result); // Enviar primeiro para aparecer no chat
            setPendingChoice({ ...result, resultId });
            return;
          }
          
          delveTableResult = { 
            ...delveTableResult, 
            text: cleanedText,
            originalText: originalText // Manter original para tooltip
          };
        }
      }
      
      result.delveTableRoll = delveTableRoll;
      result.delveTableResult = delveTableResult;
      
      // Processar o resultado da tabela e executar as ações adicionais
      if (delveTableResult && delveTableResult.text) {
        const tableText = delveTableResult.text;
        const lowerTableText = tableText.toLowerCase();
        let additionalProgress = 0;
        let needsDanger = false;
        let needsOpportunity = false;
        
        // Weak Hit: Sempre marca progresso automaticamente (se não houver escolha)
        const baseProgressAmount = getProgressForRank(rank);
        result.progressAdded = baseProgressAmount;
        
        // Verificar se precisa marcar progresso ADICIONAL (duas vezes = uma vez extra)
        if (tableText.includes('Mark progress twice') || tableText.includes('Marque progresso duas vezes')) {
          additionalProgress = getProgressForRank(rank); // Uma vez extra (já tem uma vez base)
          result.progressAdded = baseProgressAmount + additionalProgress;
        }
        
        // Verificar se precisa revelar um perigo (case-insensitive)
        if (lowerTableText.includes('reveal a danger') || lowerTableText.includes('revele um perigo')) {
          needsDanger = true;
        }
        
        // Verificar se precisa encontrar uma oportunidade (sem escolha)
        if (lowerTableText.includes('find an opportunity') || lowerTableText.includes('encontre uma oportunidade')) {
          if (tableText.includes('Do both') || tableText.includes('Faça ambos')) {
            needsOpportunity = true;
          }
        }
        
        // Executar ações automaticamente
        if (needsDanger) {
          // Rolar Danger
          const dangerRoll = Math.floor(Math.random() * 100) + 1;
          const genericDangerTable = findOracleById('delve/oracles/moves/reveal_a_danger');
          const genericDangers = genericDangerTable?.rows || [];
          
          let finalDanger: any = null;
          
          // Se o valor rolado está entre 1-30, usar esse MESMO valor na tabela de perigos do tema
          if (dangerRoll >= 1 && dangerRoll <= 30) {
            const themeDanger = findRollResult(dangerRoll, theme?.dangers || []);
            if (themeDanger) {
              const originalText = themeDanger.text;
              // Prioridade: text_pt no objeto > delveDangerTranslations > texto original
              const translatedText = getCustomFeatureDangerText(
                themeDanger as any,
                language,
                (text) => language === 'pt' && delveDangerTranslations[text] ? delveDangerTranslations[text] : text
              );
              finalDanger = {
                text: translatedText,
                originalText: originalText,
                source: 'theme',
                roll: dangerRoll,
                suggestions: (themeDanger as any).suggestions
              };
            }
          } 
          // Se o valor rolado está entre 31-45, usar esse MESMO valor na tabela de perigos do domínio
          else if (dangerRoll >= 31 && dangerRoll <= 45) {
            const domainDanger = findRollResult(dangerRoll, domain?.dangers || []);
            if (domainDanger) {
              const originalText = domainDanger.text;
              // Prioridade: text_pt no objeto > delveDangerTranslations > texto original
              const translatedText = getCustomFeatureDangerText(
                domainDanger as any,
                language,
                (text) => language === 'pt' && delveDangerTranslations[text] ? delveDangerTranslations[text] : text
              );
              finalDanger = {
                text: translatedText,
                originalText: originalText,
                source: 'domain',
                roll: dangerRoll,
                suggestions: (domainDanger as any).suggestions
              };
            }
          }
          
          // Se não encontrou em theme/domain (46-100 ou não encontrou), usar a lógica combinada normal
          if (!finalDanger) {
            const danger = getCombinedDanger(
              dangerRoll,
              theme?.dangers || [],
              domain?.dangers || [],
              genericDangers,
              language
            );
            result.danger = danger;
            
            // Se for "Check the Aspect", rolar Aspect + Focus automaticamente
            if (danger.source === 'aspect') {
              const aspectFocus = rollAspectAndFocus();
              if (aspectFocus) {
                danger.text = `${t('delve.result.checkAspect')}: ${aspectFocus.aspect.text} ${aspectFocus.focus.text}`;
                result.aspect = aspectFocus.aspect;
                result.focus = aspectFocus.focus;
              }
            } else if (danger.source === 'generic' && danger.text) {
              // Traduzir perigo genérico
              const dangerRow = findRollResult(dangerRoll, genericDangerTable?.rows || []);
              if (dangerRow) {
                const originalText = danger.text;
                danger.text = translateOracleResult('delve/oracles/moves/reveal_a_danger', dangerRoll, danger.text, language, dangerRow.min);
                danger.originalText = originalText;
              }
            }
          } else {
            result.danger = finalDanger;
          }
        }
        
        if (needsOpportunity) {
          // Rolar Opportunity
          const opportunityTable = findOracleById('delve/oracles/moves/find_an_opportunity');
          if (opportunityTable && opportunityTable.rows) {
            const maxRoll = Math.max(...opportunityTable.rows.map((r: any) => r.max || r.min));
            const opportunityRoll = Math.floor(Math.random() * maxRoll) + 1;
            const opportunityRow = findRollResult(opportunityRoll, opportunityTable.rows);
            if (opportunityRow) {
              const originalText = opportunityRow.text;
              const translatedText = translateOracleResult('delve/oracles/moves/find_an_opportunity', opportunityRoll, originalText, language, opportunityRow.min);
              result.opportunity = {
                text: translatedText,
                originalText: originalText,
                roll: opportunityRoll
              };
            }
          }
        }
      } else {
        // Fallback: se não conseguiu processar a tabela, marca progresso padrão
        const progressAmount = getProgressForRank(rank);
        result.progressAdded = progressAmount;
      }
      
      // Sempre rola Feature em Weak Hit (a menos que o resultado da tabela diga o contrário)
      if (!result.danger || !result.danger.text.includes('Check the Aspect')) {
        // Rolar Feature (1-20 Theme, 21-100 Domain)
        const featureRoll = Math.floor(Math.random() * 100) + 1;
        const aspectTable = findOracleById('delve/oracles/feature/aspect');
        const focusTable = findOracleById('delve/oracles/feature/focus');
        const genericFeatures = aspectTable?.rows || [];

        const feature = getCombinedFeature(
          featureRoll,
          theme?.features || [],
          domain?.features || [],
          genericFeatures,
          language
        );
        
        // Se for genérico, combinar Aspect + Focus
        if (feature.source === 'generic' && aspectTable && focusTable) {
          const aspectRoll = Math.floor(Math.random() * 100) + 1;
          const focusRoll = Math.floor(Math.random() * 100) + 1;
          const aspect = aspectTable.rows?.find((r: any) => 
            aspectRoll >= r.min && aspectRoll <= (r.max || r.min)
          );
          const focus = focusTable.rows?.find((r: any) => 
            focusRoll >= r.min && focusRoll <= (r.max || r.min)
          );
          if (aspect && focus) {
            const aspectText = translateOracleResult('delve/oracles/feature/aspect', aspectRoll, aspect.text, language, aspect.min);
            const focusText = translateOracleResult('delve/oracles/feature/focus', focusRoll, focus.text, language, focus.min);
            feature.text = `${aspectText} ${focusText}`;
            result.aspect = { ...aspect, text: aspectText };
            result.focus = { ...focus, text: focusText };
          }
        }
        
        result.feature = feature;
        result.featureRoll = featureRoll;
        result.featureSource = feature.source;
      }
      
      setPendingChoice(null);
      onResult(result);
    } else {
      // Miss: Rola Danger
      const dangerRoll = Math.floor(Math.random() * 100) + 1;
      const genericDangerTable = findOracleById('delve/oracles/moves/reveal_a_danger');
      const genericDangers = genericDangerTable?.rows || [];

      let finalDanger: any = null;
      
      // Se o valor rolado está entre 1-30, usar esse MESMO valor na tabela de perigos do tema
      if (dangerRoll >= 1 && dangerRoll <= 30) {
        const themeDanger = findRollResult(dangerRoll, theme?.dangers || []);
        if (themeDanger) {
          const originalText = themeDanger.text;
          // Prioridade: text_pt no objeto > delveDangerTranslations > texto original
          const translatedText = getCustomFeatureDangerText(
            themeDanger as any,
            language,
            (text) => language === 'pt' && delveDangerTranslations[text] ? delveDangerTranslations[text] : text
          );
          finalDanger = {
            text: translatedText,
            originalText: originalText,
            source: 'theme',
            roll: dangerRoll,
            suggestions: (themeDanger as any).suggestions
          };
        }
      } 
      // Se o valor rolado está entre 31-45, usar esse MESMO valor na tabela de perigos do domínio
      else if (dangerRoll >= 31 && dangerRoll <= 45) {
        const domainDanger = findRollResult(dangerRoll, domain?.dangers || []);
        if (domainDanger) {
          const originalText = domainDanger.text;
          // Prioridade: text_pt no objeto > delveDangerTranslations > texto original
          const translatedText = getCustomFeatureDangerText(
            domainDanger as any,
            language,
            (text) => language === 'pt' && delveDangerTranslations[text] ? delveDangerTranslations[text] : text
          );
          finalDanger = {
            text: translatedText,
            originalText: originalText,
            source: 'domain',
            roll: dangerRoll,
            suggestions: (domainDanger as any).suggestions
          };
        }
      }
      
      // Se não encontrou em theme/domain (46-100 ou não encontrou), usar a lógica combinada normal
      if (!finalDanger) {
        const danger = getCombinedDanger(
          dangerRoll,
          theme?.dangers || [],
          domain?.dangers || [],
          genericDangers,
          language
        );
        result.danger = danger;

        // Se for "Check the Aspect", rolar Aspect + Focus automaticamente
        if (danger.source === 'aspect') {
          const aspectFocus = rollAspectAndFocus();
          if (aspectFocus) {
            danger.text = `${t('delve.result.checkAspect')}: ${aspectFocus.aspect.text} ${aspectFocus.focus.text}`;
            result.aspect = aspectFocus.aspect;
            result.focus = aspectFocus.focus;
          }
        } else if (danger.source === 'generic' && danger.text) {
          // Traduzir perigo genérico
          const dangerRow = findRollResult(dangerRoll, genericDangerTable?.rows || []);
          if (dangerRow) {
            const originalText = danger.text;
            danger.text = translateOracleResult('delve/oracles/moves/reveal_a_danger', dangerRoll, danger.text, language, dangerRow.min);
            danger.originalText = originalText;
          }
        }
      } else {
        // Usar o perigo encontrado diretamente do tema/domínio
        result.danger = finalDanger;
      }
      
      setPendingChoice(null);
      onResult(result);
    }
  };

  const handleMarkProgress = () => {
    if (!pendingChoice) return;
    const progressAmount = getProgressForRank(rank);
    // Se for weak_hit_choice, pode precisar marcar progresso duas vezes
    let finalProgress = progressAmount;
    if (pendingChoice.choiceType === 'weak_hit_choice' && pendingChoice.delveTableResult?.text) {
      const tableText = pendingChoice.delveTableResult.text;
      if (tableText.includes('Mark progress twice') || tableText.includes('Marque progresso duas vezes')) {
        finalProgress = progressAmount * 2;
      }
    }
    const finalResult = {
      ...pendingChoice,
      progressAdded: finalProgress,
      choiceType: 'mark_progress',
      requiresChoice: false // Marcar como não requer mais escolha
    };
    setPendingChoice(null);
    onResult(finalResult);
  };

  const handleFindOpportunity = () => {
    if (!pendingChoice) return;
    const opportunityTable = findOracleById('delve/oracles/moves/find_an_opportunity');
    if (opportunityTable && opportunityTable.rows) {
      const roll = Math.floor(Math.random() * 100) + 1;
      const opportunityRow = opportunityTable.rows.find((r: any) => 
        roll >= r.min && roll <= (r.max || r.min)
      );
      if (opportunityRow) {
        const originalText = opportunityRow.text;
        const translatedText = translateOracleResult('delve/oracles/moves/find_an_opportunity', roll, opportunityRow.text, language, opportunityRow.min);
        // Se for weak_hit_choice e "Do both", também marca progresso
        let progressAdded = 0;
        if (pendingChoice.choiceType === 'weak_hit_choice' && pendingChoice.delveTableResult?.text) {
          const tableText = pendingChoice.delveTableResult.text;
          if (tableText.includes('Do both') || tableText.includes('Faça ambos')) {
            progressAdded = getProgressForRank(rank);
          }
        }
        const finalResult = {
          ...pendingChoice,
          progressAdded: progressAdded,
          choiceType: 'find_opportunity',
          opportunity: { ...opportunityRow, text: translatedText, originalText: originalText, roll: roll },
          requiresChoice: false // Marcar como não requer mais escolha
        };
        setPendingChoice(null);
        onResult(finalResult);
      }
    }
  };

  const handleRollFeature = () => {
    const featureRoll = Math.floor(Math.random() * 100) + 1;
    const aspectTable = findOracleById('delve/oracles/feature/aspect');
    const focusTable = findOracleById('delve/oracles/feature/focus');
    const genericFeatures = aspectTable?.rows || [];

    const feature = getCombinedFeature(
      featureRoll,
      theme?.features || [],
      domain?.features || [],
      genericFeatures,
      language
    );
    
    // Se for genérico, combinar Aspect + Focus
    if (feature.source === 'generic' && aspectTable && focusTable) {
      const aspectFocus = rollAspectAndFocus();
      if (aspectFocus) {
        feature.text = `${aspectFocus.aspect.text} ${aspectFocus.focus.text}`;
      }
    }

    const resultId = Date.now();
    onResult({
      actionDie: 0,
      statValue: 0,
      challengeDice: [0, 0],
      result: undefined as any,
      actionTotal: 0,
      challengeTotal: 0,
      progressAdded: 0,
      feature: feature,
      featureRoll: featureRoll,
      featureSource: feature.source,
      choiceType: 'manual_feature',
      resultId: resultId
    });
  };

  const handleRollDanger = () => {
    const dangerRoll = Math.floor(Math.random() * 100) + 1;
    const genericDangerTable = findOracleById('delve/oracles/moves/reveal_a_danger');
    const genericDangers = genericDangerTable?.rows || [];

    let finalDanger: any = null;
    
    // Se o valor rolado está entre 1-30, usar esse MESMO valor na tabela de perigos do tema
    if (dangerRoll >= 1 && dangerRoll <= 30) {
      const themeDanger = findRollResult(dangerRoll, theme?.dangers || []);
      if (themeDanger) {
        const originalText = themeDanger.text;
        // Prioridade: text_pt no objeto > delveDangerTranslations > texto original
        const translatedText = getCustomFeatureDangerText(
          themeDanger as any,
          language,
          (text) => language === 'pt' && delveDangerTranslations[text] ? delveDangerTranslations[text] : text
        );
        finalDanger = {
          text: translatedText,
          originalText: originalText,
          source: 'theme',
          roll: dangerRoll,
          suggestions: (themeDanger as any).suggestions
        };
      }
    } 
    // Se o valor rolado está entre 31-45, usar esse MESMO valor na tabela de perigos do domínio
    else if (dangerRoll >= 31 && dangerRoll <= 45) {
      const domainDanger = findRollResult(dangerRoll, domain?.dangers || []);
      if (domainDanger) {
        const originalText = domainDanger.text;
        // Prioridade: text_pt no objeto > delveDangerTranslations > texto original
        const translatedText = getCustomFeatureDangerText(
          domainDanger as any,
          language,
          (text) => language === 'pt' && delveDangerTranslations[text] ? delveDangerTranslations[text] : text
        );
        finalDanger = {
          text: translatedText,
          originalText: originalText,
          source: 'domain',
          roll: dangerRoll,
          suggestions: (domainDanger as any).suggestions
        };
      }
    }
    
    // Se não encontrou em theme/domain (46-100 ou não encontrou), usar a lógica combinada normal
    if (!finalDanger) {
      const danger = getCombinedDanger(
        dangerRoll,
        theme?.dangers || [],
        domain?.dangers || [],
        genericDangers,
        language
      );
      finalDanger = danger;
      finalDanger.roll = dangerRoll;

      // Se for "Check the Aspect", rolar Aspect + Focus automaticamente
      if (danger.source === 'aspect') {
        const aspectFocus = rollAspectAndFocus();
        if (aspectFocus) {
          finalDanger.text = `${t('delve.result.checkAspect')}: ${aspectFocus.aspect.text} ${aspectFocus.focus.text}`;
          finalDanger.aspect = aspectFocus.aspect;
          finalDanger.focus = aspectFocus.focus;
        }
      } else if (danger.source === 'generic' && danger.text) {
        // Traduzir perigo genérico
        const dangerRow = findRollResult(dangerRoll, genericDangerTable?.rows || []);
        if (dangerRow) {
          const originalText = danger.text;
          finalDanger.text = translateOracleResult('delve/oracles/moves/reveal_a_danger', dangerRoll, danger.text, language, dangerRow.min);
          finalDanger.originalText = originalText;
        }
      }
    }

    const resultId = Date.now();
    onResult({
      actionDie: 0,
      statValue: 0,
      challengeDice: [0, 0],
      result: undefined as any,
      actionTotal: 0,
      challengeTotal: 0,
      progressAdded: 0,
      danger: finalDanger,
      choiceType: 'manual_danger',
      resultId: resultId
    });
  };

  return (
    <div className="delve-action-panel">
      <h3>{t('delve.action.title')}</h3>
      
      <div className="delve-stat-table">
        <div className="delve-stat-table-header">
          <div className="delve-stat-table-cell delve-stat-table-cell-header">Atributo</div>
          <div className="delve-stat-table-cell delve-stat-table-cell-header">Valor</div>
        </div>
        <div className="delve-stat-table-row">
          <div className="delve-stat-table-cell delve-stat-table-cell-attribute">
            <div className="delve-stat-selector">
              <label>
                <input
                  type="radio"
                  name="stat"
                  value="edge"
                  checked={selectedStat === 'edge'}
                  onChange={() => setSelectedStat('edge')}
                />
                <span>{t('delve.action.stat.edge')}</span>
              </label>
              <label>
                <input
                  type="radio"
                  name="stat"
                  value="shadow"
                  checked={selectedStat === 'shadow'}
                  onChange={() => setSelectedStat('shadow')}
                />
                <span>{t('delve.action.stat.shadow')}</span>
              </label>
              <label>
                <input
                  type="radio"
                  name="stat"
                  value="wits"
                  checked={selectedStat === 'wits'}
                  onChange={() => setSelectedStat('wits')}
                />
                <span>{t('delve.action.stat.wits')}</span>
              </label>
            </div>
          </div>
          <div className="delve-stat-table-cell delve-stat-table-cell-value">
            <div className="delve-stat-value-controls">
              <button
                className="delve-stat-value-button"
                onClick={() => setStatValue(Math.max(0, statValue - 1))}
                disabled={statValue === 0}
                title="Diminuir atributo"
              >
                <FaMinus />
              </button>
              <span className="delve-stat-value-display">{statValue}</span>
              <button
                className="delve-stat-value-button"
                onClick={() => setStatValue(Math.min(5, statValue + 1))}
                disabled={statValue === 5}
                title="Aumentar atributo"
              >
                <FaPlus />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="delve-action-buttons">
        <button
          className="delve-action-button"
          onClick={handleDelveTheDepths}
          disabled={!!pendingChoice && showResultModal}
        >
          <FaDice />
          <span>{t('delve.action.roll')}</span>
        </button>

        {state?.isActive && (
          <>
            <button
              className="delve-feature-button"
              onClick={handleRollFeature}
              disabled={!!pendingChoice && showResultModal}
            >
              <FaEye />
              <span>{t('delve.action.rollFeature')}</span>
            </button>
            <button
              className="delve-danger-button"
              onClick={handleRollDanger}
              disabled={!!pendingChoice && showResultModal}
            >
              <FaSkull />
              <span>{t('delve.action.rollDanger')}</span>
            </button>
          </>
        )}
      </div>

      {/* Botões de escolha removidos - agora aparecem apenas no modal */}
    </div>
  );
}
