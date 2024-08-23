export const isValidId = (id: string) => {
  return RegExp(/^[0-9a-fA-F]{24}$/).exec(id);
};
