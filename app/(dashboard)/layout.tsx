import { Nav } from '@/components/nav';
import { LogoutButton } from '@/components/logout-button';

function todayStamp() {
  return new Date()
    .toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
    .toUpperCase();
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate pb-4 mb-6">
        <div className="flex items-center gap-6 flex-wrap">
          <span className="font-display text-xl font-bold tracking-tight">Rachel&rsquo;s Life Dashboard</span>
          <Nav />
        </div>
        <div className="flex items-center gap-3">
          <span className="stamp text-ledger">{todayStamp()}</span>
          <LogoutButton />
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
