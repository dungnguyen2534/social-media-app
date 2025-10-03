import SignInDialog from "@/components/common/SignInDialogTrigger";
import FollowingFeed from "@/components/feeds/FollowingFeed";
import ForYouFeed from "@/components/feeds/ForYouFeed";
import {
  TrendingTopics,
  TrendingTopicsSkeleton,
} from "@/components/sidebars/TrendingTopics";
import {
  WhoToFollow,
  WhoToFollowSkeleton,
} from "@/components/sidebars/WhoToFollow";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Suspense } from "react";

export default async function Home() {
  return (
    <main className="app-container app-grid mt-1 !px-0 lg:mt-2 lg:px-3">
      <aside className="app-sidebar"></aside>

      <Tabs defaultValue="for-you" className="gap-1 lg:gap-2">
        <TabsList className="rounded-none lg:rounded-lg">
          <TabsTrigger value="for-you">For you</TabsTrigger>
          <SignInDialog
            asChild
            trigger={
              <button className="h-full flex-1 font-medium">Following</button>
            }
          >
            <TabsTrigger value="following">Following</TabsTrigger>
          </SignInDialog>
        </TabsList>
        <TabsContent value="for-you">
          <ForYouFeed />
        </TabsContent>
        <TabsContent value="following">
          <FollowingFeed />
        </TabsContent>
      </Tabs>

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
