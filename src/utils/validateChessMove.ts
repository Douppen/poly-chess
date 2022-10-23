import { Chess } from "chess.js";
import { Square } from "chess.js";

// if move requires a promotion return info about that
export const validateChessMove = (
  from: Square,
  to: Square,
  fen: string
): { success: boolean; fen: string; promotion?: boolean } => {
  const chessObject = new Chess(fen);
  const move = chessObject.move({ from, to });
  if (!move) {
    return {
      success: false,
      fen,
    };
  } else {
    return {
      success: true,
      fen: chessObject.fen(),
      promotion: move.flags.includes("p"),
    };
  }
};
