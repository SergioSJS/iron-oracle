import { useState, useRef, useEffect, type MouseEvent } from 'react';
import type { StarforgedRegion, GameMode } from '../../types/datasworn';
import { useI18n } from '../../i18n/context';
import { 
  IRONSWORN_SHORTCUTS, 
  STARFORGED_SHORTCUTS,
  type ShortcutDefinition,
  getShortcutIcon
} from '../../utils/oracleShortcuts';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';

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
  
  // Carregar estado inicial: priorizar defaultOpen (vem de allGroupsOpen), senão LocalStorage
  const [isOpen, setIsOpen] = useState(() => {
    // Se allGroupsOpen está salvo no LocalStorage, usar ele
    // Caso contrário, verificar estado individual do grupo de atalhos
    const allGroupsSaved = localStorage.getItem('allGroupsOpen');
    if (allGroupsSaved !== null) {
      // Se há um estado global salvo, usar ele
      return allGroupsSaved === 'true';
    }
    // Se não há estado global, verificar estado individual
    const saved = localStorage.getItem('shortcutsExpanded');
    return saved !== null ? saved === 'true' : defaultOpen;
  });
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    // Quando defaultOpen muda (ex: botão expandir/colapsar todos), atualizar
    if (detailsRef.current) {
      detailsRef.current.open = defaultOpen;
      setIsOpen(defaultOpen);
    }
  }, [defaultOpen]);

  // Salvar estado no LocalStorage quando mudar manualmente (clicando no grupo)
  const handleToggle = (e: MouseEvent) => {
    e.preventDefault();
    const newState = !isOpen;
    setIsOpen(newState);
    if (detailsRef.current) {
      detailsRef.current.open = newState;
    }
    // Salvar no LocalStorage
    localStorage.setItem('shortcutsExpanded', String(newState));
  };

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
          onClick={handleToggle}
          className="oracle-summary"
        >
          <span className="category-icon">{isOpen ? <FaChevronDown /> : <FaChevronRight />}</span>
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

