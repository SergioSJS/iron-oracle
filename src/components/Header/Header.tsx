import type { GameMode, StarforgedRegion } from '../../types/datasworn';
import { useI18n } from '../../i18n/context';
import { FaSun, FaMoon, FaBook } from 'react-icons/fa';
import { GiPlanetCore } from 'react-icons/gi';

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
      </h1>
      
      <div className="header-controls">
        {gameMode === 'starforged' && (
          <div className="region-selector-wrapper">
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value as StarforgedRegion)}
              className="region-selector"
              title={t('region.select')}
            >
              <option value="terminus">{t('region.terminus')}</option>
              <option value="outlands">{t('region.outlands')}</option>
              <option value="expanse">{t('region.expanse')}</option>
            </select>
            <GiPlanetCore className="region-selector-icon" />
          </div>
        )}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="theme-toggle-btn"
          title={isDarkMode ? t('theme.light') : t('theme.dark')}
        >
          {isDarkMode ? <FaSun /> : <FaMoon />}
        </button>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as 'pt' | 'en')}
          className="language-selector"
          title={t('language.select')}
        >
          <option value="pt">🇧🇷 PT</option>
          <option value="en">🇺🇸 EN</option>
        </select>
        {gameMode !== 'ironsworn' && (
          <button 
            onClick={() => setGameMode('ironsworn')} 
            className="mode-btn"
          >
            <span className="mode-icon ironsworn-icon">⚒</span>
            <span className="mode-text">{t('gameMode.ironsworn')}</span>
          </button>
        )}
        {gameMode !== 'starforged' && (
          <button 
            onClick={() => setGameMode('starforged')}
            className="mode-btn"
          >
            <span className="mode-icon starforged-icon">✦</span>
            <span className="mode-text">{t('gameMode.starforged')}</span>
          </button>
        )}
        {isSmallScreen && (
          <button 
            onClick={onShowLogModal}
            className="action-btn log-modal-btn"
            title={t('buttons.viewLog')}
          >
            <FaBook /> {t('buttons.viewLog')} ({logsCount})
          </button>
        )}
      </div>
    </header>
  );
}

