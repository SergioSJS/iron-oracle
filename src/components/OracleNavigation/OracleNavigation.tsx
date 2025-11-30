import { OracleNavigator } from './OracleNavigator';
import { OracleShortcuts } from '../OracleShortcuts/OracleShortcuts';
import type { OracleTable, GameMode, StarforgedRegion } from '../../types/datasworn';
import { hasRegionStructure } from '../../utils/oracleUtils';
import { splitOraclesIntoColumns } from '../../utils/oracleDataUtils';
import type { ShortcutDefinition } from '../../utils/oracleShortcuts';

type OracleNavigationProps = {
  oracles: any[];
  rollOracle: (name: string, table: OracleTable, parentLogId?: number, region?: StarforgedRegion) => void;
  findOracleById: (id: string) => OracleTable | null;
  rollMultipleOracles: (shortcut: ShortcutDefinition, region?: StarforgedRegion) => void;
  allGroupsOpen: boolean;
  selectedRegion: StarforgedRegion;
  gameMode: GameMode;
};

export function OracleNavigation({
  oracles,
  rollOracle,
  findOracleById,
  rollMultipleOracles,
  allGroupsOpen,
  selectedRegion,
  gameMode
}: OracleNavigationProps) {
  const { left, right } = splitOraclesIntoColumns(oracles);

  return (
    <div className="oracle-navigation-columns">
      <section className="oracle-section">
        <div className="oracle-list-container">
          <OracleShortcuts
            rollMultipleOracles={rollMultipleOracles}
            gameMode={gameMode}
            selectedRegion={selectedRegion}
            defaultOpen={allGroupsOpen}
          />
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

