import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PublicHeaderProps = {
  action?: "sign-in" | "back-home";
};

export function PublicHeader({ action = "sign-in" }: PublicHeaderProps) {
  return (
    <header className="border-b border-border/70 bg-background/95">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-7">
        <Link
          href="/"
          className="font-serif text-2xl font-semibold tracking-tight text-foreground"
        >
          Northpaw
        </Link>

        {action === "sign-in" ? (
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "secondary" }), "px-4")}
          >
            Sign in
          </Link>
        ) : (
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "text-muted-foreground hover:text-foreground"
            )}
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back home
          </Link>
        )}
      </nav>
    </header>
  );
}
