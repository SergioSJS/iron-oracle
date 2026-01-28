import { useState } from 'react';
import type { SiteRank } from '../../types/delve';
import { useCustomDelveData } from '../../hooks/useCustomDelveData';
import { useI18n } from '../../i18n/context';
import { translateOracleName } from '../../i18n/oracleTranslations';
import { getCustomName } from '../../utils/customDelveTranslations';
import { getOracleIcon } from '../../utils/oracleIcons';

type SiteSetupProps = {
  onStart: (themeId: string, domainId: string, rank: SiteRank) => void;
  currentThemeId?: string;
  currentDomainId?: string;
  currentRank?: SiteRank;
};

export function SiteSetup({ onStart, currentThemeId, currentDomainId, currentRank }: SiteSetupProps) {
  const { t, language } = useI18n();
  const { themes, domains } = useCustomDelveData();
  const [themeId, setThemeId] = useState(currentThemeId || '');
  const [domainId, setDomainId] = useState(currentDomainId || '');
  const [rank, setRank] = useState<SiteRank>(currentRank || 'dangerous');

  const themeOptions = Object.entries(themes).map(([id, theme]: [string, any]) => ({
    id,
    name: getCustomName(
      theme,
      `delve/site_themes/${id}`,
      language,
      translateOracleName
    ),
    icon: getOracleIcon(`delve/site_themes/${id}`, theme.name || id)
  }));

  const domainOptions = Object.entries(domains).map(([id, domain]: [string, any]) => ({
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

  const handleStart = () => {
    if (themeId && domainId) {
      onStart(themeId, domainId, rank);
    }
  };

  return (
    <div className="delve-site-setup">
      <h3>{t('delve.setup.title')}</h3>
      <div className="delve-setup-form">
        <div className="delve-setup-field">
          <label htmlFor="theme-select">{t('delve.setup.theme')}</label>
          <select
            id="theme-select"
            value={themeId}
            onChange={(e) => setThemeId(e.target.value)}
          >
            <option value="">{t('delve.setup.theme.placeholder')}</option>
            {themeOptions.map(theme => (
              <option key={theme.id} value={theme.id}>
                {theme.name}
              </option>
            ))}
          </select>
        </div>

        <div className="delve-setup-field">
          <label htmlFor="domain-select">{t('delve.setup.domain')}</label>
          <select
            id="domain-select"
            value={domainId}
            onChange={(e) => setDomainId(e.target.value)}
          >
            <option value="">{t('delve.setup.domain.placeholder')}</option>
            {domainOptions.map(domain => (
              <option key={domain.id} value={domain.id}>
                {domain.name}
              </option>
            ))}
          </select>
        </div>

        <div className="delve-setup-field">
          <label htmlFor="rank-select">{t('delve.setup.rank')}</label>
          <select
            id="rank-select"
            value={rank}
            onChange={(e) => setRank(e.target.value as SiteRank)}
          >
            {rankOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <button
          className="delve-start-button"
          onClick={handleStart}
          disabled={!themeId || !domainId}
        >
          {t('delve.setup.start')}
        </button>
      </div>
    </div>
  );
}
