import { prisma } from "@/lib/prisma";
import { formatNumber } from "@/lib/utils";
import { unstable_cache } from "next/cache";
import Link from "next/link";

const getTrendingTopics = unstable_cache(
  async () => {
    const result = await prisma.$queryRaw<{ hashtag: string; count: bigint }[]>`
    SELECT LOWER(unnest(regexp_matches(content, '#[[:alnum:]_]+', 'g'))) AS hashtag, COUNT(*) AS count
    FROM posts
    GROUP BY (hashtag)
    ORDER BY count DESC, hashtag ASC
    LIMIT 5
  `;

    // convert bigint to number
    return result.map((row) => ({
      hashtag: row.hashtag,
      count: Number(row.count),
    }));
  },
  ["trending-topics"],
  {
    revalidate: 3 * 60 * 60, // 3 hours
  },
);

export default async function Trending() {
  const trendingTopics = await getTrendingTopics();

  return (
    <div className="bg-card space-y-3 rounded-md p-5 shadow-sm">
      <div className="-mt-2 text-lg font-semibold">Trending Topics</div>
      <hr />
      {trendingTopics.map(({ hashtag, count }) => {
        const title = hashtag.split("#")[1];

        return (
          <Link key={title} href={`/hashtags/${title}`} className="block">
            <p
              className="line-clamp-1 font-semibold break-all hover:underline"
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
