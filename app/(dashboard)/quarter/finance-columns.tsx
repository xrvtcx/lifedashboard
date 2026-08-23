'use client';

import { useState } from 'react';
import { createFinanceAccount, updateFinanceAccountBalance, deleteFinanceAccount } from './actions';
import { Card } from '@/components/ui';

type Account = {
  id: number;
  context: 'personal' | 'business';
  name: string;
  accountType: 'credit_card' | 'savings' | 'checking' | 'investment' | 'loan' | 'other';
  balance: string;
};

const TYPE_LABEL: Record<Account['accountType'], string> = {
  credit_card: 'Credit card',
  savings: 'Savings',
  checking: 'Checking',
  investment: 'Investment',
  loan: 'Loan',
  other: 'Other',
};

function AccountRow({ account }: { account: Account }) {
  const [balance, setBalance] = useState(account.balance);
  return (
    <div className="flex items-center justify-between gap-2 py-2 border-b border-slate/50 last:border-0">
      <div className="min-w-0">
        <p className="text-sm truncate">{account.name}</p>
        <p className="text-xs text-ink/50">{TYPE_LABEL[account.accountType]}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-ink/40">$</span>
        <input
          value={balance}
          onChange={(e) => setBalance(e.target.value)}
          onBlur={() => updateFinanceAccountBalance(account.id, balance || '0')}
          className="w-24 bg-transparent border border-slate rounded-sm px-2 py-1 text-sm text-right font-mono focus:outline-none focus:border-ledger"
        />
        <button onClick={() => deleteFinanceAccount(account.id)} className="text-xs text-ink/30 hover:text-rust">
          ✕
        </button>
      </div>
    </div>
  );
}

function AddAccountForm({
  context,
  adding,
  setAdding,
}: {
  context: 'personal' | 'business';
  adding: boolean;
  setAdding: (v: boolean) => void;
}) {
  const [name, setName] = useState('');
  const [accountType, setAccountType] = useState<Account['accountType']>('checking');
  const [balance, setBalance] = useState('');

  async function submit() {
    if (!name.trim()) return;
    const fd = new FormData();
    fd.set('context', context);
    fd.set('name', name.trim());
    fd.set('accountType', accountType);
    fd.set('balance', balance || '0');
    await createFinanceAccount(fd);
    setName('');
    setBalance('');
    setAdding(false);
  }

  if (!adding) {
    return (
      <button onClick={() => setAdding(true)} className="text-xs text-ledger hover:underline pt-1">
        + Add account
      </button>
    );
  }

  return (
    <div className="space-y-2 pt-2 border-t border-slate/50">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Account name"
        className="w-full bg-transparent border border-slate rounded-sm px-2 py-1.5 text-sm focus:outline-none focus:border-ledger"
      />
      <div className="flex gap-2">
        <select
          value={accountType}
          onChange={(e) => setAccountType(e.target.value as Account['accountType'])}
          className="flex-1 bg-transparent border border-slate rounded-sm px-2 py-1.5 text-sm"
        >
          <option value="checking">Checking</option>
          <option value="savings">Savings</option>
          <option value="credit_card">Credit card</option>
          <option value="investment">Investment</option>
          <option value="loan">Loan</option>
          <option value="other">Other</option>
        </select>
        <input
          value={balance}
          onChange={(e) => setBalance(e.target.value)}
          type="number"
          step="0.01"
          placeholder="Balance"
          className="w-28 bg-transparent border border-slate rounded-sm px-2 py-1.5 text-sm"
        />
      </div>
      <div className="flex justify-end gap-2">
        <button onClick={() => setAdding(false)} className="text-xs text-ink/50 px-2 py-1">
          Cancel
        </button>
        <button onClick={submit} className="text-xs bg-ink text-chalk px-3 py-1.5 rounded-sm">
          Add
        </button>
      </div>
    </div>
  );
}

function ColumnCard({ title, context, accounts }: { title: string; context: 'personal' | 'business'; accounts: Account[] }) {
  const [adding, setAdding] = useState(false);
  const total = accounts.reduce(
    (s, a) => s + parseFloat(a.balance || '0') * (a.accountType === 'credit_card' || a.accountType === 'loan' ? -1 : 1),
    0
  );

  return (
    <Card className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{title}</p>
        <span className={`font-mono text-sm ${total >= 0 ? 'text-ledger' : 'text-rust'}`}>
          {total >= 0 ? '+' : ''}
          {Math.round(total)}
        </span>
      </div>
      {accounts.length === 0 && <p className="text-xs text-ink/40 py-2">No accounts added yet.</p>}
      {accounts.map((a) => (
        <AccountRow key={a.id} account={a} />
      ))}
      <AddAccountForm context={context} adding={adding} setAdding={setAdding} />
    </Card>
  );
}

export function FinanceColumns({ accounts }: { accounts: Account[] }) {
  const personal = accounts.filter((a) => a.context === 'personal');
  const business = accounts.filter((a) => a.context === 'business');

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <ColumnCard title="Personal Financials" context="personal" accounts={personal} />
      <ColumnCard title="Business Financials" context="business" accounts={business} />
    </div>
  );
}
