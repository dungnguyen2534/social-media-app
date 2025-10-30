"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ImagePlay, Loader2 } from "lucide-react";
import React, { useState } from "react";
import { useGifSearch } from "./useGifSearch";
import Image from "next/image";
import { Gif } from "@/lib/type";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/ky";

interface GifButtonProps {
  onGifSelect: (gif: Gif | undefined) => void;
  className?: string;
}

export default function GifButton({ className, onGifSelect }: GifButtonProps) {
  const [open, setOpen] = useState(false);

  const {
    searchTerm,
    setSearchTerm,
    results: searchResults,
    isLoading,
    isFetched,
    debouncedSearchTerm,
  } = useGifSearch();

  const { data: featuredGifs, status } = useQuery({
    queryKey: ["gifs-featured"],
    queryFn: async () => {
      const response = await api.get(`tenor/featured?limit=10`).json<{
        results: Gif[];
      }>();

      return response.results;
    },
  });

  const gifsData: Gif[] | undefined =
    debouncedSearchTerm === "" ? featuredGifs : searchResults;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          className={cn("aspect-square h-full p-1", className)}
          size="icon"
        >
          <ImagePlay className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="flex h-96 w-64 flex-col p-2"
        align="start"
      >
        <Input
          placeholder="Search Tenor"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-1"
        />

        <div className="scrollbar-thin scrollbar-thumb-accent scrollbar-track-transparent relative flex-1 overflow-y-auto">
          <div className="flex flex-col">
            {status === "pending" || isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="size-5 animate-spin" />
              </div>
            ) : (
              gifsData &&
              gifsData.map((r) => (
                <Image
                  alt={r.title}
                  src={r.media_formats.webp.url}
                  width={r.media_formats.webp.dims[0]}
                  height={r.media_formats.webp.dims[1]}
                  key={r.id}
                  className="mb-1 w-full cursor-pointer rounded-md last:mb-0"
                  onClick={() => {
                    onGifSelect(r);
                    setOpen(false);
                  }}
                />
              ))
            )}

            {isFetched && gifsData?.length === 0 && !isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                No gifs found.
              </div>
            )}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
