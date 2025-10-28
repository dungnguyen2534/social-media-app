"use client";

import { useAuth } from "@/app/auth-context";
import { cn } from "@/lib/utils";
import { BellOff, ChevronLeft, Circle } from "lucide-react";
import React, { useCallback, useRef } from "react";
import {
  AvatarProps,
  ChannelList,
  ChannelPreviewMessenger,
  ChannelPreviewUIComponentProps,
  ChannelSearchFunctionParams,
  InfiniteScroll,
  SearchResultItemProps,
  useChatContext,
} from "stream-chat-react";
import ChannelMoreButton from "./ChannelMoreButton";
import { StreamChat, UserResponse } from "stream-chat";
import UserAvatar from "../common/UserAvatar";
import CustomAvatar from "./CustomAvatar";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import toast from "react-hot-toast";

interface ChatChannelistProps {
  open: boolean;
  onChannelListClose: () => void;
}

export default function ChatChannelist({
  open,
  onChannelListClose,
}: ChatChannelistProps) {
  const session = useAuth();
  const signedInUserId = session!.user.id!;

  const router = useRouter();
  const { client } = useChatContext();

  const ChanelPreviewCustom = useCallback(
    (props: ChannelPreviewUIComponentProps) => {
      const { channel } = props;

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
              className="group-hover:bg-card opacity-0 transition-opacity group-hover:opacity-100"
              channel={props.channel}
              signedInUserId={signedInUserId}
            />
          </div>
          <ChannelPreviewMessenger
            {...props}
            onSelect={() => {
              props.setActiveChannel?.(props.channel, props.watchers);
              onChannelListClose();
            }}
            Avatar={AvatarWrapper}
          />

          <div className="text-muted-foreground absolute top-1/2 right-4.5 z-1 -translate-y-1/2 group-hover:hidden">
            {props.channel.muteStatus().muted && <BellOff className="size-4" />}
          </div>
        </div>
      );
    },
    [onChannelListClose, signedInUserId],
  );

  const DEBOUNCE_DELAY = 500;
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const customSearchFunction = useCallback(
    async (
      props: ChannelSearchFunctionParams,
      event: React.BaseSyntheticEvent,
      client: StreamChat,
    ) => {
      const { setResults, setSearching, setQuery } = props;
      const value = event.target.value as string;

      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      setQuery(value);

      if (!value || value.trim() === "") {
        setResults([]);
        setSearching(false);
        return;
      }

      setSearching(true);
      debounceTimeoutRef.current = setTimeout(async () => {
        try {
          const { users } = await client.queryUsers(
            {
              $or: [
                { name: { $autocomplete: value } },
                { username: { $autocomplete: value } },
              ],
            },
            { id: 1, name: 1 },
            { limit: 15 },
          );

          const results = users.filter((u) => u.id !== signedInUserId);
          setResults(results);
        } catch (error) {
          console.log(error);
          toast.error("Something went wrong, please try again later.");
          setResults([]);
        } finally {
          setSearching(false);
        }
      }, DEBOUNCE_DELAY);
    },
    [signedInUserId],
  );

  return (
    <div
      className={cn(
        "size-full flex-col border-e lg:flex lg:w-72",
        open ? "flex" : "hidden",
      )}
    >
      <div className="flex items-center p-1">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => router.back()}
          className="mr-2 flex h-full lg:hidden"
        >
          <ChevronLeft className="size-5" />
        </Button>
        <h1 className="me-auto py-2.5 text-lg font-medium lg:ml-2.5">
          Messages
        </h1>
      </div>
      <hr />
      <ChannelList
        filters={{
          type: "messaging",
          members: { $in: [signedInUserId] },
        }}
        options={{
          state: true,
          presence: true,
          limit: 10,
        }}
        sort={{ last_message_at: -1 }}
        showChannelSearch
        additionalChannelSearchProps={{
          searchQueryParams: {
            userFilters: {
              filters: {
                role: { $eq: "user" },
              },
            },
          },
          SearchResultItem: CustomSearchResult,
          searchFunction: (params, event) => {
            return customSearchFunction(params, event, client);
          },
          searchDebounceIntervalMs: 3000,
        }}
        Preview={ChanelPreviewCustom}
        Paginator={InfiniteScroll}
        setActiveChannelOnMount={false}
      />
    </div>
  );
}

function CustomSearchResult({ result, selectResult }: SearchResultItemProps) {
  const userResult = result as UserResponse;
  if (!userResult) return;

  return (
    <button
      className="transition-color hover:bg-muted/50 flex w-full cursor-pointer items-center justify-between px-4 py-2.5"
      onClick={() => selectResult(result)}
    >
      <div className="flex items-center gap-2">
        <UserAvatar avatarUrl={userResult.image} className="size-12" />
        <div className="flex flex-col text-start">
          <p className="font-medium">{userResult.name}</p>
          <p className="text-muted-foreground">@{userResult.username}</p>
        </div>
      </div>
    </button>
  );
}
