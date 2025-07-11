"use client";

import { useTheme } from "@/context/ThemeContext";
import { Button } from "./ui/Button";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button onClick={toggleTheme} variant="ghost">
      {theme === "light" ? "Dark Mode" : "Light Mode"}
    </Button>
  );
}
