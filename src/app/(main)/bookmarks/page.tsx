import BookmarkFeed from "@/components/feeds/BookmarkFeed";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bookmarks",
};

export default function BookmarksPage() {
  return (
    <div>
      <div className="bg-card mb-1 flex h-9 items-center justify-center p-1 shadow-sm lg:mb-2 lg:rounded-md">
        <h1 className="font-medium">Your bookmarks</h1>
      </div>
      <BookmarkFeed />
    </div>
  );
}
