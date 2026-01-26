import type { GameMode, StarforgedRegion } from '../../types/datasworn';
import { useI18n } from '../../i18n/context';
import { FaSun, FaMoon, FaBook, FaSearch, FaTimes } from 'react-icons/fa';
import { GiPlanetCore, GiBattleAxe, GiSpaceship } from 'react-icons/gi';
import { useState, useRef, useEffect } from 'react';

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
  searchQuery: string;
  onSearchChange: (query: string) => void;
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
  setIsDarkMode,
  searchQuery,
  onSearchChange
}: HeaderProps) {
  const { t, language, setLanguage } = useI18n();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleSearchToggle = () => {
    if (isSearchOpen && searchQuery) {
      onSearchChange('');
    }
    setIsSearchOpen(!isSearchOpen);
  };

  const handleSearchClear = () => {
    onSearchChange('');
    setIsSearchOpen(false);
  };

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
          onClick={handleSearchToggle}
          className={`search-btn ${isSearchOpen ? 'active' : ''}`}
          title={t('search.placeholder')}
        >
          <FaSearch />
        </button>
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
          <option value="pt">🇧🇷</option>
          <option value="en">🇺🇸</option>
        </select>
        {gameMode !== 'ironsworn' && (
          <button 
            onClick={() => setGameMode('ironsworn')} 
            className="mode-btn"
          >
            <span className="mode-icon ironsworn-icon"><GiBattleAxe /></span>
            <span className="mode-text">{t('gameMode.ironsworn')}</span>
          </button>
        )}
        {gameMode !== 'starforged' && (
          <button 
            onClick={() => setGameMode('starforged')}
            className="mode-btn"
          >
            <span className="mode-icon starforged-icon"><GiSpaceship /></span>
            <span className="mode-text">{t('gameMode.starforged')}</span>
          </button>
        )}
        {isSmallScreen && (
          <button 
            onClick={onShowLogModal}
            className="log-modal-btn"
            title={`${t('buttons.viewLog')} (${logsCount})`}
          >
            <FaBook />
            {logsCount > 0 && <span className="log-badge">{logsCount}</span>}
          </button>
        )}
      </div>
      {isSearchOpen && (
        <div className="header-search-bar">
          <FaSearch className="search-icon" />
          <input
            ref={searchInputRef}
            type="text"
            className="search-input"
            placeholder={t('search.placeholder')}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button 
              className="search-clear"
              onClick={handleSearchClear}
              aria-label="Clear search"
            >
              <FaTimes />
            </button>
          )}
        </div>
      )}
    </header>
  );
}

