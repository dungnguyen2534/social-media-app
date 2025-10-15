"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ImagePlay } from "lucide-react";
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
  const { searchTerm, setSearchTerm, results: searchResults } = useGifSearch();
  const [open, setOpen] = useState(false);

  const { data: featuredGifs } = useQuery({
    queryKey: ["gifs-featured", searchTerm],
    queryFn: async () => {
      const response = await api.get(`tenor/featured?limit=10`).json<{
        results: Gif[];
      }>();

      return response.results;
    },
  });

  const gifsData = searchResults || featuredGifs;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" className={cn("h-full", className)}>
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

        <div className="scrollbar-thin scrollbar-thumb-accent scrollbar-track-transparent flex-1 overflow-y-auto">
          <div className="flex flex-col">
            {gifsData &&
              gifsData.map((r) => (
                <Image
                  alt={r.title}
                  src={r.media_formats.webp.url}
                  width={r.media_formats.webp.dims[0]}
                  height={r.media_formats.webp.dims[1]}
                  key={r.id}
                  className="mb-1 cursor-pointer rounded-md last:mb-0"
                  onClick={() => {
                    onGifSelect(r);
                    setOpen(false);
                  }}
                />
              ))}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// TODO: Gifs for replies, loading state for the gif picker, edit/delete comment
