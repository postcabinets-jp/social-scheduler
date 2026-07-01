import { getAnalyticsOverview } from "@/app/actions/social-accounts";
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";

export default async function AnalyticsPage() {
  const data = await getAnalyticsOverview();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">アナリティクス</h1>
        <p className="text-gray-500 mt-1">チャンネル別エンゲージメント分析</p>
      </div>
      <AnalyticsDashboard data={data} />
    </div>
  );
}
