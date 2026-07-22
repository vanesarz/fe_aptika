import { create } from "zustand";

interface SidebarState {
  isCollapsed: boolean;
  isOpenMobile: boolean;
  toggleCollapsed: () => void;
  setCollapsed: (collapsed: boolean) => void;
  setOpenMobile: (open: boolean) => void;
  initStore: () => void;
}

export const useSidebarStore = create<SidebarState>((set, get) => ({
  isCollapsed: false,
  isOpenMobile: false,
  toggleCollapsed: () => {
    const next = !get().isCollapsed;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("sidebarCollapsed", String(next));
      } catch (e) {}
    }
    set({ isCollapsed: next, isOpenMobile: false });
  },
  setCollapsed: (collapsed: boolean) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("sidebarCollapsed", String(collapsed));
      } catch (e) {}
    }
    set({ isCollapsed: collapsed });
  },
  setOpenMobile: (open: boolean) => set({ isOpenMobile: open }),
  initStore: () => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("sidebarCollapsed");
        if (saved !== null) {
          set({ isCollapsed: saved === "true" });
        }
      } catch (e) {}
    }
  },
}));
