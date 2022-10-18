import type { NextApiRequest, NextApiResponse } from "next";
import { pusherServerClient } from "$server/common/pusher";
import { getServerAuthSession } from "$server/common/get-server-auth-session";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { channel_name, socket_id } = req.body;

  const session = await getServerAuthSession({ req, res });

  if (!session?.user?.id) {
    res.status(403).send("channel connection unauthorized");
    return;
  }

  const userId = session.user.id;

  if (/^presence-/.test(channel_name)) {
    const presenceData = {
      is_superman: true,
      user_id: userId,
      user_info: {
        name: session.user.name ?? "unknown",
      },
    };

    const authResponse = pusherServerClient.authorizeChannel(
      socket_id,
      channel_name,
      presenceData
    );
    res.send(authResponse);
  } else {
    const authResponse = pusherServerClient.authorizeChannel(
      socket_id,
      channel_name
    );
    res.send(authResponse);
  }
}
