import { useState, useEffect } from 'react';
import type { SiteRank } from '../../types/delve';
import { useCustomDelveData } from '../../hooks/useCustomDelveData';
import { useI18n } from '../../i18n/context';
import { translateOracleName } from '../../i18n/oracleTranslations';
import { getCustomName } from '../../utils/customDelveTranslations';
import { getOracleIcon } from '../../utils/oracleIcons';
import { FaTimes, FaDice } from 'react-icons/fa';
import '../../styles/modals.css';

type ExpeditionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onStart: (themeId: string, domainId: string, rank: SiteRank) => void;
  onUpdate?: (themeId: string, domainId: string, rank: SiteRank) => void;
  currentThemeId?: string;
  currentDomainId?: string;
  currentRank?: SiteRank;
  isEditing?: boolean;
};

export function ExpeditionModal({ 
  isOpen, 
  onClose, 
  onStart, 
  onUpdate,
  currentThemeId, 
  currentDomainId, 
  currentRank,
  isEditing = false
}: ExpeditionModalProps) {
  const { t, language } = useI18n();
  const { themes, domains, customThemes, customDomains } = useCustomDelveData();
  const [themeId, setThemeId] = useState(currentThemeId || '');
  const [domainId, setDomainId] = useState(currentDomainId || '');
  const [rank, setRank] = useState<SiteRank>(currentRank || 'dangerous');

  // Atualizar quando props mudarem
  useEffect(() => {
    if (isOpen) {
      setThemeId(currentThemeId || '');
      setDomainId(currentDomainId || '');
      setRank(currentRank || 'dangerous');
    }
  }, [isOpen, currentThemeId, currentDomainId, currentRank]);

  // Separar temas originais e customizados
  const originalThemes = Object.entries(themes)
    .filter(([id]) => !customThemes[id])
    .map(([id, theme]: [string, any]) => ({
      id,
      name: getCustomName(
        theme,
        `delve/site_themes/${id}`,
        language,
        translateOracleName
      ),
      icon: getOracleIcon(`delve/site_themes/${id}`, theme.name || id)
    }));

  const customThemeOptions = Object.entries(themes)
    .filter(([id]) => customThemes[id])
    .map(([id, theme]: [string, any]) => ({
      id,
      name: getCustomName(
        theme,
        `delve/site_themes/${id}`,
        language,
        translateOracleName
      ),
      icon: getOracleIcon(`delve/site_themes/${id}`, theme.name || id)
    }));

  // Separar domínios originais e customizados
  const originalDomains = Object.entries(domains)
    .filter(([id]) => !customDomains[id])
    .map(([id, domain]: [string, any]) => ({
      id,
      name: getCustomName(
        domain,
        `delve/site_domains/${id}`,
        language,
        translateOracleName
      ),
      icon: getOracleIcon(`delve/site_domains/${id}`, domain.name || id)
    }));

  const customDomainOptions = Object.entries(domains)
    .filter(([id]) => customDomains[id])
    .map(([id, domain]: [string, any]) => ({
      id,
      name: getCustomName(
        domain,
        `delve/site_domains/${id}`,
        language,
        translateOracleName
      ),
      icon: getOracleIcon(`delve/site_domains/${id}`, domain.name || id)
    }));

  const rankOptions: { value: SiteRank; label: string }[] = [
    { value: 'troublesome', label: t('delve.rank.troublesome') },
    { value: 'dangerous', label: t('delve.rank.dangerous') },
    { value: 'formidable', label: t('delve.rank.formidable') },
    { value: 'extreme', label: t('delve.rank.extreme') },
    { value: 'epic', label: t('delve.rank.epic') }
  ];

  const handleRandomTheme = () => {
    const allThemes = [...originalThemes, ...customThemeOptions];
    const randomIndex = Math.floor(Math.random() * allThemes.length);
    setThemeId(allThemes[randomIndex].id);
  };

  const handleRandomDomain = () => {
    const allDomains = [...originalDomains, ...customDomainOptions];
    const randomIndex = Math.floor(Math.random() * allDomains.length);
    setDomainId(allDomains[randomIndex].id);
  };

  const handleRandomBoth = () => {
    handleRandomTheme();
    handleRandomDomain();
  };

  const handleStart = () => {
    if (themeId && domainId) {
      onStart(themeId, domainId, rank);
      onClose();
    }
  };

  const handleSave = () => {
    if (themeId && domainId && onUpdate) {
      onUpdate(themeId, domainId, rank);
      onClose();
    }
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="changelog-modal-overlay active"
      onClick={onClose}
    >
      <div 
        className="changelog-modal-content delve-expedition-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="changelog-modal-header">
          <h3>{t('delve.setup.title')}</h3>
          <button 
            className="changelog-modal-close"
            onClick={onClose}
            aria-label={t('close')}
          >
            <FaTimes />
          </button>
        </div>
        <div className="changelog-modal-body">
          <div className="delve-expedition-form">
            <div className="delve-expedition-field">
              <div className="delve-expedition-field-header">
                <label htmlFor="theme-select">{t('delve.setup.theme')}</label>
                <button
                  className="delve-random-button"
                  onClick={handleRandomTheme}
                  title={t('delve.setup.randomTheme')}
                >
                  <FaDice /> {t('delve.setup.random')}
                </button>
              </div>
              <select
                id="theme-select"
                value={themeId}
                onChange={(e) => setThemeId(e.target.value)}
                className="delve-expedition-select"
              >
                <option value="">{t('delve.setup.theme.placeholder')}</option>
                {originalThemes.length > 0 && (
                  <optgroup label={t('delve.setup.original')}>
                    {originalThemes.map(theme => (
                      <option key={theme.id} value={theme.id}>
                        {theme.icon} {theme.name}
                      </option>
                    ))}
                  </optgroup>
                )}
                {customThemeOptions.length > 0 && (
                  <optgroup label={t('delve.setup.custom')}>
                    {customThemeOptions.map(theme => (
                      <option key={theme.id} value={theme.id}>
                        {theme.icon} {theme.name}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>

            <div className="delve-expedition-field">
              <div className="delve-expedition-field-header">
                <label htmlFor="domain-select">{t('delve.setup.domain')}</label>
                <button
                  className="delve-random-button"
                  onClick={handleRandomDomain}
                  title={t('delve.setup.randomDomain')}
                >
                  <FaDice /> {t('delve.setup.random')}
                </button>
              </div>
              <select
                id="domain-select"
                value={domainId}
                onChange={(e) => setDomainId(e.target.value)}
                className="delve-expedition-select"
              >
                <option value="">{t('delve.setup.domain.placeholder')}</option>
                {originalDomains.length > 0 && (
                  <optgroup label={t('delve.setup.original')}>
                    {originalDomains.map(domain => (
                      <option key={domain.id} value={domain.id}>
                        {domain.icon} {domain.name}
                      </option>
                    ))}
                  </optgroup>
                )}
                {customDomainOptions.length > 0 && (
                  <optgroup label={t('delve.setup.custom')}>
                    {customDomainOptions.map(domain => (
                      <option key={domain.id} value={domain.id}>
                        {domain.icon} {domain.name}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>

            <div className="delve-expedition-field">
              <label htmlFor="rank-select">{t('delve.setup.rank')}</label>
              <select
                id="rank-select"
                value={rank}
                onChange={(e) => setRank(e.target.value as SiteRank)}
                className="delve-expedition-select"
              >
                {rankOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="delve-expedition-actions">
              <button
                className="delve-random-both-button"
                onClick={handleRandomBoth}
                title={t('delve.setup.randomBoth')}
              >
                <FaDice /> {t('delve.setup.randomBoth')}
              </button>
              {isEditing && onUpdate ? (
                <>
                  <button
                    className="delve-save-button"
                    onClick={handleSave}
                    disabled={!themeId || !domainId}
                  >
                    {t('delve.setup.save')}
                  </button>
                  <button
                    className="delve-start-button"
                    onClick={handleStart}
                    disabled={!themeId || !domainId}
                  >
                    {t('delve.setup.newExpedition')}
                  </button>
                </>
              ) : (
                <button
                  className="delve-start-button"
                  onClick={handleStart}
                  disabled={!themeId || !domainId}
                >
                  {t('delve.setup.start')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
