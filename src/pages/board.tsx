import ChessModel from "../components/ChessModel";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useState } from "react";
import { Chess } from "chess.js";
import { ChessVec } from "types/types";
import { vecToSan } from "$utils/helpers";
import { trpc } from "$utils/trpc";
import toast, { Toaster } from "react-hot-toast";

const GamePage = () => {
  const [gameState, setGameState] = useState(
    new Chess("8/8/8/8/8/8/8/8 w - - 0 1")
  );
  const [gameId, setGameId] = useState<string | null>(null);
  const [selectedSquare, setSelectedSquare] = useState<ChessVec | null>(null);

  const moveMutation = trpc.game.move.useMutation();
  const gameFromServer = trpc.game.get.useQuery();
  const allGames = trpc.game.getAll.useQuery();

  const handleClick = async (square: ChessVec) => {
    if (selectedSquare) {
      const san = {
        from: vecToSan(selectedSquare),
        to: vecToSan(square),
      };
      if (gameId) {
        const res = await moveMutation.mutateAsync({
          from: san.from,
          to: san.to,
          gameId,
          fen: gameState.fen(),
        });
        if (!res.success) {
          toast.error("Invalid move according to server");
        } else {
          toast.success("Move successful");
          setGameState((game) => {
            const newGame = new Chess(game.fen());
            newGame.move({ from: san.from, to: san.to });
            return newGame;
          });
        }
      }
      setSelectedSquare(null);
    } else {
      setSelectedSquare(square);
    }
  };

  return (
    <div id="canvas-container" style={{ height: "100vh" }}>
      <div className="flex justify-around bg-gray-200 text-slate-700">
        <p>it is {gameState.turn() === "w" ? "white's" : "black's"} turn</p>
      </div>
      <div className="flex justify-around bg-gray-200 text-slate-700">
        {allGames.data &&
          allGames.data.map((game) => (
            <button
              key={game.id}
              onClick={() => {
                setGameState(new Chess(game.fen));
                setGameId(game.id);
              }}
            >
              {game.id.substring(15, 20)}
            </button>
          ))}
      </div>
      <Toaster />
      <Canvas camera={{ position: [-5, 8, -8], fov: 50 }}>
        <hemisphereLight color="white" intensity={0.45} />
        <spotLight position={[50, 50, 10]} angle={0.15} penumbra={1} />
        <group position={[4, 0, -3]}>
          <ChessModel
            boardPosition={gameState.board()}
            handleClick={handleClick}
            selectedSquare={selectedSquare}
          />
        </group>
        <OrbitControls />
      </Canvas>
    </div>
  );
};

export default GamePage;
