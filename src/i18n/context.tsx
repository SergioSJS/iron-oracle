import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Language, TranslationKey } from './types';
import { pt } from './translations/pt';
import { en } from './translations/en';

type Translations = typeof pt;

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const translations = {
  pt,
  en,
} as Record<Language, Record<string, string>>;

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    // Tentar carregar do localStorage primeiro
    const saved = localStorage.getItem('language');
    if (saved === 'pt' || saved === 'en') {
      return saved;
    }
    // Tentar detectar idioma do navegador
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('pt')) {
      return 'pt';
    }
    return 'en';
  });

  // Salvar language no localStorage quando mudar
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // Wrapper para setLanguage que também salva no localStorage
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    const translation = translations[language][key as keyof Translations] as string;
    
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }

    // Substituir parâmetros se fornecidos
    if (params) {
      let result: string = translation;
      for (const [paramKey, paramValue] of Object.entries(params)) {
        result = result.replace(`{{${paramKey}}}`, String(paramValue));
      }
      return result;
    }

    return translation;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

