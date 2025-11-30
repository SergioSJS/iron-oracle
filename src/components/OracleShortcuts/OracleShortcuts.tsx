import { useState, useRef, useEffect } from 'react';
import type { StarforgedRegion, GameMode } from '../../types/datasworn';
import { useI18n } from '../../i18n/context';
import { 
  IRONSWORN_SHORTCUTS, 
  STARFORGED_SHORTCUTS,
  type ShortcutDefinition,
  getShortcutIcon
} from '../../utils/oracleShortcuts';

type OracleShortcutsProps = {
  rollMultipleOracles: (shortcut: ShortcutDefinition, region?: StarforgedRegion) => void;
  gameMode: GameMode;
  selectedRegion: StarforgedRegion;
  defaultOpen?: boolean;
};

export function OracleShortcuts({
  rollMultipleOracles,
  gameMode,
  selectedRegion,
  defaultOpen = false
}: OracleShortcutsProps) {
  const { t } = useI18n();
  const shortcuts = gameMode === 'ironsworn' ? IRONSWORN_SHORTCUTS : STARFORGED_SHORTCUTS;
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    if (detailsRef.current) {
      detailsRef.current.open = defaultOpen;
      setIsOpen(defaultOpen);
    }
  }, [defaultOpen]);

  if (shortcuts.length === 0) return null;

  const shortcutTitle = t('shortcuts.title') || 'Atalhos';
  const shortcutIcon = getShortcutIcon(shortcutTitle, gameMode);

  return (
    <div className="oracle-category">
      <details 
        ref={detailsRef}
        open={isOpen}
        className="oracle-details"
        onToggle={(e) => {
          const target = e.currentTarget;
          setIsOpen(target.open);
        }}
      >
        <summary
          onClick={(e) => {
            e.preventDefault();
            const newState = !isOpen;
            setIsOpen(newState);
            if (detailsRef.current) {
              detailsRef.current.open = newState;
            }
          }}
          className="oracle-summary"
        >
          <span className="category-icon">{isOpen ? '▼' : '▶'}</span>
          <span className="category-icon-oracle">{shortcutIcon}</span>
          <span className="category-name">{shortcutTitle}</span>
        </summary>
        
        {isOpen && (
          <div className="oracle-children">
            {shortcuts.map((shortcut, index) => {
              const icon = getShortcutIcon(shortcut.name, gameMode);
              return (
                <div key={index} className="oracle-item" style={{ marginLeft: '4px' }}>
                  <button
                    onClick={() => rollMultipleOracles(shortcut, selectedRegion)}
                    className="oracle-roll-btn"
                    title={shortcut.name}
                  >
                    <span className="dice-icon">{icon}</span>
                    <span className="oracle-name">{shortcut.name}</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </details>
    </div>
  );
}

