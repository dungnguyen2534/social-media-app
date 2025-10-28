import {
  Channel,
  MessageInput,
  MessageList,
  useAttachmentManagerState,
  useMessageComposerHasSendableData,
  useMessageInputContext,
  Window,
} from "stream-chat-react";
import CustomChannelHeader from "./CustomChannelHeader";
import { Button } from "../ui/button";
import { SendHorizontal } from "lucide-react";
import {
  CustomEditMessageModal,
  CustomMessage,
  CustomMessageStatus,
  CustomMessageTimestamp,
} from "./CustomeMessage";
import CustomAvatar from "./CustomAvatar";
interface ChatChanelProps {
  backToChannelList: () => void;
}

export default function ChatChanel({ backToChannelList }: ChatChanelProps) {
  return (
    <div className="flex-1 lg:block">
      <Channel
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
