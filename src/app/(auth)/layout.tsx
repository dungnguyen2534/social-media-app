import { getSessionData } from "@/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AuthProvider } from "../auth-context";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerList = await headers();
  const pathname = headerList.get("x-current-path");
  const session = await getSessionData();

  if (session && !session.user.username && pathname === "/sign-in") {
    redirect("/complete-profile");
  }

  if (!session && pathname === "/complete-profile") {
    redirect("/sign-in");
  }

  if (session && session.user.username) {
    redirect("/");
  }

  return <AuthProvider session={session}>{children}</AuthProvider>;
}
