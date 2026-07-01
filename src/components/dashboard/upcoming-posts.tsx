import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { PlatformIcon } from "@/components/ui/platform-icon";
import Link from "next/link";

interface Post {
  id: string;
  content: string | null;
  scheduled_at: string | null;
  status: string;
  post_channels: Array<{
    social_accounts: {
      id: string;
      platform: string;
      display_name: string;
      avatar_url: string | null;
    };
  }>;
}

export function UpcomingPosts({ posts }: { posts: Post[] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900">今後の予約投稿</h2>
        <Link href="/queue" className="text-sm text-blue-600 hover:text-blue-500">
          すべて見る
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <svg className="w-10 h-10 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm">予約投稿はありません</p>
          <Link href="/compose" className="text-sm text-blue-600 mt-1 inline-block">
            投稿を作成する
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
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
                <p className="text-sm text-gray-900 line-clamp-2">
                  {post.content || "(コンテンツなし)"}
                </p>
                {post.scheduled_at && (
                  <p className="text-xs text-gray-400 mt-1">
                    {format(new Date(post.scheduled_at), "M月d日 HH:mm", { locale: ja })}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
