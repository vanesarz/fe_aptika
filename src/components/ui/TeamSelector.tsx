"use client";

import { useTeamStore } from "@/store/useTeamStore";

const teams = [
  "Rekayasa Aplikasi",
  "Integrasi Interoperabilitas",
  "Pengelolaan Aplikasi",
  "SIDEBAR Jabar",
  "SMART Jabar",
  "SADA Jabar",
];

export default function TeamSelector() {
  const { team, setTeam } = useTeamStore();

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600">Tim:</span>

      <select
        value={team}
        onChange={(e) => setTeam(e.target.value)}
        className="px-3 py-2 rounded-lg border bg-white text-gray-700 focus:ring-2 focus:ring-blue-400 outline-none"
      >
        {teams.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
    </div>
  );
}