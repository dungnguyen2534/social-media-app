import { Prisma } from "@prisma/client";

export function getUserDataSelect(SignedInUserId?: string) {
  const baseSelect = {
    id: true,
    username: true,
    name: true,
    image: true,
    createdAt: true,
    _count: {
      select: {
        followers: true,
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

export function getPostDataInclude(SignedInUserId?: string) {
  return {
    user: { select: getUserDataSelect(SignedInUserId) },
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
  followers: number;
  isFollowing: boolean;
};
