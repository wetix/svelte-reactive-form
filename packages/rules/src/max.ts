export const max = (v: any, [len]: [string]): boolean | string => {
  const l = parseFloat(len);
  const value = isNaN(v) ? v.length : parseFloat(v);
  return value < l || `This field must be less than ${length} characters.`;
};
