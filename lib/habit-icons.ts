// Curated icon choices for habits (all valid lucide-react icon names).
// The lookup in components/habit-icon.tsx falls back to Star for any name
// that doesn't resolve, so this list is safe to edit/extend freely.
export const HABIT_ICON_KEYS = [
  'Dumbbell',
  'BookOpen',
  'Droplet',
  'Moon',
  'Sun',
  'Heart',
  'Brain',
  'PenLine',
  'Music',
  'Utensils',
  'Bike',
  'Smile',
  'Star',
  'Coffee',
  'Zap',
  'Feather',
] as const;

export type HabitIconKey = (typeof HABIT_ICON_KEYS)[number];
