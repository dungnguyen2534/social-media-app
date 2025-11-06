import { getSessionData } from "@/auth";
import { AuthProvider } from "../auth-context";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionData();

  return <AuthProvider session={session}>{children}</AuthProvider>;
}
