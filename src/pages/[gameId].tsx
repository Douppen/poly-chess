import ChessModel from "../components/ChessModel";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import { ChessVec, PromotionPiece } from "types/chessTypes";
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
import { getColorFromFen } from "$utils/getColorFromFen";

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
  const gameEngine = useRef(new Chess());
  const utils = trpc.useContext();

  // TODO: make this a custom hook
  // use useEvent...
  useEffect(() => {
    const pusher = new Pusher(env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: env.NEXT_PUBLIC_PUSHER_APP_CLUSTER,
    });

    const channel = pusher.subscribe("chessgame");

    channel.bind("new-move", (data: PusherNewMove) => {
      console.log("pusher data: ", data);
      // TODO: optimization - check who sent the move and only update if it's not the current user
      utils.game.getFen.setData(data.newFen, { gameId: serverGameId });
    });

    return () => pusher.disconnect();
  }, [utils, serverGameId]);

  const [selectedSquare, setSelectedSquare] = useState<ChessVec | null>(null);
  const [mouseDownSquare, setMouseDownSquare] = useState<ChessVec | null>(null);
  const { data: fenQueryData } = trpc.game.getFen.useQuery({
    gameId: serverGameId,
  });

  // TODO: set client react query fen data to fen from server

  const moveMutation = trpc.game.move.useMutation({
    onSuccess: ({ fen }) => {
      utils.game.getFen.setData(fen, { gameId: serverGameId });
      toast.success("Move successful from server");
    },
    onMutate: async ({ from, to, promotion }) => {
      await utils.game.getFen.cancel();

      const previousFen = fenQueryData;

      if (!previousFen) {
        throw new Error("No previous data");
      }

      const gameEngine = new Chess(previousFen);
      gameEngine.move({
        from,
        to,
        promotion,
      });
      const newFen = gameEngine.fen();

      utils.game.getFen.setData(newFen, { gameId: serverGameId });

      return { previousFen };
    },
    onError: (err, variables, context) => {
      console.log(err);
      toast.error("Invalid move from server");

      if (context?.previousFen) {
        utils.game.getFen.setData(context.previousFen, {
          gameId: serverGameId,
        });
      } else {
        utils.game.getFen.invalidate();
      }
    },
  });

  if (!fenQueryData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-9xl">Loading...</div>
      </div>
    );
  }

  gameEngine.current.load(fenQueryData);
  const turn = getColorFromFen(fenQueryData);

  const handleClick = async ({
    x,
    y,
    eventType,
  }: {
    x: number;
    y: number;
    eventType: "mouseDown" | "mouseUp";
  }) => {
    const square = { x, y };
    const squareContent = gameEngine.current.get(vecToSan(square));

    if (eventType === "mouseDown") {
      setMouseDownSquare(square);
      return;
    }

    if (eventType === "mouseUp" && !isEqual(mouseDownSquare, square)) {
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

    const { isValid, requiresPromotion } = validateMove(fenQueryData, from, to);

    if (!isValid) {
      toast.error("Invalid move");
      setSelectedSquare(null);
      return;
    } else {
      let promotion: PromotionPiece | undefined;
      if (requiresPromotion) {
        // TODO: promotion
        window.prompt("Promote to: ");
        promotion = PromotionPiece.QUEEN;
      }
      toast.success("Move successful from client");
      moveMutation.mutate({
        gameId: serverGameId,
        from,
        to,
        promotion,
      });
    }

    setSelectedSquare(null);
  };

  return (
    <div id="canvas-container" style={{ height: "100vh" }}>
      <div className="flex bg-gray-200 text-slate-700">
        <p>it is {`${turn}'s`} turn</p>
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
            handleClick={handleClick}
            selectedSquare={selectedSquare}
            fen={fenQueryData}
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
