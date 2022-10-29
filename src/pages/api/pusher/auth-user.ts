import type { NextApiRequest, NextApiResponse } from "next";
import { pusherServerClient } from "$server/common/pusher";
import { getServerAuthSession } from "../../../server/common/get-server-auth-session";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { socket_id } = req.body;

  const session = await getServerAuthSession({ req, res });

  if (!session?.user?.id) {
    res.status(403).send("unauthorized");
    return;
  }

  const userId = session.user.id;

  const user = {
    id: userId,
    user_info: {
      name: session.user.name ?? "unknown",
    },
  };

  const authResponse = pusherServerClient.authenticateUser(socket_id, user);
  res.send(authResponse);
}
