import { useAuth } from "@/app/auth-context";
import api from "@/lib/ky";
import { CommentLikeInfo, CommentsPage } from "@/lib/type";
import { cn } from "@/lib/utils";
import {
  InfiniteData,
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useCommentContext } from "../comment-context";

interface ReplyLikeButtonProps {
  postId: string;
  parentCommentId: string;
  replyId: string;
  initialState: CommentLikeInfo;
  disabled?: boolean;
}

type PreviousRepliesData = {
  queryKey: QueryKey;
  data: InfiniteData<CommentsPage>;
};

export default function ReplyLikeButton({
  postId,
  parentCommentId,
  replyId,
  initialState,
  disabled,
}: ReplyLikeButtonProps) {
  const session = useAuth();
  const userId = session?.user.id;

  const { newLocalReplies, setNewLocalReplies } = useCommentContext();

  const queryClient = useQueryClient();
  const queryKey: QueryKey = ["reply-like-info", replyId];
  const repliesQueryKeyPrefix: QueryKey = ["replies", parentCommentId];

  const apiUrl = `posts/${postId}/comments/${replyId}/likes`;

  const { data } = useQuery({
    queryKey: queryKey,
    queryFn: () => api.get(apiUrl).json<CommentLikeInfo>(),
    initialData: initialState,
    staleTime: Infinity,
  });

  const { mutate } = useMutation({
    mutationFn: (isCurrentlyLiked: boolean) => {
      return isCurrentlyLiked ? api.delete(apiUrl) : api.post(apiUrl);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      await queryClient.cancelQueries({ queryKey: repliesQueryKeyPrefix });

      const prevState = queryClient.getQueryData<CommentLikeInfo>(queryKey);

      const isCurrentlyLiked = prevState?.isLikedByUser ?? false;
      const newLikeCount =
        (prevState?.likes || 0) + (isCurrentlyLiked ? -1 : 1);

      queryClient.setQueryData<CommentLikeInfo>(queryKey, {
        likes: newLikeCount,
        isLikedByUser: !isCurrentlyLiked,
      });

      const relevantQueries = queryClient
        .getQueryCache()
        .findAll({ queryKey: repliesQueryKeyPrefix });

      const previousReplies: PreviousRepliesData[] = [];
      relevantQueries.forEach((query) => {
        if (query.state.data) {
          previousReplies.push({
            queryKey: query.queryKey,
            data: query.state.data as InfiniteData<CommentsPage>,
          });
        }
      });

      const updater = (
        oldData: InfiniteData<CommentsPage> | undefined,
      ): InfiniteData<CommentsPage> | undefined => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            comments: page.comments.map((comment) => {
              if (comment.id === replyId) {
                return {
                  ...comment,
                  likes: !isCurrentlyLiked && userId ? [{ userId }] : [],
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
      };

      previousReplies.forEach(({ queryKey }) => {
        queryClient.setQueryData(queryKey, updater);
      });

      if (newLocalReplies) {
        const updatedReplies = newLocalReplies.map((reply) => {
          if (reply.id === replyId) {
            return {
              ...reply,
              likes: !isCurrentlyLiked && userId ? [{ userId }] : [],
              _count: {
                ...reply._count,
                likes: newLikeCount,
              },
            };
          }
          return reply;
        });
        setNewLocalReplies(updatedReplies);
      }

      return { prevState, previousReplies, isCurrentlyLiked };
    },
    onError: (error, _, context) => {
      queryClient.setQueryData(queryKey, context?.prevState);
      context?.previousReplies?.forEach(({ queryKey, data }) => {
        queryClient.setQueryData(queryKey, data);
      });

      console.error(error);
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
      onClick={() => mutate(data.isLikedByUser ?? false)}
    >
      Like
    </button>
  );
}
