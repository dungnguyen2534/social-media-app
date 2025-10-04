import Bookmarks from "@/components/feeds/Bookmarks";
import FeaturePanel from "@/components/sidebars/FeaturePanel";
import {
  TrendingTopics,
  TrendingTopicsSkeleton,
} from "@/components/sidebars/TrendingTopics";
import {
  WhoToFollow,
  WhoToFollowSkeleton,
} from "@/components/sidebars/WhoToFollow";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Bookmarks",
};

export default function BookmarksPage() {
  return (
    <main className="app-container app-grid mt-1 !px-0 lg:mt-2 lg:px-3">
      <aside className="app-sidebar">
        <FeaturePanel />
      </aside>

      <div>
        <div className="bg-card mb-1 flex h-9 items-center justify-center p-1 shadow-sm lg:mb-2 lg:rounded-md">
          <h1 className="font-medium">Your bookmarks</h1>
        </div>
        <Bookmarks />
      </div>

      <aside className="app-sidebar">
        <Suspense fallback={<TrendingTopicsSkeleton count={5} />}>
          <TrendingTopics />
        </Suspense>
        <Suspense fallback={<WhoToFollowSkeleton count={3} />}>
          <WhoToFollow />
        </Suspense>
      </aside>
    </main>
  );
}
