import useDebounce from "@/hooks/useDebounce";
import api from "@/lib/ky";
import { Gif } from "@/lib/type";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export const useGifSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ["gifs-search-results", searchTerm],
    queryFn: async () => {
      const response = await api
        .get(`tenor/search?q=${debouncedSearchTerm}&limit=10`)
        .json<{
          results: Gif[];
        }>();

      return response.results;
    },
    enabled: !!debouncedSearchTerm,
  });

  return {
    searchTerm,
    setSearchTerm,
    results: data,
    isLoading: isLoading || isFetching,
    isError,
  };
};
