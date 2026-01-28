// Tipos para o sistema de exploração do Delve

export type SiteRank = 'troublesome' | 'dangerous' | 'formidable' | 'extreme' | 'epic';

export type DelveStat = 'edge' | 'shadow' | 'wits';

export type ActionRollResult = 'strong_hit' | 'weak_hit' | 'miss';

export interface DelveState {
  themeId: string;    // ID do tema no Datasworn (ex: 'ancient')
  domainId: string;   // ID do domínio no Datasworn (ex: 'shadowfen')
  siteRank: SiteRank;
  progress: number;   // 0 a 40 (cada 4 pontos = 1 caixa preenchida)
  isActive: boolean;  // Se há uma expedição ativa
}

export interface DelveFeature {
  min: number;
  max: number;
  text: string;
  suggestions?: {
    oracles?: string[];
  };
}

export interface DelveDanger {
  min: number;
  max: number;
  text: string;
  suggestions?: {
    oracles?: string[];
  };
}

export interface ActionRoll {
  actionDie: number;      // 1d6
  statValue: number;       // Valor do atributo
  challengeDice: [number, number]; // 2d10
  result: ActionRollResult;
  actionTotal: number;     // actionDie + statValue
  challengeTotal: number;  // Maior dos 2d10
}
