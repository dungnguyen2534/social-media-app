"use client";

import { useAuth } from "@/app/auth-context";
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import {
  ChannelList,
  ChannelPreviewMessenger,
  ChannelPreviewUIComponentProps,
  useChatContext,
} from "stream-chat-react";
import NewChatDialog from "./NewChatDialog";
import { useQueryClient } from "@tanstack/react-query";

interface ChatSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function ChatSidebar({ open, onClose }: ChatSidebarProps) {
  const session = useAuth();
  const signedInUser = session!.user;

  const queryClient = useQueryClient();
  const { channel } = useChatContext();

  useEffect(() => {
    if (channel?.id) {
      queryClient.invalidateQueries({ queryKey: ["unread-message-count"] });
    }
  }, [channel?.id, queryClient]);

  const ChanelPreviewCustom = useCallback(
    (props: ChannelPreviewUIComponentProps) => (
      <ChannelPreviewMessenger
        {...props}
        onSelect={() => {
          props.setActiveChannel?.(props.channel, props.watchers);
          onClose();
        }}
      />
    ),
    [onClose],
  );

  return (
    <div
      className={cn(
        "size-full flex-col border-e lg:flex lg:w-72",
        open ? "flex" : "hidden",
      )}
    >
      <MenuHeader onSidebarClose={onClose} />
      <ChannelList
        filters={{
          type: "messaging",
          members: { $in: [signedInUser.id!] },
        }}
        showChannelSearch
        options={{
          state: true,
          presence: true,
          limit: 10,
        }}
        sort={{ last_message_at: -1 }}
        additionalChannelSearchProps={{
          searchForChannels: true,
          searchQueryParams: {
            channelFilters: {
              filters: { members: { $in: [signedInUser.id!] } },
            },
          },
        }}
        Preview={ChanelPreviewCustom}
        setActiveChannelOnMount={false}
      />
    </div>
  );
}

interface MenuHeaderProps {
  onSidebarClose: () => void;
}

function MenuHeader({ onSidebarClose }: MenuHeaderProps) {
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);

  return (
    <>
      <div className="flex items-center gap-3 p-2 px-3">
        <h1 className="me-auto text-lg font-medium">Messages</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowNewChatDialog(true)}
        >
          <Plus className="size-4" />
        </Button>
      </div>
      <hr className="my-1" />

      {showNewChatDialog && (
        <NewChatDialog
          onOpenChange={setShowNewChatDialog}
          onChatCreated={() => {
            setShowNewChatDialog(false);
            onSidebarClose();
          }}
        />
      )}
    </>
  );
}
