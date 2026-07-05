import { getTemplates } from "@/app/actions/templates";
import { TemplatesView } from "@/components/templates/templates-view";

export default async function TemplatesPage() {
  const templates = await getTemplates();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">テンプレート</h1>
        <p className="text-gray-500 mt-1">よく使う投稿フォーマットを保存・再利用</p>
      </div>
      <TemplatesView templates={templates} />
    </div>
  );
}
