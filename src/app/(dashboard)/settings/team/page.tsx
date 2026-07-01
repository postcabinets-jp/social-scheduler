import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/app/actions/workspace";
import { TeamSettings } from "@/components/settings/team-settings";

export default async function TeamSettingsPage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;

  const supabase = await createClient();
  const { data: members } = await supabase
    .from("workspace_members")
    .select("*, profiles(full_name, avatar_url)")
    .eq("workspace_id", workspace.id);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">チーム管理</h1>
        <p className="text-gray-500 mt-1">メンバーの招待・権限管理</p>
      </div>
      <TeamSettings members={members ?? []} workspaceId={workspace.id} />
    </div>
  );
}
