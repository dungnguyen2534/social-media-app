"use client";

import { Channel } from "stream-chat";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Bell, BellOff, MoreHorizontal, Trash2 } from "lucide-react";
import { useChatContext } from "stream-chat-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ChannelMoreButtonProps {
  channel: Channel;
  signedInUserId: string;
  className?: string;
}

export default function ChannelMoreButton({
  channel,
  signedInUserId,
  className,
}: ChannelMoreButtonProps) {
  const { setActiveChannel } = useChatContext();

  const [isMuted, setIsMuted] = useState(channel.muteStatus().muted);
  const handleMuteToggle = async () => {
    if (isMuted) {
      await channel.unmute();
      setIsMuted(false);
    } else {
      await channel.mute();
      setIsMuted(true);
    }
  };

  const [isDelDialogOpen, setIsDelDialogOpen] = useState(false);

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger>
          <div
            className={cn(
              "hover:bg-accent cursor-pointer rounded-full p-1",
              className,
            )}
          >
            <MoreHorizontal className="size-5" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={handleMuteToggle}>
            {isMuted ? (
              <Bell className="mt-[0.1rem] mr-2 size-4" />
            ) : (
              <BellOff className="mt-[0.1rem] mr-2 size-4" />
            )}

            {isMuted ? "Unmute" : "Mute"}
          </DropdownMenuItem>
          <hr className="my-1" />

          <DropdownMenuItem onClick={() => setIsDelDialogOpen(true)}>
            <Trash2 className="mt-[0.1rem] mr-2 size-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isDelDialogOpen} onOpenChange={setIsDelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="-mb-1 text-lg font-semibold">
              Delete this chat?
            </DialogTitle>
            <hr />
            <DialogDescription className="hidden" />
          </DialogHeader>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="destructive"
              onClick={async () => {
                await channel.hide(signedInUserId, true);
                setActiveChannel(undefined);
              }}
            >
              Delete
            </Button>
            <Button
              onClick={async () => setIsDelDialogOpen(false)}
              variant="secondary"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
