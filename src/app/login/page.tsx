import { login } from "@/app/actions/auth";
import { AuthForm } from "./auth-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PublicHeader } from "@/components/public-header";

export default function LoginPage() {
  return (
    <>
      <PublicHeader action="back-home" />
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Welcome back</CardTitle>
              <CardDescription>Log in to your Northpaw account.</CardDescription>
            </CardHeader>
            <CardContent>
              <AuthForm
                action={login}
                submitLabel="Log in"
                altPrompt="Don't have an account?"
                altHref="/signup"
                altLabel="Sign up"
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
