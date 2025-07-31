"use client";

import { SearchIcon } from "lucide-react";
import { Input } from "../ui/input";
import { useRouter } from "next/navigation";

export function SearchField() {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const query = (form.q as HTMLInputElement).value.trim();
    if (!query) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      method="GET"
      action="/search"
      className="ml-16 hidden w-2/5 md:block"
    >
      <div className="relative">
        <Input name="q" placeholder="Search" className="rounded-full pe-10" />
        <SearchIcon className="text-muted-foreground absolute top-1/2 right-3 size-4 -translate-y-1/2" />
      </div>
    </form>
  );
}

export function MobileSearchButton() {
  // use shadcn dialog
  return (
    <div className="hover:bg-accent flex aspect-square h-8 cursor-pointer items-center justify-center rounded-full transition-colors md:hidden">
      <SearchIcon className="mt-[0.15rem] h-[1.1rem] w-[1.1rem]" />
    </div>
  );
}
