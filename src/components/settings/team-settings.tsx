"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  admin: { label: "管理者", color: "text-blue-600 bg-blue-50" },
  editor: { label: "編集者", color: "text-emerald-600 bg-emerald-50" },
  viewer: { label: "閲覧者", color: "text-gray-600 bg-gray-100" },
};

interface Member {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export function TeamSettings({ members, workspaceId }: { members: Member[]; workspaceId: string }) {
  const [isInviting, setIsInviting] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("editor");

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    // In production: send invitation email via Resend
    toast.info(`招待メールを ${email} に送信しました（デモ）`);
    setEmail("");
    setIsInviting(false);
  }

  return (
    <div className="space-y-4">
      {/* Members list */}
      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        <div className="flex items-center justify-between px-5 py-3">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            メンバー（{members.length}名）
          </h2>
          <Button size="sm" onClick={() => setIsInviting(true)}>
            招待する
          </Button>
        </div>

        {members.map((member) => {
          const roleInfo = ROLE_LABELS[member.role] ?? { label: member.role, color: "text-gray-600 bg-gray-100" };
          const name = member.profiles?.full_name ?? "Unknown";
          const initials = name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);

          return (
            <div key={member.id} className="flex items-center gap-4 px-5 py-4">
              <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                {member.profiles?.avatar_url ? (
                  <img src={member.profiles.avatar_url} className="w-9 h-9 rounded-full" alt={name} />
                ) : (
                  initials
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">{name}</p>
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded ${roleInfo.color}`}>
                {roleInfo.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Invite form */}
      {isInviting && (
        <div className="bg-white rounded-xl border border-blue-200 p-5">
          <h3 className="font-medium text-gray-900 mb-4">メンバーを招待</h3>
          <form onSubmit={handleInvite} className="space-y-4">
            <div className="space-y-1.5">
              <Label>メールアドレス</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="team@example.com"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>権限</Label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <option value="admin">管理者 — 全権限</option>
                <option value="editor">編集者 — 投稿作成・編集</option>
                <option value="viewer">閲覧者 — 閲覧のみ</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" type="button" onClick={() => setIsInviting(false)}>
                キャンセル
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                招待メールを送信
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
