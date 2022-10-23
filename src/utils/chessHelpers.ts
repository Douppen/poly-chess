import { Square } from "chess.js";

// SAN square (e.g. a4) to position object (e.g. { x: 0, y: 3 })
export const sanToVec = (square: Square): { x: number; y: number } => {
  const x = square.charCodeAt(0) - 97;
  const y = 8 - Number(square[1]);

  return { x, y };
};

export const vecToSan = ({ x, y }: { x: number; y: number }): Square => {
  const letter = String.fromCharCode(x + "a".charCodeAt(0));
  const number = 8 - y;
  const SAN = letter.concat(number.toString()) as Square;

  return SAN;
};
