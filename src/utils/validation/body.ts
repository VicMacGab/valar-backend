export const validBody = (
  body: Record<string, any>,
  expectedKeys: string[]
): boolean => {
  for (let i = 0; i < expectedKeys.length; i++) {
    if (!(expectedKeys[i] in body)) {
      return false;
    }
  }

  return true;
};
