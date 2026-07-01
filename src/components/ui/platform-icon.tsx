import { cn } from "@/lib/utils";

const PLATFORM_COLORS: Record<string, string> = {
  twitter: "bg-black",
  instagram: "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400",
  linkedin: "bg-blue-700",
  facebook: "bg-blue-600",
  bluesky: "bg-sky-500",
  mastodon: "bg-purple-600",
  threads: "bg-black",
  tiktok: "bg-black",
  pinterest: "bg-red-600",
  youtube: "bg-red-600",
};

const PLATFORM_LABELS: Record<string, string> = {
  twitter: "X",
  instagram: "IG",
  linkedin: "LI",
  facebook: "FB",
  bluesky: "BS",
  mastodon: "MA",
  threads: "TH",
  tiktok: "TK",
  pinterest: "PI",
  youtube: "YT",
};

interface PlatformIconProps {
  platform: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PlatformIcon({
  platform,
  size = "md",
  className,
}: PlatformIconProps) {
  const sizeClasses = {
    sm: "w-5 h-5 text-xs",
    md: "w-7 h-7 text-xs",
    lg: "w-9 h-9 text-sm",
  };

  const color = PLATFORM_COLORS[platform] ?? "bg-gray-400";
  const label = PLATFORM_LABELS[platform] ?? platform.slice(0, 2).toUpperCase();

  return (
    <div
      className={cn(
        sizeClasses[size],
        color,
        "rounded-full flex items-center justify-center text-white font-bold ring-2 ring-white",
        className
      )}
      title={platform}
    >
      {label}
    </div>
  );
}
