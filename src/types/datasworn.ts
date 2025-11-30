// Tipos básicos para o Datasworn
export type OracleRow = {
  min: number;
  max?: number | null;
  text: string;
  text2?: string;
  oracles?: string[];
  oracle_rolls?: Array<{ oracle: string }>;
  [key: string]: any;
};

export type OracleTable = {
  _id: string;
  type: string;
  name: string;
  rows?: OracleRow[];
  oracles?: string[];
  contents?: Record<string, OracleTable | OracleCollection>;
  collections?: Record<string, OracleTable | OracleCollection>;
  [key: string]: any;
};

export type OracleCollection = {
  _id: string;
  type: string;
  name: string;
  contents?: Record<string, OracleTable | OracleCollection>;
  collections?: Record<string, OracleTable | OracleCollection>;
  oracles?: string[];
  [key: string]: any;
};

export type ChildRoll = {
  id: number;
  oracleName: string;
  oracleId?: string; // ID do oráculo para buscar ícone
  roll: number;
  result: string;
  originalResult?: string; // Texto original em inglês
};

export type LogEntry = {
  id: number;
  oracleName: string;
  oracleId?: string; // ID do oráculo para buscar ícone
  roll: number;
  result: string;
  originalResult?: string; // Texto original em inglês
  extraRolls?: string[]; // IDs de oráculos para rolar novamente
  childRolls?: ChildRoll[]; // Rolagens automáticas filhas
};

export type StarforgedRegion = 'terminus' | 'outlands' | 'expanse';

export type GameMode = 'starforged' | 'ironsworn';

