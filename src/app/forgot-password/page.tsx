import Link from "next/link";
import { resetPassword } from "@/app/actions/auth";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen grid place-items-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <span className="text-xl font-semibold text-gray-900">
              social-scheduler
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">パスワードをリセット</h1>
          <p className="mt-2 text-sm text-gray-600">
            登録済みのメールアドレスにリセットリンクをお送りします
          </p>
        </div>

        <ResetPasswordForm action={resetPassword} />

        <p className="text-center text-sm text-gray-600">
          <Link
            href="/login"
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            ← ログインに戻る
          </Link>
        </p>
      </div>
    </div>
  );
}
