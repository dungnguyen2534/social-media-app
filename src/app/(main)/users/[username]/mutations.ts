import { useUploadThing } from "@/lib/uploadthing";
import { userProfileData } from "@/lib/validation";
import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { updateUserProfile } from "./actions";
import { PostsPage } from "@/lib/type";
import { isActionError } from "@/lib/action-error";
import toast from "react-hot-toast";

export function useUpdateProfileMutation() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { startUpload: startUploadAvatar } = useUploadThing("avatar");

  const mutation = useMutation({
    mutationFn: async ({
      data,
      avatar,
    }: {
      data: userProfileData;
      avatar?: File;
    }) => {
      return Promise.all([
        updateUserProfile(data),
        avatar && startUploadAvatar([avatar]),
      ]);
    },
    onSuccess: async ([updatedUserResult, uploadAvatarResult]) => {
      if (isActionError(updatedUserResult)) {
        console.error(updatedUserResult.error);
        return;
      }

      const updatedUser = updatedUserResult;
      const newAvatarUrl = uploadAvatarResult?.[0].serverData.avatarUrl; // from onUploadComplete in uploadthing/core.ts

      const queryFilter: QueryFilters = {
        queryKey: ["feed"],
      };

      await queryClient.cancelQueries(queryFilter);
      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
        queryFilter,
        (oldData) => {
          if (!oldData) return;

          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => ({
              nextCursor: page.nextCursor,
              posts: page.posts.map((post) => {
                if (post.user.id === updatedUser.id) {
                  return {
                    ...post,
                    user: {
                      ...updatedUser,
                      image: newAvatarUrl || updatedUser.image,
                    },
                  };
                }
                return post;
              }),
            })),
          };
        },
      );

      router.replace(`/users/${updatedUser.username}`);
      router.refresh();

      toast.success("Profile updated!");
    },
  });

  return mutation;
}
