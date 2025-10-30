"use client";

import { Bookmark, House, SearchIcon } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import { ThemeSwitcher } from "../ui/theme-switcher";
import { UserInitialDisplayData } from "@/app/(main)/layout";
import NotificationButton from "../common/NotificationButton";
import UserButton from "../common/UserButton";
import PostEditor from "../posts/editor/PostEditor";
import { useAuth } from "@/app/auth-context";
import { usePathname } from "next/navigation";
import MessageButton from "../common/MessageButton";

interface FeaturePanelProps {
  userInitialDisplayData: UserInitialDisplayData;
}

export default function FeaturePanel({
  userInitialDisplayData,
}: FeaturePanelProps) {
  const session = useAuth();
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-2">
      <div className="bg-card overflow-hidden rounded-md p-2 shadow-sm">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-primary block p-2 text-lg font-semibold"
          >
            Socius
          </Link>
          <ThemeSwitcher />
        </div>

        <hr className="my-1" />

        {session ? (
          <div className="space-y-1">
            <Button
              variant={pathname === "/" ? "secondary" : "ghost"}
              className="h-14 w-full justify-start rounded-sm"
              asChild
            >
              <Link href="/">
                <House className="size-5" />
                Home
              </Link>
            </Button>
            <Button
              variant={pathname === "/search" ? "secondary" : "ghost"}
              className="h-14 w-full justify-start rounded-sm"
              asChild
            >
              <Link href="/search">
                <SearchIcon className="size-5" />
                Search
              </Link>
            </Button>

            <Button
              variant={pathname === "/bookmarks" ? "secondary" : "ghost"}
              className="h-14 w-full justify-start rounded-sm"
              asChild
            >
              <Link href="/bookmarks">
                <Bookmark className="size-5" />
                Bookmarks
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-2 py-2">
            <Button className="w-full" asChild>
              <Link href="/sign-in">Sign in for the full experience</Link>
            </Button>
          </div>
        )}
      </div>

      {session && (
        <div className="bg-card space-y-1 overflow-hidden rounded-md p-2 shadow-sm">
          <MessageButton
            variant={pathname === "/messages" ? "secondary" : "ghost"}
            className="h-14 w-full justify-start rounded-sm !px-3"
          />

          <NotificationButton
            variant={pathname === "/notifications" ? "secondary" : "ghost"}
            className="h-14 w-full justify-start rounded-sm !px-3"
            initialState={{
              unreadCount: userInitialDisplayData.unreadNotificationCount,
            }}
          />

          <hr />
          <div className="mt-2 ml-1 flex h-14 items-center gap-2">
            <UserButton className="h-12 w-12 shadow-sm" iconStyle="size-6" />
            <PostEditor />
          </div>
        </div>
      )}
    </div>
  );
}
