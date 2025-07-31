import Link from "next/link";
import UserButton from "./UserButton";
import Notification from "./Notification";
import { CreatePost, MobileCreatePostButton } from "./CreatePost";
import { MobileSearchButton, SearchField } from "./Search";

export default function Navbar() {
  return (
    <header className="bg-card sticky top-0 z-10 h-[3.5rem] border-b">
      <div className="app-container mx-auto flex h-full items-center justify-between">
        <div>
          <Link href="/" className="text-primary text-2xl font-bold">
            Socius
          </Link>
        </div>

        <SearchField />

        <div className="flex items-center gap-3">
          <CreatePost />
          <MobileSearchButton />
          <MobileCreatePostButton />
          <Notification />
          <UserButton />
        </div>
      </div>
    </header>
  );
}
