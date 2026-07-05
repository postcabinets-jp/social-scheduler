"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createTemplate, deleteTemplate } from "@/app/actions/templates";
import { toast } from "sonner";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { useRouter } from "next/navigation";

interface Template {
  id: string;
  name: string;
  content: string;
  platforms: string[];
  created_at: string;
}

interface TemplatesViewProps {
  templates: Template[];
}

export function TemplatesView({ templates }: TemplatesViewProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleCreate() {
    if (!name.trim() || !content.trim()) {
      toast.error("名前とコンテンツを入力してください");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("name", name);
      formData.set("content", content);
      formData.set("platforms", JSON.stringify([]));

      const result = await createTemplate(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        setName("");
        setContent("");
        setIsCreating(false);
        toast.success("テンプレートを作成しました");
        router.refresh();
      }
    });
  }

  function handleDelete(id: string) {
    if (!confirm("このテンプレートを削除しますか？")) return;
    startTransition(async () => {
      const result = await deleteTemplate(id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("削除しました");
        router.refresh();
      }
    });
  }

  function handleUseTemplate(template: Template) {
    navigator.clipboard.writeText(template.content);
    toast.success("テキストをコピーしました。投稿作成画面に貼り付けてください。");
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">{templates.length} 件のテンプレート</p>
        <Button onClick={() => setIsCreating(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
          + テンプレートを追加
        </Button>
      </div>

      {/* Create form */}
      {isCreating && (
        <div className="bg-white rounded-xl border border-blue-200 p-5 space-y-4">
          <h3 className="font-medium text-gray-900">新規テンプレート</h3>
          <div className="space-y-1.5">
            <Label>テンプレート名</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: キャンペーン告知"
            />
          </div>
          <div className="space-y-1.5">
            <Label>テンプレート内容</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="投稿テンプレートを入力..."
              className="min-h-[120px]"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setIsCreating(false)}>
              キャンセル
            </Button>
            <Button
              onClick={handleCreate}
              disabled={isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isPending ? "保存中..." : "保存"}
            </Button>
          </div>
        </div>
      )}

      {/* Templates grid */}
      {templates.length === 0 && !isCreating ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400">テンプレートがありません</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div key={template.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900 text-sm">{template.name}</h3>
                <button
                  onClick={() => handleDelete(template.id)}
                  className="text-gray-300 hover:text-red-400 p-0.5 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-gray-600 line-clamp-4 mb-3">{template.content}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {format(new Date(template.created_at), "M月d日", { locale: ja })}
                </span>
                <button
                  onClick={() => handleUseTemplate(template)}
                  className="text-xs text-blue-600 hover:text-blue-500 font-medium"
                >
                  コピーして使用
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
