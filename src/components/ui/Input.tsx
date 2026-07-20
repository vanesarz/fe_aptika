import * as React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  textarea?: boolean;
  rows?: number;
}

const Input = React.forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  ({ className = "", type = "text", label, error, helperText, leftIcon, rightIcon, textarea, rows = 3, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label className="text-xs font-semibold text-slate-700 tracking-wide select-none">
            {label}
          </label>
        )}
        <div className="relative flex items-start w-full">
          {leftIcon && (
            <div className="absolute left-3.5 top-3 text-slate-400 pointer-events-none flex items-center justify-center">
              {leftIcon}
            </div>
          )}
          
          {textarea ? (
            <textarea
              rows={rows}
              className={`
                w-full px-3.5 py-2 text-sm text-slate-800 bg-white border border-slate-200 rounded-lg outline-none
                transition-all duration-150 ease-in-out placeholder:text-slate-400
                focus:border-blue-600 focus:ring-1 focus:ring-blue-600/35
                disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed
                ${leftIcon ? "pl-10" : ""}
                ${rightIcon ? "pr-10" : ""}
                ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}
                ${className}
              `}
              ref={ref as React.Ref<HTMLTextAreaElement>}
              {...(props as any)}
            />
          ) : (
            <input
              type={type}
              className={`
                w-full h-10 px-3.5 py-2 text-sm text-slate-800 bg-white border border-slate-200 rounded-lg outline-none
                transition-all duration-150 ease-in-out placeholder:text-slate-400
                focus:border-blue-600 focus:ring-1 focus:ring-blue-600/35
                disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed
                ${leftIcon ? "pl-10" : ""}
                ${rightIcon ? "pr-10" : ""}
                ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}
                ${className}
              `}
              ref={ref as React.Ref<HTMLInputElement>}
              {...props}
            />
          )}

          {rightIcon && !textarea && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 flex items-center justify-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-xs font-medium text-red-500 tracking-wide mt-0.5">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-slate-400 mt-0.5">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = "Input";

export default Input;
export { Input };
