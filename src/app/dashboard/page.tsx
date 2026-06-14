import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/actions/auth";

type Pet = { id: string; name: string; species: string };

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // RLS scopes this to the current user's pets automatically.
  const { data: pets } = await supabase
    .from("pets")
    .select("id, name, species")
    .order("created_at", { ascending: false });

  return (
    <main className="flex flex-1 flex-col gap-6 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Your pets</h1>
          <p className="text-sm text-gray-600">{user.email}</p>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="rounded border border-gray-300 px-3 py-2 text-sm font-medium"
          >
            Log out
          </button>
        </form>
      </header>

      {pets && pets.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {(pets as Pet[]).map((pet) => (
            <li key={pet.id} className="rounded border border-gray-200 px-4 py-3">
              <span className="font-medium">{pet.name}</span>{" "}
              <span className="text-sm text-gray-500">({pet.species})</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600">
          No pets yet. Pet creation is coming in a later feature.
        </p>
      )}
    </main>
  );
}
