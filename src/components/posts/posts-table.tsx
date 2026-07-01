"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { PlatformIcon } from "@/components/ui/platform-icon";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: "下書き", color: "text-gray-600 bg-gray-100" },
  scheduled: { label: "予約済み", color: "text-blue-600 bg-blue-50" },
  published: { label: "公開済み", color: "text-emerald-600 bg-emerald-50" },
  failed: { label: "失敗", color: "text-red-600 bg-red-50" },
  pending_approval: { label: "承認待ち", color: "text-amber-600 bg-amber-50" },
  approved: { label: "承認済み", color: "text-teal-600 bg-teal-50" },
  cancelled: { label: "キャンセル", color: "text-gray-500 bg-gray-100" },
};

interface Post {
  id: string;
  content: string | null;
  status: string;
  scheduled_at: string | null;
  published_at: string | null;
  created_at: string;
  post_channels: Array<{
    id: string;
    status: string;
    social_accounts: { id: string; platform: string; display_name: string };
  }>;
}

export function PostsTable({ posts }: { posts: Post[] }) {
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = posts.filter(
    (p) => statusFilter === "all" || p.status === statusFilter
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit flex-wrap">
        {[
          { value: "all", label: "すべて" },
          { value: "published", label: "公開済み" },
          { value: "scheduled", label: "予約済み" },
          { value: "draft", label: "下書き" },
          { value: "failed", label: "失敗" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              statusFilter === tab.value
                ? "bg-white text-gray-900 shadow-sm font-medium"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400">投稿がありません</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">投稿内容</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3 w-32">チャンネル</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3 w-28">ステータス</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3 w-36">日時</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((post) => {
                const statusConfig = STATUS_CONFIG[post.status] ?? {
                  label: post.status,
                  color: "text-gray-600 bg-gray-100",
                };
                const date = post.published_at ?? post.scheduled_at ?? post.created_at;
                return (
                  <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-900 line-clamp-2 max-w-lg">
                        {post.content || "(コンテンツなし)"}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex -space-x-1.5">
                        {post.post_channels.slice(0, 4).map((ch) => (
                          <PlatformIcon
                            key={ch.id}
                            platform={ch.social_accounts.platform}
                            size="sm"
                          />
                        ))}
                        {post.post_channels.length > 4 && (
                          <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600 ring-2 ring-white">
                            +{post.post_channels.length - 4}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-500">
                        {format(new Date(date), "M/d HH:mm", { locale: ja })}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
