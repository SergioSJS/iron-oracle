import { OracleNavigator } from './OracleNavigator';
import type { OracleTable, GameMode, StarforgedRegion } from '../../types/datasworn';
import { hasRegionStructure } from '../../utils/oracleUtils';
import { splitOraclesIntoColumns } from '../../utils/oracleDataUtils';

type OracleNavigationProps = {
  oracles: any[];
  rollOracle: (name: string, table: OracleTable, parentLogId?: number, region?: StarforgedRegion) => void;
  findOracleById: (id: string) => OracleTable | null;
  allGroupsOpen: boolean;
  selectedRegion: StarforgedRegion;
  gameMode: GameMode;
};

export function OracleNavigation({
  oracles,
  rollOracle,
  findOracleById,
  allGroupsOpen,
  selectedRegion,
  gameMode
}: OracleNavigationProps) {
  const { left, right } = splitOraclesIntoColumns(oracles);

  return (
    <div className="oracle-navigation-columns">
      <section className="oracle-section">
        <div className="oracle-list-container">
          {left.map((oracle: any) => (
            <OracleNavigator
              key={`${oracle._id}-${allGroupsOpen}`}
              data={oracle}
              rollOracle={rollOracle}
              findOracleById={findOracleById}
              defaultOpen={allGroupsOpen}
              hasRegionStructure={hasRegionStructure}
              selectedRegion={selectedRegion}
              gameMode={gameMode}
            />
          ))}
        </div>
      </section>
      
      <section className="oracle-section">
        <div className="oracle-list-container">
          {right.map((oracle: any) => (
            <OracleNavigator
              key={`${oracle._id}-${allGroupsOpen}`}
              data={oracle}
              rollOracle={rollOracle}
              findOracleById={findOracleById}
              defaultOpen={allGroupsOpen}
              hasRegionStructure={hasRegionStructure}
              selectedRegion={selectedRegion}
              gameMode={gameMode}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

