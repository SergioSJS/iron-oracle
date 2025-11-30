import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { OracleTable } from '../../types/datasworn';
import { useI18n } from '../../i18n/context';

type OracleTextProps = {
  text: string;
  originalText?: string; // Texto original em inglês para tooltip
  onOracleClick?: (oracleId: string) => void;
  findOracleById?: (id: string) => OracleTable | null;
};

// Função para parsear texto com links markdown do Datasworn
// Formato: [text](id:path/to/oracle)
export function OracleText({ text, originalText, onOracleClick, findOracleById }: OracleTextProps) {
  const { language } = useI18n();
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const textRef = useRef<HTMLSpanElement>(null);
  
  if (!text) return null;

  // Se está em português e tem texto original diferente, mostrar tooltip
  const shouldShowTooltip = language === 'pt' && originalText && originalText !== text;

  const handleMouseEnter = () => {
    if (!shouldShowTooltip || !textRef.current) return;
    
    const rect = textRef.current.getBoundingClientRect();
    const tooltipHeight = 200;
    const spaceAbove = rect.top;
    
    // Posicionar acima se houver espaço, senão abaixo
    // Com position: fixed, usamos coordenadas da viewport
    // Quando acima, o tooltip usa translateY(-100%), então top = rect.top - 10px (espaçamento)
    // Quando abaixo, top = rect.bottom + 10
    const top = spaceAbove > tooltipHeight 
      ? rect.top - 10
      : rect.bottom + 10;
    
    setTooltipPosition({
      top,
      left: rect.left + (rect.width / 2)
    });
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  // Regex para encontrar links no formato [text](id:path)
  const linkRegex = /\[([^\]]+)\]\(id:([^)]+)\)/g;
  const parts: Array<{ type: 'text' | 'link'; content: string; oracleId?: string }> = [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    // Adiciona texto antes do link
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex, match.index)
      });
    }

    // Adiciona o link
    parts.push({
      type: 'link',
      content: match[1], // texto do link
      oracleId: match[2] // ID do oráculo
    });

    lastIndex = linkRegex.lastIndex;
  }

  // Adiciona texto restante
  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.substring(lastIndex)
    });
  }

  // Se não encontrou links, retorna o texto simples
  if (parts.length === 0) {
    return (
      <>
        <span 
          ref={textRef}
          className={shouldShowTooltip ? 'oracle-text-with-tooltip' : ''}
          onMouseEnter={shouldShowTooltip ? handleMouseEnter : undefined}
          onMouseLeave={shouldShowTooltip ? handleMouseLeave : undefined}
        >
          {text}
        </span>
        {shouldShowTooltip && showTooltip && originalText && (() => {
          const rect = textRef.current?.getBoundingClientRect();
          const spaceAbove = rect ? rect.top : 0;
          const tooltipHeight = 200;
          const isAbove = spaceAbove > tooltipHeight;
          const appContainer = document.querySelector('.app-container');
          const themeClass = appContainer?.classList.contains('theme-starforged') ? 'theme-starforged' : 'theme-ironsworn';
          const bgColor = themeClass === 'theme-starforged' ? '#14141e' : '#1a1410';
          const borderColor = themeClass === 'theme-starforged' ? '#8ba3d4' : '#c9a961';
          const glowColor = themeClass === 'theme-starforged' ? 'rgba(139, 163, 212, 0.5)' : 'rgba(201, 169, 97, 0.5)';
          
          return createPortal(
            <div 
              className={`oracle-tooltip-portal ${themeClass}`}
              style={{
                position: 'fixed',
                top: `${tooltipPosition.top}px`,
                left: `${tooltipPosition.left}px`,
                transform: isAbove ? 'translateX(-50%) translateY(calc(-100% - 10px))' : 'translateX(-50%)',
                zIndex: 10000,
                pointerEvents: 'none',
                backgroundColor: bgColor,
                color: '#d4c4a8',
                border: `2px solid ${borderColor}`,
                padding: '10px 14px',
                borderRadius: '6px',
                fontSize: '13px',
                lineHeight: '1.5',
                whiteSpace: 'pre-wrap',
                maxWidth: '500px',
                minWidth: '250px',
                wordWrap: 'break-word',
                textAlign: 'left',
                boxShadow: `0 4px 16px rgba(0, 0, 0, 1), 0 0 24px ${glowColor}`,
                opacity: 1
              }}
            >
              {originalText}
            </div>,
            document.body
          );
        })()}
      </>
    );
  }

  const content = (
    <>
      {parts.map((part, index) => {
        if (part.type === 'link' && part.oracleId) {
          const oracle = findOracleById?.(part.oracleId);
          const displayName = oracle?.name || part.content;
          
          return (
            <button
              key={index}
              onClick={() => onOracleClick?.(part.oracleId!)}
              style={{
                padding: '2px 6px',
                margin: '0 2px',
                backgroundColor: 'transparent',
                color: '#4a9',
                border: '1px solid #4a9',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: 'inherit',
                fontFamily: 'inherit',
                textDecoration: 'underline',
                transition: 'all 0.2s',
                display: 'inline-block'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#4a9';
                e.currentTarget.style.color = '#1a1a1a';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#4a9';
              }}
              title={`Rolar: ${displayName}`}
            >
              {part.content}
            </button>
          );
        }
        return <span key={index}>{part.content}</span>;
      })}
    </>
  );

  // Se tem tooltip, envolver todo o conteúdo
  if (shouldShowTooltip) {
    return (
      <>
        <span 
          ref={textRef}
          className="oracle-text-with-tooltip"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {content}
        </span>
        {showTooltip && originalText && (() => {
          const rect = textRef.current?.getBoundingClientRect();
          const spaceAbove = rect ? rect.top : 0;
          const tooltipHeight = 200;
          const isAbove = spaceAbove > tooltipHeight;
          const appContainer = document.querySelector('.app-container');
          const themeClass = appContainer?.classList.contains('theme-starforged') ? 'theme-starforged' : 'theme-ironsworn';
          const bgColor = themeClass === 'theme-starforged' ? '#14141e' : '#1a1410';
          const borderColor = themeClass === 'theme-starforged' ? '#8ba3d4' : '#c9a961';
          const glowColor = themeClass === 'theme-starforged' ? 'rgba(139, 163, 212, 0.5)' : 'rgba(201, 169, 97, 0.5)';
          
          return createPortal(
            <div 
              className={`oracle-tooltip-portal ${themeClass}`}
              style={{
                position: 'fixed',
                top: `${tooltipPosition.top}px`,
                left: `${tooltipPosition.left}px`,
                transform: isAbove ? 'translateX(-50%) translateY(calc(-100% - 10px))' : 'translateX(-50%)',
                zIndex: 10000,
                pointerEvents: 'none',
                backgroundColor: bgColor,
                color: '#d4c4a8',
                border: `2px solid ${borderColor}`,
                padding: '10px 14px',
                borderRadius: '6px',
                fontSize: '13px',
                lineHeight: '1.5',
                whiteSpace: 'pre-wrap',
                maxWidth: '500px',
                minWidth: '250px',
                wordWrap: 'break-word',
                textAlign: 'left',
                boxShadow: `0 4px 16px rgba(0, 0, 0, 1), 0 0 24px ${glowColor}`,
                opacity: 1
              }}
            >
              {originalText}
            </div>,
            document.body
          );
        })()}
      </>
    );
  }

  return content;
}

