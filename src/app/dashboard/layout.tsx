import { redirect } from "next/navigation";

import { AppHeader } from "@/components/app-header";
import { createClient } from "@/lib/supabase/server";

function fallbackName(email: string | null | undefined) {
  if (!email) return "Northpaw";
  return email.split("@")[0] || "Northpaw";
}

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const profileName =
    typeof profile?.name === "string" ? profile.name.trim() : "";
  const metadataName =
    typeof user.user_metadata?.name === "string"
      ? user.user_metadata.name.trim()
      : "";
  const displayName = profileName || metadataName || fallbackName(user.email);

  return (
    <>
      <AppHeader displayName={displayName} email={user.email} />
      {children}
    </>
  );
}
