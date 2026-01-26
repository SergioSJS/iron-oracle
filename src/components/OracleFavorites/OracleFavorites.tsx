import { useI18n } from '../../i18n/context';
import { translateOracleName } from '../../i18n/oracleTranslations';
import { getOracleIcon } from '../../utils/oracleIcons';
import type { OracleTable, GameMode, StarforgedRegion } from '../../types/datasworn';
import { FaStar } from 'react-icons/fa';

type OracleFavoritesProps = {
  favorites: Set<string>;
  findOracleById: (id: string) => OracleTable | null;
  rollOracle: (name: string, table: OracleTable, parentLogId?: number, region?: StarforgedRegion) => void;
  selectedRegion: StarforgedRegion;
  gameMode: GameMode;
  toggleFavorite: (oracleId: string) => void;
};

export function OracleFavorites({
  favorites,
  findOracleById,
  rollOracle,
  selectedRegion,
  toggleFavorite
}: OracleFavoritesProps) {
  const { t, language } = useI18n();

  if (favorites.size === 0) {
    return null;
  }

  const favoriteOracles = Array.from(favorites)
    .map(id => findOracleById(id))
    .filter(Boolean) as OracleTable[];

  if (favoriteOracles.length === 0) {
    return null;
  }

  return (
    <div className="oracle-favorites">
      <div className="oracle-favorites-header">
        <h3>
          <FaStar /> {t('favorites.title')}
        </h3>
      </div>
      <div className="oracle-favorites-list">
        {favoriteOracles.map(oracle => (
          <div key={oracle._id} className="oracle-favorite-item">
            <button
              className="oracle-favorite-roll"
              onClick={() => rollOracle(oracle.name, oracle, undefined, selectedRegion)}
            >
              <span className="dice-icon">{getOracleIcon(oracle._id, oracle.name)}</span>
              <span className="oracle-name">
                {translateOracleName(oracle._id, oracle.name, language)}
              </span>
            </button>
            <button
              className="oracle-favorite-star active"
              onClick={() => toggleFavorite(oracle._id)}
              title={t('favorites.remove')}
            >
              <FaStar />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
