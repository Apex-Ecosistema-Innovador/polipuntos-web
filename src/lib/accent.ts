export const accents = ['green', 'yellow', 'purple'] as const;

export type Accent = (typeof accents)[number];

export const accentFor = (index: number): Accent => accents[index % accents.length];
