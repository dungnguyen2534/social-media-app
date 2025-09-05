import FollowingFeed from "@/components/feeds/FollowingFeed";
import ForYouFeed from "@/components/feeds/ForYouFeed";
import TrendingTopics from "@/components/sidebars/TrendingTopics";
import WhoToFollow from "@/components/sidebars/WhoToFollow";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";

export default async function Home() {
  return (
    <main className="app-container app-grid">
      <aside className="app-sidebar"></aside>

      <Tabs defaultValue="for-you">
        <TabsList>
          <TabsTrigger value="for-you">For you</TabsTrigger>
          <TabsTrigger value="following">Following</TabsTrigger>
        </TabsList>
        <TabsContent value="for-you">
          <ForYouFeed />
        </TabsContent>
        <TabsContent value="following">
          <FollowingFeed />
        </TabsContent>
      </Tabs>

      <aside className="app-sidebar">
        {/* TODO: Skeleton loading for the fallback */}
        <Suspense fallback={<Loader2 className="mx-auto animate-spin" />}>
          <TrendingTopics />
          <WhoToFollow />
        </Suspense>
      </aside>
    </main>
  );
}
