export const min = (v, [length]): boolean | string => {
  const l = parseFloat(length[0]);
  const value = isNaN(v) ? v.length : parseFloat(v);
  return value >= l || `This field must be at least ${l} characters.`;
};
