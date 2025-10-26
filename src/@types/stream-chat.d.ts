import "stream-chat";
import type { DefaultChannelData } from "stream-chat-react";

declare module "stream-chat" {
  interface CustomChannelData extends DefaultChannelData {
    name?: string;
    isGroup: boolean;
  }
}
