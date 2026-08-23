import { login } from './actions';

export default function LoginPage({
  searchParams,
}: {
  searchParams: { from?: string; error?: string };
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm border border-slate rounded-md bg-paper p-6">
        <p className="stamp text-ledger mb-4">Logbook</p>
        <h1 className="font-display text-xl font-bold mb-1">Sign in</h1>
        <p className="text-sm text-ink/60 mb-5">Enter the shared password to continue.</p>
        <form action={login} className="space-y-3">
          <input type="hidden" name="from" value={searchParams.from || '/'} />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            autoFocus
            className="w-full bg-transparent border border-slate rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-ledger"
          />
          {searchParams.error && <p className="text-xs text-rust">Wrong password. Try again.</p>}
          <button
            type="submit"
            className="w-full bg-ink text-chalk px-4 py-2 rounded-sm text-sm font-medium hover:bg-ledgerdark transition-colors"
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  );
}
