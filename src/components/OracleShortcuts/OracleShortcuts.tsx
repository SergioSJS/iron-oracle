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
  
  // Carregar estado inicial do LocalStorage
  // Se não houver valor no localStorage, usar defaultOpen
  const storageKey = 'shortcutsExpanded';
  const [isOpen, setIsOpen] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      console.log(`🔍 [OracleShortcuts] Inicializando:`, {
        storageKey,
        saved,
        defaultOpen,
        willUseSaved: saved !== null,
        finalValue: saved !== null ? saved === 'true' : defaultOpen
      });
      if (saved !== null) {
        // Se há valor salvo, usar ele
        return saved === 'true';
      }
    } catch (e) {
      // Se houver erro ao acessar localStorage, continuar
      console.warn('Erro ao acessar localStorage:', e);
    }
    // Se não há estado salvo, usar defaultOpen
    return defaultOpen;
  });
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const skipNextToggle = useRef(false);
  const justSavedFromClick = useRef(false);
  const prevDefaultOpen = useRef<boolean | undefined>(undefined);

  // Sincronizar o elemento details com o estado inicial na montagem
  useEffect(() => {
    if (detailsRef.current) {
      console.log(`🔧 [OracleShortcuts] Sincronizando details na montagem:`, {
        isOpen,
        detailsOpen: detailsRef.current.open,
        willSetTo: isOpen
      });
      // Marcar para ignorar o próximo onToggle (que será disparado pela mudança do open)
      skipNextToggle.current = true;
      detailsRef.current.open = isOpen;
      // Resetar a flag após um pequeno delay
      setTimeout(() => {
        skipNextToggle.current = false;
      }, 100);
    }
  }, []); // Apenas na montagem inicial

  // Atualizar quando defaultOpen mudar externamente (botão expandir/colapsar todos)
  // Mas apenas se não for a montagem inicial
  useEffect(() => {
    // Na primeira montagem, apenas salvar o defaultOpen atual e não fazer nada
    if (prevDefaultOpen.current === undefined) {
      prevDefaultOpen.current = defaultOpen;
      console.log(`🚫 [OracleShortcuts] Primeira montagem, ignorando defaultOpen`);
      return;
    }

    // Só atualizar se defaultOpen realmente mudou
    if (prevDefaultOpen.current === defaultOpen) {
      return;
    }

    prevDefaultOpen.current = defaultOpen;

    // Quando defaultOpen muda (ex: botão expandir/colapsar todos), atualizar
    console.log(`🌐 [OracleShortcuts] defaultOpen mudou:`, {
      defaultOpen,
      currentIsOpen: isOpen
    });
    setIsOpen(defaultOpen);
    if (detailsRef.current) {
      skipNextToggle.current = true;
      detailsRef.current.open = defaultOpen;
      setTimeout(() => {
        skipNextToggle.current = false;
      }, 100);
    }
    // Salvar no LocalStorage quando mudado pelo botão global
    localStorage.setItem(storageKey, String(defaultOpen));
  }, [defaultOpen, storageKey]);

  // Salvar estado no LocalStorage quando mudar manualmente (clicando no grupo)
  const handleToggle = (e: MouseEvent) => {
    e.preventDefault();
    const newState = !isOpen;
    console.log(`🖱️ [OracleShortcuts] Click no summary:`, {
      oldState: isOpen,
      newState,
      storageKey
    });
    setIsOpen(newState);
    if (detailsRef.current) {
      detailsRef.current.open = newState;
    }
    // Marcar que já salvamos do click, para o onToggle não salvar novamente
    justSavedFromClick.current = true;
    // Salvar no LocalStorage
    try {
      localStorage.setItem(storageKey, String(newState));
      console.log(`💾 [OracleShortcuts] Salvo no localStorage ${storageKey}:`, newState);
    } catch (e) {
      console.error(`❌ [OracleShortcuts] Erro ao salvar no localStorage:`, e);
    }
    // Resetar a flag após um pequeno delay
    setTimeout(() => {
      justSavedFromClick.current = false;
    }, 100);
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
          // Ignorar se for a montagem inicial ou mudança programática
          if (skipNextToggle.current) {
            console.log(`⏭️ [OracleShortcuts] Ignorando onToggle (mudança programática)`);
            return;
          }
          
          // Ignorar se já salvamos do onClick
          if (justSavedFromClick.current) {
            console.log(`⏭️ [OracleShortcuts] Ignorando onToggle (já salvo do onClick)`);
            return;
          }
          
          const target = e.currentTarget;
          // Só processar se o estado realmente mudou
          if (target.open === isOpen) {
            console.log(`⏭️ [OracleShortcuts] Ignorando onToggle (estado não mudou)`);
            return;
          }
          
          console.log(`🔄 [OracleShortcuts] onToggle:`, {
            oldState: isOpen,
            newState: target.open,
            storageKey
          });
          setIsOpen(target.open);
          // Salvar no LocalStorage quando mudar (apenas se não foi do onClick)
          try {
            localStorage.setItem(storageKey, String(target.open));
            console.log(`💾 [OracleShortcuts] Salvo no localStorage ${storageKey}:`, target.open);
          } catch (e) {
            console.error(`❌ [OracleShortcuts] Erro ao salvar no localStorage:`, e);
          }
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
              const translatedName = t(shortcut.nameKey) || shortcut.name;
              const icon = getShortcutIcon(translatedName, gameMode);
              return (
                <div key={index} className="oracle-item" style={{ marginLeft: '4px' }}>
                  <button
                    onClick={() => rollMultipleOracles(shortcut, selectedRegion)}
                    className="oracle-roll-btn"
                    title={translatedName}
                  >
                    <span className="dice-icon">{icon}</span>
                    <span className="oracle-name">{translatedName}</span>
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

