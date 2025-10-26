"use client";

import { useAuth } from "@/app/auth-context";
import LoadingButton from "@/components/common/LoadingButton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import useDebounce from "@/hooks/useDebounce";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Check, SearchIcon } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { ChannelData, UserResponse } from "stream-chat";
import { useChatContext } from "stream-chat-react";
import UserAvatar from "../common/UserAvatar";

interface NewChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChatCreated: () => void;
}

export default function NewChatDialog({
  open,
  onOpenChange,
  onChatCreated,
}: NewChatDialogProps) {
  const session = useAuth();
  const signedInUser = session!.user;

  const { client, setActiveChannel } = useChatContext();

  const [selectedUsers, setSelectedUsers] = useState<UserResponse[]>([]);

  const [searchInput, setSearchInput] = useState("");
  const searchInputDebounced = useDebounce(searchInput, 300);

  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [groupName, setGroupName] = useState("");

  const { data, isSuccess } = useQuery({
    queryKey: ["stream-search-users", searchInputDebounced],
    queryFn: async () => {
      const response = await client.queryUsers(
        {
          ...(searchInputDebounced
            ? {
                $or: [
                  { username: { $autocomplete: searchInputDebounced } },
                  { name: { $autocomplete: searchInputDebounced } },
                ],
              }
            : {}),
        },
        { name: 1, username: 1 },
        { limit: 15 },
      );

      const filteredUsers = response.users.filter(
        (user) => user.id !== signedInUser.id,
      );

      return { ...response, users: filteredUsers };
    },
    enabled: open,
  });

  const memberIds = [signedInUser.id!, ...selectedUsers.map((user) => user.id)];
  const isGroup = selectedUsers.length > 1;

  const mutation = useMutation({
    mutationFn: async () => {
      const channel = client.channel(
        "messaging",
        isGroup ? crypto.randomUUID() : undefined,
        {
          members: memberIds,
          name: isGroup
            ? groupName
            : signedInUser.name +
              ", " +
              selectedUsers.map((user) => user.name).join(", "),
          isGroup: isGroup,
        } as ChannelData,
      );

      await channel.create();
      return channel;
    },

    onSuccess: (channel) => {
      setActiveChannel(channel);
      onChatCreated();
    },

    onError: (error) => {
      console.error("Error starting chat", error);
      toast.error("Error starting chat, please try again.");
    },
  });

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="responsive-dialog !flex !flex-col lg:!h-[calc(100dvh-1rem)]">
          <DialogHeader>
            <DialogTitle className="-mb-1 text-lg font-semibold">
              New chat
            </DialogTitle>
            <hr />
            <DialogDescription className="hidden" />
          </DialogHeader>

          <div className="group bg-accent focus-within:ring-ring/50 relative mb-auto rounded-md transition-all focus-within:ring-[3px]">
            <SearchIcon className="text-muted-foreground group-focus-within:text-primary absolute top-1/2 left-5 size-5 -translate-y-1/2 transform" />
            <input
              type="text"
              placeholder="Search users..."
              className="h-12 w-full ps-14 pe-4 text-base focus:outline-none"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <div className="scrollbar-thin flex-1 overflow-y-auto">
            {isSuccess &&
              data.users.map((user) => (
                <NewChatUserResult
                  key={user.id}
                  user={user}
                  selected={selectedUsers.some((u) => u.id === user.id)}
                  onClick={() => {
                    setSelectedUsers((prev) =>
                      prev.some((u) => u.id === user.id)
                        ? prev.filter((u) => u.id !== user.id)
                        : [...prev, user],
                    );
                  }}
                />
              ))}
          </div>

          <LoadingButton
            disabled={!selectedUsers.length}
            loading={mutation.isPending}
            onClick={() =>
              isGroup ? setIsCreatingGroup(true) : mutation.mutate()
            }
          >
            {isGroup ? "Create group" : "Start chat"}
          </LoadingButton>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreatingGroup} onOpenChange={setIsCreatingGroup}>
        <DialogContent className="responsive-dialog">
          <DialogHeader>
            <DialogTitle className="-mb-1 text-lg font-semibold">
              What&apos;s your group name?
            </DialogTitle>
            <hr />
            <DialogDescription className="hidden" />
          </DialogHeader>

          <div className="group bg-accent focus-within:ring-ring/50 relative rounded-md transition-all focus-within:ring-[3px]">
            <input
              placeholder="New group name"
              className="h-12 w-full px-4 text-base focus:outline-none"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>

          <LoadingButton
            disabled={!selectedUsers.length}
            loading={mutation.isPending}
            onClick={() => mutation.mutate()}
            className=""
          >
            Start chat
          </LoadingButton>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface NewChatUserResultProps {
  user: UserResponse;
  selected: boolean;
  onClick: () => void;
}

function NewChatUserResult({
  user,
  selected,
  onClick,
}: NewChatUserResultProps) {
  return (
    <button
      className="transition-color hover:bg-muted/50 flex w-full cursor-pointer items-center justify-between rounded-md px-4 py-2.5"
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        <UserAvatar avatarUrl={user.image} />
        <div className="flex flex-col text-start">
          <p className="font-medium">{user.name}</p>
          <p className="text-muted-foreground text-xs">@{user.username}</p>
        </div>
      </div>
      {selected && <Check className="size-5" />}
    </button>
  );
}
