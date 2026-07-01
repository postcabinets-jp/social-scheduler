import Link from "next/link";

const FEATURES = [
  {
    title: "マルチチャンネル同時投稿",
    desc: "X、Instagram、LinkedIn、Bluesky など7つのプラットフォームへ一度に投稿。チャンネルごとにテキストをカスタマイズ可能。",
    icon: "→",
  },
  {
    title: "フラット料金 — チャンネル数無制限",
    desc: "Bufferは10チャンネルで$60/月。social-schedulerは10チャンネルも30チャンネルも同額$15/月。成長しても料金が上がらない。",
    icon: "$",
  },
  {
    title: "自分のAPIキーでAI生成",
    desc: "OpenAI・Anthropic・Groqのキーを持ち込んでキャプション生成・ハッシュタグ提案。投稿内容が外部に渡らない完全プライベート。",
    icon: "AI",
  },
  {
    title: "承認フロー",
    desc: "編集者が作成 → 管理者が承認 → 自動公開。代理店・チーム運用に必須のワークフローを標準搭載。",
    icon: "✓",
  },
  {
    title: "ビジュアルカレンダー",
    desc: "月/週カレンダーで投稿スケジュールを一目確認。コンテンツの空白期間をなくす。",
    icon: "▦",
  },
  {
    title: "クロスチャンネルアナリティクス",
    desc: "チャンネル別のインプレッション・エンゲージメント率を一画面に集約。どのコンテンツが機能しているかを即判断。",
    icon: "↗",
  },
];

const COMPARISON = [
  { feature: "月額（10チャンネル）", social: "$15", buffer: "$60", hootsuite: "$99" },
  { feature: "月額（30チャンネル）", social: "$15", buffer: "$180", hootsuite: "$249+" },
  { feature: "AIコンテンツ生成", social: "自社キー", buffer: "制限あり", hootsuite: "有料Add-on" },
  { feature: "承認フロー", social: "標準搭載", buffer: "Team以上", hootsuite: "△" },
  { feature: "オープンソース", social: "AGPL", buffer: "×", hootsuite: "×" },
  { feature: "セルフホスト", social: "永久無料", buffer: "×", hootsuite: "×" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur-sm z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <span className="font-semibold text-gray-900">social-scheduler</span>
          </Link>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/postcabinets-jp/social-scheduler"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-600 hover:text-gray-900 hidden sm:block"
            >
              GitHub
            </a>
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
              ログイン
            </Link>
            <Link
              href="/register"
              className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              無料で始める
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm px-3 py-1 rounded-full mb-6 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
          Buffer の代替 — チャンネル課金なし
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
          SNS予約投稿を<br />
          <span className="text-blue-600">チャンネル数に関係なく</span><br />
          フラット料金で
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
          10チャンネルも30チャンネルも同額$15/月。Bufferの最大の痛点を解決した
          オープンソースSNS管理ツール。自社キーでAI生成、承認フロー、アナリティクス標準搭載。
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/register"
            className="bg-blue-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-base"
          >
            無料で始める（クレジット不要）
          </Link>
          <a
            href="https://github.com/postcabinets-jp/social-scheduler"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-gray-300 text-gray-700 px-8 py-3.5 rounded-xl font-medium hover:bg-gray-50 transition-colors text-base flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            GitHubで見る
          </a>
        </div>
        <p className="text-sm text-gray-400 mt-4">
          または{" "}
          <a
            href="https://vercel.com/new/clone?repository-url=https://github.com/postcabinets-jp/social-scheduler"
            className="text-blue-600 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Vercelに自分でデプロイ
          </a>
          （永久無料）
        </p>
      </section>

      {/* Features grid */}
      <section className="bg-gray-50 border-y border-gray-100 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Bufferが解決しなかった問題を全部解決
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700 font-bold text-sm mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
          料金比較
        </h2>
        <p className="text-gray-600 text-center mb-10">
          チャンネルが増えるほど差は開く
        </p>
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-3 px-5 text-sm font-medium text-gray-500">比較項目</th>
                <th className="py-3 px-5 text-sm font-bold text-blue-600 bg-blue-50">social-scheduler</th>
                <th className="py-3 px-5 text-sm font-medium text-gray-500">Buffer</th>
                <th className="py-3 px-5 text-sm font-medium text-gray-500">Hootsuite</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {COMPARISON.map((row) => (
                <tr key={row.feature} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3.5 px-5 text-sm text-gray-700">{row.feature}</td>
                  <td className="py-3.5 px-5 text-sm font-semibold text-blue-600 text-center bg-blue-50/30">{row.social}</td>
                  <td className="py-3.5 px-5 text-sm text-gray-500 text-center">{row.buffer}</td>
                  <td className="py-3.5 px-5 text-sm text-gray-500 text-center">{row.hootsuite}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Deploy section */}
      <section className="bg-gray-900 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            自社サーバーにデプロイ = 永久無料
          </h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            AGPLライセンスのオープンソース。Vercel + Supabase の無料枠で全機能を無制限で利用できます。
            セットアップは5分。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://vercel.com/new/clone?repository-url=https://github.com/postcabinets-jp/social-scheduler&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY&envDescription=Supabase%20project%20credentials&project-name=social-scheduler&repository-name=social-scheduler"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              <svg className="h-4" viewBox="0 0 116 100" fill="currentColor">
                <path d="M57.5 0L115 100H0L57.5 0z" />
              </svg>
              Deploy with Vercel
            </a>
            <a
              href="https://github.com/postcabinets-jp/social-scheduler"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-gray-600 text-gray-300 px-6 py-3 rounded-xl font-medium hover:border-gray-400 hover:text-white transition-colors"
            >
              GitHubを見る
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-600">social-scheduler</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <a href="https://github.com/postcabinets-jp/social-scheduler" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900">GitHub</a>
            <a href="https://github.com/postcabinets-jp/social-scheduler/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900">AGPL License</a>
            <a href="https://postcabinets.co.jp" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900">POST CABINETS</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
