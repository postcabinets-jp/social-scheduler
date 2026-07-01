"use client";

import { useTransition } from "react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { PlatformIcon } from "@/components/ui/platform-icon";
import { Button } from "@/components/ui/button";
import { reviewApproval } from "@/app/actions/posts";
import { toast } from "sonner";

interface Approval {
  id: string;
  created_at: string;
  posts: {
    id: string;
    content: string | null;
    created_at: string;
    post_channels: Array<{
      social_accounts: { id: string; platform: string; display_name: string };
    }>;
  };
}

export function ApprovalsView({ approvals }: { approvals: Approval[] }) {
  const [isPending, startTransition] = useTransition();

  function handleReview(approvalId: string, action: "approved" | "rejected") {
    startTransition(async () => {
      const result = await reviewApproval(approvalId, action);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(action === "approved" ? "承認しました" : "差し戻しました");
      }
    });
  }

  if (approvals.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-gray-500 font-medium">承認待ちの投稿はありません</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {approvals.map((approval) => (
        <div key={approval.id} className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-start gap-4">
            <div className="flex -space-x-1.5 flex-shrink-0 mt-1">
              {approval.posts.post_channels.slice(0, 4).map((ch, idx) => (
                <PlatformIcon
                  key={idx}
                  platform={ch.social_accounts.platform}
                  size="sm"
                />
              ))}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 whitespace-pre-wrap line-clamp-3">
                {approval.posts.content || "(コンテンツなし)"}
              </p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs text-gray-400">
                  {format(new Date(approval.created_at), "M月d日 HH:mm", { locale: ja })}
                </span>
                <span className="text-xs text-gray-400">
                  {approval.posts.post_channels
                    .map((ch) => ch.social_accounts.display_name)
                    .join(" / ")}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => handleReview(approval.id, "rejected")}
                disabled={isPending}
              >
                差し戻し
              </Button>
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => handleReview(approval.id, "approved")}
                disabled={isPending}
              >
                承認
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
