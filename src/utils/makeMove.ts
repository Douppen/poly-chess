import { Chess } from "chess.js";
import { Square } from "chess.js";

// This function assumes the move is valid
export const makeMove = (
  fen: string,
  from: Square,
  to: Square,
  promotion?: "n" | "b" | "r" | "q"
) => {
  const game = new Chess(fen);
  game.move({ from, to, promotion });

  const newFen = game.fen();

  return newFen;
};
