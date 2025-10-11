"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

function ThemeSwitcher({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer bg-accent focus-visible:border-ring focus-visible:ring-ring/50 relative inline-flex h-[1.35rem] w-10 shrink-0 cursor-pointer items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
      onClick={toggleTheme}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "bg-card pointer-events-none block size-5 rounded-full shadow-xs ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=checked]:bg-white data-[state=unchecked]:translate-x-0",
        )}
      />
      <Sun
        className={cn(
          "text-muted-foreground absolute right-1 size-3 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90",
        )}
      />
      <Moon
        className={cn(
          "text-muted-foreground absolute left-1 size-3 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { ThemeSwitcher };
