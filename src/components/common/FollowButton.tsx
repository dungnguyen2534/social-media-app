"use client";

import useFollowerInfo from "@/hooks/useFollowerInfo";
import api from "@/lib/ky";
import { FollowerInfo, FollowingInfo, UserData } from "@/lib/type";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "../ui/button";
import toast from "react-hot-toast";
import { useAuth } from "@/app/auth-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { useState } from "react";

interface FollowButtonProps {
  user: UserData;
  initialState: FollowerInfo;
  noDialog?: boolean;
  className?: string;
}

export default function FollowButton({
  user,
  initialState,
  noDialog,
  className,
}: FollowButtonProps) {
  const { data } = useFollowerInfo(user.id, initialState);
  const session = useAuth();
  const signedInUserId = session?.user.id;

  const [isUnfollowDialogOpen, setIsUnfollowDialogOpen] = useState(false);

  const queryClient = useQueryClient();
  const followerQueryKey = ["follower-info", user.id];
  const followingQueryKey = ["following-info", signedInUserId];

  const { mutate } = useMutation({
    mutationFn: () => {
      return data.isFollowing
        ? api.delete(`users/id/${user.id}/followers`)
        : api.post(`users/id/${user.id}/followers`);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: followerQueryKey });
      await queryClient.cancelQueries({ queryKey: followingQueryKey });

      const prevFollowerState =
        queryClient.getQueryData<FollowerInfo>(followerQueryKey);
      const prevFollowingState =
        queryClient.getQueryData<FollowingInfo>(followingQueryKey);

      queryClient.setQueryData<FollowerInfo>(followerQueryKey, () => ({
        followerCount:
          (prevFollowerState?.followerCount || 0) +
          (prevFollowerState?.isFollowing ? -1 : 1),
        isFollowing: !prevFollowerState?.isFollowing,
      }));

      queryClient.setQueryData<FollowingInfo>(followingQueryKey, () => ({
        followingCount:
          (prevFollowingState?.followingCount || 0) +
          (!prevFollowerState?.isFollowing ? 1 : -1),
      }));

      return { prevFollowerState, prevFollowingState };
    },
    onError: (error, _, context) => {
      queryClient.setQueryData(followerQueryKey, context?.prevFollowerState);
      queryClient.setQueryData(followingQueryKey, context?.prevFollowingState);

      console.log(error);
      toast.error("Something went wrong, please try gain.");
    },
  });

  return (
    <>
      <Button
        variant="custom"
        onClick={
          data.isFollowing
            ? () => (noDialog ? mutate() : setIsUnfollowDialogOpen(true))
            : () => mutate()
        }
        className={className}
      >
        {data.isFollowing ? "Unfollow" : "Follow"}
      </Button>

      <Dialog
        open={isUnfollowDialogOpen}
        onOpenChange={setIsUnfollowDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unfollow @{user.username}?</DialogTitle>
            <hr />
            <DialogDescription>
              Their posts will no longer show up in your following feed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              className="sm:w-24"
              onClick={() => {
                mutate();
                setIsUnfollowDialogOpen(false);
              }}
            >
              Unfollow
            </Button>
            <Button
              className="sm:w-24"
              variant="outline"
              onClick={() => setIsUnfollowDialogOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
