import { getSessionData } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import UserAvatar from "../common/UserAvatar";
import FollowButton from "../common/FollowButton";
import { getUserDataSelect } from "@/lib/type";
import { MiniProfile } from "../common/MiniProfile";
import SidebarSkeletonWrapper from "./SidebarSkeletonWrapper";
import { Skeleton } from "../ui/skeleton";

export async function WhoToFollow() {
  const session = await getSessionData();
  if (!session?.user.id) return null;

  const usersToFollow = await prisma.user.findMany({
    where: {
      NOT: {
        id: session.user.id,
      },
      followers: {
        none: {
          followerId: session.user.id,
        },
      },
    },
    select: getUserDataSelect(session.user.id),
    orderBy: {
      followers: {
        _count: "desc",
      },
    },
    take: 5,
  });

  if (usersToFollow.length === 0) return null;
  return (
    <div className="bg-card overflow-hidden rounded-md p-2 shadow-sm">
      <div className="p-2 text-lg font-semibold">Who to follow</div>
      <hr className="my-1" />
      <div className="space-y-2">
        {usersToFollow.map((user) => (
          <div
            key={user.id}
            className="grid grid-cols-[2fr_1fr] items-center gap-3 p-2"
          >
            <MiniProfile user={user}>
              <Link
                href={`/users/${user.username}`}
                className="group flex min-w-0 items-center gap-2"
              >
                <UserAvatar avatarUrl={user.image} />
                <div className="h-9 min-w-0 flex-grow">
                  <div className="line-clamp-1 block font-medium text-nowrap overflow-ellipsis underline-offset-2 group-hover:underline">
                    {user.name}
                  </div>
                  <div className="text-muted-foreground line-clamp-1 block text-xs text-nowrap overflow-ellipsis">
                    @{user.username}
                  </div>
                </div>
              </Link>
            </MiniProfile>
            <FollowButton
              user={user}
              initialState={{
                followerCount: user._count.followers,
                isFollowing: user.followers.some(
                  ({ followerId }) => followerId === session.user.id,
                ),
              }}
              className="w-24"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function WhoToFollowSkeleton({ count = 5 }: { count?: number }) {
  return (
    <SidebarSkeletonWrapper
      skeletonCount={count}
      title="Who to follow"
      listStyle="space-y-2"
    >
      <div className="flex">
        <div className="flex items-center gap-2">
          <Skeleton className="aspect-square h-9 rounded-full" />

          <div className="flex h-9 flex-col justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-[0.8rem] w-14" />
          </div>
        </div>
        <Skeleton className="ml-auto h-9 w-24" />
      </div>
    </SidebarSkeletonWrapper>
  );
}
