"use client";

import { useAuth } from "@/app/auth-context";
import { cn } from "@/lib/utils";
import { BellOff } from "lucide-react";
import React, { useCallback } from "react";
import {
  ChannelList,
  ChannelPreviewMessenger,
  ChannelPreviewUIComponentProps,
  InfiniteScroll,
} from "stream-chat-react";
import MenuHeader from "./MenuHeader";
import ChannelItemMoreButton from "./ChannelItemMoreButton";

interface ChatChannelistProps {
  open: boolean;
  onChannelListClose: () => void;
}

export default function ChatChannelist({
  open,
  onChannelListClose,
}: ChatChannelistProps) {
  const session = useAuth();
  const signedInUser = session!.user;

  const ChanelPreviewCustom = useCallback(
    (props: ChannelPreviewUIComponentProps) => (
      <div className="group relative">
        <div className="absolute top-1/2 right-3 z-1 -translate-y-1/2">
          <ChannelItemMoreButton
            channel={props.channel}
            signedInUserId={signedInUser.id!}
            muted={props.channel.muteStatus().muted}
          />
        </div>
        <ChannelPreviewMessenger
          {...props}
          onSelect={() => {
            props.setActiveChannel?.(props.channel, props.watchers);
            onChannelListClose();
          }}
        />

        <div className="text-muted absolute top-1/2 right-4.5 z-1 -translate-y-1/2 group-hover:hidden">
          {props.channel.muteStatus().muted && <BellOff className="size-4" />}
        </div>
      </div>
    ),
    [onChannelListClose, signedInUser.id],
  );

  return (
    <div
      className={cn(
        "size-full flex-col border-e lg:flex lg:w-72",
        open ? "flex" : "hidden",
      )}
    >
      <MenuHeader onChannelListClose={onChannelListClose} />
      <ChannelList
        filters={{
          type: "messaging",
          members: { $in: [signedInUser.id!] },
        }}
        options={{
          state: true,
          presence: true,
          limit: 10,
        }}
        sort={{ last_message_at: -1 }}
        showChannelSearch
        additionalChannelSearchProps={{
          searchForChannels: true,
          searchQueryParams: {
            channelFilters: {
              filters: {
                members: { $in: [signedInUser.id!] },
              },
            },
          },
        }}
        Preview={ChanelPreviewCustom}
        Paginator={InfiniteScroll}
        setActiveChannelOnMount={false}
      />
    </div>
  );
}
