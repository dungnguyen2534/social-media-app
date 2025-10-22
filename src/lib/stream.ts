import { env } from "@/env";
import { StreamChat } from "stream-chat";

const streamSeverClient = StreamChat.getInstance(
  env.NEXT_PUBLIC_STREAM_KEY!,
  env.STREAM_SECRET,
);

export default streamSeverClient;
