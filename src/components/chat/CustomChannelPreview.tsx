"use client";

import { cn } from "@/lib/utils";
import { BellOff, Circle } from "lucide-react";
import {
  AvatarProps,
  ChannelPreviewMessenger,
  ChannelPreviewUIComponentProps,
} from "stream-chat-react";
import ChannelMoreButton from "./ChannelMoreButton";
import CustomAvatar from "./CustomAvatar";

interface CustomChannelPreviewProps extends ChannelPreviewUIComponentProps {
  signedInUserId: string;
  onChannelListClose: () => void;
}

export default function CustomChannelPreview({
  channel,
  signedInUserId,
  onChannelListClose,
  ...restProps
}: CustomChannelPreviewProps) {
  const channelId = channel.id;
  if (!channelId) return null;

  const members = Object.values(channel.state.members);
  const onlineMembers = members.filter(
    (member) => member.user?.online && member.user_id !== signedInUserId,
  );

  const AvatarWrapper = (avatarProps: AvatarProps) => {
    return (
      <div className="relative">
        <CustomAvatar {...avatarProps} />
        <Circle
          className={cn(
            "text-card absolute -right-1 bottom-0 size-2.5 fill-green-500",
            !!onlineMembers.length ? "fill-green-500" : "hidden",
          )}
        />
      </div>
    );
  };

  return (
    <div className="group relative">
      <div className="absolute top-1/2 right-3 z-1 -translate-y-1/2">
        <ChannelMoreButton
          className="group-hover:bg-card opacity-0 transition-opacity lg:group-hover:opacity-100"
          channel={channel}
          signedInUserId={signedInUserId}
        />
      </div>
      <ChannelPreviewMessenger
        {...restProps}
        channel={channel}
        onSelect={() => {
          restProps.setActiveChannel?.(channel, restProps.watchers);
          onChannelListClose();
        }}
        Avatar={AvatarWrapper}
      />

      <div className="text-muted-foreground absolute top-1/2 right-4.5 z-1 -translate-y-1/2 group-hover:hidden">
        {channel.muteStatus().muted && <BellOff className="size-4" />}
      </div>
    </div>
  );
}
