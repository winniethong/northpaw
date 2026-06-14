import { signup } from "@/app/actions/auth";
import { AuthForm } from "@/app/login/auth-form";

export default function SignupPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 p-6">
      <h1 className="text-2xl font-semibold">Create your Northpaw account</h1>
      <AuthForm
        action={signup}
        submitLabel="Sign up"
        altPrompt="Already have an account?"
        altHref="/login"
        altLabel="Log in"
      />
    </main>
  );
}
