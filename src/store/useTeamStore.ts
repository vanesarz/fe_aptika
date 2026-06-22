import { create } from "zustand";

type TeamState = {
  team: string;
  setTeam: (team: string) => void;
};

export const useTeamStore = create<TeamState>((set) => ({
  team: "Rekayasa Aplikasi",
  setTeam: (team) => set({ team }),
}));