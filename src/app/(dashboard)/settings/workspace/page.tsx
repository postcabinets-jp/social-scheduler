import { getCurrentWorkspace } from "@/app/actions/workspace";
import { WorkspaceSettings } from "@/components/settings/workspace-settings";

export default async function WorkspaceSettingsPage() {
  const workspace = await getCurrentWorkspace();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ワークスペース設定</h1>
        <p className="text-gray-500 mt-1">基本情報・AI設定を管理します</p>
      </div>
      {workspace && <WorkspaceSettings workspace={workspace} />}
    </div>
  );
}
