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
  | 'buttons.expandCollapse'
  | 'log.title'
  | 'log.empty'
  | 'log.empty.hint'
  | 'log.rolled'
  | 'log.clear'
  | 'askTheOracle.title'
  | 'region.terminus'
  | 'region.outlands'
  | 'region.expanse'
  | 'region.select'
  | 'modal.result.title'
  | 'modal.log.title'
  | 'modal.close'
  | 'gameMode.ironsworn'
  | 'gameMode.starforged'
  | 'result.notFound'
  | 'language.select'
  | 'theme.dark'
  | 'theme.light'
  | 'shortcuts.title'
  | 'log.autoModal'
  | 'footer.dataFrom'
  | 'footer.createdBy'
  | 'search.placeholder'
  | 'search.noResults'
  | 'copy.button'
  | 'copy.success'
  | 'favorites.title'
  | 'favorites.empty'
  | 'favorites.add'
  | 'favorites.remove'
  | 'export.button'
  | 'export.history'
  | 'keyboard.hint'
  | 'changelog'
  | 'changelog.button'
  | 'changelogError'
  | 'loading'
  | 'close'
  | 'shortcut.actionAndTheme'
  | 'shortcut.fullCharacter'
  | 'shortcut.place'
  | 'shortcut.coastalPlace'
  | 'shortcut.settlement'
  | 'shortcut.descriptorAndFocus'
  | 'shortcut.planet'
  | 'shortcut.starship'
  | 'shortcut.precursorVault'
  | string; // Permite chaves dinâmicas

// Interface para o sistema de tradução (a ser implementado)
export interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

