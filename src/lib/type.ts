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
          usernameUpdatedAt: true,
        }
      : {}),
  } satisfies Prisma.UserSelect;
}

export type UserData = Prisma.UserGetPayload<{
  select: ReturnType<typeof getUserDataSelect>;
}>;

// Post data
export function getPostDataInclude(SignedInUserId?: string) {
  return {
    user: { select: getUserDataSelect(SignedInUserId) },
    attachments: true,

    sharedPost: {
      include: {
        user: { select: getUserDataSelect(SignedInUserId) },
        attachments: true,
      },
    },

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
        comments: true,
      },
    },
  } satisfies Prisma.PostInclude;
}

export type PostData = Prisma.PostGetPayload<{
  include: ReturnType<typeof getPostDataInclude>;
}>;

export type SharedPostData = Omit<
  PostData,
  "likes" | "bookmarks" | "_count" | "sharedPost"
>;

export type PostsPage = {
  posts: PostData[];
  nextCursor: string | null;
};

// Comment data
export function getCommentDataInclude(SignedInUserId?: string) {
  return {
    user: { select: getUserDataSelect(SignedInUserId) },
    gif: true,
    likes: {
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
        replies: true,
      },
    },
  } satisfies Prisma.CommentInclude;
}

export type CommentData = Prisma.CommentGetPayload<{
  include: ReturnType<typeof getCommentDataInclude>;
}>;

export type CommentsPage = {
  comments: CommentData[];
  nextCursor: string | null;
};

// Additional info types
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

export type CommentLikeInfo = {
  likes: number;
  isLikedByUser?: boolean;
};

export type Gif = {
  id: string;
  title: string;
  media_formats: {
    webp: {
      url: string;
      dims: number[];
    };
  };
};
