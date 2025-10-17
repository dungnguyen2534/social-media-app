import Link from "next/link";
import { MobileSearchButton } from "./Search";
import { getSessionData } from "@/auth";
import { Button } from "../ui/button";
import PostEditor from "../posts/editor/PostEditor";
import HamburgerMenu from "./HamburgerMenu";
import { UserInitialDisplayData } from "@/app/(main)/layout";
import NotificationButton from "../common/NotificationButton";

interface MobileNavbarProps {
  userInitialDisplayData: UserInitialDisplayData;
}

export default async function MobileNavbar({
  userInitialDisplayData,
}: MobileNavbarProps) {
  const session = await getSessionData();

  return (
    <header className="bg-card sticky top-0 z-10 h-[var(--navbar-height)] border-b lg:hidden">
      <div className="app-container mx-auto grid h-full grid-cols-2 items-center gap-2">
        <Link href="/" className="text-primary text-2xl font-bold">
          Socius
        </Link>

        {session ? (
          <div className="flex items-center justify-end gap-3">
            <PostEditor />
            <MobileSearchButton />
            <NotificationButton
              onMobileNav
              variant="ghost"
              initialState={{
                unreadCount: userInitialDisplayData.unreadNotificationCount,
              }}
            />
            <HamburgerMenu />
          </div>
        ) : (
          <Button asChild className="w-full flex-1 gap-1">
            <Link href="/sign-in">
              Sign in
              <span className="hidden sm:inline">for the full experience</span>
            </Link>
          </Button>
        )}
      </div>
    </header>
  );
}
