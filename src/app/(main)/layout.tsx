import { getSessionData } from "@/auth";
import { redirect } from "next/navigation";
import { AuthProvider } from "../auth-context";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionData();
  if (session && !session.user.username) redirect("/complete-profile");

  return <AuthProvider session={session}>{children}</AuthProvider>;
}
