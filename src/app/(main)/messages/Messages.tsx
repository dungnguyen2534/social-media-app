"use client";

import React, { useState } from "react";
import { Chat } from "stream-chat-react";
import { useTheme } from "next-themes";
import { useStreamClient } from "../StreamClientProvider";
import ChatSidebar from "@/components/chat/ChatChannelist";
import ChatChanel from "@/components/chat/ChatChannel";

export default function Messages() {
  const client = useStreamClient();
  const { resolvedTheme } = useTheme();

  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!client) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-card relative h-dvh overflow-hidden shadow-md lg:h-[calc(100dvh-1rem)] lg:rounded-md">
      <div className="absolute top-0 bottom-0 flex w-full">
        <Chat
          client={client}
          theme={
            resolvedTheme === "dark"
              ? "str-chat__theme-dark"
              : "str-chat__theme-light"
          }
        >
          <ChatSidebar
            open={sidebarOpen}
            onChannelListClose={() => setSidebarOpen(false)}
          />

          {!sidebarOpen && (
            <ChatChanel backToChannelList={() => setSidebarOpen(true)} />
          )}
        </Chat>
      </div>
    </div>
  );
}
