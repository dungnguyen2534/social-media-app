import { Prisma } from "@prisma/client";

export const userDataSelect = {
  select: {
    id: true,
    username: true,
    name: true,
    image: true,
  },
};

export const postDataInclude = {
  user: userDataSelect,
} satisfies Prisma.PostInclude;

export type PostData = Prisma.PostGetPayload<{
  include: typeof postDataInclude;
}>;

export type PostsPage = {
  posts: PostData[];
  nextCursor: string | null;
};
