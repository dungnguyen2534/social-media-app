"use client";

import { Channel } from "stream-chat";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Bell, BellOff, LogOut, MoreHorizontal, Trash2 } from "lucide-react";
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
  const { setActiveChannel } = useChatContext();

  const [isDelDialogOpen, setIsDelDialogOpen] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);

  return (
    <>
      <DropdownMenu modal={false}>
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

          <DropdownMenuItem onClick={() => setIsDelDialogOpen(true)}>
            <Trash2 className="mt-[0.1rem] mr-2 size-4" /> Delete
          </DropdownMenuItem>

          {channel.data?.isGroup && (
            <DropdownMenuItem onClick={() => setIsLeaveDialogOpen(true)}>
              <LogOut className="mt-[0.1rem] mr-2 size-4" /> Leave
            </DropdownMenuItem>
          )}
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

      <Dialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="-mb-1 text-lg font-semibold">
              Leave this chat?
            </DialogTitle>
            <hr />
            <DialogDescription className="hidden" />
          </DialogHeader>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="destructive"
              onClick={async () => {
                await channel.removeMembers([signedInUserId]);
                setActiveChannel(undefined);
              }}
            >
              Delete
            </Button>
            <Button
              onClick={async () => setIsLeaveDialogOpen(false)}
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
