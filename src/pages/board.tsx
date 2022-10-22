import ChessModel from "../components/ChessModel";
import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { useState } from "react";
import { Chess } from "chess.js";
import { ChessVec } from "types/types";
import { vecToSan } from "$utils/helpers";

const GamePage = () => {
  const [gameState, setGameState] = useState(new Chess());
  const [selectedSquare, setSelectedSquare] = useState<ChessVec | null>(null);

  const handleClick = (square: ChessVec) => {
    if (selectedSquare) {
      const san = {
        from: vecToSan(selectedSquare),
        to: vecToSan(square),
      };
      setGameState((game) => {
        const newGame = new Chess(game.fen());
        newGame.move({ from: san.from, to: san.to });
        return newGame;
      });
      setSelectedSquare(null);
    } else {
      setSelectedSquare(square);
    }
  };

  return (
    <div id="canvas-container" style={{ height: "100vh" }}>
      <header className="absolute m-4 after:w-8">
        It is {gameState.turn() === "w" ? "White's" : "Black's"} turn
      </header>
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
