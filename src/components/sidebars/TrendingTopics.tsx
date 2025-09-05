import { prisma } from "@/lib/prisma";
import { formatNumber } from "@/lib/utils";
import { unstable_cache } from "next/cache";
import Link from "next/link";

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

export default async function TrendingTopics() {
  const trendingTopics = await getTrendingTopics();

  return (
    <div className="bg-card space-y-3 rounded-md p-5 shadow-sm">
      <div className="-mt-2 text-lg font-semibold">Trending topics</div>
      <hr />
      {trendingTopics.map(({ hashtag, count }) => {
        const title = hashtag.split("#")[1];

        return (
          <Link
            key={title}
            href={`/hashtags/${title}`}
            className="group block min-w-0"
          >
            <p
              className="line-clamp-1 min-w-0 font-semibold text-nowrap overflow-ellipsis group-hover:underline"
              title={title}
            >
              #{title}
            </p>
            <p className="text-muted-foreground text-sm">
              {formatNumber(count)}
              {count == 1 ? " post" : " posts"}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
