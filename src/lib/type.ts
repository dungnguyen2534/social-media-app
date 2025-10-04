import { Prisma } from "@prisma/client";

export function getUserDataSelect(SignedInUserId?: string) {
  const baseSelect = {
    id: true,
    username: true,
    name: true,
    image: true,
    bio: true,
    createdAt: true,
    _count: {
      select: {
        followers: true,
        following: true,
        posts: true,
      },
    },
  };

  return {
    ...baseSelect,
    ...(SignedInUserId
      ? {
          followers: {
            where: {
              followerId: SignedInUserId,
            },
            select: {
              followerId: true,
            },
          },
        }
      : {}),
  } satisfies Prisma.UserSelect;
}

export type UserData = Prisma.UserGetPayload<{
  select: ReturnType<typeof getUserDataSelect>;
}>;

export function getPostDataInclude(SignedInUserId?: string) {
  return {
    user: { select: getUserDataSelect(SignedInUserId) },
    attachments: true,
    likes: {
      where: {
        userId: SignedInUserId,
      },
      select: {
        userId: true,
      },
    },
    bookmarks: {
      where: {
        userId: SignedInUserId,
      },
      select: {
        userId: true,
      },
    },
    _count: {
      select: {
        likes: true,
      },
    },
  } satisfies Prisma.PostInclude;
}

export type PostData = Prisma.PostGetPayload<{
  include: ReturnType<typeof getPostDataInclude>;
}>;

export type PostsPage = {
  posts: PostData[];
  nextCursor: string | null;
};

export type FollowerInfo = {
  followerCount: number;
  isFollowing?: boolean;
};

export type FollowingInfo = {
  followingCount: number;
};

export type LikeInfo = {
  likes: number;
  isLikedByUser?: boolean;
};

export type BookmarkInfo = {
  isBookmarkedByUser: boolean;
};
