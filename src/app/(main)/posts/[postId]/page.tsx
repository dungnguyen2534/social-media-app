import { getSessionData } from "@/auth";
import CommentCreator from "@/components/comments/CommentCreator";
import Comments from "@/components/comments/Comments";
import Post from "@/components/posts/Post";
import { prisma } from "@/lib/prisma";
import { getPostDataInclude } from "@/lib/type";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

interface PageProps {
  params: Promise<{ postId: string }>;
}

const getPost = cache(async (postId: string, signedInUserId?: string) => {
  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
    include: getPostDataInclude(signedInUserId),
  });

  if (!post) notFound();

  return post;
});

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { postId } = await params;
  const session = await getSessionData();
  if (!session) return {};

  const post = await getPost(postId, session?.user.id);

  const title = post.content
    ? `${post.user.username}: ${post.content?.slice(0, 50)}...`
    : `${post.user.username}'s post`;

  return {
    title,
  };
}

export default async function PostPage({ params }: PageProps) {
  const { postId } = await params;
  const session = await getSessionData();
  const post = await getPost(postId, session?.user.id);

  return (
    <div className="bg-card scrollbar-thin scrollbar-thumb-accent scrollbar-track-transparent relative flex h-[calc(100dvh-1rem)] flex-col overflow-y-scroll shadow-md lg:rounded-md">
      <Post post={post} noCommentButton className="!rounded-none shadow-none" />
      <div className="px-5">
        <Comments post={post} />
      </div>
      <div className="sticky bottom-0 mt-auto h-fit w-full">
        <CommentCreator post={post} />
      </div>
    </div>
  );
}
