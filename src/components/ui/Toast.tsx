import * as React from "react";
import { Toaster as HotToaster, toast } from "react-hot-toast";

// Customized Toast notification container
export default function ToastProvider() {
  return (
    <HotToaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        className: "glassmorphism font-sans text-xs font-semibold text-slate-800 border border-slate-100/60 rounded-xl shadow-lg px-4 py-3",
        duration: 4000,
        style: {
          background: "rgba(255, 255, 255, 0.95)",
          color: "#0f2540",
          boxShadow: "0 10px 15px -3px rgba(15, 37, 64, 0.05), 0 4px 6px -2px rgba(15, 37, 64, 0.05)",
          border: "1px solid rgba(226, 232, 240, 0.8)",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: "12px",
        },
        success: {
          iconTheme: {
            primary: "#10b981",
            secondary: "#ffffff",
          },
        },
        error: {
          iconTheme: {
            primary: "#ef4444",
            secondary: "#ffffff",
          },
        },
      }}
    />
  );
}

export { toast };
export const showToast = {
  success: (msg: string) => toast.success(msg),
  error: (msg: string) => toast.error(msg),
  loading: (msg: string) => toast.loading(msg),
  dismiss: (id?: string) => toast.dismiss(id),
};
