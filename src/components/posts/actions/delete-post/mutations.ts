import { PostsPage } from "@/lib/type";
import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { deletePost } from "./actions";
import { isActionError } from "@/lib/action-error";
import toast from "react-hot-toast";

export function useDeletePostMutation() {
  const queryClient = useQueryClient();

  const router = useRouter();
  const pathname = usePathname();

  const mutation = useMutation({
    mutationFn: deletePost,
    onSuccess: async (result) => {
      if (isActionError(result)) {
        toast.error(result.error);
        return;
      }

      const queryFilter: QueryFilters = { queryKey: ["feed"] };
      await queryClient.cancelQueries(queryFilter);

      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
        queryFilter,
        (oldData) => {
          if (!oldData) return;

          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => ({
              nextCursor: page.nextCursor,
              posts: page.posts.filter((p) => p.id !== result.id),
            })),
          };
        },
      );

      if (pathname === `/posts/${result.id}`) {
        router.push(`/users/${result.user.username}`);
      }
    },
  });

  return mutation;
}
