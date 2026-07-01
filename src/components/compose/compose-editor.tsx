"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PlatformIcon } from "@/components/ui/platform-icon";
import { createPost } from "@/app/actions/posts";
import { toast } from "sonner";

interface SocialAccount {
  id: string;
  platform: string;
  display_name: string;
  username: string | null;
  avatar_url: string | null;
  follower_count: number | null;
}

interface ComposeEditorProps {
  accounts: SocialAccount[];
}

const MAX_CHARS: Record<string, number> = {
  twitter: 280,
  bluesky: 300,
  mastodon: 500,
  threads: 500,
  instagram: 2200,
  linkedin: 3000,
  facebook: 63206,
};

export function ComposeEditor({ accounts }: ComposeEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [content, setContent] = useState("");
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [activeOverride, setActiveOverride] = useState<string | null>(null);
  const [scheduledAt, setScheduledAt] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  function toggleAccount(accountId: string) {
    setSelectedAccounts((prev) =>
      prev.includes(accountId)
        ? prev.filter((id) => id !== accountId)
        : [...prev, accountId]
    );
  }

  function getContentForAccount(accountId: string) {
    return overrides[accountId] ?? content;
  }

  function getCharLimit(accountId: string) {
    const account = accounts.find((a) => a.id === accountId);
    return account ? (MAX_CHARS[account.platform] ?? 5000) : 5000;
  }

  async function handleGenerate() {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      const data = await response.json();
      if (data.content) {
        setContent(data.content);
        toast.success("AIがコンテンツを生成しました");
      }
    } catch {
      toast.error("AI生成に失敗しました");
    } finally {
      setIsGenerating(false);
    }
  }

  function handleSubmit(status: "draft" | "scheduled" | "pending_approval") {
    if (selectedAccounts.length === 0) {
      toast.error("投稿先チャンネルを選択してください");
      return;
    }
    if (!content.trim()) {
      toast.error("投稿内容を入力してください");
      return;
    }
    if (status === "scheduled" && !scheduledAt) {
      toast.error("予約日時を設定してください");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("content", content);
      formData.set("status", status);
      if (scheduledAt) formData.set("scheduled_at", scheduledAt);
      formData.set("channel_overrides", JSON.stringify(overrides));
      selectedAccounts.forEach((id) => formData.append("channel_ids", id));

      const result = await createPost(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(
          status === "draft"
            ? "下書きを保存しました"
            : status === "scheduled"
            ? "投稿を予約しました"
            : "承認申請を送信しました"
        );
        router.push("/posts");
      }
    });
  }

  if (accounts.length === 0) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
        <p className="text-amber-800 font-medium">SNSアカウントが接続されていません</p>
        <p className="text-amber-600 text-sm mt-1">
          <a href="/settings/accounts" className="underline">設定</a> からアカウントを接続してください
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main editor */}
      <div className="lg:col-span-2 space-y-4">
        {/* AI Generator */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm font-medium text-blue-900 mb-2">AI コンテンツ生成</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="例: 新製品ローンチのお知らせ。ターゲットは中小企業のマーケター。"
              className="flex-1 text-sm px-3 py-2 bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <Button
              size="sm"
              onClick={handleGenerate}
              disabled={isGenerating || !aiPrompt.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white flex-shrink-0"
            >
              {isGenerating ? "生成中..." : "生成"}
            </Button>
          </div>
        </div>

        {/* Content textarea */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="投稿内容を入力してください..."
            className="min-h-[160px] resize-none border-0 p-0 focus-visible:ring-0 text-base"
          />
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <button className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors" title="画像を追加">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
            <span className={`text-xs ${content.length > 280 ? "text-red-500" : "text-gray-400"}`}>
              {content.length} 文字
            </span>
          </div>
        </div>

        {/* Per-channel overrides */}
        {selectedAccounts.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm font-medium text-gray-900 mb-3">チャンネル別テキスト編集（任意）</p>
            <div className="flex gap-2 mb-3 flex-wrap">
              {selectedAccounts.map((accountId) => {
                const account = accounts.find((a) => a.id === accountId);
                if (!account) return null;
                return (
                  <button
                    key={accountId}
                    onClick={() => setActiveOverride(activeOverride === accountId ? null : accountId)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      activeOverride === accountId
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <PlatformIcon platform={account.platform} size="sm" />
                    {account.display_name}
                    {overrides[accountId] && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    )}
                  </button>
                );
              })}
            </div>

            {activeOverride && (
              <div>
                <Textarea
                  value={getContentForAccount(activeOverride)}
                  onChange={(e) =>
                    setOverrides((prev) => ({ ...prev, [activeOverride]: e.target.value }))
                  }
                  placeholder="このチャンネル専用のテキスト（空白の場合は共通テキストを使用）"
                  className="min-h-[100px] resize-none text-sm"
                />
                <div className="flex justify-between items-center mt-1">
                  <button
                    onClick={() => {
                      setOverrides((prev) => {
                        const next = { ...prev };
                        delete next[activeOverride];
                        return next;
                      });
                    }}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    共通テキストに戻す
                  </button>
                  <span className={`text-xs ${
                    getContentForAccount(activeOverride).length > getCharLimit(activeOverride)
                      ? "text-red-500"
                      : "text-gray-400"
                  }`}>
                    {getContentForAccount(activeOverride).length} / {getCharLimit(activeOverride)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right panel */}
      <div className="space-y-4">
        {/* Channel selector */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm font-medium text-gray-900 mb-3">投稿先チャンネル</p>
          <div className="space-y-2">
            {accounts.map((account) => (
              <label
                key={account.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedAccounts.includes(account.id)}
                  onChange={() => toggleAccount(account.id)}
                  className="rounded border-gray-300 text-blue-600"
                />
                <PlatformIcon platform={account.platform} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {account.display_name}
                  </p>
                  {account.username && (
                    <p className="text-xs text-gray-400">@{account.username}</p>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Schedule */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm font-medium text-gray-900 mb-3">予約日時</p>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
            className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          {!scheduledAt && (
            <p className="text-xs text-gray-400 mt-1.5">未設定の場合は即時投稿</p>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => handleSubmit(scheduledAt ? "scheduled" : "draft")}
            disabled={isPending}
          >
            {isPending ? "処理中..." : scheduledAt ? "予約する" : "下書き保存"}
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => handleSubmit("pending_approval")}
            disabled={isPending}
          >
            承認申請を送信
          </Button>
        </div>
      </div>
    </div>
  );
}
