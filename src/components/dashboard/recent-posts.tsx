import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { PlatformIcon } from "@/components/ui/platform-icon";
import Link from "next/link";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: "下書き", color: "text-gray-500 bg-gray-100" },
  scheduled: { label: "予約済み", color: "text-blue-600 bg-blue-50" },
  published: { label: "公開済み", color: "text-emerald-600 bg-emerald-50" },
  failed: { label: "失敗", color: "text-red-600 bg-red-50" },
  pending_approval: { label: "承認待ち", color: "text-amber-600 bg-amber-50" },
  approved: { label: "承認済み", color: "text-emerald-600 bg-emerald-50" },
  cancelled: { label: "キャンセル", color: "text-gray-500 bg-gray-100" },
};

interface Post {
  id: string;
  content: string | null;
  status: string;
  created_at: string;
  post_channels: Array<{
    social_accounts: {
      id: string;
      platform: string;
    };
  }>;
}

export function RecentPosts({ posts }: { posts: Post[] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900">最近の投稿</h2>
        <Link href="/posts" className="text-sm text-blue-600 hover:text-blue-500">
          すべて見る
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p className="text-sm">投稿がありません</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => {
            const statusInfo = STATUS_LABELS[post.status] ?? { label: post.status, color: "text-gray-500 bg-gray-100" };
            return (
              <div key={post.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex -space-x-1.5 flex-shrink-0 mt-0.5">
                  {post.post_channels.slice(0, 3).map((ch) => (
                    <PlatformIcon
                      key={ch.social_accounts.id}
                      platform={ch.social_accounts.platform}
                      size="sm"
                    />
                  ))}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 line-clamp-1">
                    {post.content || "(コンテンツなし)"}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                    <span className="text-xs text-gray-400">
                      {format(new Date(post.created_at), "M月d日", { locale: ja })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
