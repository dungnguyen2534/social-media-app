import SignInDialog from "@/components/common/SignInDialogTrigger";
import FollowingFeed from "@/components/feeds/FollowingFeed";
import ForYouFeed from "@/components/feeds/ForYouFeed";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function Home() {
  return (
    <Tabs defaultValue="for-you" className="gap-1 lg:gap-2">
      <TabsList className="rounded-none lg:rounded-md">
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
  );
}
