"use client";

import { ChannelHeaderProps, useChatContext } from "stream-chat-react";
import { Button } from "../ui/button";
import { ChevronLeft, Circle } from "lucide-react";
import UserAvatar from "../common/UserAvatar";
import Link from "next/link";
import { cn, formatRelativeDate } from "@/lib/utils";
import ChannelMoreButton from "./ChannelMoreButton";
import { useAuth } from "@/app/auth-context";

interface CustomChanelHeaderProps extends ChannelHeaderProps {
  backToChannelList: () => void;
}

export default function CustomChannelHeader({
  backToChannelList,
}: CustomChanelHeaderProps) {
  const session = useAuth();
  const signedInUserId = session!.user.id!;

  const { setActiveChannel, channel, client } = useChatContext();

  if (!channel || !client) {
    return null;
  }

  const otherMember = Object.values(channel.state.members).find(
    (member) => member.user_id !== client.userID,
  );

  const channelName =
    channel.data?.name || otherMember?.user?.name || "Unknown";
  const isOnline = otherMember?.user?.online;
  const lastActive = otherMember?.user?.last_active;

  let statusText: React.ReactNode;

  if (isOnline) {
    statusText = "online";
  } else if (lastActive) {
    const lastActiveDate = new Date(lastActive);
    const relativeTime = formatRelativeDate(lastActiveDate);
    statusText = `Last active ${relativeTime}`;
  } else {
    statusText = null;
  }

  const otherMemberUsername = otherMember?.user?.username;
  const avatarImage = otherMember?.user?.image;

  return (
    <div className="flex w-full items-center justify-between border-b">
      <div className="flex h-full items-center p-1">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => {
            backToChannelList();
            setActiveChannel(undefined);
          }}
          className="flex h-full lg:hidden"
        >
          <ChevronLeft className="size-5" />
        </Button>

        <Link
          href={`/users/${otherMemberUsername}`}
          passHref
          className="hover:bg-accent cursor-pointer rounded-md px-2 transition-colors"
          title={`@${otherMemberUsername}`}
        >
          <div className="flex h-full min-w-0 items-center space-x-3 p-1 pl-0">
            <div className="outline-card relative rounded-full outline">
              <UserAvatar avatarUrl={avatarImage} />
              <Circle
                className={cn(
                  "text-card absolute right-0 bottom-0 size-2.5 fill-green-500",
                  isOnline ? "fill-green-500" : "fill-gray-500",
                )}
              />
            </div>

            <div className="flex min-w-0 flex-col justify-center">
              <h1 className="truncate font-medium">{channelName}</h1>
              <div className="text-muted-foreground">{statusText}</div>
            </div>
          </div>
        </Link>
      </div>

      <div className="text-muted-foreground flex items-center gap-1 pr-4">
        <ChannelMoreButton
          className="text-muted-foreground hover:text-primary"
          channel={channel}
          signedInUserId={signedInUserId}
        />
      </div>
    </div>
  );
}
