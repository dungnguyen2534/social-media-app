"use client";

import React, { useState } from "react";
import { Chat } from "stream-chat-react";
import { useTheme } from "next-themes";
import { useStreamClient } from "../StreamClientProvider";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatChanel from "@/components/chat/ChatChanel";

export default function Messages() {
  const client = useStreamClient();
  const { resolvedTheme } = useTheme();

  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!client) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-card relative h-[calc(100dvh-1rem)] overflow-hidden rounded-md shadow-md">
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
            onClose={() => setSidebarOpen(false)}
          />

          {!sidebarOpen && (
            <ChatChanel backToSidebar={() => setSidebarOpen(true)} />
          )}
        </Chat>
      </div>
    </div>
  );
}
