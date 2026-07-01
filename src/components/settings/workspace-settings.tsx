"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateWorkspaceSettings } from "@/app/actions/workspace";
import { toast } from "sonner";

interface Workspace {
  id: string;
  name: string;
  slug: string;
  plan: string;
  ai_provider: string | null;
  timezone: string;
}

export function WorkspaceSettings({ workspace }: { workspace: Workspace }) {
  const [isPending, startTransition] = useTransition();
  const [aiProvider, setAiProvider] = useState(workspace.ai_provider ?? "");

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateWorkspaceSettings(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("設定を保存しました");
      }
    });
  }

  const PLAN_LABELS: Record<string, { label: string; color: string }> = {
    free: { label: "Free", color: "text-gray-600 bg-gray-100" },
    starter: { label: "Starter", color: "text-blue-600 bg-blue-50" },
    pro: { label: "Pro", color: "text-purple-600 bg-purple-50" },
    agency: { label: "Agency", color: "text-amber-600 bg-amber-50" },
  };

  const planInfo = PLAN_LABELS[workspace.plan] ?? { label: workspace.plan, color: "text-gray-600 bg-gray-100" };

  return (
    <div className="space-y-6">
      {/* Plan info */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">現在のプラン</p>
            <span className={`text-sm font-semibold px-2 py-0.5 rounded ${planInfo.color}`}>
              {planInfo.label}
            </span>
          </div>
          <a href="/settings/billing" className="text-sm text-blue-600 hover:text-blue-500">
            プランを変更 →
          </a>
        </div>
      </div>

      {/* General settings */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-4">基本情報</h2>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>ワークスペース名</Label>
            <Input name="name" defaultValue={workspace.name} required />
          </div>

          <div className="space-y-1.5">
            <Label>タイムゾーン</Label>
            <select
              name="timezone"
              defaultValue={workspace.timezone}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <option value="UTC">UTC</option>
              <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
              <option value="America/New_York">America/New_York (EST)</option>
              <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
              <option value="Europe/London">Europe/London (GMT)</option>
              <option value="Europe/Paris">Europe/Paris (CET)</option>
            </select>
          </div>

          <Button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700 text-white">
            {isPending ? "保存中..." : "保存"}
          </Button>
        </form>
      </div>

      {/* AI Settings */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-1">AI設定（自分のAPIキー）</h2>
        <p className="text-sm text-gray-500 mb-4">
          自社のAPIキーを使ってAI機能を利用します。キーはサーバーサイドで暗号化保存されます。
        </p>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>AIプロバイダー</Label>
            <select
              name="ai_provider"
              value={aiProvider}
              onChange={(e) => setAiProvider(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <option value="">未設定</option>
              <option value="openai">OpenAI (GPT-4o)</option>
              <option value="anthropic">Anthropic (Claude 3.5)</option>
              <option value="groq">Groq (Llama 3)</option>
            </select>
          </div>

          {aiProvider && (
            <div className="space-y-1.5">
              <Label>APIキー</Label>
              <Input
                name="ai_api_key"
                type="password"
                placeholder="sk-..."
                autoComplete="off"
              />
              <p className="text-xs text-gray-400">
                現在設定されているキーは表示されません。変更する場合のみ入力してください。
              </p>
            </div>
          )}

          <Button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700 text-white">
            {isPending ? "保存中..." : "AI設定を保存"}
          </Button>
        </form>
      </div>
    </div>
  );
}
