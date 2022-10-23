import ChessModel from "../components/ChessModel";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useState } from "react";
import { Chess } from "chess.js";
import { ChessVec } from "types/chessTypes";
import { vecToSan } from "$utils/chessHelpers";
import { trpc } from "$utils/trpc";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/router";
import { GetServerSidePropsContext } from "next";
import { inferSSRProps } from "types/inferSSRProps";
import prisma from "$server/db/client";

const GamePage = ({
  gameId: serverGameId,
  fen: serverFen,
}: inferSSRProps<typeof getServerSideProps>) => {
  const [gameState, setGameState] = useState(new Chess(serverFen));
  const [gameId, setGameId] = useState<string>(serverGameId);
  const [selectedSquare, setSelectedSquare] = useState<ChessVec | null>(null);

  const moveMutation = trpc.game.move.useMutation();

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
      <div className="flex bg-gray-200 text-slate-700">
        <p>it is {gameState.turn() === "w" ? "white's" : "black's"} turn</p>
      </div>
      <div className="flex bg-gray-200 text-slate-700">game id: {gameId}</div>
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

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const gameId = context.params?.gameId as string;
  const game = await prisma.chessgame.findFirst({
    where: {
      id: gameId,
    },
    select: {
      fen: true,
    },
  });

  if (!game) {
    return {
      notFound: true,
    };
  }

  const fen = game.fen;

  return {
    props: {
      gameId,
      fen,
    },
  };
};

export default GamePage;
