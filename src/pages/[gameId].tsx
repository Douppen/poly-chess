import ChessModel from "../components/ChessModel";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useState } from "react";
import { Chess } from "chess.js";
import { ChessVec } from "types/chessTypes";
import { vecToSan } from "$utils/chessHelpers";
import { trpc } from "$utils/trpc";
import toast, { Toaster } from "react-hot-toast";
import { GetServerSidePropsContext } from "next";
import { inferSSRProps } from "types/inferSSRProps";
import prisma from "$server/db/client";
import { validateMove } from "$utils/validateMove";

const GamePage = ({
  gameId: serverGameId,
  fen: serverFen,
}: inferSSRProps<typeof getServerSideProps>) => {
  const [gameState, setGameState] = useState(new Chess(serverFen));
  const [gameId, setGameId] = useState<string>(serverGameId);
  const [selectedSquare, setSelectedSquare] = useState<ChessVec | null>(null);

  const moveMutation = trpc.game.move.useMutation();

  const handleClick = async (square: ChessVec) => {
    if (!selectedSquare) {
      setSelectedSquare(square);
      return;
    }

    const from = vecToSan(selectedSquare);
    const to = vecToSan(square);

    // client-side check first
    const { isValid, requiresPromotion } = validateMove(
      gameState.fen(),
      from,
      to
    );

    if (!isValid) {
      toast.error("Invalid move");
      return;
    } else if (requiresPromotion) {
      // TODO: implement promotion
      toast.error("Promotion not supported yet");
      return;
    } else {
      // TODO: optimistic update
      toast.success("Move successful");
      const { success, fen: newFen } = await moveMutation.mutateAsync({
        gameId,
        from,
        to,
      });
      if (!success) {
        toast.error("Invalid move from server");
      } else {
        toast.success("Move successful from server");
        setGameState(new Chess(newFen));
      }
    }

    setSelectedSquare(null);
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
  const game = await prisma.chessGame.findFirst({
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
