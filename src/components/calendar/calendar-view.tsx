"use client";

import { useState, useEffect, useTransition } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  getDay,
} from "date-fns";
import { ja } from "date-fns/locale";
import { getScheduledPosts } from "@/app/actions/posts";
import { PlatformIcon } from "@/components/ui/platform-icon";

interface ScheduledPost {
  id: string;
  content: string | null;
  scheduled_at: string;
  status: string;
  post_channels: Array<{
    social_accounts: { platform: string };
  }>;
}

export function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setLoading(true);
    const start = startOfMonth(currentMonth).toISOString();
    const end = endOfMonth(currentMonth).toISOString();

    startTransition(async () => {
      const data = await getScheduledPosts(start, end);
      setPosts(data as ScheduledPost[]);
      setLoading(false);
    });
  }, [currentMonth]);

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const firstDayOfWeek = getDay(startOfMonth(currentMonth));

  const weekDays = ["日", "月", "火", "水", "木", "金", "土"];

  function getPostsForDay(day: Date) {
    return posts.filter(
      (p) => p.scheduled_at && isSameDay(new Date(p.scheduled_at), day)
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Calendar header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">
          {format(currentMonth, "yyyy年 M月", { locale: ja })}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            今月
          </button>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Week headers */}
      <div className="grid grid-cols-7 border-b border-gray-100">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-400 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      {loading ? (
        <div className="h-96 flex items-center justify-center text-gray-400">
          読み込み中...
        </div>
      ) : (
        <div className="grid grid-cols-7">
          {/* Empty cells for first week */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="h-28 border-b border-r border-gray-50 bg-gray-50/50" />
          ))}

          {days.map((day) => {
            const dayPosts = getPostsForDay(day);
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isWeekend = getDay(day) === 0 || getDay(day) === 6;

            return (
              <div
                key={day.toISOString()}
                className={`h-28 border-b border-r border-gray-100 p-1.5 ${
                  !isCurrentMonth ? "bg-gray-50/50" : isWeekend ? "bg-gray-50/30" : ""
                }`}
              >
                <div
                  className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                    isToday
                      ? "bg-blue-600 text-white"
                      : "text-gray-500"
                  }`}
                >
                  {format(day, "d")}
                </div>

                <div className="space-y-0.5 overflow-hidden">
                  {dayPosts.slice(0, 3).map((post) => (
                    <div
                      key={post.id}
                      className="flex items-center gap-1 bg-blue-50 border border-blue-100 rounded px-1.5 py-0.5 cursor-pointer hover:bg-blue-100 transition-colors"
                    >
                      <div className="flex -space-x-1">
                        {post.post_channels.slice(0, 2).map((ch, idx) => (
                          <PlatformIcon
                            key={idx}
                            platform={ch.social_accounts.platform}
                            size="sm"
                          />
                        ))}
                      </div>
                      <p className="text-xs text-blue-800 truncate flex-1 min-w-0">
                        {post.content?.slice(0, 20) ?? "..."}
                      </p>
                    </div>
                  ))}
                  {dayPosts.length > 3 && (
                    <p className="text-xs text-gray-400 pl-1">
                      +{dayPosts.length - 3} 件
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
