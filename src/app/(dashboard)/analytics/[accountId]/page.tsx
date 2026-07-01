import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/app/actions/workspace";
import { PlatformIcon } from "@/components/ui/platform-icon";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function AccountAnalyticsPage({
  params,
}: {
  params: Promise<{ accountId: string }>;
}) {
  const { accountId } = await params;
  const workspace = await getCurrentWorkspace();
  if (!workspace) notFound();

  const supabase = await createClient();

  const { data: account } = await supabase
    .from("social_accounts")
    .select("*")
    .eq("id", accountId)
    .eq("workspace_id", workspace.id)
    .single();

  if (!account) notFound();

  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const { data: snapshots } = await supabase
    .from("analytics_snapshots")
    .select("*")
    .eq("social_account_id", accountId)
    .gte("snapshot_date", ninetyDaysAgo.toISOString().split("T")[0])
    .order("snapshot_date", { ascending: true });

  const totalImpressions = (snapshots ?? []).reduce(
    (s, r) => s + (r.total_impressions ?? 0),
    0
  );
  const totalEngagements = (snapshots ?? []).reduce(
    (s, r) => s + (r.total_engagements ?? 0),
    0
  );
  const avgEngagementRate =
    totalImpressions > 0
      ? ((totalEngagements / totalImpressions) * 100).toFixed(1)
      : "—";

  function fmt(n: number | null | undefined): string {
    if (!n) return "—";
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/analytics" className="text-gray-400 hover:text-gray-600">
          ← アナリティクス
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <PlatformIcon platform={account.platform} size="lg" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{account.display_name}</h1>
          {account.username && (
            <p className="text-gray-500">@{account.username}</p>
          )}
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "フォロワー", value: fmt(account.follower_count) },
          { label: "インプレッション(90日)", value: fmt(totalImpressions) },
          { label: "エンゲージメント(90日)", value: fmt(totalEngagements) },
          { label: "エンゲージメント率", value: avgEngagementRate !== "—" ? `${avgEngagementRate}%` : "—" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Snapshots table */}
      {(snapshots ?? []).length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">日次データ（過去90日）</h2>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">日付</th>
                <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">フォロワー</th>
                <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">インプレッション</th>
                <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">エンゲージメント</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(snapshots ?? []).slice(-30).reverse().map((snap) => (
                <tr key={snap.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 text-sm text-gray-700">{snap.snapshot_date}</td>
                  <td className="px-4 py-2.5 text-sm text-gray-700 text-right">{fmt(snap.follower_count)}</td>
                  <td className="px-4 py-2.5 text-sm text-gray-700 text-right">{fmt(snap.total_impressions)}</td>
                  <td className="px-4 py-2.5 text-sm text-gray-700 text-right">{fmt(snap.total_engagements)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
          データが収集されていません
        </div>
      )}
    </div>
  );
}
