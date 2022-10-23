import { customAlphabet } from "nanoid";

/**
 * @param length default value is 6
 * @returns string of random characters [a-z0-9]
 */
export const randomId = customAlphabet(
  "abcdefghijklmnopqrstuvwxyz0123456789",
  6
);

export const nanoId = customAlphabet(
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
  12
);
