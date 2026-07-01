"use client";

import { useTransition } from "react";
import { PlatformIcon } from "@/components/ui/platform-icon";
import { Button } from "@/components/ui/button";
import { disconnectAccount } from "@/app/actions/social-accounts";
import { toast } from "sonner";

const SUPPORTED_PLATFORMS = [
  { platform: "twitter", label: "X / Twitter" },
  { platform: "instagram", label: "Instagram" },
  { platform: "linkedin", label: "LinkedIn" },
  { platform: "facebook", label: "Facebook" },
  { platform: "bluesky", label: "Bluesky" },
  { platform: "mastodon", label: "Mastodon" },
  { platform: "threads", label: "Threads" },
];

interface SocialAccount {
  id: string;
  platform: string;
  display_name: string;
  username: string | null;
  avatar_url: string | null;
  follower_count: number | null;
}

export function AccountsSettings({ accounts }: { accounts: SocialAccount[] }) {
  const [isPending, startTransition] = useTransition();

  function handleDisconnect(accountId: string, displayName: string) {
    if (!confirm(`${displayName} の接続を解除しますか？`)) return;
    startTransition(async () => {
      const result = await disconnectAccount(accountId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("接続を解除しました");
      }
    });
  }

  const connectedPlatforms = new Set(accounts.map((a) => a.platform));

  return (
    <div className="space-y-4">
      {/* Connected accounts */}
      {accounts.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          <div className="px-5 py-3">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">接続済みアカウント</h2>
          </div>
          {accounts.map((account) => (
            <div key={account.id} className="flex items-center gap-4 px-5 py-4">
              <PlatformIcon platform={account.platform} size="md" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">{account.display_name}</p>
                <p className="text-sm text-gray-400">
                  {account.username ? `@${account.username}` : account.platform}
                  {account.follower_count ? ` · ${account.follower_count.toLocaleString()} フォロワー` : ""}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50 flex-shrink-0"
                onClick={() => handleDisconnect(account.id, account.display_name)}
                disabled={isPending}
              >
                切断
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add account */}
      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        <div className="px-5 py-3">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">アカウントを追加</h2>
        </div>
        {SUPPORTED_PLATFORMS.map(({ platform, label }) => (
          <div key={platform} className="flex items-center gap-4 px-5 py-4">
            <PlatformIcon platform={platform} size="md" />
            <div className="flex-1">
              <p className="font-medium text-gray-900">{label}</p>
              {connectedPlatforms.has(platform) && (
                <p className="text-xs text-emerald-600">接続済み</p>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // OAuth flow would redirect to /api/auth/connect/[platform]
                window.location.href = `/api/auth/connect/${platform}`;
              }}
            >
              {connectedPlatforms.has(platform) ? "別アカウントを追加" : "接続"}
            </Button>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 text-center">
        アカウント接続はOAuth 2.0で安全に認証されます。パスワードは保存されません。
      </p>
    </div>
  );
}
