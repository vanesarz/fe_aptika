"use client";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend
} from "recharts";

export default function ProgressChart({ data }: any) {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="jumlah" fill="#3B82F6" />
          <Bar dataKey="target" fill="#FACC15" />
          <Bar dataKey="realisasi" fill="#9CA3AF" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}