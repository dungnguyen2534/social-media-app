import { getSessionData } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import UserAvatar from "../common/UserAvatar";
import FollowButton from "../common/FollowButton";
import { getUserDataSelect } from "@/lib/type";

export default async function WhoToFollow() {
  const session = await getSessionData();
  if (!session?.user.id) return null;

  const usersToFollow = await prisma.user.findMany({
    where: {
      NOT: {
        id: session.user.id,
      },

      // followers: {
      //   none: {
      //     followerId: session.user.id,
      //   },
      // },
    },
    select: getUserDataSelect(session.user.id),
    take: 5,
  });

  return (
    <div className="bg-card space-y-3 rounded-md p-5 shadow-sm">
      <div className="-mt-2 text-lg font-semibold">Who to follow</div>
      <hr />

      {usersToFollow.map((user) => (
        <div
          key={user.id}
          className="grid grid-cols-[2fr_1fr] items-center gap-3"
        >
          <Link
            href={`/users/${user.username}`}
            className="flex min-w-0 items-center gap-2"
          >
            <UserAvatar avatarUrl={user.image} />
            <div className="h-9 min-w-0 flex-grow">
              <div className="line-clamp-1 block text-sm font-medium text-nowrap overflow-ellipsis hover:underline">
                {user.name}
              </div>
              <div className="text-muted-foreground line-clamp-1 block text-xs text-nowrap overflow-ellipsis">
                @{user.username}
              </div>
            </div>
          </Link>
          <FollowButton
            userId={user.id}
            initialState={{
              followers: user._count.followers,
              isFollowing: user.followers.some(
                ({ followerId }) => followerId === session.user.id,
              ),
            }}
          />
        </div>
      ))}
    </div>
  );
}
