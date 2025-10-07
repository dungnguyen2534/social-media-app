"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface ThemeChangerProps {
  className?: string;
  iconStyle?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
  switchMode?: boolean;
}

export function ThemeChanger({
  className,
  variant,
  iconStyle,
  switchMode = false,
}: ThemeChangerProps) {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const ThemeButton = (
    <Button
      variant={variant ? variant : "custom"}
      size="icon"
      className={cn("relative", className)}
      onClick={switchMode ? toggleTheme : undefined}
    >
      <Sun
        className={cn(
          "size-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90",
          iconStyle,
        )}
      />
      <Moon
        className={cn(
          "absolute size-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0",
          iconStyle,
        )}
      />
    </Button>
  );

  if (switchMode) {
    return ThemeButton;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{ThemeButton}</DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={theme === "light" ? "underline" : ""}
        >
          <Sun className="!mr-3 size-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={theme === "dark" ? "underline" : ""}
        >
          <Moon className="!mr-3 size-4" />
          Dark
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
