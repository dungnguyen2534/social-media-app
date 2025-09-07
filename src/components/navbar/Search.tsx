"use client";

import { SearchIcon } from "lucide-react";
import { Input } from "../ui/input";
import { useRouter } from "next/navigation";

export function SearchField() {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const q = (form.q as HTMLInputElement).value.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      method="GET"
      action="/search"
      className="hidden w-full md:block"
    >
      <div className="relative">
        <Input
          name="q"
          placeholder="Search"
          className="h-9 rounded-full border-0 pe-10 pl-4"
          suppressHydrationWarning
        />
        <SearchIcon className="text-muted-foreground absolute top-1/2 right-4 size-4 -translate-y-1/2 md:text-sm" />
      </div>
    </form>
  );
}

export function MobileSearchButton() {
  // use shadcn dialog
  return (
    <div className="hover:bg-accent flex aspect-square h-9 cursor-pointer items-center justify-center rounded-full transition-colors lg:hidden">
      <SearchIcon className="mt-[0.15rem] h-[1.1rem] w-[1.1rem]" />
    </div>
  );
}
