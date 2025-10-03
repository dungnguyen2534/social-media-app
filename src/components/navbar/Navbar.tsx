import Link from "next/link";
import UserButton from "./UserButton";
import Notification from "./Notification";
import { MobileSearchButton, SearchField } from "./Search";
import { getSessionData } from "@/auth";
import { Button } from "../ui/button";
import { ThemeChanger } from "./ThemeChanger";
import PostEditor from "../posts/editor/PostEditor";

export default async function Navbar() {
  const session = await getSessionData();

  return (
    <header className="bg-card sticky top-0 z-10 h-[var(--navbar-height)] border-b">
      <div className="app-container mx-auto grid h-full grid-cols-2 items-center gap-2 lg:grid-cols-3">
        <div>
          <Link href="/" className="text-primary text-2xl font-bold">
            Socius
          </Link>
        </div>

        <div className="hidden lg:block">
          <SearchField />
        </div>

        {session ? (
          <div className="ml-auto flex items-center gap-3">
            <MobileSearchButton />
            <PostEditor />
            <Notification />
            <UserButton />
          </div>
        ) : (
          <div className="ml-auto flex w-full justify-end gap-3">
            <MobileSearchButton />
            <ThemeChanger />
            <Button asChild className="w-28" variant="outline">
              <Link href="/sign-in">Sign in</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
