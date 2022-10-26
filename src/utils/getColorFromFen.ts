export const getColorFromFen = (fen: string) => {
  const fenParts = fen.split(" ");
  const color = fenParts[1];
  if (!color) {
    throw new Error("Invalid FEN");
  }
  if (color !== "w" && color !== "b") {
    throw new Error("Invalid FEN");
  }

  if (color === "w") return "white";
  else return "black";
};
