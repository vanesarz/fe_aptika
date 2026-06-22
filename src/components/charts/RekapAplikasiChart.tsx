"use client";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend
} from "recharts";

export default function RekapAplikasiChart({ data }: any) {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="aplikasi" fill="#3B82F6" />
          <Bar dataKey="profil" fill="#F97316" />
          <Bar dataKey="repository" fill="#6B7280" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}