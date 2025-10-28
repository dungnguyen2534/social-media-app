"use client";

import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import { Bell } from "lucide-react";
import { NotificationCountInfo } from "@/lib/type";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/ky";

interface NotificationButtonProps
  extends React.ComponentPropsWithoutRef<typeof Button> {
  className?: string;
  initialState: NotificationCountInfo;
  onMobileNav?: boolean;
}

export default function NotificationButton({
  className,
  initialState,
  onMobileNav,
  ...rest
}: NotificationButtonProps) {
  const { data } = useQuery({
    queryKey: ["unread-notification-count"],
    queryFn: () =>
      api.get("notifications/unread-count").json<NotificationCountInfo>(),

    initialData: initialState,
    refetchInterval: 30 * 1000,
  });

  return (
    <Button asChild size={onMobileNav ? "icon" : "default"} {...rest}>
      <Link href="/notifications" className={className}>
        <div className="relative">
          <Bell className="mt-[0.15rem] size-4 lg:mt-0 lg:size-5" />
          {data.unreadCount > 0 && (
            <span className="text-primary absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 text-xs font-medium tabular-nums"></span>
          )}
        </div>

        {!onMobileNav && (
          <div>
            Notifications
            {data.unreadCount > 0 && ` (${data.unreadCount})`}
          </div>
        )}
      </Link>
    </Button>
  );
}
