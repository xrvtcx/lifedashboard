'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

type Point = { week: string; count: number };

export function GymConsistencyChart({ data }: { data: Point[] }) {
  const chartData = data.map((d) => ({
    label: new Date(`${d.week}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    days: d.count,
  }));

  return (
    <div className="bg-paper border border-slate rounded-md p-5 h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid stroke="#C9CDC7" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#15211D' }} axisLine={{ stroke: '#C9CDC7' }} tickLine={false} />
          <YAxis domain={[0, 7]} tick={{ fontSize: 11, fill: '#15211D' }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip contentStyle={{ fontSize: 12, border: '1px solid #C9CDC7', borderRadius: 4 }} formatter={(v: number) => [`${v} days`, '']} />
          <Bar dataKey="days" fill="#2F5D50" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
