import { createContext, useContext, useState } from "react";
import {
  EditMessageModal,
  EditMessageModalProps,
  MessageContextValue,
  MessageSimple,
  MessageStatusProps,
  useChatContext,
  useMessageContext,
} from "stream-chat-react";
import UserAvatar from "../common/UserAvatar";
import { Loader2 } from "lucide-react";

const TimestampVisibilityContext = createContext({ showTimestamp: false });

export function CustomMessageTimestamp() {
  const { showTimestamp } = useContext(TimestampVisibilityContext);
  const { message, formatDate } = useMessageContext();

  if (!showTimestamp) return null;

  const messageDate = message.created_at
    ? new Date(message.created_at)
    : new Date();
  const formattedDate = formatDate
    ? formatDate(messageDate)
    : messageDate.toLocaleString();

  return (
    <div>
      {formattedDate}
      {message.message_text_updated_at && <span> (edited)</span>}
    </div>
  );
}

export function CustomMessageStatus(props: MessageStatusProps) {
  const { messageType = "simple" } = props;
  const { message, readBy = [] } = useMessageContext();
  const { client } = useChatContext();

  const status = message.status || "unknown";

  const otherUsersWhoRead = readBy.filter(
    (user) => user.id !== client.user?.id && user.id !== message.user?.id,
  );

  const [firstOtherUser] = otherUsersWhoRead;

  return (
    <span className={`str-chat__message-${messageType}-status`}>
      {status === "sending" && <Loader2 className="size-3 animate-spin" />}
      {firstOtherUser && (
        <UserAvatar
          avatarUrl={firstOtherUser.image}
          className="size-3.5"
          iconStyle="size-2.5"
        />
      )}
    </span>
  );
}

export function CustomEditMessageModal(props: EditMessageModalProps) {
  return (
    <EditMessageModal
      additionalMessageInputProps={{
        ...props.additionalMessageInputProps,
        maxRows: 6,
      }}
    />
  );
}
export function CustomMessage(props: Partial<MessageContextValue>) {
  const [showTimestamp, setShowTimestamp] = useState(false);

  return (
    <TimestampVisibilityContext.Provider value={{ showTimestamp }}>
      <div
        className="relative"
        onClick={(e: React.MouseEvent<HTMLDivElement>) => {
          const target = e.target as HTMLElement;

          if (
            target.closest(
              ".str-chat__message-text, .str-chat__message-attachment",
            )
          ) {
            e.stopPropagation();
            setShowTimestamp(!showTimestamp);
          }
        }}
      >
        <MessageSimple {...props} />
      </div>
    </TimestampVisibilityContext.Provider>
  );
}
