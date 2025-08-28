"use client";

import useFollowerInfo from "@/hooks/useFollowerInfo";
import api from "@/lib/ky";
import { FollowerInfo } from "@/lib/type";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "../ui/button";
import toast from "react-hot-toast";

interface FollowButtonProps {
  userId: string;
  initialState: FollowerInfo;
}

export default function FollowButton({
  userId,
  initialState,
}: FollowButtonProps) {
  const { data } = useFollowerInfo(userId, initialState);

  const queryClient = useQueryClient();
  const queryKey = ["follower-info", userId];

  const { mutate } = useMutation({
    mutationFn: () => {
      return data.isFollowing
        ? api.delete(`users/${userId}/followers`)
        : api.post(`users/${userId}/followers`);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const prevState = queryClient.getQueryData<FollowerInfo>(queryKey);

      queryClient.setQueryData<FollowerInfo>(queryKey, () => ({
        followers:
          (prevState?.followers || 0) + (prevState?.isFollowing ? -1 : 1),
        isFollowing: !prevState?.isFollowing,
      }));

      return { prevState };
    },
    onError: (error, _, context) => {
      queryClient.setQueryData(queryKey, context?.prevState);
      console.log(error);
      toast.error("Something went wrong, please try gain.");
    },
  });

  return (
    <Button
      variant={data.isFollowing ? "secondary" : "default"}
      onClick={() => mutate()}
    >
      {data.isFollowing ? "Unfollow" : "Follow"}
    </Button>
  );
}
