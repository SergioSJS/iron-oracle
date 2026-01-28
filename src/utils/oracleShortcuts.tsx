import { type ReactElement } from 'react';
import type { OracleTable, StarforgedRegion, GameMode } from '../types/datasworn';
import { 
  FaHandRock, FaStar, FaUser, FaMapMarkerAlt, FaCity, FaRocket, FaBolt, FaDungeon, FaSkull, FaCrosshairs, FaEye, FaFlag, FaShip
} from 'react-icons/fa';
import { 
  GiPlanetCore, GiSpaceship, GiAlienBug, GiMonsterGrasp
} from 'react-icons/gi';
import { 
  MdTerrain
} from 'react-icons/md';

export type ShortcutRoll = {
  oracleId: string | string[]; // ID ou array de IDs (para seleção aleatória)
  count?: number; // Quantas vezes rolar (padrão: 1)
  condition?: (region?: StarforgedRegion) => boolean; // Condição para incluir (ex: apenas para Vital World)
};

export type ShortcutDefinition = {
  name: string;
  nameKey: string; // Chave de tradução para o nome
  rolls: ShortcutRoll[];
};

/**
 * Encontra um oráculo por ID parcial (busca em toda a estrutura)
 * Tenta primeiro match exato, depois parcial
 */
export function findOracleByPartialId(
  ruleset: any,
  partialId: string,
  findOracleById?: (id: string) => OracleTable | null
): OracleTable | null {
  // Se temos findOracleById, tentar primeiro com ID completo
  if (findOracleById) {
    const exactMatch = findOracleById(partialId);
    if (exactMatch) return exactMatch;
  }

  const findInObject = (obj: any, partial: string): OracleTable | null => {
    if (!obj || typeof obj !== 'object') return null;

    // Se o ID contém o partial e tem rows, é uma tabela rolável
    if (obj._id && typeof obj._id === 'string') {
      // Match exato primeiro
      if (obj._id === partial) {
        if (obj.rows && Array.isArray(obj.rows) && obj.rows.length > 0) {
          return obj;
        }
      }
      // Match parcial
      if (obj._id.includes(partial) || partial.includes(obj._id)) {
        if (obj.rows && Array.isArray(obj.rows) && obj.rows.length > 0) {
          return obj;
        }
      }
    }

    // Buscar em contents
    if (obj.contents && typeof obj.contents === 'object') {
      for (const key in obj.contents) {
        const found = findInObject(obj.contents[key], partial);
        if (found) return found;
      }
    }

    // Buscar em collections
    if (obj.collections && typeof obj.collections === 'object') {
      for (const key in obj.collections) {
        const found = findInObject(obj.collections[key], partial);
        if (found) return found;
      }
    }

    return null;
  };

  if (ruleset.oracles && typeof ruleset.oracles === 'object') {
    const oracles = ruleset.oracles as Record<string, any>;
    for (const key in oracles) {
      const found = findInObject(oracles[key], partialId);
      if (found) return found;
    }
  }

  return null;
}

/**
 * Encontra múltiplos oráculos por IDs parciais
 */
export function findOraclesByPartialIds(
  ruleset: any,
  partialIds: string[],
  findOracleById?: (id: string) => OracleTable | null
): OracleTable[] {
  return partialIds
    .map(id => findOracleByPartialId(ruleset, id, findOracleById))
    .filter((table): table is OracleTable => table !== null);
}

/**
 * Seleciona aleatoriamente um oráculo de uma lista de IDs
 */
export function selectRandomOracle(
  ruleset: any,
  partialIds: string[],
  findOracleById?: (id: string) => OracleTable | null
): OracleTable | null {
  const tables = findOraclesByPartialIds(ruleset, partialIds, findOracleById);
  if (tables.length === 0) return null;
  return tables[Math.floor(Math.random() * tables.length)];
}

/**
 * Coleta todas as tabelas de nomes de PERSONAGENS do Ironsworn
 * Exclui nomes de assentamentos, lugares, etc.
 */
export function getAllIronswornNameTables(ruleset: any): OracleTable[] {
  const tables: OracleTable[] = [];
  
  const collectFromObject = (obj: any) => {
    if (!obj || typeof obj !== 'object') return;
    
    if (obj.rows && Array.isArray(obj.rows) && obj.rows.length > 0) {
      // Verificar se é uma tabela de nome de PERSONAGEM
      // Deve estar em classic/oracles/name/ mas NÃO em settlement/name ou place/name
      if (obj._id && typeof obj._id === 'string') {
        const id = obj._id;
        // Incluir apenas nomes de personagens: classic/oracles/name/...
        // Excluir: settlement/name, place/name, quick_name, etc.
        if (id.includes('classic/oracles/name/') && 
            !id.includes('settlement') && 
            !id.includes('place') && 
            !id.includes('quick_name') &&
            !id.includes('location')) {
          tables.push(obj as OracleTable);
        }
      }
    }
    
    if (obj.contents && typeof obj.contents === 'object') {
      for (const key in obj.contents) {
        collectFromObject(obj.contents[key]);
      }
    }
    
    if (obj.collections && typeof obj.collections === 'object') {
      for (const key in obj.collections) {
        collectFromObject(obj.collections[key]);
      }
    }
  };
  
  if (ruleset.oracles && typeof ruleset.oracles === 'object') {
    const oracles = ruleset.oracles as Record<string, any>;
    for (const key in oracles) {
      collectFromObject(oracles[key]);
    }
  }
  
  return tables;
}

/**
 * Coleta todas as tabelas de nomes de ASSENTAMENTOS do Ironsworn
 */
export function getAllIronswornSettlementNameTables(ruleset: any): OracleTable[] {
  const tables: OracleTable[] = [];
  
  const collectFromObject = (obj: any) => {
    if (!obj || typeof obj !== 'object') return;
    
    if (obj.rows && Array.isArray(obj.rows) && obj.rows.length > 0) {
      // Verificar se é uma tabela de nome de ASSENTAMENTO
      if (obj._id && typeof obj._id === 'string') {
        const id = obj._id;
        // Incluir todas as tabelas de nomes de assentamento
        if (id.includes('classic/oracles/settlement/name/') || 
            id === 'classic/oracles/settlement/name' ||
            id.includes('classic/oracles/settlement/quick_name/')) {
          tables.push(obj as OracleTable);
        }
      }
    }
    
    if (obj.contents && typeof obj.contents === 'object') {
      for (const key in obj.contents) {
        collectFromObject(obj.contents[key]);
      }
    }
    
    if (obj.collections && typeof obj.collections === 'object') {
      for (const key in obj.collections) {
        collectFromObject(obj.collections[key]);
      }
    }
  };
  
  if (ruleset.oracles && typeof ruleset.oracles === 'object') {
    const oracles = ruleset.oracles as Record<string, any>;
    for (const key in oracles) {
      collectFromObject(oracles[key]);
    }
  }
  
  return tables;
}

/**
 * Retorna o ícone apropriado para um atalho
 */
export function getShortcutIcon(shortcutName: string, _gameMode: GameMode): ReactElement {
  const name = shortcutName.toLowerCase();
  
  // Atalhos (título do grupo)
  if (name.includes('atalho') || name.includes('shortcut')) {
    return <FaBolt />;
  }
  
  // Ação e Tema (contém ambos)
  if ((name.includes('ação') || name.includes('action')) && (name.includes('tema') || name.includes('theme'))) {
    return <FaHandRock />;
  }
  
  // Ação sozinha
  if (name.includes('ação') || name.includes('action')) {
    return <FaHandRock />;
  }
  
  // Tema sozinho
  if (name.includes('tema') || name.includes('theme')) {
    return <FaStar />;
  }
  
  // Descritor e Foco
  if ((name.includes('descritor') || name.includes('descriptor')) && (name.includes('foco') || name.includes('focus'))) {
    return <FaStar />;
  }
  
  // Descritor sozinho
  if (name.includes('descritor') || name.includes('descriptor')) {
    return <FaStar />;
  }
  
  // Foco sozinho
  if (name.includes('foco') || name.includes('focus')) {
    return <FaStar />;
  }
  
  // Personagem
  if (name.includes('personagem') || name.includes('character')) {
    return <FaUser />;
  }
  
  // Local
  if (name.includes('local') || name.includes('place') || name.includes('location')) {
    if (name.includes('costeiro') || name.includes('coastal')) {
      return <FaMapMarkerAlt />;
    }
    return <FaMapMarkerAlt />;
  }
  
  // Assentamento
  if (name.includes('assentamento') || name.includes('settlement')) {
    return <FaCity />;
  }
  
  // Planeta
  if (name.includes('planeta') || name.includes('planet')) {
    return <GiPlanetCore />;
  }
  
  // Nave Espacial
  if (name.includes('nave') || name.includes('starship') || name.includes('ship')) {
    if (name.includes('abandonada') || name.includes('derelict')) {
      return <FaShip />;
    }
    return <GiSpaceship />;
  }
  
  // Cofre/Vault Precursor
  if (name.includes('cofre') || name.includes('vault') || name.includes('precursor')) {
    return <FaDungeon />;
  }
  
  // Facção
  if (name.includes('facção') || name.includes('faction')) {
    return <FaFlag />;
  }
  
  // Monstrosidade (Delve) - verificar antes de criatura genérica
  if (name.includes('monstrosidade') || name.includes('monstrosity')) {
    return <GiMonsterGrasp />;
  }
  
  // Criatura (Starforged)
  if (name.includes('criatura') || name.includes('creature')) {
    return <GiAlienBug />;
  }
  
  // Tema de Localização
  if (name.includes('tema de localização') || name.includes('location theme')) {
    return <MdTerrain />;
  }
  
  // Avistamento Espacial
  if (name.includes('avistamento') || name.includes('sighting')) {
    return <FaEye />;
  }
  
  // Feature (Delve)
  if (name.includes('característica') || name.includes('feature')) {
    return <FaEye />;
  }
  
  // Site (Delve)
  if (name.includes('site') || name.includes('local do delve')) {
    if (name.includes('completo') || name.includes('full')) {
      return <FaDungeon />;
    }
    return <FaDungeon />;
  }
  
  // Domain e Theme (Delve)
  if ((name.includes('domain') || name.includes('domínio')) && (name.includes('theme') || name.includes('tema'))) {
    return <FaDungeon />;
  }
  
  // Threat (Delve)
  if (name.includes('ameaça') || name.includes('threat')) {
    return <FaSkull />;
  }
  
  // Trap (Delve)
  if (name.includes('armadilha') || name.includes('trap')) {
    return <FaCrosshairs />;
  }
  
  // Combat Event (Delve)
  if (name.includes('evento de combate') || name.includes('combat event')) {
    return <FaCrosshairs />;
  }
  
  // Padrão
  return <FaRocket />;
}

/**
 * Definições de atalhos para Ironsworn
 */
export const IRONSWORN_SHORTCUTS: ShortcutDefinition[] = [
  {
    name: 'Ação e Tema',
    nameKey: 'shortcut.actionAndTheme',
    rolls: [
      { oracleId: 'classic/oracles/action_and_theme/action' }, // Ação
      { oracleId: 'classic/oracles/action_and_theme/theme' } // Tema
    ]
  },
  {
    name: 'Personagem Completo',
    nameKey: 'shortcut.fullCharacter',
    rolls: [
      { oracleId: ['classic/oracles/name/ironlander', 'classic/oracles/name/elf', 'classic/oracles/name/giant', 'classic/oracles/name/varou', 'classic/oracles/name/troll'] }, // Nome aleatório
      { oracleId: 'classic/oracles/character/role' }, // Background/Papel
      { oracleId: 'classic/oracles/character/goal' }, // Objetivo
      { oracleId: 'classic/oracles/character/descriptor', count: 3 } // Descritor (3x)
    ]
  },
  {
    name: 'Local',
    nameKey: 'shortcut.place',
    rolls: [
      { oracleId: 'classic/oracles/place/location' }, // Localização
      { oracleId: 'classic/oracles/place/descriptor', count: 2 } // Descritor de localização (2x)
    ]
  },
  {
    name: 'Local Costeiro',
    nameKey: 'shortcut.coastalPlace',
    rolls: [
      { oracleId: 'classic/oracles/place/coastal_waters_location' }, // Localização de águas costeiras
      { oracleId: 'classic/oracles/place/descriptor', count: 2 } // Descritor de localização (2x)
    ]
  },
  {
    name: 'Assentamento',
    nameKey: 'shortcut.settlement',
    rolls: [
      { oracleId: ['classic/oracles/settlement/name', 'classic/oracles/settlement/name/landscape_feature', 'classic/oracles/settlement/name/manmade_edifice', 'classic/oracles/settlement/name/creature', 'classic/oracles/settlement/name/historical_event', 'classic/oracles/settlement/name/old_world_language', 'classic/oracles/settlement/name/environmental_aspect', 'classic/oracles/settlement/name/something_else', 'classic/oracles/settlement/quick_name/prefix', 'classic/oracles/settlement/quick_name/suffix'] }, // Nome aleatório entre todas as opções
      { oracleId: 'classic/oracles/settlement/trouble' } // Problema
    ]
  },
  // ===== IRONSWORN: DELVE - ATALHOS =====
  {
    name: 'Monstrosidade Completa',
    nameKey: 'shortcut.fullMonstrosity',
    rolls: [
      { oracleId: 'delve/oracles/monstrosity/size' }, // Tamanho
      { oracleId: 'delve/oracles/monstrosity/primary_form' }, // Forma Primária
      { oracleId: 'delve/oracles/monstrosity/characteristics' }, // Características
      { oracleId: 'delve/oracles/monstrosity/abilities' } // Habilidades
    ]
  },
  {
    name: 'Característica Completa',
    nameKey: 'shortcut.fullFeature',
    rolls: [
      { oracleId: 'delve/oracles/feature/aspect' }, // Aspecto
      { oracleId: 'delve/oracles/feature/focus' } // Foco
    ]
  },
  {
    name: 'Personagem do Delve',
    nameKey: 'shortcut.delveCharacter',
    rolls: [
      { oracleId: 'delve/oracles/character/activity' }, // Atividade
      { oracleId: 'delve/oracles/character/disposition' } // Disposição
    ]
  },
  {
    name: 'Evento de Combate',
    nameKey: 'shortcut.combatEvent',
    rolls: [
      { oracleId: 'delve/oracles/combat_event/method' }, // Método
      { oracleId: 'delve/oracles/combat_event/target' } // Alvo
    ]
  },
  {
    name: 'Nome do Site',
    nameKey: 'shortcut.siteName',
    rolls: [
      { oracleId: 'delve/oracles/site_name/description' }, // Descrição
      { oracleId: 'delve/oracles/site_name/detail' }, // Detalhe
      { oracleId: ['delve/oracles/site_name/place/barrow', 'delve/oracles/site_name/place/cavern', 'delve/oracles/site_name/place/frozen_cavern', 'delve/oracles/site_name/place/icereach', 'delve/oracles/site_name/place/mine', 'delve/oracles/site_name/place/pass', 'delve/oracles/site_name/place/ruin', 'delve/oracles/site_name/place/sea_cave', 'delve/oracles/site_name/place/shadowfen', 'delve/oracles/site_name/place/stronghold', 'delve/oracles/site_name/place/tanglewood', 'delve/oracles/site_name/place/underkeep'] } // Lugar (aleatório)
    ]
  },
  {
    name: 'Armadilha',
    nameKey: 'shortcut.trap',
    rolls: [
      { oracleId: 'delve/oracles/trap/trap' }, // Evento
      { oracleId: 'delve/oracles/trap/component' } // Componente
    ]
  },
  {
    name: 'Domain e Theme',
    nameKey: 'shortcut.domainAndTheme',
    rolls: [
      { oracleId: 'delve/oracles/site_nature/domain' }, // Domínio
      { oracleId: 'delve/oracles/site_nature/theme' } // Tema
    ]
  },
  {
    name: 'Site Completo',
    nameKey: 'shortcut.fullSite',
    rolls: [
      { oracleId: 'delve/oracles/site_nature/domain' }, // Domínio
      { oracleId: 'delve/oracles/site_nature/theme' }, // Tema
      { oracleId: 'delve/oracles/site_name/description' }, // Descrição
      { oracleId: 'delve/oracles/site_name/detail' }, // Detalhe
      { oracleId: ['delve/oracles/site_name/place/barrow', 'delve/oracles/site_name/place/cavern', 'delve/oracles/site_name/place/frozen_cavern', 'delve/oracles/site_name/place/icereach', 'delve/oracles/site_name/place/mine', 'delve/oracles/site_name/place/pass', 'delve/oracles/site_name/place/ruin', 'delve/oracles/site_name/place/sea_cave', 'delve/oracles/site_name/place/shadowfen', 'delve/oracles/site_name/place/stronghold', 'delve/oracles/site_name/place/tanglewood', 'delve/oracles/site_name/place/underkeep'] } // Lugar (aleatório)
    ]
  }
];

/**
 * Definições de atalhos para Starforged
 */
export const STARFORGED_SHORTCUTS: ShortcutDefinition[] = [
  {
    name: 'Ação e Tema',
    nameKey: 'shortcut.actionAndTheme',
    rolls: [
      { oracleId: 'starforged/oracles/core/action' }, // Ação
      { oracleId: 'starforged/oracles/core/theme' } // Tema
    ]
  },
  {
    name: 'Descritor e Foco',
    nameKey: 'shortcut.descriptorAndFocus',
    rolls: [
      { oracleId: 'starforged/oracles/core/descriptor' }, // Descritor
      { oracleId: 'starforged/oracles/core/focus' } // Foco
    ]
  },
  {
    name: 'Planeta',
    nameKey: 'shortcut.planet',
    rolls: [
      { oracleId: 'starforged/oracles/planets/class' }, // Classe de planeta
      { oracleId: 'starforged/oracles/planets/desert/name' }, // Nome (será ajustado pela classe)
      { oracleId: 'starforged/oracles/planets/desert/settlements', count: 1 }, // Settlements (será ajustado pela classe e região)
      { oracleId: 'starforged/oracles/planets/desert/atmosphere' }, // Atmosfera (será ajustado pela classe)
      { oracleId: 'starforged/oracles/planets/desert/life' }, // Vida (será ajustado pela classe)
      { oracleId: 'starforged/oracles/planets/desert/observed_from_space', count: 2 }, // Observado do Espaço (2x, será ajustado pela classe)
      { oracleId: 'starforged/oracles/planets/desert/feature', count: 2 } // Característica planetária (2x, será ajustado pela classe)
      // Diversity e Biomes serão adicionados automaticamente se a classe for vital
    ]
  },
  {
    name: 'Personagem Completo',
    nameKey: 'shortcut.fullCharacter',
    rolls: [
      { oracleId: ['starforged/oracles/characters/name/given', 'starforged/oracles/characters/name/callsign', 'starforged/oracles/characters/name/family_name'] }, // Nome aleatório
      { oracleId: 'starforged/oracles/characters/role' }, // Papel
      { oracleId: 'starforged/oracles/characters/goal' }, // Objetivo
      { oracleId: 'starforged/oracles/characters/first_look' }, // Primeira Impressão
      { oracleId: 'starforged/oracles/characters/initial_disposition' } // Disposição Inicial
    ]
  },
  {
    name: 'Nave Espacial',
    nameKey: 'shortcut.starship',
    rolls: [
      { oracleId: 'starforged/oracles/starships/starship_name' }, // Nome
      { oracleId: 'starforged/oracles/starships/type' }, // Tipo/Classe
      { oracleId: 'starforged/oracles/starships/first_look' }, // Primeira Impressão
      { oracleId: 'starforged/oracles/starships/initial_contact' } // Contato Inicial
    ]
  },
  {
    name: 'Assentamento',
    nameKey: 'shortcut.settlement',
    rolls: [
      { oracleId: 'starforged/oracles/settlements/name' }, // Nome
      { oracleId: 'starforged/oracles/settlements/location' }, // Localização
      { oracleId: 'starforged/oracles/settlements/population/terminus', count: 1 }, // População (será ajustado pela região)
      { oracleId: 'starforged/oracles/settlements/first_look' }, // Primeira Impressão
      { oracleId: 'starforged/oracles/settlements/authority' }, // Autoridade
      { oracleId: 'starforged/oracles/settlements/trouble' } // Problema
    ]
  },
  {
    name: 'Câmara dos Precursores',
    nameKey: 'shortcut.precursorVault',
    rolls: [
      { oracleId: 'starforged/oracles/vaults/location' }, // Localização
      { oracleId: 'starforged/oracles/vaults/scale' }, // Escala
      { oracleId: 'starforged/oracles/vaults/form' }, // Forma
      { oracleId: 'starforged/oracles/vaults/shape' }, // Formato
      { oracleId: 'starforged/oracles/vaults/material' }, // Material
      { oracleId: 'starforged/oracles/vaults/outer_first_look', count: 2 } // Primeira Impressão Externa (2x)
    ]
  },
  {
    name: 'Facção Completa',
    nameKey: 'shortcut.fullFaction',
    rolls: [
      { oracleId: 'starforged/oracles/factions/type' }, // Tipo
      { oracleId: 'starforged/oracles/factions/influence' }, // Influência
      { oracleId: ['starforged/oracles/factions/dominion', 'starforged/oracles/factions/guild', 'starforged/oracles/factions/fringe_group'] }, // Tipo específico (aleatório baseado no tipo)
      { oracleId: 'starforged/oracles/factions/projects' }, // Projetos
      { oracleId: 'starforged/oracles/factions/relationships' }, // Relacionamentos
      { oracleId: 'starforged/oracles/factions/quirks' } // Peculiaridades
    ]
  },
  {
    name: 'Nave Abandonada',
    nameKey: 'shortcut.derelict',
    rolls: [
      { oracleId: 'starforged/oracles/derelicts/location' }, // Localização
      { oracleId: 'starforged/oracles/derelicts/condition' }, // Condição
      { oracleId: 'starforged/oracles/derelicts/outer_first_look' }, // Primeira Impressão Externa
      { oracleId: 'starforged/oracles/derelicts/inner_first_look' }, // Primeira Impressão Interna
      { oracleId: ['starforged/oracles/derelicts/type/planetside', 'starforged/oracles/derelicts/type/orbital', 'starforged/oracles/derelicts/type/deep_space'] }, // Tipo (ajustado pela localização)
      { oracleId: ['starforged/oracles/derelicts/zones/starship', 'starforged/oracles/derelicts/zones/settlement'] } // Zonas (ajustado pelo tipo)
    ]
  },
  {
    name: 'Criatura Completa',
    nameKey: 'shortcut.fullCreature',
    rolls: [
      { oracleId: 'starforged/oracles/creatures/environment' }, // Ambiente
      { oracleId: 'starforged/oracles/creatures/scale' }, // Escala
      { oracleId: 'starforged/oracles/creatures/first_look' }, // Primeira Impressão
      { oracleId: 'starforged/oracles/creatures/encountered_behavior' }, // Comportamento Encontrado
      { oracleId: 'starforged/oracles/creatures/revealed_aspect' }, // Aspecto Revelado
      { oracleId: ['starforged/oracles/creatures/basic_form/space', 'starforged/oracles/creatures/basic_form/interior', 'starforged/oracles/creatures/basic_form/land', 'starforged/oracles/creatures/basic_form/liquid', 'starforged/oracles/creatures/basic_form/air'] } // Forma Básica (ajustado pelo ambiente)
    ]
  },
  {
    name: 'Tema de Localização',
    nameKey: 'shortcut.locationTheme',
    rolls: [
      { oracleId: 'starforged/oracles/location_themes/type' }, // Tipo
      { oracleId: 'starforged/oracles/location_themes/chaotic/feature' }, // Feature (será ajustado pelo tipo)
      { oracleId: 'starforged/oracles/location_themes/chaotic/peril' }, // Peril (será ajustado pelo tipo)
      { oracleId: 'starforged/oracles/location_themes/chaotic/opportunity' } // Opportunity (será ajustado pelo tipo)
    ]
  },
  {
    name: 'Avistamento Espacial',
    nameKey: 'shortcut.spaceSighting',
    rolls: [
      { oracleId: 'starforged/oracles/space/stellar_object' }, // Objeto Estelar
      { oracleId: 'starforged/oracles/space/sighting/terminus', count: 1 }, // Avistamento (será ajustado pela região)
      { oracleId: 'starforged/oracles/space/peril' }, // Perigo Espacial
      { oracleId: 'starforged/oracles/space/opportunity' } // Oportunidade Espacial
    ]
  }
];

