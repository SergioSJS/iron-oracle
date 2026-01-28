import type { Language } from '../i18n/types';

/**
 * Obtém o nome traduzido de um theme/domain customizado
 * Prioridade: tradução no objeto > sistema de tradução > texto original
 */
export function getCustomName(
  item: { name: string; name_pt?: string },
  oracleId: string,
  language: Language,
  fallbackTranslate: (oracleId: string, originalName: string, language: Language) => string
): string {
  // Se está em português e tem tradução no objeto, usar ela
  if (language === 'pt' && item.name_pt) {
    return item.name_pt;
  }
  
  // Caso contrário, usar o sistema de tradução existente (que pode ter tradução em ironsworn.ts)
  return fallbackTranslate(oracleId, item.name, language);
}

/**
 * Obtém o texto traduzido de um theme/domain customizado
 * Prioridade: tradução no objeto > sistema de tradução > texto original
 */
export function getCustomText(
  item: { text: string; text_pt?: string },
  oracleId: string,
  language: Language,
  fallbackTranslate: (oracleId: string, originalText: string, language: Language) => string
): string {
  // Se está em português e tem tradução no objeto, usar ela
  if (language === 'pt' && item.text_pt) {
    return item.text_pt;
  }
  
  // Caso contrário, usar o sistema de tradução existente
  return fallbackTranslate(oracleId, item.text, language);
}

/**
 * Obtém o texto traduzido de uma feature/danger customizada
 * Prioridade: tradução no objeto > sistema de tradução > texto original
 */
export function getCustomFeatureDangerText(
  item: { text: string; text_pt?: string },
  language: Language,
  fallbackTranslate?: (text: string) => string
): string {
  // Se está em português e tem tradução no objeto, usar ela
  if (language === 'pt' && item.text_pt) {
    return item.text_pt;
  }
  
  // Se tem função de fallback (ex: delveFeatureTranslations), usar ela
  if (fallbackTranslate) {
    return fallbackTranslate(item.text);
  }
  
  // Caso contrário, usar o texto original
  return item.text;
}
