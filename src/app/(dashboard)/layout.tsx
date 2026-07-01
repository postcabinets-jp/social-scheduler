import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, workspaces(*)")
    .eq("id", user.id)
    .single();

  const currentWorkspace =
    profile?.current_workspace_id
      ? await supabase
          .from("workspaces")
          .select("*")
          .eq("id", profile.current_workspace_id)
          .single()
          .then((r) => r.data)
      : null;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AppSidebar workspace={currentWorkspace} user={user} />
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader user={user} profile={profile} workspace={currentWorkspace} />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
