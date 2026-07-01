import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/app/actions/workspace";
import { getSocialAccounts } from "@/app/actions/social-accounts";
import { QueueView } from "@/components/queue/queue-view";

export default async function QueuePage() {
  const [workspace, accounts] = await Promise.all([
    getCurrentWorkspace(),
    getSocialAccounts(),
  ]);

  const supabase = await createClient();
  const { data: queuedPosts } = await supabase
    .from("posts")
    .select(`
      *,
      post_channels(
        *,
        social_accounts(id, platform, display_name, username, avatar_url)
      )
    `)
    .eq("workspace_id", workspace?.id ?? "")
    .in("status", ["draft", "scheduled", "approved", "pending_approval"])
    .order("scheduled_at", { ascending: true, nullsFirst: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">投稿キュー</h1>
        <p className="text-gray-500 mt-1">スケジュール済み・下書き投稿の管理</p>
      </div>
      <QueueView posts={queuedPosts ?? []} accounts={accounts} />
    </div>
  );
}
