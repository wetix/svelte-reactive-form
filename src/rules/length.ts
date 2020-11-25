export const minLength = (val: any, [min]: [number]): boolean | string => {
  const typeOfVal = typeof val;
  switch (typeOfVal) {
    case "string":
      return (
        val.length >= Number(min) ||
        `This field must be at least ${min} characters.`
      );
    case "number":
  }
  return "invalid data type for minLength";
};
