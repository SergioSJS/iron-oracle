import type { ActionRoll, ActionRollResult, SiteRank, DelveFeature, DelveDanger } from '../types/delve';
import { findRollResult } from './oracleUtils';
import type { OracleRow } from '../types/datasworn';
import { delveFeatureTranslations, delveDangerTranslations } from '../i18n/oracleTranslations/delveFeatures';
import { getCustomFeatureDangerText } from './customDelveTranslations';

/**
 * Rola 1d6 + stat vs 2d10 para Delve the Depths
 * Mecânica: Se vencer apenas 1 d10 = weak hit, se vencer ambos = strong hit, se não vencer nenhum = miss
 */
export function rollDelveAction(statValue: number): ActionRoll {
  const actionDie = Math.floor(Math.random() * 6) + 1;
  const challengeDie1 = Math.floor(Math.random() * 10) + 1;
  const challengeDie2 = Math.floor(Math.random() * 10) + 1;
  const challengeDice: [number, number] = [challengeDie1, challengeDie2];
  
  const actionTotal = actionDie + statValue;
  
  // Comparar com cada d10 separadamente
  const beatsDie1 = actionTotal > challengeDie1;
  const beatsDie2 = actionTotal > challengeDie2;
  
  let result: ActionRollResult;
  if (beatsDie1 && beatsDie2) {
    // Venceu ambos os d10 = Strong Hit
    result = 'strong_hit';
  } else if (beatsDie1 || beatsDie2) {
    // Venceu apenas 1 d10 = Weak Hit
    result = 'weak_hit';
  } else {
    // Não venceu nenhum = Miss
    result = 'miss';
  }
  
  return {
    actionDie,
    statValue,
    challengeDice,
    result,
    actionTotal,
    challengeTotal: Math.max(challengeDie1, challengeDie2) // Mantido para exibição
  };
}

/**
 * Calcula o progresso baseado no rank do site
 */
export function getProgressForRank(rank: SiteRank): number {
  const progressMap: Record<SiteRank, number> = {
    'troublesome': 12,  // 3 caixas (12/4 = 3)
    'dangerous': 8,    // 2 caixas (8/4 = 2)
    'formidable': 4,   // 1 caixa (4/4 = 1)
    'extreme': 2,      // meia caixa (2/4 = 0.5)
    'epic': 1         // 1/4 de caixa (1/4 = 0.25)
  };
  return progressMap[rank];
}

/**
 * Busca uma Feature combinando Theme e Domain
 * 01-20: Theme features
 * 21-100: Domain features
 */
export function getCombinedFeature(
  roll100: number,
  themeFeatures: DelveFeature[],
  domainFeatures: DelveFeature[],
  genericFeatures: OracleRow[],
  language: 'pt' | 'en' = 'pt'
): { text: string; originalText?: string; source: 'theme' | 'domain' | 'generic'; suggestions?: { oracles?: string[] } } {
  if (roll100 >= 1 && roll100 <= 20 && themeFeatures.length > 0) {
    // Theme features (1-20)
    const feature = findRollResult(roll100, themeFeatures as any);
    if (feature) {
      const originalText = feature.text;
      // Prioridade: text_pt no objeto > delveFeatureTranslations > texto original
      const translatedText = getCustomFeatureDangerText(
        feature as any,
        language,
        (text) => language === 'pt' && delveFeatureTranslations[text] ? delveFeatureTranslations[text] : text
      );
      return {
        text: translatedText,
        originalText: originalText,
        source: 'theme',
        suggestions: (feature as DelveFeature).suggestions
      };
    }
  } else if (roll100 >= 21 && roll100 <= 100 && domainFeatures.length > 0) {
    // Domain features (21-100)
    const feature = findRollResult(roll100, domainFeatures as any);
    if (feature) {
      const originalText = feature.text;
      // Prioridade: text_pt no objeto > delveFeatureTranslations > texto original
      const translatedText = getCustomFeatureDangerText(
        feature as any,
        language,
        (text) => language === 'pt' && delveFeatureTranslations[text] ? delveFeatureTranslations[text] : text
      );
      return {
        text: translatedText,
        originalText: originalText,
        source: 'domain',
        suggestions: (feature as DelveFeature).suggestions
      };
    }
  }
  
  // Se não encontrou em theme/domain, usar Aspect + Focus (genérico)
  if (genericFeatures.length > 0) {
    const feature = findRollResult(roll100, genericFeatures);
    if (feature) {
      return {
        text: feature.text,
        originalText: feature.text,
        source: 'generic'
      };
    }
  }
  
  // Fallback se não encontrar nada
  return {
    text: 'Nenhuma característica encontrada',
    source: 'generic'
  };
}

/**
 * Busca um Danger combinando Theme, Domain, Aspect/Focus ou genérico
 * 01-15: Theme dangers
 * 16-30: Domain dangers
 * 31-45: Aspect + Focus (Check the Aspect)
 * 46-100: Generic dangers
 */
export function getCombinedDanger(
  roll100: number,
  themeDangers: DelveDanger[],
  domainDangers: DelveDanger[],
  genericDangers: OracleRow[],
  language: 'pt' | 'en' = 'pt'
): { text: string; originalText?: string; source: 'theme' | 'domain' | 'aspect' | 'generic'; suggestions?: { oracles?: string[] } } {
  if (roll100 >= 1 && roll100 <= 15) {
    // Theme dangers
    const danger = findRollResult(roll100, themeDangers as any);
    if (danger) {
      const originalText = danger.text;
      // Prioridade: text_pt no objeto > delveDangerTranslations > texto original
      const translatedText = getCustomFeatureDangerText(
        danger as any,
        language,
        (text) => language === 'pt' && delveDangerTranslations[text] ? delveDangerTranslations[text] : text
      );
      return {
        text: translatedText,
        originalText: originalText,
        source: 'theme',
        suggestions: (danger as DelveDanger).suggestions
      };
    }
  } else if (roll100 >= 16 && roll100 <= 30) {
    // Domain dangers
    const danger = findRollResult(roll100, domainDangers as any);
    if (danger) {
      const originalText = danger.text;
      // Prioridade: text_pt no objeto > delveDangerTranslations > texto original
      const translatedText = getCustomFeatureDangerText(
        danger as any,
        language,
        (text) => language === 'pt' && delveDangerTranslations[text] ? delveDangerTranslations[text] : text
      );
      return {
        text: translatedText,
        originalText: originalText,
        source: 'domain',
        suggestions: (danger as DelveDanger).suggestions
      };
    }
  } else if (roll100 >= 31 && roll100 <= 45) {
    // Check the Aspect (Aspect + Focus) - será traduzido no componente
    return {
      text: 'Check the Aspect',
      source: 'aspect'
    };
  }
  
  // Generic dangers (46-100)
  const danger = findRollResult(roll100, genericDangers);
  if (danger) {
    return {
      text: danger.text,
      originalText: danger.text,
      source: 'generic'
    };
  }
  
  return {
    text: 'Nenhum perigo encontrado',
    source: 'generic'
  };
}

/**
 * Converte progresso (0-40) em número de caixas preenchidas (0-10)
 */
export function getProgressBoxes(progress: number): number {
  return Math.floor(progress / 4);
}

/**
 * Obtém o nível de preenchimento de uma caixa específica (0-4)
 * 0 = vazia, 1 = 1 traço, 2 = 2 traços (X), 3 = 3 traços, 4 = 4 traços (asterisco)
 */
export function getBoxFillLevel(boxIndex: number, progress: number): number {
  const boxStart = boxIndex * 4;
  const boxEnd = boxStart + 4;
  if (progress >= boxEnd) return 4; // Caixa completa (asterisco)
  if (progress > boxStart) return progress - boxStart; // Nível parcial
  return 0; // Vazia
}

/**
 * Verifica se o progresso está completo (40/40 = 10 caixas)
 */
export function isProgressComplete(progress: number): boolean {
  return progress >= 40;
}
