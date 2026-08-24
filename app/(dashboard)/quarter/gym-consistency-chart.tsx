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
          <CartesianGrid stroke="#DCD3C4" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#211815' }} axisLine={{ stroke: '#DCD3C4' }} tickLine={false} />
          <YAxis domain={[0, 7]} tick={{ fontSize: 11, fill: '#211815' }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip contentStyle={{ fontSize: 12, border: '1px solid #DCD3C4', borderRadius: 2 }} formatter={(v: number) => [`${v} days`, '']} />
          <Bar dataKey="days" fill="#7A1F2B" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
