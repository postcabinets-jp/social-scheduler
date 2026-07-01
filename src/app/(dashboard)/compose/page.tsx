import { getSocialAccounts } from "@/app/actions/social-accounts";
import { ComposeEditor } from "@/components/compose/compose-editor";

export default async function ComposePage() {
  const accounts = await getSocialAccounts();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">新規投稿</h1>
        <p className="text-gray-500 mt-1">複数のSNSチャンネルへ同時に投稿を作成・スケジュールします</p>
      </div>

      <ComposeEditor accounts={accounts} />
    </div>
  );
}
