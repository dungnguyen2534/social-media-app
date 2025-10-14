import { useAuth } from "@/app/auth-context";
import api from "@/lib/ky";
import { CommentLikeInfo, CommentsPage } from "@/lib/type"; // Assume CommentsPage is the type returned by the comments infinite query
import { cn } from "@/lib/utils";
import {
  InfiniteData,
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import toast from "react-hot-toast";

interface CommentLikeButtonProps {
  postId: string;
  commentId: string;
  initialState: CommentLikeInfo;
  disabled?: boolean;
}

export default function CommentLikeButton({
  postId,
  commentId,
  initialState,
  disabled,
}: CommentLikeButtonProps) {
  const session = useAuth();
  const userId = session?.user.id;

  const queryClient = useQueryClient();
  const queryKey: QueryKey = ["comment-like-info", commentId];
  const commentsQueryKey: QueryKey = ["comments", postId];

  const apiUrl = `posts/${postId}/comments/${commentId}/likes`;

  const { data } = useQuery({
    queryKey: queryKey,
    queryFn: () => api.get(apiUrl).json<CommentLikeInfo>(),
    initialData: initialState,
    staleTime: Infinity,
  });

  const { mutate } = useMutation({
    mutationFn: () => {
      return data.isLikedByUser ? api.delete(apiUrl) : api.post(apiUrl);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      await queryClient.cancelQueries({ queryKey: commentsQueryKey });

      const prevState = queryClient.getQueryData<CommentLikeInfo>(queryKey);
      const prevCommentsData =
        queryClient.getQueryData<CommentsPage>(commentsQueryKey);

      const newLikeCount =
        (prevState?.likes || 0) + (prevState?.isLikedByUser ? -1 : 1);

      const newLikeInfo: CommentLikeInfo = {
        likes: newLikeCount,
        isLikedByUser: !prevState?.isLikedByUser,
      };

      queryClient.setQueryData<CommentLikeInfo>(queryKey, newLikeInfo);

      if (prevCommentsData) {
        queryClient.setQueryData<InfiniteData<CommentsPage, string | null>>(
          commentsQueryKey,
          (oldData) => {
            if (!oldData) return oldData;

            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                comments: page.comments.map((comment) => {
                  if (comment.id === commentId) {
                    return {
                      ...comment,
                      likes: userId ? [{ userId }] : [],
                      _count: {
                        ...comment._count,
                        likes: newLikeCount,
                      },
                    };
                  }
                  return comment;
                }),
              })),
            };
          },
        );
      }

      return { prevState, prevCommentsData };
    },
    onError: (error, _, context) => {
      queryClient.setQueryData(queryKey, context?.prevState);
      if (context?.prevCommentsData) {
        queryClient.setQueryData(commentsQueryKey, context.prevCommentsData);
      }

      console.log(error);
      toast.error("Something went wrong, please try again.");
    },
  });

  return (
    <button
      className={cn(
        "hover:text-primary cursor-pointer",
        data.isLikedByUser && "text-red-500 hover:text-red-300",
      )}
      disabled={disabled}
      onClick={() => mutate()}
    >
      Like
    </button>
  );
}
