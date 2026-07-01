import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/app/actions/workspace";
import { getPosts } from "@/app/actions/posts";
import { getSocialAccounts } from "@/app/actions/social-accounts";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { RecentPosts } from "@/components/dashboard/recent-posts";
import { UpcomingPosts } from "@/components/dashboard/upcoming-posts";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const [workspace, postsResult, accounts] = await Promise.all([
    getCurrentWorkspace(),
    getPosts({ limit: 5 }),
    getSocialAccounts(),
  ]);

  const supabase = await createClient();
  const { data: scheduledPosts } = await supabase
    .from("posts")
    .select(`
      *,
      post_channels(*, social_accounts(id, platform, display_name, avatar_url))
    `)
    .eq("workspace_id", workspace?.id ?? "")
    .in("status", ["scheduled", "approved"])
    .gte("scheduled_at", new Date().toISOString())
    .order("scheduled_at", { ascending: true })
    .limit(5);

  const { data: pendingApprovals } = await supabase
    .from("approval_requests")
    .select("id, post_id")
    .eq("status", "pending");

  if (!workspace) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-gray-900">ワークスペースが見つかりません</h2>
        <p className="text-gray-600 mt-2">アカウントに問題が発生しています。サポートにお問い合わせください。</p>
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
          <p className="text-gray-500 mt-1">おかえりなさい、{workspace.name}</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">SNSアカウントを接続してください</h3>
          <p className="text-gray-600 mb-6 max-w-sm mx-auto">
            X/Twitter、Instagram、LinkedIn などのアカウントを接続して、投稿を一括管理しましょう。
          </p>
          <Link href="/settings/accounts">
            <Button>アカウントを接続する</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
          <p className="text-gray-500 mt-1">{workspace.name}</p>
        </div>
        <Link href="/compose">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            新規投稿を作成
          </Button>
        </Link>
      </div>

      <DashboardStats
        totalAccounts={accounts.length}
        scheduledCount={scheduledPosts?.length ?? 0}
        pendingApprovals={pendingApprovals?.length ?? 0}
        totalPosts={postsResult.count}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingPosts posts={scheduledPosts ?? []} />
        <RecentPosts posts={postsResult.data} />
      </div>
    </div>
  );
}
