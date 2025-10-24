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
  const signedInUser = session?.user;

  const [chatClient, setChatClient] = useState<StreamChat | undefined>(
    undefined,
  );

  useEffect(() => {
    if (!signedInUser) return;

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
      setChatClient(undefined);
      client
        .disconnectUser()
        .catch((error) => console.error("Failed to disconnect user", error));
    };
  }, [signedInUser]);

  return (
    <StreamClientContext.Provider value={chatClient}>
      {children}
    </StreamClientContext.Provider>
  );
}

export function useStreamClient(): StreamChat | undefined {
  const context = useContext(StreamClientContext);
  return context;
}
