import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/app/actions/workspace";
import { TemplatesView } from "@/components/templates/templates-view";

export default async function TemplatesPage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;

  const supabase = await createClient();
  const { data: templates } = await supabase
    .from("post_templates")
    .select("*")
    .eq("workspace_id", workspace.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">テンプレート</h1>
        <p className="text-gray-500 mt-1">よく使う投稿フォーマットを保存・再利用</p>
      </div>
      <TemplatesView templates={templates ?? []} workspaceId={workspace.id} />
    </div>
  );
}
