import { signup } from "@/app/actions/auth";
import { AuthForm } from "@/app/login/auth-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PublicHeader } from "@/components/public-header";

export default function SignupPage() {
  return (
    <>
      <PublicHeader action="back-home" />
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Create your account</CardTitle>
              <CardDescription>
                Tell us who is caring for the pets.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AuthForm
                action={signup}
                submitLabel="Sign up"
                altPrompt="Already have an account?"
                altHref="/login"
                altLabel="Log in"
                showName
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
