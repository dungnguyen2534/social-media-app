import FollowingFeed from "@/components/feeds/FollowingFeed";
import ForYouFeed from "@/components/feeds/ForYouFeed";
import TrendingTopics from "@/components/sidebars/TrendingTopics";
import WhoToFollows from "@/components/sidebars/WhoToFollow";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";

export default async function Home() {
  return (
    <main className="app-container mx-auto mt-2 gap-2 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.75fr)_minmax(0,1fr)]">
      <aside className="sticky top-[calc(var(--navbar-height)+0.5rem)] hidden space-y-2 self-start lg:block"></aside>

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

      <aside className="sticky top-[calc(var(--navbar-height)+0.5rem)] hidden space-y-2 self-start lg:block">
        {/* TODO: Skeleton loading for the fallback */}
        <Suspense fallback={<Loader2 className="mx-auto animate-spin" />}>
          <TrendingTopics />
          <WhoToFollows />
        </Suspense>
      </aside>
    </main>
  );
}
