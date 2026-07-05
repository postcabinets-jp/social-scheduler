import { getWorkspaceMembers } from "@/app/actions/workspace";
import { TeamSettings } from "@/components/settings/team-settings";

export default async function TeamSettingsPage() {
  const members = await getWorkspaceMembers();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">チーム管理</h1>
        <p className="text-gray-500 mt-1">メンバーの招待・権限管理</p>
      </div>
      <TeamSettings members={members} />
    </div>
  );
}
