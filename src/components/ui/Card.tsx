import * as React from "react";

export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  headerActions?: React.ReactNode;
  footer?: React.ReactNode;
  variant?: "default" | "flat" | "outline" | "glass";
  hoverable?: boolean;
}

export default function Card({
  className = "",
  children,
  title,
  headerActions,
  footer,
  variant = "default",
  hoverable = true,
  ...props
}: CardProps) {
  const baseStyles = "rounded-2xl overflow-hidden transition-all duration-200";

  const variants = {
    default: "bg-white border border-slate-100 shadow-sm",
    flat: "bg-slate-50 border border-slate-100",
    outline: "bg-transparent border border-slate-200",
    glass: "glassmorphism shadow-sm",
  };

  const hoverStyles = hoverable
    ? "hover:shadow-md hover:translate-y-[-1px]"
    : "";

  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${hoverStyles} ${className}`}
      {...props}
    >
      {/* Header */}
      {(title || headerActions) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100/60">
          {typeof title === "string" ? (
            <h2 className="text-sm font-bold text-slate-800 tracking-wide">
              {title}
            </h2>
          ) : (
            title
          )}
          {headerActions && (
            <div className="flex items-center gap-2">{headerActions}</div>
          )}
        </div>
      )}

      {/* Body */}
      <div className="px-6 py-5 text-sm text-slate-600">{children}</div>

      {/* Footer */}
      {footer && (
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100/60">
          {footer}
        </div>
      )}
    </div>
  );
}
export { Card };