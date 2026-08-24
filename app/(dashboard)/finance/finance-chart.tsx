'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

type Point = { month: string; personal: number; business: number };

export function FinanceChart({ data }: { data: Point[] }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid stroke="#DCD3C4" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: '#211815' }}
            axisLine={{ stroke: '#DCD3C4' }}
            tickLine={false}
          />
          <YAxis tick={{ fontSize: 11, fill: '#211815' }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ fontSize: 12, border: '1px solid #DCD3C4', borderRadius: 2 }}
          />
          <Bar dataKey="personal" name="Personal" fill="#7A1F2B" radius={[2, 2, 0, 0]} />
          <Bar dataKey="business" name="Business" fill="#B08D57" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
