import { getCurrentWorkspace } from "@/app/actions/workspace";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "/月",
    channels: "3チャンネル",
    posts: "10投稿/月",
    users: "1ユーザー",
    features: ["基本スケジューリング", "投稿履歴"],
  },
  {
    name: "Starter",
    price: "$15",
    period: "/月",
    channels: "10チャンネル",
    posts: "無制限",
    users: "2ユーザー",
    features: ["全機能", "AIコンテンツ生成", "チームコラボレーション"],
    recommended: true,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/月",
    channels: "30チャンネル",
    posts: "無制限",
    users: "5ユーザー",
    features: ["全Starter機能", "承認フロー", "詳細アナリティクス", "優先サポート"],
  },
  {
    name: "Agency",
    price: "$79",
    period: "/月",
    channels: "100チャンネル",
    posts: "無制限",
    users: "無制限",
    features: ["全Pro機能", "ホワイトラベル", "APIアクセス", "専任サポート"],
  },
];

export default async function BillingPage() {
  const workspace = await getCurrentWorkspace();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">プラン・請求</h1>
        <p className="text-gray-500 mt-1">
          現在のプラン:{" "}
          <span className="font-medium capitalize">{workspace?.plan ?? "Free"}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`bg-white rounded-xl border-2 p-5 ${
              plan.recommended
                ? "border-blue-500"
                : "border-gray-200"
            }`}
          >
            {plan.recommended && (
              <div className="text-xs font-semibold text-blue-600 mb-2">おすすめ</div>
            )}
            <h3 className="font-bold text-gray-900 text-lg">{plan.name}</h3>
            <div className="mt-2 mb-4">
              <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
              <span className="text-gray-500 text-sm">{plan.period}</span>
            </div>

            <div className="space-y-1.5 mb-5">
              <p className="text-sm text-gray-600">
                <span className="font-medium">{plan.channels}</span>
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">{plan.posts}</span>
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">{plan.users}</span>
              </p>
            </div>

            <ul className="space-y-1.5 mb-6">
              {plan.features.map((f) => (
                <li key={f} className="text-sm text-gray-600 flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>

            <button
              className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                workspace?.plan === plan.name.toLowerCase()
                  ? "bg-gray-100 text-gray-500 cursor-default"
                  : plan.recommended
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
              disabled={workspace?.plan === plan.name.toLowerCase()}
            >
              {workspace?.plan === plan.name.toLowerCase() ? "現在のプラン" : "このプランに変更"}
            </button>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 text-sm text-gray-600">
        <p className="font-medium text-gray-900 mb-2">セルフホスト（完全無料）</p>
        <p>social-scheduler はAGPLライセンスのオープンソースです。自社サーバーにデプロイすれば無制限で無料利用できます。</p>
        <a
          href="https://github.com/postcabinets-jp/social-scheduler"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline mt-2 inline-block"
        >
          GitHubを見る →
        </a>
      </div>
    </div>
  );
}
