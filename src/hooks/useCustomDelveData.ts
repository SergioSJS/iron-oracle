import { useMemo } from 'react';
import delveData from '@datasworn/ironsworn-classic-delve/json/delve.json';

/**
 * Interface para um Theme customizado
 */
export interface CustomTheme {
  id: string;
  name: string;
  name_pt?: string; // Tradução opcional do nome em português
  text: string;
  text_pt?: string; // Tradução opcional da descrição em português
  features: Array<{
    min: number;
    max: number;
    text: string;
    text_pt?: string; // Tradução opcional em português
    suggestions?: {
      oracles?: string[];
    };
  }>;
  dangers: Array<{
    min: number;
    max: number;
    text: string;
    text_pt?: string; // Tradução opcional em português
    suggestions?: {
      oracles?: string[];
    };
  }>;
}

/**
 * Interface para um Domain customizado
 */
export interface CustomDomain {
  id: string;
  name: string;
  name_pt?: string; // Tradução opcional do nome em português
  text: string;
  text_pt?: string; // Tradução opcional da descrição em português
  features: Array<{
    min: number;
    max: number;
    text: string;
    text_pt?: string; // Tradução opcional em português
    suggestions?: {
      oracles?: string[];
    };
  }>;
  dangers: Array<{
    min: number;
    max: number;
    text: string;
    text_pt?: string; // Tradução opcional em português
    suggestions?: {
      oracles?: string[];
    };
  }>;
}

/**
 * Hook para carregar e mesclar dados customizados de Themes e Domains
 * 
 * Este hook:
 * 1. Carrega automaticamente todos os arquivos JSON de customThemes/ e customDomains/
 * 2. Mescla com os dados originais do Delve
 * 3. Retorna os dados mesclados prontos para uso
 * 
 * Para adicionar novos themes/domains:
 * - Crie um arquivo JSON em src/data/customThemes/ ou src/data/customDomains/
 * - Siga o formato dos templates em src/data/templates/
 * - O arquivo será carregado automaticamente
 */
export function useCustomDelveData() {
  return useMemo(() => {
    // Carregar themes customizados
    const customThemes: Record<string, CustomTheme> = {};
    try {
      // Usar import dinâmico para carregar todos os arquivos JSON
      // Vite suporta import.meta.glob para isso
      const themeModules = import.meta.glob('../data/customThemes/*.json', { eager: true });
      for (const path in themeModules) {
        const module = themeModules[path] as { default: CustomTheme | CustomTheme[] };
        const data = module.default;
        
        // Suporta tanto objeto único quanto array de objetos
        if (Array.isArray(data)) {
          // Se for array, processar cada item
          for (const theme of data) {
            if (theme && theme.id) {
              customThemes[theme.id] = theme;
            }
          }
        } else if (data && data.id) {
          // Se for objeto único, adicionar diretamente
          customThemes[data.id] = data;
        }
      }
    } catch (error) {
      console.warn('Erro ao carregar themes customizados:', error);
    }

    // Carregar domains customizados
    const customDomains: Record<string, CustomDomain> = {};
    try {
      const domainModules = import.meta.glob('../data/customDomains/*.json', { eager: true });
      for (const path in domainModules) {
        const module = domainModules[path] as { default: CustomDomain | CustomDomain[] };
        const data = module.default;
        
        // Suporta tanto objeto único quanto array de objetos
        if (Array.isArray(data)) {
          // Se for array, processar cada item
          for (const domain of data) {
            if (domain && domain.id) {
              customDomains[domain.id] = domain;
            }
          }
        } else if (data && data.id) {
          // Se for objeto único, adicionar diretamente
          customDomains[data.id] = data;
        }
      }
    } catch (error) {
      console.warn('Erro ao carregar domains customizados:', error);
    }

    // Mesclar com dados originais do Delve
    const mergedThemes = {
      ...(delveData.site_themes || {}),
      ...customThemes
    };

    const mergedDomains = {
      ...(delveData.site_domains || {}),
      ...customDomains
    };

    return {
      themes: mergedThemes,
      domains: mergedDomains,
      customThemes,
      customDomains
    };
  }, []); // useMemo sem dependências - só executa uma vez
}
