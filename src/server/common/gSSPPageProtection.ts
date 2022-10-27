import { GetServerSidePropsContext } from "next";

import { getServerAuthSession } from "./get-server-auth-session";

export const protectPage = async (ctx: GetServerSidePropsContext) => {
  const session = await getServerAuthSession(ctx);
  if (!session) {
    return { redirect: { destination: "/api/auth/signin", permanent: false } };
  }
  return { props: {} };
};
