import * as React from "react";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  indicator?: "online" | "offline" | "away" | null;
}

export default function Avatar({
  src,
  name = "User",
  size = "md",
  indicator = null,
  className = "",
  ...props
}: AvatarProps) {
  const getInitials = (userName: string) => {
    const parts = userName.trim().split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const sizeClasses = {
    xs: "w-6 h-6 text-[10px]",
    sm: "w-8 h-8 text-[12px]",
    md: "w-10 h-10 text-[14px]",
    lg: "w-12 h-12 text-[16px]",
    xl: "w-16 h-16 text-[20px]",
  };

  const indicatorClasses = {
    online: "bg-emerald-500",
    offline: "bg-slate-400",
    away: "bg-amber-500",
  };

  const indicatorSizes = {
    xs: "w-1.5 h-1.5",
    sm: "w-2.5 h-2.5",
    md: "w-3 h-3",
    lg: "w-3 h-3 border-2",
    xl: "w-4 h-4 border-2",
  };

  return (
    <div className={`relative inline-block rounded-full ${className}`} {...props}>
      <div className={`
        flex items-center justify-center rounded-full font-bold overflow-hidden select-none
        ${sizeClasses[size]}
        ${src ? "bg-slate-100" : "bg-gradient-to-tr from-slate-700 to-slate-800 text-white"}
      `}>
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to initials on load error
              (e.target as HTMLElement).style.display = "none";
            }}
          />
        ) : (
          <span>{getInitials(name)}</span>
        )}
      </div>

      {indicator && (
        <span className={`
          absolute bottom-0 right-0 rounded-full border border-white
          ${indicatorClasses[indicator]}
          ${indicatorSizes[size]}
        `} />
      )}
    </div>
  );
}
export { Avatar };
