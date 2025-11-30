import type { GameMode, StarforgedRegion } from '../../types/datasworn';
import { useI18n } from '../../i18n/context';

type HeaderProps = {
  gameMode: GameMode;
  setGameMode: (mode: GameMode) => void;
  selectedRegion: StarforgedRegion;
  setSelectedRegion: (region: StarforgedRegion) => void;
  isSmallScreen: boolean;
  logsCount: number;
  onShowLogModal: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
};

export function Header({
  gameMode,
  setGameMode,
  selectedRegion,
  setSelectedRegion,
  isSmallScreen,
  logsCount,
  onShowLogModal,
  isDarkMode,
  setIsDarkMode
}: HeaderProps) {
  const { t, language, setLanguage } = useI18n();

  return (
    <header className="app-header">
      <h1 className="app-title">
        <span className="title-text">
          <span className="title-game">{t(`gameMode.${gameMode}` as any)}</span>
        </span>
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="theme-toggle-btn theme-toggle-btn-inline"
          title={isDarkMode ? t('theme.light') : t('theme.dark')}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
        {gameMode === 'starforged' && (
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value as StarforgedRegion)}
            className="region-selector region-selector-inline"
            title={t('region.select')}
          >
            <option value="terminus">{t('region.terminus')}</option>
            <option value="outlands">{t('region.outlands')}</option>
            <option value="expanse">{t('region.expanse')}</option>
          </select>
        )}
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as 'pt' | 'en')}
          className="language-selector language-selector-inline"
          title={t('language.select')}
        >
          <option value="pt">🇧🇷 PT</option>
          <option value="en">🇺🇸 EN</option>
        </select>
      </h1>
      
      <div className="header-controls">
        <div className="mode-selector">
          <button 
            onClick={() => setGameMode('ironsworn')} 
            className={`mode-btn ${gameMode === 'ironsworn' ? 'active' : ''}`}
          >
            <span className="mode-icon ironsworn-icon">⚒</span>
            <span className="mode-text">{t('gameMode.ironsworn')}</span>
          </button>
          <button 
            onClick={() => setGameMode('starforged')}
            className={`mode-btn ${gameMode === 'starforged' ? 'active' : ''}`}
          >
            <span className="mode-icon starforged-icon">✦</span>
            <span className="mode-text">{t('gameMode.starforged')}</span>
          </button>
        </div>
        
        <div className="header-region-controls">
          {isSmallScreen && (
            <button 
              onClick={onShowLogModal}
              className="action-btn log-modal-btn"
              title={t('buttons.viewLog')}
            >
              📜 {t('buttons.viewLog')} ({logsCount})
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

