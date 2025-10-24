import { Channel } from "stream-chat";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Bell, BellOff, LogOut, MoreHorizontal, Trash2 } from "lucide-react";

interface ChannelItemMoreButtonProps {
  channel: Channel;
  signedInUserId: string;
  muted: boolean;
}

export default function ChannelItemMoreButton({
  channel,
  signedInUserId,
  muted,
}: ChannelItemMoreButtonProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div className="group-hover:bg-card hover:bg-accent cursor-pointer rounded-full p-1 opacity-0 transition-opacity group-hover:opacity-100">
          <MoreHorizontal className="size-5" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          onClick={async () =>
            muted ? await channel.unmute() : await channel.mute()
          }
        >
          {muted ? (
            <Bell className="mt-[0.1rem] mr-2 size-4" />
          ) : (
            <BellOff className="mt-[0.1rem] mr-2 size-4" />
          )}

          {muted ? "Unmute" : "Mute"}
        </DropdownMenuItem>
        <hr className="my-1" />

        <DropdownMenuItem
          onClick={async () => await channel.hide(signedInUserId, true)}
        >
          <Trash2 className="mt-[0.1rem] mr-2 size-4" /> Delete
        </DropdownMenuItem>

        {channel.data?.isGroup && (
          <DropdownMenuItem
            onClick={async () => await channel.removeMembers([signedInUserId])}
          >
            <LogOut className="mt-[0.1rem] mr-2 size-4" /> Leave
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// TODO: use dialogs for delete/leave
