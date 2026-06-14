import { login } from "@/app/actions/auth";
import { AuthForm } from "./auth-form";

export default function LoginPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 p-6">
      <h1 className="text-2xl font-semibold">Log in to Northpaw</h1>
      <AuthForm
        action={login}
        submitLabel="Log in"
        altPrompt="Don't have an account?"
        altHref="/signup"
        altLabel="Sign up"
      />
    </main>
  );
}
