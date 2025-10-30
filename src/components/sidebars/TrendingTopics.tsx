import { prisma } from "@/lib/prisma";
import { formatNumber } from "@/lib/utils";
import { unstable_cache } from "next/cache";
import Link from "next/link";
import SidebarSkeletonWrapper from "./SidebarSkeletonWrapper";
import { Skeleton } from "../ui/skeleton";

const getTrendingTopics = unstable_cache(
  async () => {
    // Attempt to get trending topics from the last week
    const recentTopics = await prisma.$queryRaw<
      { hashtag: string; count: bigint }[]
    >`
      SELECT LOWER(unnest(regexp_matches(content, '#[[:alnum:]_]+', 'g'))) AS hashtag, COUNT(*) AS count
      FROM posts
      WHERE "createdAt" >= NOW() - INTERVAL '7 days'
      GROUP BY (hashtag)
      ORDER BY count DESC, hashtag ASC
      LIMIT 5
    `;

    // If there are 5 or more recent topics, return them
    if (recentTopics.length >= 5) {
      return recentTopics.map((row) => ({
        hashtag: row.hashtag,
        count: Number(row.count),
      }));
    }

    // If not enough recent topics, fetch topics from all time
    const allTimeTopics = await prisma.$queryRaw<
      { hashtag: string; count: bigint }[]
    >`
      SELECT LOWER(unnest(regexp_matches(content, '#[[:alnum:]_]+', 'g'))) AS hashtag, COUNT(*) AS count
      FROM posts
      GROUP BY (hashtag)
      ORDER BY count DESC, hashtag ASC
      LIMIT 5
    `;

    return allTimeTopics.map((row) => ({
      hashtag: row.hashtag,
      count: Number(row.count),
    }));
  },
  ["trending-topics"],
  {
    revalidate: 3 * 60 * 60, // 3 hours
  },
);

export async function TrendingTopics() {
  const trendingTopics = await getTrendingTopics();

  return (
    <div className="bg-card overflow-hidden rounded-md p-2 shadow-sm">
      <div className="p-2 text-lg font-semibold">Trending topics</div>
      <hr className="my-1" />
      <div>
        {trendingTopics.map(({ hashtag, count }) => {
          const tag = hashtag.split("#")[1];

          return (
            <Link
              key={tag}
              href={`/hashtags/${tag}`}
              className="group hover:bg-accent block min-w-0 rounded-sm p-2 transition-colors duration-75"
            >
              <p
                className="line-clamp-1 min-w-0 font-medium text-nowrap overflow-ellipsis"
                title={tag}
              >
                #{tag}
              </p>
              <p className="text-muted-foreground text-sm">
                {formatNumber(count)}
                {count == 1 ? " post" : " posts"}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function TrendingTopicsSkeleton({ count = 5 }: { count?: number }) {
  return (
    <SidebarSkeletonWrapper skeletonCount={count} title="Trending topics">
      <div className="flex h-10 flex-col justify-center gap-2">
        <Skeleton className="h-[0.9rem] w-3/4" />
        <Skeleton className="h-[0.8rem] w-1/3" />
      </div>
    </SidebarSkeletonWrapper>
  );
}
