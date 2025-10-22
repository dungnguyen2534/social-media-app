import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import {
  Channel,
  ChannelHeader,
  ChannelHeaderProps,
  MessageInput,
  MessageList,
  Window,
} from "stream-chat-react";

interface ChatChanelProps {
  backToSidebar: () => void;
}

export default function ChatChanel({ backToSidebar }: ChatChanelProps) {
  return (
    <div className="w-full lg:block">
      <Channel>
        <Window>
          <CustomChanelHeader backToSidebar={backToSidebar} />
          <MessageList />
          <MessageInput />
        </Window>
      </Channel>
    </div>
  );
}

interface CustomChanelHeaderProps extends ChannelHeaderProps {
  backToSidebar: () => void;
}

function CustomChanelHeader({
  backToSidebar,
  ...props
}: CustomChanelHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-full p-2 lg:hidden">
        <Button size="icon" variant="ghost" onClick={backToSidebar}>
          <ChevronLeft className="size-4" />
        </Button>
      </div>
      <ChannelHeader {...props} />
    </div>
  );
}
