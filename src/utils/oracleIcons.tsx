import { 
  FaDice, FaUser, FaMapMarkerAlt, FaCity, FaBook, FaSkull, FaMountain,
  FaTree, FaWater, FaFire, FaSnowflake, FaRocket, FaShip, FaGem,
  FaUsers, FaFlag, FaCompass, FaStar,
  FaCloud, FaLeaf, FaBolt, FaShieldAlt, FaCrosshairs,
  FaEye, FaHandRock, FaQuestionCircle,
  FaThermometerEmpty, FaThermometerQuarter, FaThermometerHalf,
  FaThermometerThreeQuarters, FaThermometerFull
} from 'react-icons/fa';
import { 
  GiPlanetCore, GiAlienBug, GiSpaceship,
  GiDesert, GiJungle, GiMountainCave,
  GiGraveyard, GiGasMask, GiFlowerPot, GiCastle, GiVillage,
  GiRiver, GiCaveEntrance, GiAncientRuins
} from 'react-icons/gi';
import { 
  MdLocationOn,
  MdTerrain
} from 'react-icons/md';
import type { ReactElement } from 'react';

/**
 * Mapeia IDs de oráculos para ícones apropriados
 */
export function getOracleIcon(oracleId: string, oracleName: string): ReactElement {
  const id = oracleId.toLowerCase();
  const name = oracleName.toLowerCase();

  // Ironsworn - Action & Theme
  if (id.includes('action_and_theme') || id.includes('action') || name.includes('ação') || name.includes('action')) {
    return <FaHandRock />;
  }
  if (id.includes('theme') || name.includes('tema') || name.includes('theme')) {
    return <FaStar />;
  }

  // Characters / Personagens
  if (id.includes('character') || id.includes('personagem') || name.includes('personagem') || name.includes('character')) {
    if (id.includes('pronoun') || name.includes('pronome')) return <FaUser />;
    if (id.includes('name') || name.includes('nome')) return <FaUser />;
    return <FaUsers />;
  }

  // Places / Lugares
  if (id.includes('place') || name.includes('lugar') || name.includes('place')) {
    if (id.includes('coast') || name.includes('costa')) return <FaWater />;
    if (id.includes('forest') || name.includes('floresta')) return <FaTree />;
    if (id.includes('mountain') || name.includes('montanha')) return <FaMountain />;
    if (id.includes('river') || name.includes('rio')) return <GiRiver />;
    if (id.includes('ruin') || name.includes('ruína')) return <GiAncientRuins />;
    return <FaMapMarkerAlt />;
  }

  // Settlement / Assentamento
  if (id.includes('settlement') || name.includes('assentamento') || name.includes('settlement')) {
    if (id.includes('name') || name.includes('nome')) return <FaCity />;
    if (id.includes('type') || name.includes('tipo')) return <GiVillage />;
    return <GiCastle />;
  }

  // Names / Nomes
  if (id.includes('name') || name.includes('nome')) {
    if (id.includes('elf') || name.includes('elfo')) return <FaLeaf />;
    if (id.includes('giant') || name.includes('gigante')) return <FaMountain />;
    if (id.includes('troll') || name.includes('troll')) return <FaSkull />;
    return <FaUser />;
  }

  // Moves / Movimentos
  if (id.includes('move') || name.includes('movimento') || name.includes('move')) {
    // Ask the Oracle - ícones de termômetro representando probabilidade
    // Verificar primeiro os sub-oráculos específicos antes do genérico
    if (id.includes('ask_the_oracle/almost_certain') || (id.includes('ask_the_oracle') && (name.includes('quase certo') || name.includes('almost certain')))) {
      return <FaThermometerFull />; // Termômetro cheio - alta probabilidade (90%+)
    }
    if (id.includes('ask_the_oracle/likely') || (id.includes('ask_the_oracle') && (name.includes('provável') || name.includes('likely')))) {
      return <FaThermometerThreeQuarters />; // 3/4 cheio - probabilidade alta (75%)
    }
    if (id.includes('ask_the_oracle/fifty_fifty') || (id.includes('ask_the_oracle') && (name.includes('50/50') || name.includes('fifty fifty') || name.includes('cinquenta')))) {
      return <FaThermometerHalf />; // Meio cheio - 50%
    }
    if (id.includes('ask_the_oracle/unlikely') || (id.includes('ask_the_oracle') && (name.includes('improvável') || name.includes('unlikely')))) {
      return <FaThermometerQuarter />; // 1/4 cheio - probabilidade baixa (25%)
    }
    if (id.includes('ask_the_oracle/small_chance') || (id.includes('ask_the_oracle') && (name.includes('pequena chance') || name.includes('small chance')))) {
      return <FaThermometerEmpty />; // Vazio - probabilidade muito baixa (10%)
    }
    if (id.includes('ask_the_oracle') || name.includes('pergunte ao oráculo')) {
      return <FaQuestionCircle />;
    }
    if (id.includes('pay_the_price') || name.includes('pague o preço')) return <FaSkull />;
    if (id.includes('endure') || name.includes('suportar')) return <FaShieldAlt />;
    return <FaCrosshairs />;
  }

  // Turning Point / Ponto de Virada
  if (id.includes('turning_point') || name.includes('ponto de virada')) {
    if (id.includes('combat') || name.includes('combate')) return <FaCrosshairs />;
    if (id.includes('mystic') || name.includes('místico')) return <FaBolt />;
    return <FaStar />;
  }

  // Starforged - Core
  if (id.includes('core')) {
    if (id.includes('action')) return <FaHandRock />;
    if (id.includes('theme')) return <FaStar />;
    if (id.includes('descriptor')) return <FaEye />;
    if (id.includes('focus')) return <FaCrosshairs />;
    return <FaDice />;
  }

  // Planets / Planetas
  if (id.includes('planet') || name.includes('planeta')) {
    if (id.includes('class') || name.includes('classe')) return <GiPlanetCore />;
    if (id.includes('desert') || name.includes('deserto')) return <GiDesert />;
    if (id.includes('furnace') || name.includes('fornalha')) return <FaFire />;
    if (id.includes('grave') || name.includes('túmulo')) return <GiGraveyard />;
    if (id.includes('ice') || name.includes('gelo')) return <FaSnowflake />;
    if (id.includes('jovian') || name.includes('joviano')) return <GiGasMask />;
    if (id.includes('jungle') || name.includes('selva')) return <GiJungle />;
    if (id.includes('ocean') || name.includes('oceano')) return <FaWater />;
    if (id.includes('rocky') || name.includes('rochoso')) return <FaMountain />;
    if (id.includes('shattered') || name.includes('estilhaçado')) return <FaSnowflake />;
    if (id.includes('tainted') || name.includes('contaminado')) return <GiGasMask />;
    if (id.includes('vital') || name.includes('vital')) return <GiFlowerPot />;
    if (id.includes('atmosphere')) return <FaCloud />;
    if (id.includes('life')) return <GiAlienBug />;
    if (id.includes('feature')) return <FaEye />;
    if (id.includes('peril')) return <FaSkull />;
    if (id.includes('opportunity')) return <FaStar />;
    return <GiPlanetCore />;
  }

  // Space / Espaço
  if (id.includes('space') || name.includes('espaço')) {
    if (id.includes('sighting') || name.includes('avistamento')) return <FaEye />;
    if (id.includes('sector') || name.includes('setor')) return <FaCompass />;
    if (id.includes('stellar') || name.includes('estelar')) return <FaStar />;
    return <FaRocket />;
  }

  // Starships / Naves
  if (id.includes('starship') || id.includes('ship') || name.includes('nave') || name.includes('starship')) {
    if (id.includes('name') || name.includes('nome')) return <FaRocket />;
    if (id.includes('class') || name.includes('classe')) return <GiSpaceship />;
    return <FaRocket />;
  }

  // Derelicts / Naufrágios
  if (id.includes('derelict') || name.includes('naufrágio')) {
    if (id.includes('location')) return <MdLocationOn />;
    if (id.includes('access')) return <GiCaveEntrance />;
    if (id.includes('feature')) return <FaEye />;
    if (id.includes('peril')) return <FaSkull />;
    if (id.includes('opportunity')) return <FaStar />;
    return <FaShip />;
  }

  // Vaults / Cofres
  if (id.includes('vault') || name.includes('cofre')) {
    if (id.includes('form') || id.includes('shape')) return <FaGem />;
    if (id.includes('material')) return <FaGem />;
    if (id.includes('interior')) return <GiMountainCave />;
    if (id.includes('sanctum')) return <FaGem />;
    if (id.includes('peril')) return <FaSkull />;
    if (id.includes('opportunity')) return <FaStar />;
    return <FaGem />;
  }

  // Creatures / Criaturas
  if (id.includes('creature') || name.includes('criatura')) {
    if (id.includes('form') || name.includes('forma')) return <GiAlienBug />;
    if (id.includes('aspect') || name.includes('aspecto')) return <FaEye />;
    return <GiAlienBug />;
  }

  // Factions / Facções
  if (id.includes('faction') || name.includes('facção')) {
    if (id.includes('type') || name.includes('tipo')) return <FaFlag />;
    if (id.includes('influence')) return <FaUsers />;
    return <FaFlag />;
  }

  // Location Themes / Temas de Localização
  if (id.includes('location_theme') || name.includes('tema de localização')) {
    return <MdTerrain />;
  }

  // Campaign Launch / Início de Campanha
  if (id.includes('campaign_launch') || name.includes('início de campanha')) {
    if (id.includes('background')) return <FaBook />;
    if (id.includes('backstory')) return <FaBook />;
    if (id.includes('starship')) return <FaRocket />;
    if (id.includes('sector')) return <FaCompass />;
    if (id.includes('inciting')) return <FaBolt />;
    return <FaRocket />;
  }

  // Misc / Diversos
  if (id.includes('misc') || name.includes('diversos')) {
    if (id.includes('complication') || name.includes('complicação')) return <FaSkull />;
    if (id.includes('clue') || name.includes('pista')) return <FaEye />;
    if (id.includes('anomaly') || name.includes('anomalia')) return <FaBolt />;
    if (id.includes('combat') || name.includes('combate')) return <FaCrosshairs />;
    return <FaDice />;
  }

  // Default
  return <FaDice />;
}

