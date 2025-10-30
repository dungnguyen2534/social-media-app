"use client";

import {
  Channel,
  MessageInput,
  MessageList,
  useAttachmentManagerState,
  useChatContext,
  useMessageComposerHasSendableData,
  useMessageInputContext,
  Window,
} from "stream-chat-react";
import CustomChannelHeader from "./CustomChannelHeader";
import { Button } from "../ui/button";
import { MessagesSquare, SendHorizontal } from "lucide-react";
import {
  CustomEditMessageModal,
  CustomMessage,
  CustomMessageStatus,
  CustomMessageTimestamp,
} from "./CustomeMessage";
import CustomAvatar from "./CustomAvatar";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/app/auth-context";
import toast from "react-hot-toast";
import { useEffect } from "react";
interface ChatChanelProps {
  backToChannelList: () => void;
}

export default function ChatChanel({ backToChannelList }: ChatChanelProps) {
  const session = useAuth();
  const signedInUserId = session!.user.id!;

  const { client, setActiveChannel } = useChatContext();

  const searchParams = useSearchParams();
  const directMessageToId = searchParams.get("userId");

  const {
    data: channel,
    isSuccess,
    isError,
    error,
  } = useQuery({
    queryKey: ["createDirectChannel", directMessageToId],
    queryFn: async () => {
      if (!directMessageToId) return null;
      const newChannel = client.channel("messaging", undefined, {
        members: [signedInUserId, directMessageToId],
      });
      await newChannel.create();
      return newChannel;
    },
    enabled: !!directMessageToId,
    refetchOnWindowFocus: false,
    retry: false,
  });

  useEffect(() => {
    if (isSuccess && channel) {
      setActiveChannel(channel);
    }

    if (isError) {
      console.error("Error starting chat", error);
      toast.error("Error starting chat, please try again.");
    }
  }, [isSuccess, isError, channel, error, setActiveChannel]);

  return (
    <div className="flex-1 lg:block">
      <Channel
        LoadingIndicator={() => null}
        EmptyPlaceholder={<EmptyPlaceholder />}
        EmptyStateIndicator={EmptyStateIndicator}
        SendButton={CustomSendButton}
        Message={CustomMessage}
        MessageTimestamp={CustomMessageTimestamp}
        MessageStatus={CustomMessageStatus}
        Avatar={CustomAvatar}
        EditMessageModal={CustomEditMessageModal}
      >
        <Window>
          <CustomChannelHeader backToChannelList={backToChannelList} />
          <MessageList messageActions={["edit", "delete"]} />
          <MessageInput maxRows={6} />
        </Window>
      </Channel>
    </div>
  );
}

function CustomSendButton() {
  const { handleSubmit } = useMessageInputContext();
  const hasSendableData = useMessageComposerHasSendableData();
  const { uploadsInProgressCount } = useAttachmentManagerState();

  const isDisabled = !hasSendableData || uploadsInProgressCount > 0;

  return (
    <Button
      size="icon"
      variant="ghost"
      className="hover:bg-input/50 ml-1.5 rounded-full shadow-none"
      onClick={handleSubmit}
      disabled={isDisabled}
    >
      <SendHorizontal className="size-5.5 text-[#72767E]" />
    </Button>
  );
}

function EmptyPlaceholder() {
  return (
    <div className="text-muted-foreground/50 hidden flex-1 items-center justify-center lg:flex">
      <div className="flex flex-col items-center justify-center gap-3 text-lg font-medium">
        <MessagesSquare className="size-28" />
        Let&apos;s start a conversation!
      </div>
    </div>
  );
}

function EmptyStateIndicator() {
  return (
    <div className="text-muted-foreground/50 mt-57.5 flex flex-1 items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-3 text-lg font-medium">
        <MessagesSquare className="size-28" />
        No chat here yet...
      </div>
    </div>
  );
}
