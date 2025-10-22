"use client";

import { env } from "@/env";
import api from "@/lib/ky";
import React, { createContext, useContext, useEffect, useState } from "react";
import { StreamChat } from "stream-chat";
import { useAuth } from "@/app/auth-context";

export const StreamClientContext = createContext<StreamChat | undefined>(
  undefined,
);

export function StreamClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = useAuth();
  const signedInUser = session!.user;

  const [chatClient, setChatClient] = useState<StreamChat | null>(null);

  useEffect(() => {
    const client = StreamChat.getInstance(env.NEXT_PUBLIC_STREAM_KEY);
    client
      .connectUser(
        {
          id: signedInUser.id!,
          username: signedInUser.username!,
          name: signedInUser.name!,
          image: signedInUser.image!,
        },
        async () =>
          api
            .get("get-stream-token")
            .json<{ token: string }>()
            .then((data) => data.token),
      )
      .catch((error) => console.error("Failed to connect user", error))
      .then(() => setChatClient(client));

    return () => {
      setChatClient(null);
      client
        .disconnectUser()
        .catch((error) => console.error("Failed to disconnect user", error));
    };
  }, [
    signedInUser.id,
    signedInUser.username,
    signedInUser.name,
    signedInUser.image, // only rerun when these specific values change
  ]);

  if (!chatClient) {
    return null;
  }

  return (
    <StreamClientContext.Provider value={chatClient}>
      {children}
    </StreamClientContext.Provider>
  );
}

export function useStreamClient(): StreamChat {
  const context = useContext(StreamClientContext);

  if (context === undefined) {
    throw new Error(
      "useStreamClient must be used within an StreamClientProvider",
    );
  }

  return context;
}
