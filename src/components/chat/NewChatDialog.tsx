"use client";

import { useAuth } from "@/app/auth-context";
import LoadingButton from "@/components/common/LoadingButton";
import UserAvatar from "@/components/common/UserAvatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import useDebounce from "@/hooks/useDebounce";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Check, SearchIcon } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { ChannelData, UserResponse } from "stream-chat";
import { useChatContext } from "stream-chat-react";

interface NewChatDialogProps {
  onOpenChange: (open: boolean) => void;
  onChatCreated: () => void;
}

export default function NewChatDialog({
  onOpenChange,
  onChatCreated,
}: NewChatDialogProps) {
  const session = useAuth();
  const signedInUser = session!.user;

  const { client, setActiveChannel } = useChatContext();

  const [selectedUsers, setSelectedUsers] = useState<UserResponse[]>([]);

  const [searchInput, setSearchInput] = useState("");
  const searchInputDebounced = useDebounce(searchInput, 300);

  const { data, isSuccess } = useQuery({
    queryKey: ["stream-users", searchInputDebounced],
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
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const channel = client.channel("messaging", undefined, {
        members: [signedInUser.id!, ...selectedUsers.map((user) => user.id)],
        name:
          selectedUsers.length > 1
            ? signedInUser.name +
              ", " +
              selectedUsers.map((user) => user.name).join(", ")
            : undefined,
      } as ChannelData & { name: string });

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
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="responsive-dialog">
        <DialogTitle className="-mb-1 text-lg font-semibold">
          New chat
        </DialogTitle>
        <DialogDescription className="hidden" />
        <hr />
        <div>
          <div className="group relative">
            <SearchIcon className="text-muted-foreground group-focus-within:text-primary absolute top-1/2 left-0 size-5 -translate-y-1/2 transform" />
            <input
              type="text"
              placeholder="Search users..."
              className="h-12 w-full ps-14 pe-4 focus:outline-none"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <div className="h-96 overflow-y-auto">
            {isSuccess &&
              data.users.map((user) => (
                <UserResult
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
        </div>
        <DialogFooter className="px-6 pb-6">
          <LoadingButton
            disabled={!selectedUsers.length}
            loading={mutation.isPending}
            onClick={() => mutation.mutate()}
            className="w-24"
          >
            Start chat
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface UserResultProps {
  user: UserResponse;
  selected: boolean;
  onClick: () => void;
}

function UserResult({ user, selected, onClick }: UserResultProps) {
  return (
    <button
      className="transition-color hover:bg-muted/50 flex w-full items-center justify-between px-4 py-2.5"
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        <UserAvatar avatarUrl={user.image} />
        <div className="flex flex-col text-start">
          <p className="font-bold">{user.name}</p>
          <p className="text-muted-foreground">@{user.username}</p>
        </div>
      </div>
      {selected && <Check className="size-5" />}
    </button>
  );
}
