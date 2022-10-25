// K factors for players of varying abilities according to FIDE
// K = 40 until the player has completed 30 games
// K = 20 for as long as the player has an Elo rating under 2400
// K = 10 for as long as the player has an Elo rating over 2400

// We use a constant k-factor of 32 by default for simplicity

export const calculateNewElo = (
  myRating: number,
  opponentRating: number,
  gameResult: 1 | 0.5 | 0,
  kFactor = 32
) => {
  const expectedScore = 1 / (1 + 10 ** ((opponentRating - myRating) / 400));
  const ratingDelta = Math.round(kFactor * (gameResult - expectedScore));
  const newRating = myRating + ratingDelta;
  return newRating;
};

export const calculateKFactor = (myElo: number, myGames: number) => {
  if (myGames < 30) {
    return 40;
  } else if (myElo < 2400) {
    return 20;
  } else {
    return 10;
  }
};
