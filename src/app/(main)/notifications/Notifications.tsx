"use client";

import api from "@/lib/ky";
import { NotificationsPage } from "@/lib/type";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import InfiniteScrollContainer from "../../../components/common/InfiniteScrollContainer";
import { Annoyed } from "lucide-react";
import Notification from "./Notification";
import { useEffect } from "react";
import NotificationSkeletons from "./NotificationSkeletons";

export default function Notifications() {
  const {
    data,
    status,
    isFetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["notifications"],
    queryFn: ({ pageParam }) => {
      return api
        .get(
          "notifications",
          pageParam ? { searchParams: { cursor: pageParam } } : {},
        )
        .json<NotificationsPage>();
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 0,
  });

  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: () => api.patch("notifications/mark-as-read"),
    onSuccess: () => {
      queryClient.setQueryData(["unread-notification-count"], {
        unreadCount: 0,
      });
    },
    onError: (error) => {
      console.error("Failed to mark notifications as read", error);
    },
  });

  useEffect(() => {
    mutate();
  }, [mutate]);

  const notifications = data?.pages.flatMap((page) => page.notifications) || [];

  if (status === "pending") {
    return <NotificationSkeletons count={10} />;
  }

  if (status === "success" && notifications.length === 0 && !hasNextPage) {
    return (
      <div className="bg-card flex h-fit flex-col gap-8 p-5 shadow-sm lg:rounded-md">
        <p className="text-center font-medium">
          You don&apos;t have any notifications...
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="mt-8 flex h-full flex-col items-center gap-8">
        <p className="text-xl font-medium">
          An error occured while loading notifications...
        </p>
        <Annoyed className="size-48" />
      </div>
    );
  }

  return (
    <InfiniteScrollContainer
      onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
    >
      {notifications.map((notification) => (
        <Notification notification={notification} key={notification.id} />
      ))}

      {isFetchingNextPage && <NotificationSkeletons count={2} />}
    </InfiniteScrollContainer>
  );
}
