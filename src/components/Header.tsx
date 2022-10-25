import { trpc } from "$utils/trpc";

const Header = () => {
  const query = trpc.auth.getSession.useQuery();

  if (query.isLoading) {
    return <div>Loading...</div>;
  }

  if (query.data && query.data.user) {
    return <div>Logged in as {query.data.user.email ?? "unknown"}</div>;
  }

  return <div>Not logged in</div>;
};

export default Header;
