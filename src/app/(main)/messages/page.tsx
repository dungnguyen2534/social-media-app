import { Metadata } from "next";
import Messages from "./Messages";
import { getSessionData } from "@/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Messages",
};

export default async function MessagesPage() {
  const session = await getSessionData();

  if (!session) {
    redirect("/");
  }

  return <Messages />;
}
