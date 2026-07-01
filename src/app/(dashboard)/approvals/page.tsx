import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/app/actions/workspace";
import { ApprovalsView } from "@/components/approvals/approvals-view";

export default async function ApprovalsPage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;

  const supabase = await createClient();
  const { data: approvals } = await supabase
    .from("approval_requests")
    .select(`
      *,
      posts(
        id, content, created_at,
        post_channels(
          *,
          social_accounts(id, platform, display_name)
        )
      )
    `)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">承認フロー</h1>
        <p className="text-gray-500 mt-1">承認待ち投稿のレビュー</p>
      </div>
      <ApprovalsView approvals={approvals ?? []} />
    </div>
  );
}
