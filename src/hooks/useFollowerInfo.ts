import api from "@/lib/ky";
import { FollowerInfo } from "@/lib/type";
import { useQuery } from "@tanstack/react-query";

export default function useFollowerInfo(
  userId: string,
  initialState: FollowerInfo,
) {
  const query = useQuery({
    queryKey: ["follower-info", userId],
    queryFn: () => api.get(`users/${userId}/followers`).json<FollowerInfo>(),
    initialData: initialState,
    staleTime: Infinity, // only revalidate when asked to
  });

  return query;
}
