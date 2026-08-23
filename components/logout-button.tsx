import { logout } from '@/app/login/actions';

export function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="text-xs uppercase tracking-wide text-ink/50 hover:text-rust transition-colors"
      >
        Sign out
      </button>
    </form>
  );
}
