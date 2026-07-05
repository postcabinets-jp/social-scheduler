"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { PlatformIcon } from "@/components/ui/platform-icon";
import { Button } from "@/components/ui/button";
import { deletePost, schedulePost, cancelScheduledPost, duplicatePost } from "@/app/actions/posts";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: "下書き", color: "text-gray-600 bg-gray-100" },
  scheduled: { label: "予約済み", color: "text-blue-600 bg-blue-50" },
  approved: { label: "承認済み", color: "text-emerald-600 bg-emerald-50" },
  pending_approval: { label: "承認待ち", color: "text-amber-600 bg-amber-50" },
};

interface Post {
  id: string;
  content: string | null;
  status: string;
  scheduled_at: string | null;
  created_at: string;
  post_channels: Array<{
    id: string;
    status: string;
    social_accounts: {
      id: string;
      platform: string;
      display_name: string;
    };
  }>;
}

interface QueueViewProps {
  posts: Post[];
  accounts: Array<{ id: string; platform: string; display_name: string }>;
}

export function QueueView({ posts }: QueueViewProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<string>("all");
  const [isPending, startTransition] = useTransition();
  const [schedulingPostId, setSchedulingPostId] = useState<string | null>(null);
  const [scheduleDateTime, setScheduleDateTime] = useState("");

  const filtered = posts.filter(
    (p) => filter === "all" || p.status === filter
  );

  function handleDelete(postId: string) {
    if (!confirm("この投稿を削除しますか？")) return;
    startTransition(async () => {
      const result = await deletePost(postId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("投稿を削除しました");
      }
    });
  }

  function handleSchedule(postId: string) {
    if (!scheduleDateTime) {
      toast.error("予約日時を選択してください");
      return;
    }
    startTransition(async () => {
      const result = await schedulePost(postId, scheduleDateTime);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("投稿を予約しました");
        setSchedulingPostId(null);
        setScheduleDateTime("");
      }
    });
  }

  function handleCancelSchedule(postId: string) {
    if (!confirm("予約をキャンセルして下書きに戻しますか？")) return;
    startTransition(async () => {
      const result = await cancelScheduledPost(postId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("予約をキャンセルしました");
      }
    });
  }

  function handleDuplicate(postId: string) {
    startTransition(async () => {
      const result = await duplicatePost(postId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("投稿を複製しました");
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { value: "all", label: "すべて" },
          { value: "draft", label: "下書き" },
          { value: "scheduled", label: "予約済み" },
          { value: "pending_approval", label: "承認待ち" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              filter === tab.value
                ? "bg-white text-gray-900 shadow-sm font-medium"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400">投稿がありません</p>
          <Link href="/compose">
            <Button className="mt-4">新規投稿を作成</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((post) => {
            const statusConfig = STATUS_CONFIG[post.status] ?? { label: post.status, color: "text-gray-600 bg-gray-100" };
            return (
              <div key={post.id}>
                <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-4">
                  {/* Channel icons */}
                  <div className="flex -space-x-2 flex-shrink-0 mt-0.5">
                    {post.post_channels.slice(0, 4).map((ch) => (
                      <PlatformIcon
                        key={ch.id}
                        platform={ch.social_accounts.platform}
                        size="sm"
                      />
                    ))}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 line-clamp-2">
                      {post.content || "(コンテンツなし)"}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                      {post.scheduled_at ? (
                        <span className="text-xs text-gray-500">
                          {format(new Date(post.scheduled_at), "M月d日 HH:mm", { locale: ja })}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">
                          作成: {format(new Date(post.created_at), "M月d日", { locale: ja })}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">
                        {post.post_channels.length}チャンネル
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {post.status === "draft" && (
                      <button
                        onClick={() => setSchedulingPostId(schedulingPostId === post.id ? null : post.id)}
                        disabled={isPending}
                        className="text-gray-400 hover:text-blue-500 p-1.5 rounded-md hover:bg-blue-50 transition-colors"
                        title="予約する"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                    )}
                    {post.status === "scheduled" && (
                      <button
                        onClick={() => handleCancelSchedule(post.id)}
                        disabled={isPending}
                        className="text-gray-400 hover:text-amber-500 p-1.5 rounded-md hover:bg-amber-50 transition-colors"
                        title="予約をキャンセル"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => handleDuplicate(post.id)}
                      disabled={isPending}
                      className="text-gray-400 hover:text-gray-600 p-1.5 rounded-md hover:bg-gray-50 transition-colors"
                      title="複製"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      disabled={isPending}
                      className="text-gray-400 hover:text-red-500 p-1.5 rounded-md hover:bg-red-50 transition-colors"
                      title="削除"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Schedule inline form */}
                {schedulingPostId === post.id && (
                  <div className="bg-blue-50 border border-blue-200 rounded-b-xl -mt-1 p-3 flex items-center gap-3">
                    <input
                      type="datetime-local"
                      value={scheduleDateTime}
                      onChange={(e) => setScheduleDateTime(e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                      className="text-sm px-3 py-1.5 border border-blue-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleSchedule(post.id)}
                      disabled={isPending || !scheduleDateTime}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isPending ? "予約中..." : "予約する"}
                    </Button>
                    <button
                      onClick={() => { setSchedulingPostId(null); setScheduleDateTime(""); }}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      キャンセル
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
