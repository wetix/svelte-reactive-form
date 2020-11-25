export const required = (v: any): boolean | string => {
  if (v === undefined) return "This field is required.";
  if (v === 0) return "This field is required.";
  if (v === null) return "This field is required.";
  if (v === "") return "This field is required.";
  if (Array.isArray(v) && v.length === 0) return "This field is required.";
  return true;
};
