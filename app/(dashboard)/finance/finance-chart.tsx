'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

type Point = { month: string; personal: number; business: number };

export function FinanceChart({ data }: { data: Point[] }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid stroke="#C9CDC7" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: '#15211D' }}
            axisLine={{ stroke: '#C9CDC7' }}
            tickLine={false}
          />
          <YAxis tick={{ fontSize: 11, fill: '#15211D' }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ fontSize: 12, border: '1px solid #C9CDC7', borderRadius: 4 }}
          />
          <Bar dataKey="personal" name="Personal" fill="#2F5D50" radius={[2, 2, 0, 0]} />
          <Bar dataKey="business" name="Business" fill="#C08A2E" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
