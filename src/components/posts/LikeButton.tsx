import api from "@/lib/ky";
import { LikeInfo } from "@/lib/type";
import { cn, formatNumber } from "@/lib/utils";
import {
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Heart } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "../ui/button";

interface LikeButtonProps
  extends React.ComponentPropsWithoutRef<typeof Button> {
  postId: string;
  initialState: LikeInfo;
}

export default function LikeButton({
  postId,
  initialState,
  ...rest
}: LikeButtonProps) {
  const queryClient = useQueryClient();
  const queryKey: QueryKey = ["like-info", postId];

  const apiUrl = `posts/${postId}/likes`;

  const { data } = useQuery({
    queryKey: queryKey,
    queryFn: () => api.get(apiUrl).json<LikeInfo>(),
    initialData: initialState,
    staleTime: Infinity,
  });

  const { mutate } = useMutation({
    mutationFn: () => {
      return data.isLikedByUser ? api.delete(apiUrl) : api.post(apiUrl);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const prevState = queryClient.getQueryData<LikeInfo>(queryKey);

      queryClient.setQueryData<LikeInfo>(queryKey, () => ({
        likes: (prevState?.likes || 0) + (prevState?.isLikedByUser ? -1 : 1),
        isLikedByUser: !prevState?.isLikedByUser,
      }));

      return { prevState };
    },
    onError: (error, _, context) => {
      queryClient.setQueryData(queryKey, context?.prevState);

      console.log(error);
      toast.error("Something went wrong, please try gain.");
    },
  });

  return (
    <Button title="Like" variant="ghost" onClick={() => mutate()} {...rest}>
      <Heart
        className={cn(
          "size-5",
          data.isLikedByUser && "fill-red-500 text-red-500",
        )}
      />

      {data.likes > 0 && (
        <span className="font-medium tabular-nums">
          {formatNumber(data.likes)}
        </span>
      )}
    </Button>
  );
}
