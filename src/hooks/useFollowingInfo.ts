import api from "@/lib/ky";
import { FollowingInfo } from "@/lib/type";
import { useQuery } from "@tanstack/react-query";

export default function useFollowingInfo(
  userId: string,
  initialState: FollowingInfo,
) {
  const query = useQuery({
    queryKey: ["following-info", userId],
    queryFn: () => api.get(`users/${userId}/following`).json<FollowingInfo>(),
    initialData: initialState,
    staleTime: Infinity,
  });

  return query;
}
