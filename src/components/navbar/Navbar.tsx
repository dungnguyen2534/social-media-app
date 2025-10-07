import Link from "next/link";
import Notification from "./Notification";
import { MobileSearchButton } from "./Search";
import { getSessionData } from "@/auth";
import { Button } from "../ui/button";
import { ThemeChanger } from "./ThemeChanger";
import PostEditor from "../posts/editor/PostEditor";
import HamburgerMenu from "./HamburgerMenu";

// TODO: make hamburger menu
export default async function Navbar() {
  const session = await getSessionData();

  return (
    <header className="bg-card sticky top-0 z-10 h-[var(--navbar-height)] border-b lg:hidden">
      <div className="app-container mx-auto grid h-full grid-cols-2 items-center gap-2">
        <div>
          <Link href="/" className="text-primary text-2xl font-bold">
            Socius
          </Link>
        </div>

        {session ? (
          <div className="flex items-center justify-end gap-3">
            <PostEditor />
            <MobileSearchButton />
            <Notification />
            {/*TODO: Add messages here later */}
            <HamburgerMenu />
          </div>
        ) : (
          <div className="flex justify-end gap-3">
            <ThemeChanger
              className="text-muted-foreground"
              variant="secondary"
            />
            <Button asChild className="w-full flex-1">
              <Link href="/sign-in">Sign in</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
