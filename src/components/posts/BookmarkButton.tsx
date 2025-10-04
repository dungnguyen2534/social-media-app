import api from "@/lib/ky";
import { BookmarkInfo } from "@/lib/type";
import { cn } from "@/lib/utils";
import {
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Bookmark } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "../ui/button";

interface BookmarkButtonProps {
  postId: string;
  initialState: BookmarkInfo;
}

export default function BookmarkButton({
  postId,
  initialState,
}: BookmarkButtonProps) {
  const queryClient = useQueryClient();
  const queryKey: QueryKey = ["bookmark-info", postId];

  const apiUrl = `posts/${postId}/bookmark`;

  const { data } = useQuery({
    queryKey: queryKey,
    queryFn: () => api.get(apiUrl).json<BookmarkInfo>(),
    initialData: initialState,
    staleTime: Infinity,
  });

  const { mutate } = useMutation({
    mutationFn: () => {
      return data.isBookmarkedByUser ? api.delete(apiUrl) : api.post(apiUrl);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const prevState = queryClient.getQueryData<BookmarkInfo>(queryKey);

      queryClient.setQueryData<BookmarkInfo>(queryKey, () => ({
        isBookmarkedByUser: !prevState?.isBookmarkedByUser,
      }));

      toast(`Post ${data.isBookmarkedByUser ? "un" : ""}bookmarked`);

      return { prevState };
    },
    onError: (error, _, context) => {
      queryClient.setQueryData(queryKey, context?.prevState);

      console.log(error);
      toast.error("Something went wrong, please try gain.");
    },
  });

  return (
    <Button title="Bookmark" variant="ghost" onClick={() => mutate()}>
      <Bookmark
        className={cn(
          "size-5",
          data.isBookmarkedByUser &&
            "fill-black text-black dark:fill-white dark:text-white",
        )}
      />
    </Button>
  );
}
