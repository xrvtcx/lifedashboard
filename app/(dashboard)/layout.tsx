import { Nav } from '@/components/nav';
import { LogoutButton } from '@/components/logout-button';
import { WaxSeal } from '@/components/wax-seal';

function todayStamp() {
  return new Date()
    .toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
    .toUpperCase();
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-ledger pb-4 mb-6">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-3">
            <WaxSeal size={40} className="shrink-0 drop-shadow-sm" />
            <span className="font-display text-2xl font-bold tracking-tight text-ledger">
              Rachel&rsquo;s Life Dashboard
            </span>
          </div>
          <Nav />
        </div>
        <div className="flex items-center gap-3">
          <span className="stamp text-ledger">{todayStamp()}</span>
          <a
            href={`https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID || ''}&redirect_uri=${process.env.GOOGLE_REDIRECT_URI || ''}&response_type=code&scope=https://www.googleapis.com/auth/calendar.readonly&access_type=offline&prompt=consent`}
            className="text-xs text-ochre hover:underline"
            title="Connect Google Calendar"
          >
            📅
          </a>
          <LogoutButton />
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
