import { RollLog } from '../RollLog/RollLog';
import type { LogEntry, OracleTable } from '../../types/datasworn';
import { useI18n } from '../../i18n/context';
import { FaTimes, FaTrash } from 'react-icons/fa';

type LogModalProps = {
  isOpen: boolean;
  onClose: () => void;
  logs: LogEntry[];
  onRollAgain: (oracleId: string) => void;
  findOracleById: (id: string) => OracleTable | null;
  onClearLog: () => void;
};

export function LogModal({
  isOpen,
  onClose,
  logs,
  onRollAgain,
  findOracleById,
  onClearLog
}: LogModalProps) {
  const { t } = useI18n();
  
  if (!isOpen) return null;

  return (
    <div 
      className={`log-modal-overlay active`}
      onClick={onClose}
    >
      <div 
        className="log-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="log-modal-header">
          <h3>{t('modal.log.title')}</h3>
          <div className="log-modal-header-actions">
            <button 
              onClick={onClearLog}
              className="log-modal-clear"
              title={t('log.clear')}
            >
              <FaTrash />
            </button>
            <button 
              className="log-modal-close"
              onClick={onClose}
            >
              <FaTimes />
            </button>
          </div>
        </div>
        <RollLog 
          logs={logs} 
          onRollAgain={onRollAgain}
          findOracleById={findOracleById}
        />
      </div>
    </div>
  );
}

