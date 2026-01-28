import type { SiteRank } from '../../types/delve';
import { isProgressComplete, getBoxFillLevel, getProgressForRank } from '../../utils/delveUtils';
import { useI18n } from '../../i18n/context';
import { FaPlus, FaMinus } from 'react-icons/fa';

type ProgressTrackerProps = {
  progress: number;
  rank: SiteRank;
  onAdjustProgress?: (amount: number) => void;
};

export function ProgressTracker({ progress, rank, onAdjustProgress }: ProgressTrackerProps) {
  const { t } = useI18n();
  const maxBoxes = 10;
  const isComplete = isProgressComplete(progress);
  const progressIncrement = getProgressForRank(rank);
  
  const rankLabels: Record<SiteRank, string> = {
    'troublesome': t('delve.rank.troublesome'),
    'dangerous': t('delve.rank.dangerous'),
    'formidable': t('delve.rank.formidable'),
    'extreme': t('delve.rank.extreme'),
    'epic': t('delve.rank.epic')
  };

  const handleIncrement = () => {
    if (onAdjustProgress && progress < 40) {
      onAdjustProgress(progressIncrement);
    }
  };

  const handleDecrement = () => {
    if (onAdjustProgress && progress > 0) {
      onAdjustProgress(-progressIncrement);
    }
  };

  const getBoxSymbol = (fillLevel: number): string => {
    if (fillLevel === 0) return '';
    if (fillLevel === 1) return '│'; // 1 traço vertical
    if (fillLevel === 2) return '╳'; // 2 traços (X)
    if (fillLevel === 3) return '≡'; // 3 traços (três linhas horizontais)
    return '✱'; // 4 traços (asterisco)
  };

  return (
    <div className="delve-progress-tracker">
      <div className="delve-progress-header">
        <div className="delve-progress-header-left">
          <span className="delve-progress-label">{t('delve.progress.label')} {progress}/40</span>
          <span className="delve-rank-label">{t('delve.progress.rank')} {rankLabels[rank]}</span>
        </div>
        {onAdjustProgress && (
          <div className="delve-progress-controls">
            <button
              className="delve-progress-button"
              onClick={handleDecrement}
              disabled={progress === 0}
              title={`Diminuir ${progressIncrement} pontos`}
            >
              <FaMinus />
            </button>
            <button
              className="delve-progress-button"
              onClick={handleIncrement}
              disabled={progress >= 40}
              title={`Aumentar ${progressIncrement} pontos`}
            >
              <FaPlus />
            </button>
          </div>
        )}
      </div>
      <div className="delve-progress-boxes">
        {Array.from({ length: maxBoxes }, (_, i) => {
          const fillLevel = getBoxFillLevel(i, progress);
          const symbol = getBoxSymbol(fillLevel);
          return (
            <div
              key={i}
              className={`delve-progress-box fill-level-${fillLevel} ${isComplete ? 'complete' : ''}`}
              title={`Caixa ${i + 1}: ${fillLevel}/4`}
            >
              {symbol}
            </div>
          );
        })}
      </div>
      {isComplete && (
        <div className="delve-progress-complete">
          {t('delve.progress.complete')}
        </div>
      )}
    </div>
  );
}
