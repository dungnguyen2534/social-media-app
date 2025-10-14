import { getSessionData } from "@/auth";
import UserProfileFeed from "@/components/feeds/UserProfileFeed";
import {
  TrendingTopics,
  TrendingTopicsSkeleton,
} from "@/components/sidebars/TrendingTopics";
import {
  WhoToFollow,
  WhoToFollowSkeleton,
} from "@/components/sidebars/WhoToFollow";
import { prisma } from "@/lib/prisma";
import {
  FollowerInfo,
  FollowingInfo,
  getUserDataSelect,
  UserData,
} from "@/lib/type";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache, Suspense } from "react";
import UserAvatar from "@/components/common/UserAvatar";
import { formatDate } from "date-fns";
import FollowButton from "@/components/common/FollowButton";
import { FollowerCount, FollowingCount } from "@/components/common/FollowCount";
import Linkify from "@/components/common/Linkify";
import { ProfileEditor } from "./ProfileEditor";
import FeaturePanel from "@/components/sidebars/FeaturePanel";

interface PageProps {
  params: Promise<{ username: string }>;
}

const getUser = cache(async (username: string, signedInUserId?: string) => {
  const user = await prisma.user.findFirst({
    where: {
      username: {
        equals: username,
        mode: "insensitive",
      },
    },

    select: getUserDataSelect(signedInUserId),
  });

  if (!user) notFound();
  return user;
});

// getSessionData to provide the signedInUserId to `getUser`.
// This allows `getUser` to be efficiently cached across function calls; getSessionData also uses react cache.
async function getProfilePageData(username: string) {
  const session = await getSessionData();
  const user = await getUser(username, session?.user.id);

  return {
    user,
    signedInUser: session?.user,
  };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { username } = await params;
  const { user } = await getProfilePageData(username);
  return {
    title: user.name,
  };
}

export default async function UserProfilePage({ params }: PageProps) {
  const { username } = await params;
  const { user, signedInUser } = await getProfilePageData(username);

  return (
    <main className="app-container app-grid mt-1 !px-0 lg:mt-2 lg:px-3">
      <aside className="app-sidebar">
        <FeaturePanel />
      </aside>

      <div className="space-y-1 lg:space-y-2">
        <UserProfile user={user} signedInUserId={signedInUser?.id} />
        <UserProfileFeed user={user} />
      </div>

      <aside className="app-sidebar">
        <Suspense fallback={<TrendingTopicsSkeleton count={5} />}>
          <TrendingTopics />
        </Suspense>
        <Suspense fallback={<WhoToFollowSkeleton count={5} />}>
          <WhoToFollow />
        </Suspense>
      </aside>
    </main>
  );
}

interface UserProfileProps {
  user: UserData;
  signedInUserId?: string;
}

function UserProfile({ user, signedInUserId }: UserProfileProps) {
  const followerInfo: FollowerInfo = {
    followerCount: user._count.followers,
    isFollowing: signedInUserId
      ? user.followers.some(({ followerId }) => followerId === signedInUserId)
      : undefined,
  };

  const followingInfo: FollowingInfo = {
    followingCount: user._count.following,
  };

  return (
    <div className="text-base">
      <div className="bg-card relative flex h-fit flex-col gap-2 p-5 shadow-sm lg:rounded-md">
        <div className="flex">
          <div className="flex flex-col gap-2">
            <UserAvatar
              avatarUrl={user.image}
              className="size-20 md:size-28"
              iconStyle="size-10 md:size-16"
            />
            <div className="">
              <h1 className="text-lg font-bold md:text-xl">{user.name}</h1>
              <div className="text-muted-foreground">
                <div>
                  @{user.username} - Joined{" "}
                  {formatDate(user.createdAt, "MMM d, yyyy")}
                </div>
              </div>
            </div>
          </div>

          <div className="absolute top-5 right-5">
            {signedInUserId &&
              (signedInUserId === user.id ? (
                <ProfileEditor user={user} />
              ) : (
                <FollowButton
                  initialState={followerInfo}
                  user={user}
                  className="w-24"
                />
              ))}
          </div>
        </div>

        {user.bio && (
          <Linkify>
            <p className="mb-1 overflow-hidden break-words break-all whitespace-pre-line">
              {user.bio}
            </p>
          </Linkify>
        )}

        <hr />
        <div className="flex gap-3">
          <FollowerCount userId={user.id} initialState={followerInfo} />
          |
          <FollowingCount userId={user.id} initialState={followingInfo} />
        </div>
      </div>
    </div>
  );
}
