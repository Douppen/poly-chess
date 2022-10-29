export const colorFromMoveNumber = (moveNumber: number) => {
  return moveNumber % 2 === 0 ? "white" : "black";
};
