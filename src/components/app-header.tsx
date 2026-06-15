import { LogOut } from "lucide-react";
import Link from "next/link";

import { logout } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

type AppHeaderProps = {
  displayName: string;
  email: string | null | undefined;
};

export function AppHeader({ displayName, email }: AppHeaderProps) {
  const initial = displayName.trim().charAt(0).toUpperCase() || "N";

  return (
    <header className="border-b border-border/70 bg-background/95">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-5">
        <Link
          href="/dashboard"
          className="font-serif text-2xl font-semibold tracking-tight text-foreground"
        >
          Northpaw
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground">
              {initial}
            </div>
            <div className="hidden text-right sm:block">
              <p className="max-w-44 truncate text-sm font-medium text-foreground">
                {displayName}
              </p>
              {email && (
                <p className="max-w-44 truncate text-xs text-muted-foreground">
                  {email}
                </p>
              )}
            </div>
          </div>

          <form action={logout}>
            <Button type="submit" variant="outline" aria-label="Log out">
              <LogOut className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">Log out</span>
            </Button>
          </form>
        </div>
      </nav>
    </header>
  );
}
