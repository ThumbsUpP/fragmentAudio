// Define translation types
type Language = 'zh' | 'en' | 'fr';
export type Translation = Partial<Record<Language, string>>;
