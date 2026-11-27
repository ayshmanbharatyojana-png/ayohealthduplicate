import { useTheme } from "@/components/layout/ThemeProvider"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"

export function Topbar() {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="bg-background sticky top-0 z-30 flex h-16 shrink-0 items-center justify-end border-b px-4 sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground"
        onClick={toggleTheme}
        aria-label="Toggle theme"
      >
        {theme === "dark" ? (
          <Sun className="size-5" />
        ) : (
          <Moon className="size-5" />
        )}
      </Button>
    </header>
  )
}
