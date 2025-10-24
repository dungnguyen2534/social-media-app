import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import {
  Channel,
  ChannelHeader,
  ChannelHeaderProps,
  MessageInput,
  MessageList,
  useChatContext,
  Window,
} from "stream-chat-react";

interface ChatChanelProps {
  backToChannelList: () => void;
}

export default function ChatChanel({ backToChannelList }: ChatChanelProps) {
  return (
    <div className="flex-1 lg:block">
      <Channel>
        <Window>
          <CustomChanelHeader backToChannelList={backToChannelList} />
          <MessageList />
          <MessageInput />
        </Window>
      </Channel>
    </div>
  );
}

interface CustomChanelHeaderProps extends ChannelHeaderProps {
  backToChannelList: () => void;
}

function CustomChanelHeader({
  backToChannelList,
  ...props
}: CustomChanelHeaderProps) {
  const { setActiveChannel } = useChatContext();

  return (
    <div className="flex items-center">
      <div className="h-full p-2 lg:hidden">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => {
            backToChannelList();
            setActiveChannel(undefined);
          }}
          className="h-full"
        >
          <ChevronLeft className="size-5" />
        </Button>
      </div>
      <ChannelHeader {...props} />
    </div>
  );
}
