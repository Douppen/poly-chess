import { PieceSymbol, Square } from "chess.js";

export interface ChessVec {
  x: number;
  y: number;
}

export interface MoveInfo {
  color: "white" | "black";
  from: Square;
  to: Square;
  piece: PieceSymbol;
  san: string;
  flags: Flag[];
  captured?: PieceSymbol;
  promotion?: "n" | "b" | "r" | "q";

  remainingMillis: number;
  endTimeMillis: number;

  fenAfterMove: string;
}

export type MovesList = MoveInfo[];

export enum Flag {
  NORMAL = "n",
  CAPTURE = "c",
  BIG_PAWN = "b",
  EP_CAPTURE = "e",
  PROMOTION = "p",
  KSIDE_CASTLE = "k",
  QSIDE_CASTLE = "q",
}
