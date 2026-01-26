import { useEffect, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { useI18n } from '../../i18n/context';
import '../../styles/modals.css';

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangelogModal = ({ isOpen, onClose }: ChangelogModalProps) => {
  const { t } = useI18n();
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen) {
      fetch('/iron-oracle/CHANGELOG.md')
        .then(response => response.text())
        .then(text => {
          setContent(text);
          setLoading(false);
        })
        .catch(() => {
          setContent(t('changelogError'));
          setLoading(false);
        });
    }
  }, [isOpen, t]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!isOpen) return null;



  const parseBold = (line: string) => {
    const parts = line.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) => 
      i % 2 === 1 ? <strong key={i}>{part}</strong> : part
    );
  };

  const parseMarkdown = (text: string) => {
    const lines = text.split('\n');
    const elements = [];
    let key = 0;
    let currentList: React.ReactNode[] = [];

    const flushList = () => {
      if (currentList.length > 0) {
        elements.push(<ul key={key++}>{currentList}</ul>);
        currentList = [];
      }
    };

    for (const line of lines) {
      if (line.startsWith('# ')) {
        flushList();
        elements.push(<h1 key={key++}>{parseBold(line.substring(2))}</h1>);
      } else if (line.startsWith('## ')) {
        flushList();
        elements.push(<h2 key={key++}>{parseBold(line.substring(3))}</h2>);
      } else if (line.startsWith('### ')) {
        flushList();
        elements.push(<h3 key={key++}>{parseBold(line.substring(4))}</h3>);
      } else if (line.startsWith('#### ')) {
        flushList();
        elements.push(<h4 key={key++}>{parseBold(line.substring(5))}</h4>);
      } else if (line.startsWith('- ')) {
        currentList.push(<li key={key++}>{parseBold(line.substring(2))}</li>);
      } else if (line.startsWith('---')) {
        flushList();
        elements.push(<hr key={key++} />);
      } else if (line.trim()) {
        flushList();
        elements.push(<p key={key++}>{parseBold(line)}</p>);
      } else {
        flushList();
      }
    }

    flushList();
    return elements;
  };

  return (
    <div 
      className="changelog-modal-overlay active"
      onClick={onClose}
    >
      <div 
        className="changelog-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="changelog-modal-header">
          <h3>{t('changelog')}</h3>
          <button 
            className="changelog-modal-close"
            onClick={onClose}
            aria-label={t('close')}
          >
            <FaTimes />
          </button>
        </div>
        <div className="changelog-modal-body">
          {loading ? (
            <p>{t('loading')}...</p>
          ) : (
            <div className="markdown-content">
              {parseMarkdown(content)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
