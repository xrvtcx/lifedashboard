'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const links = [
  { href: '/', label: 'Week' },
  { href: '/tasks', label: 'Tasks' },
  { href: '/habits', label: 'Habits' },
  { href: '/finance', label: 'Finance' },
  { href: '/notes', label: 'Notes' },
  { href: '/quarter', label: 'Quarter' },
  { href: '/side-quests', label: 'Side Quests' },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-1 text-sm">
      {links.map((l) => {
        const active = l.href === '/' ? pathname === '/' : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={clsx(
              'px-3 py-1.5 rounded-sm border transition-colors',
              active
                ? 'bg-ink text-chalk border-ink'
                : 'border-transparent text-ink/70 hover:border-slate hover:text-ink'
            )}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
