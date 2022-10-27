import ChessModel from "../components/ChessModel";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect, useState } from "react";
import { ChessVec } from "types/chessTypes";
import { vecToSan } from "$utils/chessHelpers";
import { trpc } from "$utils/trpc";
import toast, { Toaster } from "react-hot-toast";
import { GetServerSidePropsContext } from "next";
import { inferSSRProps } from "types/inferSSRProps";
import { prisma } from "$server/db/client";
import { validateMove } from "$utils/validateMove";
import Pusher from "pusher-js";
import { env } from "env/client.mjs";
import { getServerAuthSession } from "$server/common/get-server-auth-session";
import { isEqual } from "lodash";
import { Chess } from "chess.js";

type PusherNewMove = {
  newFen: string;
};

const GamePage = ({
  gameId: serverGameId,
  fen: serverFen,
  session: serverSession,
  whoThere: serverWhoThere,
  isSolo: serverIsSoloGame,
}: inferSSRProps<typeof getServerSideProps>) => {
  const [gameState, setGameState] = useState(new Chess(serverFen));
  const [selectedSquare, setSelectedSquare] = useState<ChessVec | null>(null);
  const [mouseDownSquare, setMouseDownSquare] = useState<ChessVec | null>(null);
  const moveMutation = trpc.game.move.useMutation();

  const handleClick = async ({
    x,
    y,
    eventType,
  }: {
    x: number;
    y: number;
    eventType: "mouseDown" | "mouseUp";
  }) => {
    const turn = gameState.turn() === "w" ? "white" : "black";
    const square = { x, y };
    const squareContent = gameState.get(vecToSan(square));

    if (eventType === "mouseDown") {
      setMouseDownSquare(square);
      return;
    }

    if (eventType === "mouseUp" && !isEqual(mouseDownSquare, square)) {
      setSelectedSquare(null);
      setMouseDownSquare(null);
      return;
    }

    if (!selectedSquare) {
      if (!serverIsSoloGame) {
        if (!squareContent) {
          setSelectedSquare(null);
          return;
        }
        const squarePieceColor =
          squareContent.color === "w" ? "white" : "black";
        if (squarePieceColor !== serverWhoThere.color) {
          return;
        }
      }

      setSelectedSquare(square);
      return;
    }

    if (squareContent) {
      const squarePieceColor = squareContent.color === "w" ? "white" : "black";

      if (squarePieceColor === serverWhoThere.color) {
        if (isEqual(selectedSquare, square)) {
          setSelectedSquare(null);
          return;
        }
        setSelectedSquare(square);
        return;
      }
    }

    const from = vecToSan(selectedSquare);
    const to = vecToSan(square);

    const { isValid, requiresPromotion } = validateMove(
      gameState.fen(),
      from,
      to
    );

    if (!isValid) {
      toast.error("Invalid move");
      setSelectedSquare(null);
      return;
    } else if (requiresPromotion) {
      // TODO: promotion
      window.prompt("Promote to: ");
      toast.error("Promotion not supported yet");
      return;
    } else {
      // TODO: optimistic update
      toast.success("Move successful from client");
      const { success, fen: newFen } = await moveMutation.mutateAsync({
        gameId: serverGameId,
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

  useEffect(() => {
    const pusher = new Pusher(env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: env.NEXT_PUBLIC_PUSHER_APP_CLUSTER,
    });

    const channel = pusher.subscribe("chessgame");

    channel.bind("new-move", (data: PusherNewMove) => {
      console.log("pusher data: ", data);
      setGameState(new Chess(data.newFen));
    });

    return () => pusher.disconnect();
  }, []);

  return (
    <div id="canvas-container" style={{ height: "100vh" }}>
      <div className="flex bg-gray-200 text-slate-700">
        <p>it is {gameState.turn() === "w" ? "white's" : "black's"} turn</p>
      </div>
      <div className="flex bg-gray-200 text-slate-700">
        game id: {serverGameId}
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

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getServerAuthSession(context);
  if (!session || !session.user) {
    return { redirect: { destination: "/api/auth/signin", permanent: false } };
  }

  const gameId = context.params?.gameId as string;
  const game = await prisma.chessGame.findFirst({
    where: {
      id: gameId,
    },
    select: {
      fen: true,
      gameCreatorId: true,
      opponentId: true,
      gameCreatorColor: true,
      isSolo: true,
    },
  });

  if (!game) {
    return {
      notFound: true,
    };
  }

  const userId = session.user.id;
  const whoThere: {
    who: "spectator" | "creator" | "opponent";
    color: null | "white" | "black";
  } = {
    who: "spectator",
    color: null,
  };
  if (userId === game.gameCreatorId) {
    whoThere.who = "creator";
    whoThere.color = game.gameCreatorColor;
  } else if (userId === game.opponentId) {
    whoThere.who = "opponent";
    whoThere.color = game.gameCreatorColor === "white" ? "black" : "white";
  }

  return {
    props: {
      fen: game.fen,
      isSolo: game.isSolo,
      gameId,
      session,
      whoThere,
    },
  };
};

export default GamePage;
