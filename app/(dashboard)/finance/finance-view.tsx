'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { createTransaction, deleteTransaction } from './actions';
import { Card, SectionLabel, Stamp } from '@/components/ui';

type Txn = {
  id: number;
  context: 'personal' | 'business';
  type: 'income' | 'expense';
  amount: string;
  category: string;
  description: string | null;
  date: string;
};

export function FinanceView({ transactions }: { transactions: Txn[] }) {
  const [tab, setTab] = useState<'personal' | 'business'>('personal');
  const filtered = transactions.filter((t) => t.context === tab);

  const summary = useMemo(() => {
    const now = new Date();
    const monthTxns = filtered.filter((t) => {
      const d = new Date(t.date);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    });
    const income = monthTxns.filter((t) => t.type === 'income').reduce((s, t) => s + parseFloat(t.amount), 0);
    const expense = monthTxns.filter((t) => t.type === 'expense').reduce((s, t) => s + parseFloat(t.amount), 0);
    return { income, expense, net: income - expense };
  }, [filtered]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 text-xs uppercase tracking-wide">
        {(['personal', 'business'] as const).map((c) => (
          <button
            key={c}
            onClick={() => setTab(c)}
            className={clsx(
              'px-3 py-1 rounded-sm border',
              tab === c ? 'bg-ink text-chalk border-ink' : 'border-slate text-ink/60 hover:border-ink'
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card>
          <p className="font-mono text-lg text-ledger">+{Math.round(summary.income)}</p>
          <p className="text-xs text-ink/60 mt-1">Income (month)</p>
        </Card>
        <Card>
          <p className="font-mono text-lg text-rust">-{Math.round(summary.expense)}</p>
          <p className="text-xs text-ink/60 mt-1">Expense (month)</p>
        </Card>
        <Card>
          <p className={clsx('font-mono text-lg', summary.net >= 0 ? 'text-ledger' : 'text-rust')}>
            {summary.net >= 0 ? '+' : ''}
            {Math.round(summary.net)}
          </p>
          <p className="text-xs text-ink/60 mt-1">Net (month)</p>
        </Card>
      </div>

      <Card>
        <SectionLabel>New transaction — {tab}</SectionLabel>
        <form key={tab} action={createTransaction} className="grid sm:grid-cols-5 gap-2">
          <input type="hidden" name="context" defaultValue={tab} />
          <select name="type" defaultValue="expense" className="bg-transparent border border-slate rounded-sm px-2 py-2 text-sm">
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <input
            name="amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="Amount"
            required
            className="bg-transparent border border-slate rounded-sm px-2 py-2 text-sm"
          />
          <input name="category" placeholder="Category" className="bg-transparent border border-slate rounded-sm px-2 py-2 text-sm" />
          <input
            name="date"
            type="date"
            defaultValue={new Date().toISOString().slice(0, 10)}
            className="bg-transparent border border-slate rounded-sm px-2 py-2 text-sm"
          />
          <button
            type="submit"
            className="bg-ink text-chalk px-3 py-2 rounded-sm text-sm font-medium hover:bg-ledgerdark transition-colors"
          >
            Add
          </button>
          <input
            name="description"
            placeholder="Description (optional)"
            className="sm:col-span-5 bg-transparent border border-slate rounded-sm px-2 py-2 text-sm"
          />
        </form>
      </Card>

      <div className="space-y-1.5">
        {filtered.length === 0 && (
          <Card className="text-sm text-ink/50 text-center py-8">No {tab} transactions yet.</Card>
        )}
        {filtered.map((t) => (
          <Card key={t.id} className="flex items-center justify-between py-2.5 gap-3 flex-wrap">
            <div className="flex items-center gap-3 min-w-0">
              <Stamp tone={t.type === 'income' ? 'ledger' : 'rust'}>{t.type}</Stamp>
              <div className="min-w-0">
                <p className="text-sm truncate">
                  {t.category}
                  {t.description ? ` — ${t.description}` : ''}
                </p>
                <p className="text-xs text-ink/50 font-mono">
                  {new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className={clsx('font-mono text-sm', t.type === 'income' ? 'text-ledger' : 'text-rust')}>
                {t.type === 'income' ? '+' : '-'}
                {parseFloat(t.amount).toFixed(2)}
              </span>
              <button onClick={() => deleteTransaction(t.id)} className="text-xs text-ink/40 hover:text-rust">
                Remove
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
