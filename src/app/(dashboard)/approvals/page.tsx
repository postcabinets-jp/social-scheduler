import { getApprovals } from "@/app/actions/posts";
import { ApprovalsView } from "@/components/approvals/approvals-view";

export default async function ApprovalsPage() {
  const approvals = await getApprovals();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">承認フロー</h1>
        <p className="text-gray-500 mt-1">承認待ち投稿のレビュー</p>
      </div>
      <ApprovalsView approvals={approvals} />
    </div>
  );
}
