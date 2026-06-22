"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const data = [
  { name: "Badan Kesbangpol", value: 99.16 },
  { name: "Bappeda", value: 96.88 },
  { name: "Diskominfo", value: 98.35 },
  { name: "Dinas Kesehatan", value: 97.12 },
  { name: "Dinas Pendidikan", value: 98.77 },
  { name: "Dinas PU", value: 95.44 },
  { name: "Dinas Sosial", value: 99.01 },
  { name: "Dinas Pariwisata", value: 96.73 },
  { name: "Dinas Perhubungan", value: 97.89 },
  { name: "Dinas Lingkungan", value: 98.11 },
];

export default function InstansiChart() {
  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ left: 40 }}
        >
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis type="number" domain={[90, 100]} />
          <YAxis
            dataKey="name"
            type="category"
            width={180}
          />

          <Tooltip />

          <Bar dataKey="value" fill="#3B82F6" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}