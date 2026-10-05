export const normalizeSearch = (text: string) =>
  text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

export const matchesStudent = (query: string, fullName: string, cedula: string) => {
  const terms = normalizeSearch(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;
  const name = normalizeSearch(fullName);
  return terms.every((term) => name.includes(term) || cedula.includes(term.replace(/\D/g, '') || '\u0000'));
};
