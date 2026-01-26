import { useI18n } from '../../i18n/context';
import { FaGithub, FaNewspaper } from 'react-icons/fa';

interface FooterProps {
  onShowChangelog: () => void;
}

export function Footer({ onShowChangelog }: FooterProps) {
  const { t } = useI18n();

  return (
    <footer className="app-footer">
      <p>
        {t('footer.dataFrom')}{' '}
        <a 
          href="https://datasworn.netlify.app/" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          Datasworn
        </a>
        {', '}
        {t('footer.createdBy')}{' '}
        <a 
          href="https://www.ironswornrpg.com/" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          Shawn Tomkin
        </a>
      </p>
      <div className="footer-links">
        <button 
          onClick={onShowChangelog}
          className="changelog-link"
          title={t('changelog')}
        >
          <FaNewspaper /> {t('changelog.button')}
        </button>
        <a 
          href="https://github.com/sergioroeder/iron-oracle" 
          target="_blank" 
          rel="noopener noreferrer"
          className="github-link"
          title="GitHub"
        >
          <FaGithub />
        </a>
      </div>
    </footer>
  );
}
