import { Chess, Move } from "chess.js";
import { Square } from "chess.js";

export const validateMove = (
  fen: string,
  from: Square,
  to: Square
): { isValid: boolean; requiresPromotion: boolean } => {
  const chessObject = new Chess(fen);
  const validMoves = chessObject.moves({
    square: from,
    verbose: true,
  }) as Move[];

  const move = validMoves.find((move) => move.to === to);

  if (!move) {
    return {
      isValid: false,
      requiresPromotion: false,
    };
  } else {
    const requiresPromotion = move.flags.includes("p");

    return {
      isValid: true,
      requiresPromotion,
    };
  }
};
