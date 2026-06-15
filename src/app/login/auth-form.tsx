"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { AuthState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredMark } from "@/components/field-hint";

type AuthFormProps = {
  action: (state: AuthState, formData: FormData) => Promise<AuthState>;
  submitLabel: string;
  altPrompt: string;
  altHref: string;
  altLabel: string;
  showName?: boolean;
};

export function AuthForm({
  action,
  submitLabel,
  altPrompt,
  altHref,
  altLabel,
  showName = false,
}: AuthFormProps) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {showName && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">
            Name <RequiredMark />
          </Label>
          <Input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
          />
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">
          Email <RequiredMark />
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">
          Password <RequiredMark />
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>

      {state?.error && (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "…" : submitLabel}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {altPrompt}{" "}
        <Link
          href={altHref}
          className="font-medium text-foreground underline underline-offset-4"
        >
          {altLabel}
        </Link>
      </p>
    </form>
  );
}
