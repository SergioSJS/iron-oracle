// Estrutura preparada para futuras traduções
// Por enquanto, apenas define os tipos sem implementar

export type Language = 'pt' | 'en';

export type TranslationKey = 
  | 'app.title'
  | 'app.title.game'
  | 'buttons.expand'
  | 'buttons.collapse'
  | 'buttons.clear'
  | 'buttons.viewLog'
  | 'log.title'
  | 'log.empty'
  | 'log.empty.hint'
  | 'log.rolled'
  | 'askTheOracle.title'
  | 'region.terminus'
  | 'region.outlands'
  | 'region.expanse'
  | 'region.select'
  | string; // Permite chaves dinâmicas

// Interface para o sistema de tradução (a ser implementado)
export interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

