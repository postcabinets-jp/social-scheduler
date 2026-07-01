import { getCurrentWorkspace } from "@/app/actions/workspace";
import { CalendarView } from "@/components/calendar/calendar-view";

export default async function CalendarPage() {
  const workspace = await getCurrentWorkspace();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">カレンダー</h1>
        <p className="text-gray-500 mt-1">投稿スケジュールをカレンダービューで確認</p>
      </div>
      <CalendarView workspaceId={workspace?.id ?? ""} />
    </div>
  );
}
