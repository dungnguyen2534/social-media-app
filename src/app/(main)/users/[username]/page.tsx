import { getSessionData } from "@/auth";
import UserProfileFeed from "@/components/feeds/UserProfileFeed";
import TrendingTopics from "@/components/sidebars/TrendingTopics";
import WhoToFollow from "@/components/sidebars/WhoToFollow";
import { prisma } from "@/lib/prisma";
import {
  FollowerInfo,
  FollowingInfo,
  getUserDataSelect,
  UserData,
} from "@/lib/type";
import { Loader2 } from "lucide-react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache, Suspense } from "react";
import { Card } from "@/components/ui/card";
import UserAvatar from "@/components/common/UserAvatar";
import { formatDate } from "date-fns";
import { Button } from "@/components/ui/button";
import FollowButton from "@/components/common/FollowButton";
import { FollowerCount, FollowingCount } from "@/components/common/FollowCount";

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
    <main className="app-container app-grid">
      <aside className="app-sidebar"></aside>
      <div className="space-y-2">
        <UserProfile user={user} signedInUserId={signedInUser?.id} />
        <UserProfileFeed userId={user.id} />
      </div>

      <aside className="app-sidebar">
        {/* TODO: Skeleton loading for the fallback */}
        <Suspense fallback={<Loader2 className="mx-auto animate-spin" />}>
          <WhoToFollow />
          <TrendingTopics />
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
    <div>
      <Card className="relative h-fit gap-2 rounded-md border-0 p-5">
        <div className="flex">
          <div className="flex flex-col gap-2">
            <UserAvatar
              avatarUrl={user.image}
              className="size-20 md:size-28"
              iconSize="size-10 md:size-16"
            />
            <div className="">
              <h1 className="text-lg font-bold md:text-xl">{user.name}</h1>
              <div className="text-muted-foreground text-sm font-medium">
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
                <Button variant="secondary">Edit Profile</Button>
              ) : (
                <FollowButton
                  initialState={followerInfo}
                  userId={user.id}
                  className="w-24"
                />
              ))}
          </div>
        </div>

        {user.bio && <p>{user.bio}</p>}

        <hr />
        <div className="flex gap-3">
          <FollowerCount userId={user.id} initialState={followerInfo} />
          |
          <FollowingCount userId={user.id} initialState={followingInfo} />
        </div>
      </Card>
    </div>
  );
}
