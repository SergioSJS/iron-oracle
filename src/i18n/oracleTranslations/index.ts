import type { Language } from '../types';
import type { OracleTranslation } from './types';
import { ironswornTranslations } from './ironsworn';
import { starforgedTranslations } from './starforged';

// Agrega todas as traduções de oráculos
export const oracleTranslations: Record<Language, Record<string, OracleTranslation>> = {
  pt: {
    ...ironswornTranslations,
    ...starforgedTranslations,
  },
  en: {},
};

// Re-exportar tipos
export type { OracleTranslation } from './types';

/**
 * Traduz o nome de um oráculo
 */
export function translateOracleName(
  oracleId: string,
  originalName: string,
  language: Language
): string {
  const translation = oracleTranslations[language][oracleId];
  return translation?.name || originalName;
}

/**
 * Traduz o texto de um resultado de rolagem
 * Nota: A tradução é baseada no valor mínimo (min) da linha, não no valor rolado
 * Por exemplo, se uma linha tem min=1 e max=5, a tradução deve estar em rows[1]
 */
export function translateOracleResult(
  oracleId: string,
  rollValue: number,
  originalText: string,
  language: Language,
  rowMin?: number
): string {
  const translation = oracleTranslations[language][oracleId];
  // Usar rowMin se fornecido, caso contrário tentar rollValue
  const key = rowMin !== undefined ? rowMin : rollValue;
  if (translation?.rows?.[key]) {
    return translation.rows[key];
  }
  return originalText;
}

/**
 * Traduz um texto simples de oráculo
 */
export function translateOracleText(
  oracleId: string,
  originalText: string,
  language: Language
): string {
  const translation = oracleTranslations[language][oracleId];
  return translation?.text || originalText;
}

