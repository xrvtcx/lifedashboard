import * as Icons from 'lucide-react';
import type { LucideProps } from 'lucide-react';

// Defensive lookup: renders whatever icon name is stored on the habit, and
// falls back to Star if the name doesn't resolve to a real lucide icon.
export function HabitIcon({ name, ...props }: { name: string } & LucideProps) {
  const IconMap = Icons as unknown as Record<string, React.ComponentType<LucideProps>>;
  const Icon = IconMap[name] || Icons.Star;
  return <Icon {...props} />;
}
