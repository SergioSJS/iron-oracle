// Estrutura para traduções dos dados do Datasworn
export type OracleTranslation = {
  name?: string;
  rows?: Record<number, string>; // min value -> translated text
  text?: string; // Para textos simples
};

export type OracleTranslationsMap = Record<string, OracleTranslation>;

