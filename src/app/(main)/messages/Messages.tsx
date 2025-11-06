"use client";

import React, { useEffect, useState } from "react";
import { Chat } from "stream-chat-react";
import { useTheme } from "next-themes";
import { useStreamClient } from "../StreamClientProvider";
import ChatChannelist from "@/components/chat/ChatChannelist";
import ChatChanel from "@/components/chat/ChatChannel";
import { useRouter, useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, MessagesSquare } from "lucide-react";

export default function Messages() {
  const client = useStreamClient();
  const { resolvedTheme } = useTheme();

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const searchParams = useSearchParams();
  const directMessageToId = searchParams.get("userId");

  useEffect(() => {
    if (directMessageToId) setSidebarOpen(false);
  }, [directMessageToId]);

  if (!client) {
    return <ChatPageSkeleton />;
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
          <ChatChannelist
            open={sidebarOpen}
            onChannelListClose={() => setSidebarOpen(false)}
          />

          <ChatChanel backToChannelList={() => setSidebarOpen(true)} />
        </Chat>
      </div>
    </div>
  );
}

function ChatPageSkeleton() {
  const router = useRouter();

  return (
    <div className="bg-card relative flex h-dvh overflow-hidden shadow-md lg:h-[calc(100dvh-1rem)] lg:rounded-md">
      <div className="border-border flex h-full w-full flex-col lg:w-[18rem] lg:border-r">
        <div className="flex h-14 items-center p-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => {
              if (window.history.length > 2) {
                router.back();
              } else {
                router.push("/");
              }
            }}
            className="mr-2 flex h-full lg:hidden"
          >
            <ChevronLeft className="size-5" />
          </Button>
          <h1 className="me-auto py-2.5 text-lg font-medium lg:ml-2.5">
            Messages
          </h1>
        </div>
        <div className="border-border h-full w-full rounded-none border-t p-2.5">
          <Skeleton className="mb-6 h-11" />
          <div className="my-3 flex gap-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
          <div className="mt-7 flex gap-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        </div>
      </div>

      <div className="text-muted-foreground/50 hidden flex-1 items-center justify-center lg:flex">
        <div className="flex flex-col items-center justify-center gap-3 text-lg font-medium">
          <MessagesSquare className="size-28" />
          Let&apos;s start a conversation!
        </div>
      </div>
    </div>
  );
}
