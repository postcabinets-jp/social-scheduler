import { getSocialAccounts } from "@/app/actions/social-accounts";
import { AccountsSettings } from "@/components/settings/accounts-settings";

export default async function AccountsSettingsPage() {
  const accounts = await getSocialAccounts();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">SNSアカウント</h1>
        <p className="text-gray-500 mt-1">接続するSNSアカウントを管理します</p>
      </div>
      <AccountsSettings accounts={accounts} />
    </div>
  );
}
