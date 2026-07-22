import * as React from "react";
import { ChevronDown } from "lucide-react";

export interface DropdownItem {
  label: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  destructive?: boolean;
}

export interface DropdownProps {
  trigger?: React.ReactNode;
  label?: string;
  items: DropdownItem[];
  align?: "left" | "right";
  className?: string;
}

export default function Dropdown({
  trigger,
  label = "Menu",
  items,
  align = "right",
  className = "",
}: DropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const alignClasses = align === "left" ? "left-0" : "right-0";

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Trigger */}
      {trigger ? (
        <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
          {trigger}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`
            inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white
            border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 outline-none transition-all
          `}
        >
          {label}
          <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
      )}

      {/* Menu overlay */}
      {isOpen && (
        <div className={`
          absolute z-50 mt-1.5 w-48 rounded-xl border border-slate-100 bg-white shadow-lg ring-1 ring-slate-900/5
          divide-y divide-slate-50 overflow-hidden outline-none animate-in fade-in slide-in-from-top-1 duration-150
          ${alignClasses}
        `}>
          <div className="py-1">
            {items.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  if (item.disabled) return;
                  if (item.onClick) item.onClick();
                  setIsOpen(false);
                }}
                disabled={item.disabled}
                className={`
                  flex items-center gap-2.5 w-full text-left px-4 py-2.5 text-xs font-medium tracking-wide
                  transition-colors select-none outline-none
                  ${item.disabled 
                    ? "text-slate-300 cursor-not-allowed" 
                    : item.destructive 
                      ? "text-red-600 hover:bg-red-50/70"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                  }
                `}
              >
                {item.icon && <span className="text-slate-400 flex-shrink-0">{item.icon}</span>}
                <span className="flex-1">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
export { Dropdown };
