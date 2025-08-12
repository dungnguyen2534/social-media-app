import Post from "@/components/posts/Post";
import Trending from "@/components/sidebars/Trending";
import WhoToFollows from "@/components/sidebars/WhoToFollows";
import { prisma } from "@/lib/prisma";
import { postDataInclude } from "@/lib/type";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";

export default async function Home() {
  const posts = await prisma.post.findMany({
    include: postDataInclude,
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="app-container mx-auto mt-2 gap-2 lg:grid lg:grid-cols-[1fr_2fr_1fr]">
      <aside className="sticky top-[calc(var(--navbar-height)+0.5rem)] hidden space-y-2 self-start lg:block"></aside>
      <div>
        {/* TODO: Add a create post section, filter foryou/follow */}
        {posts.map((post) => (
          <Post post={post} className="mb-2" key={post.id} />
        ))}
      </div>
      <aside className="sticky top-[calc(var(--navbar-height)+0.5rem)] hidden space-y-2 self-start lg:block">
        {/* TODO: Skeleton loading for the fallback */}
        <Suspense fallback={<Loader2 className="mx-auto animate-spin" />}>
          <Trending />
          <WhoToFollows />
        </Suspense>
      </aside>
    </main>
  );
}
