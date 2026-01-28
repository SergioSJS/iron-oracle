import { useState, useEffect } from 'react';
import type { DelveState, SiteRank } from '../types/delve';

const STORAGE_KEY = 'delveState';

const defaultState: DelveState = {
  themeId: '',
  domainId: '',
  siteRank: 'dangerous',
  progress: 0,
  isActive: false
};

export function useDelveState() {
  const [state, setState] = useState<DelveState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Erro ao carregar estado do Delve:', e);
    }
    return defaultState;
  });

  // Salvar no localStorage sempre que o estado mudar
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Erro ao salvar estado do Delve:', e);
    }
  }, [state]);

  const startExpedition = (themeId: string, domainId: string, siteRank: SiteRank) => {
    setState({
      themeId,
      domainId,
      siteRank,
      progress: 0,
      isActive: true
    });
  };

  const addProgress = (amount: number) => {
    setState(prev => ({
      ...prev,
      progress: Math.min(40, prev.progress + amount)
    }));
  };

  const adjustProgress = (amount: number) => {
    setState(prev => ({
      ...prev,
      progress: Math.max(0, Math.min(40, prev.progress + amount))
    }));
  };

  const resetExpedition = () => {
    setState(defaultState);
  };

  const updateRank = (rank: SiteRank) => {
    setState(prev => ({
      ...prev,
      siteRank: rank
    }));
  };

  const updateTheme = (themeId: string) => {
    setState(prev => ({
      ...prev,
      themeId
    }));
  };

  const updateDomain = (domainId: string) => {
    setState(prev => ({
      ...prev,
      domainId
    }));
  };

  return {
    state,
    startExpedition,
    addProgress,
    adjustProgress,
    resetExpedition,
    updateRank,
    updateTheme,
    updateDomain
  };
}
