import type { LogEntry } from '../types/datasworn';

/**
 * Formata um log entry como texto simples
 */
export function formatLogAsText(log: LogEntry, includeChildren: boolean = true): string {
  const isShortcut = log.roll === 0 && !log.result && log.childRolls && log.childRolls.length > 0;
  
  let text = '';
  
  if (!isShortcut) {
    text += `${log.oracleName}\n`;
    text += `Rolled: ${log.roll}\n`;
    text += `Result: ${log.result}\n`;
  } else {
    text += `${log.oracleName}\n`;
  }
  
  if (includeChildren && log.childRolls && log.childRolls.length > 0) {
    text += '\n';
    log.childRolls.forEach((child, index) => {
      if (index > 0) text += '\n';
      text += `  ${child.oracleName}: ${child.result} (${child.roll})\n`;
    });
  }
  
  return text;
}

/**
 * Formata múltiplos logs como texto simples
 */
export function formatLogsAsText(logs: LogEntry[]): string {
  return logs.map((log) => {
    const timestamp = new Date(log.timestamp).toLocaleString();
    return `[${timestamp}]\n${formatLogAsText(log)}`;
  }).join('\n---\n\n');
}

/**
 * Formata múltiplos logs como markdown
 */
export function formatLogsAsMarkdown(logs: LogEntry[]): string {
  return logs.map((log) => {
    const timestamp = new Date(log.timestamp).toLocaleString();
    const isShortcut = log.roll === 0 && !log.result && log.childRolls && log.childRolls.length > 0;
    
    let md = `## ${log.oracleName}\n\n`;
    md += `*${timestamp}*\n\n`;
    
    if (!isShortcut) {
      md += `**Rolled:** ${log.roll}  \n`;
      md += `**Result:** ${log.result}\n\n`;
    }
    
    if (log.childRolls && log.childRolls.length > 0) {
      log.childRolls.forEach(child => {
        md += `- **${child.oracleName}:** ${child.result} (${child.roll})\n`;
      });
      md += '\n';
    }
    
    return md;
  }).join('---\n\n');
}
