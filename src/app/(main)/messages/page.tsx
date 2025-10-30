import { Metadata } from "next";
import Messages from "./Messages";

export const metadata: Metadata = {
  title: "Messages",
};

export default function MessagesPage() {
  return <Messages />;
}
