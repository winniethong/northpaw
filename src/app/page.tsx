import { redirect } from "next/navigation";

export default function Home() {
  // The proxy redirects to /login when unauthenticated.
  redirect("/dashboard");
}
