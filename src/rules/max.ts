export const max = (v: any, length: string[]): boolean | string => {
  const l = parseFloat(length[0]);
  const value = isNaN(v) ? v.length : parseFloat(v);
  return value < l || `This field must be less than ${length} characters.`;
};
