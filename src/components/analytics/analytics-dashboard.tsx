"use client";

import { PlatformIcon } from "@/components/ui/platform-icon";
import Link from "next/link";

interface SocialAccount {
  id: string;
  platform: string;
  display_name: string;
  username: string | null;
  avatar_url: string | null;
  follower_count: number | null;
}

interface AnalyticsSnapshot {
  social_account_id: string;
  snapshot_date: string;
  follower_count: number | null;
  total_impressions: number | null;
  total_engagements: number | null;
}

interface AnalyticsDashboardProps {
  data: {
    accounts: SocialAccount[];
    snapshots: AnalyticsSnapshot[];
  } | null;
}

function formatNumber(n: number | null | undefined): string {
  if (!n) return "—";
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

export function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
  if (!data?.accounts?.length) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <p className="text-gray-400 mb-2">アナリティクスデータがありません</p>
        <p className="text-sm text-gray-400">
          <Link href="/settings/accounts" className="text-blue-600 hover:underline">
            SNSアカウントを接続
          </Link>
          してデータの収集を開始してください
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Account cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.accounts.map((account) => {
          const accountSnapshots = data.snapshots.filter(
            (s) => s.social_account_id === account.id
          );
          const latest = accountSnapshots[accountSnapshots.length - 1];
          const totalImpressions = accountSnapshots.reduce(
            (sum, s) => sum + (s.total_impressions ?? 0),
            0
          );
          const totalEngagements = accountSnapshots.reduce(
            (sum, s) => sum + (s.total_engagements ?? 0),
            0
          );
          const engagementRate =
            totalImpressions > 0
              ? ((totalEngagements / totalImpressions) * 100).toFixed(1)
              : "—";

          return (
            <Link key={account.id} href={`/analytics/${account.id}`}>
              <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer">
                <div className="flex items-center gap-3 mb-4">
                  <PlatformIcon platform={account.platform} size="md" />
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{account.display_name}</p>
                    {account.username && (
                      <p className="text-xs text-gray-400">@{account.username}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-xs text-gray-400">フォロワー</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatNumber(latest?.follower_count ?? account.follower_count)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">インプレッション</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatNumber(totalImpressions)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">エンゲージ率</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {engagementRate !== "—" ? `${engagementRate}%` : "—"}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Empty state for no snapshot data */}
      {data.snapshots.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
          <p className="text-blue-800 font-medium">データ収集中</p>
          <p className="text-blue-600 text-sm mt-1">
            アナリティクスデータは24時間以内に表示されます
          </p>
        </div>
      )}
    </div>
  );
}
