export const parseToNumber = (value: string | number): number => {
  if (typeof value === 'number') return value;
  const cleaned = value.replace(/[$,\s.]/g, '');
  return parseInt(cleaned, 10);
}