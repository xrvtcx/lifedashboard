import { db } from '@/db';
import { transactions } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { FinanceView } from './finance-view';
import { FinanceChart } from './finance-chart';
import { Card, SectionLabel } from '@/components/ui';

export const dynamic = 'force-dynamic';

function monthKey(d: Date) {
  return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

export default async function FinancePage() {
  const all = await db.select().from(transactions).orderBy(desc(transactions.date));

  const now = new Date();
  const months: { key: string; date: Date }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: monthKey(d), date: d });
  }

  const chartData = months.map(({ key, date }) => {
    const monthTxns = all.filter((t) => {
      const td = new Date(t.date);
      return td.getFullYear() === date.getFullYear() && td.getMonth() === date.getMonth();
    });
    const net = (ctx: 'personal' | 'business') =>
      monthTxns
        .filter((t) => t.context === ctx)
        .reduce((sum, t) => sum + (t.type === 'income' ? 1 : -1) * parseFloat(t.amount), 0);
    return { month: key, personal: Math.round(net('personal')), business: Math.round(net('business')) };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Finance</h1>
        <p className="text-ink/60 text-sm mt-1">Personal and business, kept separate.</p>
      </div>

      <Card>
        <SectionLabel>Last 6 months, net</SectionLabel>
        <FinanceChart data={chartData} />
      </Card>

      <FinanceView transactions={all} />
    </div>
  );
}
